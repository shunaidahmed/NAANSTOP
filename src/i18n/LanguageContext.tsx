import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations } from "./translations";
import type { Language } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.es;
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

  const handleSetLang = useCallback((newLang: Language) => {
    setLang(newLang);
    try {
      window.localStorage.setItem("naan-stop-lang", newLang);
    } catch {}
    document.documentElement.lang = newLang;
  }, []);

  const t = translations[lang] as typeof translations.es;

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
