import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

type Theme = "dark" | "light";

const KEY = "naan-stop-theme";

/**
 * Dark is the house look, so it is the default. The choice is written to
 * <html data-theme> — an inline script in index.html reads it back before the
 * first paint, so a returning visitor never sees the wrong theme flash past.
 */
export default function ThemeToggle() {
  const { lang } = useLanguage();
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem(KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // Private browsing. The toggle still works for this visit.
    }
  }, [theme]);

  const label =
    theme === "dark"
      ? lang === "es"
        ? "Cambiar a modo claro"
        : "Switch to light mode"
      : lang === "es"
        ? "Cambiar a modo oscuro"
        : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" className="h-4.5 w-4.5" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
          <path d="M20 13.5A8.2 8.2 0 0 1 10.5 4a8.2 8.2 0 1 0 9.5 9.5Z" />
        </svg>
      )}
    </button>
  );
}
