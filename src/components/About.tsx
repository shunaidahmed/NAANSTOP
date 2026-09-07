import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FlameIcon } from "./icons";
import { useLayoutEffect, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHTS_ES = [
  { title: "A la Parrilla", desc: "Cada taco se aplasta y tuesta en la parrilla solo después de pedir." },
  { title: "Ingredientes Frescos", desc: "Patatas cortadas a mano, salsa de queso real y marinadas hechas en casa a diario." },
  { title: "Grandes Sabores", desc: "Rellenos generosos envueltos en una tortilla crujiente — sin atajos." },
  { title: "Servicio Rápido", desc: "Caliente y listo rápido, porque los antojos no esperan." },
];
const HIGHLIGHTS_EN = [
  { title: "Grilled to Order", desc: "Every taco is smashed and toasted on the grill only after you order." },
  { title: "Fresh Ingredients", desc: "Hand-cut fries, real cheese sauce and marinades made in-house daily." },
  { title: "Big Flavours", desc: "Generous fillings wrapped in a crispy tortilla — no shortcuts." },
  { title: "Quick Service", desc: "Hot and ready fast, because cravings can't wait." },
];

const GALLERY_ES = [
  { src: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80", alt: "Taco francés cercano" },
  { src: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=1200&q=80", alt: "Hamburguesa de pollo" },
  { src: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80", alt: "Patatas fritas" },
  { src: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80", alt: "Batido de chocolate" },
  { src: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80", alt: "Taco de queso" },
  { src: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80", alt: "Taco especial" },
];
const GALLERY_EN = [
  { src: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80", alt: "French taco close-up" },
  { src: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=1200&q=80", alt: "Chicken burger" },
  { src: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80", alt: "French fries" },
  { src: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80", alt: "Chocolate shake" },
  { src: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80", alt: "Cheese taco" },
  { src: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80", alt: "Special taco" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { lang, t } = useLanguage();

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-story-card]");
      gsap.fromTo("[data-story-copy]", { opacity: 0, y: 70 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top 72%", end: "top 25%", scrub: 1 } });
      cards.forEach((card, index) => {
        gsap.fromTo(card, { opacity: 0.25, y: 90 + index * 22, scale: 0.88 }, { opacity: 1, y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: card, start: "top 92%", end: "top 42%", scrub: 1 } });
      });
    }, sectionRef);
    return () => context.revert();
  }, []);

  const highlights = lang === "es" ? HIGHLIGHTS_ES : HIGHLIGHTS_EN;
  const gallery = lang === "es" ? GALLERY_ES : GALLERY_EN;

  return (
    <section id="about" ref={sectionRef} className="border-y border-white/10 bg-black/10 px-4 py-32 sm:px-8 md:py-48 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="story-pin" data-story-copy>
          <p className="editorial-kicker font-label">{lang === "es" ? "Hecho cuando golpea el antojo" : "Made after the craving hits"}</p>
          <h2 className="editorial-heading mt-6 max-w-xl text-6xl text-white sm:text-7xl font-heading">
            CRISPY<br />
            <span className="text-brand">{lang === "es" ? "POR FUERA." : "OUTSIDE."}</span><br />
            {lang === "es" ? "QUESOSO." : "CHEESY."}
          </h2>
          <p className="mt-8 max-w-md text-base leading-relaxed text-neutral-400 font-body">{t.about.description}</p>
          <div className="mt-12 flex items-center gap-4 text-xs font-label uppercase tracking-[0.2em] text-neutral-500">
            <span className="h-px w-12 bg-brand" />
            {t.about.tagline}
          </div>
        </div>

        <div className="space-y-8">
          {gallery.map((gallery, index) => (
            <figure key={gallery.src} data-story-card className={`story-card cafe-card group relative overflow-hidden rounded-[1.5rem] ${index % 3 === 1 ? "lg:ml-20" : ""}`}>
              <img src={gallery.src} alt={gallery.alt} loading="lazy" decoding="async" width={1200} height={800} className="h-full w-full object-cover" />
              <div className="image-wash absolute inset-0" />
              <figcaption className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-4">
                <span className="font-heading text-3xl text-white">{gallery.alt}</span>
                <span className="font-mono text-xs text-white/55">0{index + 1} / 06</span>
              </figcaption>
            </figure>
          ))}
          <div className="story-accordion pt-8" aria-label={lang === "es" ? "Por qué vuelven" : "Why people come back"}>
            {highlights.map((highlight) => (
              <article key={highlight.title} className="cafe-card rounded-2xl p-6">
                <FlameIcon className="h-5 w-5 text-brand" />
                <h3 className="mt-8 font-heading text-xl text-white">{highlight.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400 font-body">{highlight.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
