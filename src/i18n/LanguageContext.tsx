import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { translations } from "./translations";
import type { Language } from "./translations";
import { DEFAULT_CONTENT, fetchContent, type Content, type NavLink, type SiteSettings } from "../cms/content";
import type { MenuCategory, Slide } from "../data/site";
import { applySeo, applyTags } from "../cms/head";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.es;
  SITE: SiteSettings;
  MENU: MenuCategory[];
  NAV_LINKS: NavLink[];
  /** Hero carousel and About strip pictures. */
  GALLERY: { hero: Slide[]; about: Slide[] };
  /** WhatsApp deep link for the current live phone number. */
  waLink: (message: string) => string;
  /** Google Maps link for the current live address. */
  mapsUrl: () => string;
  /** The default "I'd like to order" message in the active language. */
  waMsg: string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const stored = window.localStorage.getItem("naan-stop-lang");
      if (stored === "es" || stored === "en") return stored;
    } catch {}
    return "es";
  });

  // Render from the bundled defaults immediately, then swap in whatever the
  // panel has published. No spinner, no layout shift, works with the API down.
  const [content, setContent] = useState<Content>(DEFAULT_CONTENT);

  useEffect(() => {
    let live = true;
    fetchContent().then((next) => {
      if (live && next) setContent(next);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => applySeo(content.seo), [content.seo]);
  useEffect(() => applyTags(content.tags), [content.tags]);

  const handleSetLang = useCallback((newLang: Language) => {
    setLang(newLang);
    try {
      window.localStorage.setItem("naan-stop-lang", newLang);
    } catch {}
  }, []);

  const value = useMemo<LanguageContextType>(() => {
    const site = content.site;
    const waLink = (message: string) =>
      `https://wa.me/${site.phone}?text=${encodeURIComponent(message)}`;
    return {
      lang,
      setLang: handleSetLang,
      t: content.t[lang] as typeof translations.es,
      SITE: site,
      MENU: content.menu,
      NAV_LINKS: content.nav,
      GALLERY: content.gallery,
      waLink,
      mapsUrl: () =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${site.name} ${site.subtitle}, ${site.address}`
        )}`,
      waMsg: lang === "es" ? site.waMessageEs : site.waMessage,
    };
  }, [content, lang, handleSetLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
