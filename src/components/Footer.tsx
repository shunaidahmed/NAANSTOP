import type { NavLink } from "../cms/content";
import { useLanguage } from "../i18n/LanguageContext";
import { fmt } from "../i18n/fmt";
import { ClockIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";

export default function Footer() {
  const year = new Date().getFullYear();
  const { lang, t, SITE, NAV_LINKS, waLink, mapsUrl, waMsg } = useLanguage();

  const navLabel = (link: NavLink) => (lang === "es" ? link.labelEs : link.label);

  const heading = "font-label text-[11px] uppercase tracking-[0.18em] text-faint";
  const row = "flex items-start gap-2.5 text-sm leading-relaxed text-muted transition hover:text-brand";

  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Who we are */}
          <div className="flex flex-col gap-4">
            <a href="#home" aria-label={SITE.name} className="w-fit">
              <img
                src={SITE.logo || "/logo.png"}
                alt={`${SITE.name} ${SITE.subtitle}`}
                width={256}
                height={256}
                loading="lazy"
                className="h-20 w-20 rounded-full"
              />
            </a>
            <p className="max-w-xs text-sm leading-relaxed font-body text-muted">{t.footer.description}</p>
          </div>

          {/* Where to go */}
          <nav aria-label={t.nav.menu} className="flex flex-col gap-3">
            <p className={heading}>{t.nav.menu}</p>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-muted transition hover:text-brand">
                    {navLabel(link)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* How to reach us */}
          <div className="flex flex-col gap-3">
            <p className={heading}>{t.contact.findUs}</p>
            <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className={row}>
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{SITE.address}</span>
            </a>
            <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" className={row}>
              <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>+{SITE.phone}</span>
            </a>
            <a href={`tel:+${SITE.phone}`} className={row}>
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{t.contact.callTheGrill}</span>
            </a>
          </div>

          {/* When we are open */}
          <div className="flex flex-col gap-3">
            <p className={heading}>{t.contact.openingHours}</p>
            <ul className="flex flex-col gap-2">
              {SITE.hours.map((h) => (
                <li key={h.days} className="flex items-start gap-2.5 text-sm text-muted">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>
                    <span className="block text-fg">{lang === "es" ? h.daysEs : h.days}</span>
                    {lang === "es" ? h.timeEs : h.time}
                  </span>
                </li>
              ))}
            </ul>
            {SITE.hoursNote && (
              <p className="text-xs text-faint">{lang === "es" ? SITE.hoursNoteEs : SITE.hoursNote}</p>
            )}
            <a
              href={waLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-btn mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              {t.footer.order}
            </a>
          </div>
        </div>

        <p className="mt-12 border-t border-line pt-6 text-center text-xs font-label tracking-wide text-faint">
          {fmt(t.footer.allRightsReserved, { year })}
        </p>
      </div>
    </footer>
  );
}
