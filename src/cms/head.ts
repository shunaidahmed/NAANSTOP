/**
 * Applies the CMS "SEO" and "Analytics & tags" settings to the live page.
 *
 * Everything here touches the DOM directly rather than rendering into React:
 * tag snippets are third-party globals, and keeping them outside the tree means
 * a bad pixel id can never take the site down with it.
 */
import type { Seo, Tags } from "./content";

const MARK = "data-cms-tag";
let applied = false;

function meta(selector: string, attr: "name" | "property", key: string, value: string) {
  if (!value) return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

export function applySeo(seo: Seo) {
  if (seo.title) document.title = seo.title;
  meta('meta[name="description"]', "name", "description", seo.description);
  meta('meta[property="og:title"]', "property", "og:title", seo.title);
  meta('meta[property="og:description"]', "property", "og:description", seo.description);
  meta('meta[property="og:image"]', "property", "og:image", seo.ogImage);
  meta('meta[name="twitter:card"]', "name", "twitter:card", seo.ogImage ? "summary_large_image" : "");
}

function script(src: string | null, code: string, async = true) {
  const el = document.createElement("script");
  el.setAttribute(MARK, "");
  if (src) {
    el.src = src;
    el.async = async;
  } else {
    el.textContent = code;
  }
  document.head.appendChild(el);
}

function raw(html: string, target: HTMLElement) {
  if (!html.trim()) return;
  const holder = document.createElement("div");
  holder.innerHTML = html;
  for (const node of Array.from(holder.childNodes)) {
    if (node.nodeName === "SCRIPT") {
      const old = node as HTMLScriptElement;
      const fresh = document.createElement("script");
      for (const a of Array.from(old.attributes)) fresh.setAttribute(a.name, a.value);
      fresh.textContent = old.textContent;
      fresh.setAttribute(MARK, "");
      target.appendChild(fresh);
    } else {
      if (node instanceof HTMLElement) node.setAttribute(MARK, "");
      target.appendChild(node);
    }
  }
}

/* -- consent --------------------------------------------------------- */
const CONSENT_KEY = "naan-stop-consent";

function storedConsent(): "granted" | "denied" | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Device time zone, not an IP lookup - no request, no third party. */
function inEurope(): boolean {
  try {
    return /^(Europe|Atlantic\/(Canary|Azores|Madeira|Faroe|Reykjavik))/.test(
      Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    );
  } catch {
    return true;
  }
}

function banner(onChoice: (granted: boolean) => void) {
  const box = document.createElement("div");
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Cookies");
  box.style.cssText =
    "position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:9999;max-width:min(560px,calc(100vw - 24px));" +
    "background:#111;color:#f5f5f5;border:1px solid #2a2a2a;border-radius:16px;padding:16px 18px;display:flex;gap:12px;" +
    "align-items:center;flex-wrap:wrap;font:14px/1.5 system-ui,sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.5)";
  const text = document.createElement("p");
  text.style.cssText = "margin:0;flex:1 1 240px";
  text.textContent =
    document.documentElement.lang === "en"
      ? "We use cookies to measure how the site is used. Analytics only runs if you agree."
      : "Usamos cookies para medir el uso del sitio. La analitica solo se activa si aceptas.";
  const make = (label: string, primary: boolean, granted: boolean) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText =
      "font:inherit;font-weight:600;border-radius:999px;padding:9px 18px;cursor:pointer;border:1px solid " +
      (primary ? "transparent;background:#e11d2e;color:#fff" : "#3a3a3a;background:transparent;color:#f5f5f5");
    b.onclick = () => {
      try {
        localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
      } catch {}
      box.remove();
      onChoice(granted);
    };
    return b;
  };
  const en = document.documentElement.lang === "en";
  box.append(text, make(en ? "Decline" : "Rechazar", false, false), make(en ? "Accept" : "Aceptar", true, true));
  document.body.appendChild(box);
}

/* -- tags ------------------------------------------------------------ */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[] };
  }
}

function loadGoogle(tags: Tags) {
  if (!tags.gtm && !tags.ga4 && !tags.adsId) return;
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => window.dataLayer!.push(args);
  window.gtag = gtag;

  // Consent Mode v2: Google's tags load immediately but store nothing until
  // consent is granted. That is Google's own recommended pattern.
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
  gtag("js", new Date());

  if (tags.gtm) {
    script(null, `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tags.gtm}');`);
  }
  const direct = tags.ga4 || tags.adsId;
  if (direct) {
    script(`https://www.googletagmanager.com/gtag/js?id=${direct}`, "");
    if (tags.ga4) gtag("config", tags.ga4);
    if (tags.adsId) gtag("config", tags.adsId);
  }
}

function loadMarketing(tags: Tags) {
  if (tags.metaPixel) {
    script(null, `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${tags.metaPixel}');fbq('track','PageView');`);
  }
  if (tags.tiktok) {
    script(null, `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(e,n){e[n]=function(){e.push([n].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=n;ttq._t=ttq._t||{};ttq._t[e]=+new Date;var o=d.createElement('script');o.type='text/javascript';o.async=!0;o.src=n+'?sdkid='+e;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load('${tags.tiktok}');ttq.page()}(window,document,'ttq');`);
  }
  if (tags.linkedin) {
    script(null, `_linkedin_partner_id='${tags.linkedin}';window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);`);
    script("https://snap.licdn.com/li.lms-analytics/insight.min.js", "");
  }
  if (tags.clarity) {
    script(null, `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','${tags.clarity}');`);
  }
}

function grant() {
  window.gtag?.("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  });
}

export function applyTags(tags: Tags) {
  if (applied) return; // ponytail: tags load once per page load. Republish + reload to change them.
  applied = true;

  if (tags.verification) {
    meta('meta[name="google-site-verification"]', "name", "google-site-verification", tags.verification);
  }

  raw(tags.headCode, document.head);
  raw(tags.bodyCode, document.body);

  loadGoogle(tags);

  const needsConsent = tags.consent === "all" || (tags.consent === "eu" && inEurope());
  const choice = storedConsent();

  if (!needsConsent || choice === "granted") {
    grant();
    loadMarketing(tags);
    return;
  }
  if (choice === "denied") return;

  // Pixels without a consent mode are not loaded at all until the visitor agrees.
  banner((granted) => {
    if (!granted) return;
    grant();
    loadMarketing(tags);
  });
}
