import { useLanguage } from "../i18n/LanguageContext";

const WORDS_ES = ["Tacos Franceses", "Hamburguesas", "Patatas Cargadas", "Batidos", "A la Parrilla Fresca", "Tirada de Queso"];
const WORDS_EN = ["French Tacos", "Burgers", "Loaded Fries", "Shakes", "Grilled Fresh", "Cheese Pull"];

export default function Marquee() {
  const { lang } = useLanguage();
  const row = lang === "es" ? [...WORDS_ES, ...WORDS_ES] : [...WORDS_EN, ...WORDS_EN];
  return (
    <div className="relative overflow-hidden border-y border-brand/40 bg-brand py-3" aria-hidden="true">
      <div className="animate-marquee flex w-max items-center">
        {row.map((word, i) => (
          <span key={i} className="flex items-center gap-8 pr-8 font-display text-sm tracking-[0.25em] text-white">
            {word.toUpperCase()}
            <span className="text-black">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
