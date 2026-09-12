import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import { WhatsAppIcon } from "./icons";



export default function Hero() {
  const [activeImage, setActiveImage] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const { lang, t, waLink, waMsg, GALLERY } = useLanguage();
  const slides = GALLERY.hero;

  useEffect(() => {
    if (galleryPaused) return;
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % slides.length);
    }, 4600);
    return () => window.clearInterval(timer);
  }, [galleryPaused, slides.length]);

  const features = t.hero.features;

  const slide = slides[activeImage] ?? slides[0];
  if (!slide) return null;

  return (
    <section id="home" className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-20 pt-28 sm:px-8 lg:px-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_38%,rgba(227,30,36,0.22),transparent_28%),radial-gradient(circle_at_18%_82%,rgba(211,112,64,0.12),transparent_25%)]" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative z-10 max-w-4xl">
          <p className="editorial-kicker font-label">{t.hero.subtitle}</p>
          <h1 className="editorial-heading mt-6 max-w-6xl text-[clamp(3.7rem,8.5vw,8.5rem)] text-white font-hero">
            {t.hero.title1} <span className="text-brand">{t.hero.titleAccent}</span>
            <br />
            <span className="outline-word">{t.hero.title2}</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg font-body">
            {t.hero.description}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex font-btn items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <WhatsAppIcon className="h-4 w-4" />
              {t.hero.orderOnWhatsApp}
            </motion.a>
            <motion.a href="#menu" className="inline-flex font-btn items-center justify-center gap-2 border-b border-neutral-500 px-1 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-200 transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" whileHover={{ x: 5, borderColor: "rgba(227,30,36,0.8)" }} whileTap={{ scale: 0.98 }}>
              {t.hero.exploreMenu}
            </motion.a>
          </div>
          <ul className="mt-16 flex flex-wrap gap-x-7 gap-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-xs font-label uppercase tracking-[0.16em] text-neutral-500">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand" />
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, delay: 0.15, ease: "easeOut" }} className="relative mx-auto w-full max-w-xl lg:ml-auto" onMouseEnter={() => setGalleryPaused(true)} onMouseLeave={() => setGalleryPaused(false)} onFocusCapture={() => setGalleryPaused(true)} onBlurCapture={() => setGalleryPaused(false)}>
          <div className="absolute -inset-8 rounded-full bg-brand/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-neutral-900/70 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
            <div className="relative aspect-[0.86] overflow-hidden rounded-[1.5rem]">
              <AnimatePresence mode="sync">
                <motion.img key={slide.src} src={slide.src} alt={slide.alt} width={1200} height={1400} fetchPriority={activeImage === 0 ? "high" : "low"} decoding="async" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 1.1, ease: "easeInOut" }} className="absolute inset-0 h-full w-full object-cover will-change-transform" />
              </AnimatePresence>
              <div className="image-wash absolute inset-0" />
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div key={activeImage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}>
                      <p className="text-xs font-label uppercase tracking-[0.22em] text-white/65">{lang === "es" ? slide.kickerEs : slide.kicker}</p>
                      <p className="mt-2 font-heading text-3xl text-white">{lang === "es" ? slide.captionEs : slide.caption}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <span className="font-mono text-xs text-white/55">{String(activeImage + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
