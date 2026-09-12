/**
 * The shape of everything the admin panel can edit, plus the defaults.
 *
 * `src/data/site.ts` and `src/i18n/translations.ts` stay the single source of
 * truth for the shipped copy. The CMS document is an *overlay* on top of them:
 * the site renders instantly from the bundled defaults, then swaps in whatever
 * the panel has published. Nothing breaks if the API is down or empty.
 */
import {
  MENU,
  NAV_LINKS,
  SITE,
  HERO_SLIDES,
  ABOUT_SLIDES,
  DEFAULT_WA_MESSAGE,
  DEFAULT_WA_MESSAGE_ES,
  type MenuCategory,
  type Slide,
} from "../data/site";
import { translations } from "../i18n/translations";

export interface SiteSettings {
  name: string;
  subtitle: string;
  phone: string;
  currency: string;
  address: string;
  logo: string;
  hours: { days: string; time: string; daysEs: string; timeEs: string }[];
  hoursNote: string;
  hoursNoteEs: string;
  waMessage: string;
  waMessageEs: string;
  /** Offer delivery alongside pickup. */
  delivery: boolean;
  deliveryFee: number;
  minDeliveryOrder: number;
}

export interface NavLink {
  label: string;
  labelEs: string;
  href: string;
}

export interface Seo {
  title: string;
  description: string;
  ogImage: string;
}

export interface Tags {
  gtm: string;
  ga4: string;
  adsId: string;
  adsLabel: string;
  metaPixel: string;
  tiktok: string;
  linkedin: string;
  clarity: string;
  verification: string;
  consent: "off" | "eu" | "all";
  headCode: string;
  bodyCode: string;
}

export interface Content {
  site: SiteSettings;
  menu: MenuCategory[];
  gallery: { hero: Slide[]; about: Slide[] };
  nav: NavLink[];
  t: { es: Record<string, unknown>; en: Record<string, unknown> };
  seo: Seo;
  tags: Tags;
  updatedAt?: string;
  publishedAt?: string;
}

export const DEFAULT_TAGS: Tags = {
  gtm: "",
  ga4: "",
  adsId: "",
  adsLabel: "",
  metaPixel: "",
  tiktok: "",
  linkedin: "",
  clarity: "",
  verification: "",
  consent: "eu",
  headCode: "",
  bodyCode: "",
};

export const DEFAULT_CONTENT: Content = {
  site: {
    ...SITE,
    hours: SITE.hours.map((h) => ({ ...h })),
    waMessage: DEFAULT_WA_MESSAGE,
    waMessageEs: DEFAULT_WA_MESSAGE_ES,
  },
  menu: structuredClone(MENU),
  gallery: { hero: structuredClone(HERO_SLIDES), about: structuredClone(ABOUT_SLIDES) },
  nav: NAV_LINKS.map((l) => ({ ...l })),
  t: { es: translations.es as Record<string, unknown>, en: translations.en as Record<string, unknown> },
  // The site is Spanish first — these overwrite the tags in index.html, so
  // they have to be Spanish too or the tab title flips to English on load.
  seo: {
    title: `${SITE.name} ${SITE.subtitle} — Tacos franceses en El Masnou`,
    description:
      "Tacos franceses, hamburguesas y patatas cargadas hechos al momento en El Masnou. Pide por WhatsApp.",
    ogImage: "/logo.png",
  },
  tags: DEFAULT_TAGS,
};

/**
 * Deep-merge an overlay onto a default. Arrays and primitives replace wholesale;
 * plain objects merge key by key. Keys absent from the overlay keep the default,
 * which is what preserves the function values in `translations` (`orderItems`,
 * `allRightsReserved`) - the panel never serialises those, so they survive.
 */
export function merge<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base;
  if (Array.isArray(over) || typeof over !== "object") return over as T;
  if (typeof base !== "object" || base === null || Array.isArray(base)) return over as T;
  const out = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(over as Record<string, unknown>)) {
    out[key] = merge(out[key], (over as Record<string, unknown>)[key]);
  }
  return out as T;
}

/** Turn whatever the API returned (possibly `{}`) into a complete Content. */
export function resolve(raw: unknown): Content {
  if (!raw || typeof raw !== "object") return DEFAULT_CONTENT;
  return merge(DEFAULT_CONTENT, raw);
}

/** Fetch published content, or the draft when `?preview=1` is in the URL. */
export async function fetchContent(): Promise<Content | null> {
  const preview = new URLSearchParams(window.location.search).has("preview");
  try {
    const res = await fetch(`/api/cms${preview ? "?draft=1" : ""}`, { credentials: "same-origin" });
    if (!res.ok) return null;
    return resolve(await res.json());
  } catch {
    return null;
  }
}
