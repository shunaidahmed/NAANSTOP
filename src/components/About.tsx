import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FlameIcon } from "./icons";
import { useLayoutEffect, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";

gsap.registerPlugin(ScrollTrigger);



export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { lang, t, GALLERY } = useLanguage();

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-story-card]");
      gsap.fromTo("[data-story-copy]", { opacity: 0, y: 70 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top 72%", end: "top 25%", scrub: 1 } });
      cards.forEach((card, index) => {
        gsap.fromTo(card, { opacity: 0.25, y: 60 + (index % 2) * 20, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: card, start: "top 92%", end: "top 42%", scrub: 1 } });
      });
    }, sectionRef);
    return () => context.revert();
  }, []);

  const h = t.about.highlights;
  const highlights = [
    { title: h.grilled, desc: h.grilledDesc },
    { title: h.fresh, desc: h.freshDesc },
    { title: h.flavours, desc: h.flavoursDesc },
    { title: h.quick, desc: h.quickDesc },
  ];
  const gallery = GALLERY.about;

  return (
    <section id="about" ref={sectionRef} className="border-y border-line bg-surface-2 px-4 py-32 sm:px-8 md:py-48 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="story-pin" data-story-copy>
          <p className="editorial-kicker font-label">{t.about.kicker}</p>
          <h2 className="editorial-heading mt-6 max-w-xl text-6xl text-fg sm:text-7xl font-heading">
            {t.about.heading1}<br />
            <span className="text-brand">{t.about.heading2}</span><br />
            {t.about.heading3}
          </h2>
          <p className="mt-8 max-w-md text-base leading-relaxed text-muted font-body">{t.about.description}</p>
          <div className="mt-12 flex items-center gap-4 text-xs font-label uppercase tracking-[0.2em] text-faint">
            <span className="h-px w-12 bg-brand" />
            {t.about.tagline}
          </div>
        </div>

        <div>
          <div className="grid gap-4 sm:grid-cols-2">
          {gallery.map((slide, index) => (
            <figure key={slide.src + index} data-story-card className="story-card cafe-card group relative overflow-hidden rounded-[1.5rem]">
              <img src={slide.src} alt={slide.alt} loading="lazy" decoding="async" width={1200} height={800} className="h-full w-full object-cover" />
              <div className="image-wash absolute inset-0" />
              <figcaption className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                <span className="on-photo font-heading text-2xl leading-tight">{lang === "es" ? slide.captionEs : slide.caption}</span>
                <span className="on-photo-dim font-mono text-xs">{String(index + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span>
              </figcaption>
            </figure>
          ))}
          </div>
          <div className="story-accordion pt-10" aria-label={t.about.tagline}>
            {highlights.map((highlight) => (
              <article key={highlight.title} className="cafe-card rounded-2xl p-6">
                <FlameIcon className="h-5 w-5 text-brand" />
                <h3 className="mt-8 font-heading text-xl text-fg">{highlight.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted font-body">{highlight.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
