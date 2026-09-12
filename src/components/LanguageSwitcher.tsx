import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label={lang === "es" ? "Cambiar a ingles" : "Switch to Spanish"}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-300 transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {(["es", "en"] as const).map((code, i) => (
        <span key={code} className="contents">
          {i > 0 && <span className="text-neutral-600">/</span>}
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              lang === code ? "bg-brand/20 text-brand" : "bg-neutral-700/60 text-neutral-400"
            }`}
          >
            {code.toUpperCase()}
          </span>
        </span>
      ))}
    </button>
  );
}
