import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { DEFAULT_WA_MESSAGE, DEFAULT_WA_MESSAGE_ES, mapsUrl, SITE, waLink } from "../data/site";
import { ClockIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";
import { useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function Contact() {
  const [motifImageFailed, setMotifImageFailed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.25 });
  const ySpring = useSpring(0, { stiffness: 80, damping: 14 });
  const yPos = useTransform(ySpring, (v) => `-${v * 8}px`);
  const opacityVar = useTransform(ySpring, (v) => 0.92 + v * 0.08);
  const { lang } = useLanguage();

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 + 0.1, duration: 0.5, ease: "easeOut" } }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  };

  const waMsg = lang === "es" ? DEFAULT_WA_MESSAGE_ES : DEFAULT_WA_MESSAGE;

  return (
    <motion.section id="contact" ref={sectionRef} initial="hidden" animate={inView ? "visible" : "hidden"} className="mx-auto max-w-7xl px-4 py-32 sm:px-8 md:py-48 lg:px-12" style={{ y: yPos, opacity: opacityVar }}>
      <motion.div variants={textVariants} className="max-w-3xl">
        <p className="editorial-kicker">{lang === "es" ? "Listo cuando tú lo estés" : "Ready when you are"}</p>
        <h2 className="editorial-heading mt-5 font-display text-6xl text-white sm:text-8xl">
          {lang === "es" ? "HÁZLO" : "MAKE IT"}<br />
          <span className="text-brand">{lang === "es" ? "UNA COMIDA." : "A MEAL."}</span>
        </h2>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-neutral-400">
          {lang === "es" ? "Encuentra la parrilla, consulta los horarios o envía el primer mensaje. Nosotros nos encargamos del resto." : "Find the grill, check the hours, or send the first message. We will take it from there."}
        </p>
      </motion.div>

      <div className="mt-16 grid gap-4 lg:grid-cols-12">
        <motion.div custom={0} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} whileHover={{ y: -6, scale: 1.01 }} className="cafe-card group relative flex flex-col items-center justify-center rounded-2xl p-8 text-center overflow-hidden lg:col-span-4">
          <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white transition group-hover:scale-110"><WhatsAppIcon className="h-7 w-7" /></span>
          <h3 className="mt-4 font-display text-lg tracking-widest text-white">WHATSAPP</h3>
          <p className="mt-1 text-sm text-neutral-300">+{SITE.phone}</p>
          <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs uppercase tracking-widest text-brand transition hover:text-white">{lang === "es" ? "Toca para chatear →" : "Tap to chat →"}</a>
          <a href={`tel:+${SITE.phone}`} onClick={(event) => event.stopPropagation()} className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 transition hover:text-white">
            <PhoneIcon className="h-3.5 w-3.5" />
            {lang === "es" ? "Llamar a la parrilla" : "Call the grill"}
          </a>
        </motion.div>

        <motion.a href={mapsUrl()} target="_blank" rel="noopener noreferrer" custom={1} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} whileHover={{ y: -6, scale: 1.014, borderColor: "rgba(227,30,36,0.5)" }} className="cafe-card group relative flex flex-col items-center justify-center rounded-2xl p-8 text-center overflow-hidden lg:col-span-4">
          <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand/50 text-brand transition group-hover:scale-110"><PinIcon className="h-6 w-6" /></span>
          <h3 className="mt-4 font-display text-lg tracking-widest text-white">{lang === "es" ? "ENCUÉNTRANOS" : "FIND US"}</h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-300">{SITE.address}</p>
          <p className="mt-3 text-xs uppercase tracking-widest text-brand">{lang === "es" ? "Toca para abrir en Maps →" : "Tap to open in Maps →"}</p>
        </motion.a>

        <motion.div custom={2} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} whileHover={{ y: -4, scale: 1.01 }} className="cafe-card relative flex flex-col items-center justify-center rounded-2xl p-8 text-center overflow-hidden lg:col-span-4">
          <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand/50 text-brand"><ClockIcon className="h-6 w-6" /></span>
          <h3 className="mt-4 font-display text-lg tracking-widest text-white">{lang === "es" ? "HORARIO" : "OPENING HOURS"}</h3>
          <ul className="mt-2 space-y-1">
            {SITE.hours.map((h) => (
              <li key={h.days} className="text-sm text-neutral-300">
                <span className="text-neutral-500">{lang === "es" ? h.daysEs : h.days}:</span>{" "}
                {h.time}
              </li>
            ))}
          </ul>
          {SITE.hoursNote && (
            <p className="mt-3 text-xs tracking-wide text-neutral-500">{lang === "es" ? SITE.hoursNoteEs : SITE.hoursNote}</p>
          )}
        </motion.div>

        <motion.div custom={3} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} whileHover={{ y: -4, scale: 1.008 }} className="cafe-card relative mt-4 flex flex-col items-center gap-4 overflow-hidden rounded-2xl px-6 py-16 text-center lg:col-span-12">
          <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
          {!motifImageFailed && (
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80" alt="Freshly grilled tacos" loading="lazy" decoding="async" width={800} height={240} onError={() => setMotifImageFailed(true)} className="h-20 w-auto rounded-xl object-cover drop-shadow-lg transition-transform duration-500" />
            </div>
          )}
          <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
            {lang === "es" ? "Tienes hambre ahora? Envíanos un mensaje por WhatsApp y tendremos tu pedido chisporroteando en la parrilla." : "Hungry right now? Send us a message on WhatsApp and we'll have your order sizzling on the grill."}
          </p>
          <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" aria-label={lang === "es" ? "Chatea con NAAN STOP en WhatsApp" : "Chat with NAAN STOP on WhatsApp"} className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            <WhatsAppIcon className="h-4 w-4" />
            {lang === "es" ? "Chatea con nosotros" : "Chat with us"}
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
