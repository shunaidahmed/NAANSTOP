import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label="Switch language"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-300 transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span className="w-4 rounded-full bg-brand/20 px-1 py-0.5 text-[10px] font-bold text-brand">ES</span>
      <span className="text-neutral-600">/</span>
      <span className="w-4 rounded-full bg-neutral-700 px-1 py-0.5 text-[10px] font-bold text-neutral-400">EN</span>
    </button>
  );
}
