import { useLanguage } from "../i18n/LanguageContext";

export default function Marquee() {
  const { t } = useLanguage();
  const words = t.marquee;
  const row = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-brand/40 bg-brand py-3" aria-hidden="true">
      <div className="animate-marquee flex w-max items-center">
        {row.map((word, i) => (
          <span key={i} className="flex items-center gap-8 pr-8 font-label text-sm tracking-[0.25em] text-white">
            {word.toUpperCase()}
            <span className="text-black">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
