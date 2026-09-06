import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { DEFAULT_WA_MESSAGE, mapsUrl, SITE, waLink } from "../data/site";
import { ClockIcon, PinIcon, WhatsAppIcon } from "./icons";
import { useRef, useState } from "react";

export default function Contact() {
  const [motifImageFailed, setMotifImageFailed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.25 });
  const ySpring = useSpring(0, { stiffness: 80, damping: 14 });
  const yPos = useTransform(ySpring, (v) => `-${v * 8}px`);
  const opacityVar = useTransform(ySpring, (v) => 0.92 + v * 0.08);

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08 + 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  };

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="mx-auto max-w-7xl px-4 py-32 sm:px-8 md:py-48 lg:px-12"
      style={{ y: yPos, opacity: opacityVar }}
    >
      <motion.div variants={textVariants} className="max-w-3xl">
        <p className="editorial-kicker">Ready when you are</p>
        <h2 className="editorial-heading mt-5 font-display text-6xl text-white sm:text-8xl">
          MAKE IT
          <br />
          <span className="text-brand">A MEAL.</span>
        </h2>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-neutral-400">
          Find the grill, check the hours, or send the first message. We will
          take it from there.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-4 lg:grid-cols-12">
        {/* WhatsApp card */}
        <motion.a
          href={waLink(DEFAULT_WA_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          whileHover={{ y: -6, scale: 1.01 }}
          className="cafe-card group relative flex flex-col items-center justify-center rounded-2xl p-8 text-center overflow-hidden lg:col-span-4"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white transition group-hover:scale-110">
            <WhatsAppIcon className="h-7 w-7" />
          </span>
          <h3 className="mt-4 font-display text-lg tracking-widest text-white">WHATSAPP</h3>
          <p className="mt-1 text-sm text-neutral-300">+{SITE.phone}</p>
          <p className="mt-3 text-xs uppercase tracking-widest text-brand">
            Tap to chat →
          </p>
        </motion.a>

        {/* Location card */}
        <motion.a
          href={mapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          custom={1}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          whileHover={{ y: -6, scale: 1.014, borderColor: "rgba(227,30,36,0.5)" }}
          className="cafe-card group relative flex flex-col items-center justify-center rounded-2xl p-8 text-center overflow-hidden lg:col-span-4"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand/50 text-brand transition group-hover:scale-110">
            <PinIcon className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-display text-lg tracking-widest text-white">FIND US</h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-300">{SITE.address}</p>
          <p className="mt-3 text-xs uppercase tracking-widest text-brand">
            Tap to open in Maps →
          </p>
        </motion.a>

        {/* Hours card */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="cafe-card relative flex flex-col items-center justify-center rounded-2xl p-8 text-center overflow-hidden lg:col-span-4"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand/50 text-brand">
            <ClockIcon className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-display text-lg tracking-widest text-white">OPENING HOURS</h3>
          <ul className="mt-2 space-y-1">
            {SITE.hours.map((h) => (
              <li key={h.days} className="text-sm text-neutral-300">
                <span className="text-neutral-500">{h.days}:</span>{" "}
                {h.time}
              </li>
            ))}
          </ul>
          {SITE.hoursNote && (
            <p className="mt-3 text-xs tracking-wide text-neutral-500">
              {SITE.hoursNote}
            </p>
          )}
        </motion.div>

        {/* Bordered card with motif image */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          whileHover={{ y: -4, scale: 1.008 }}
          className="cafe-card relative mt-4 flex flex-col items-center gap-4 overflow-hidden rounded-2xl px-6 py-16 text-center lg:col-span-12"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-clip-border border-shimmer" />
          {!motifImageFailed && (
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80"
                alt="Freshly grilled tacos"
                loading="lazy"
                decoding="async"
                width={800}
                height={240}
                onError={() => setMotifImageFailed(true)}
                className="h-20 w-auto rounded-xl object-cover drop-shadow-lg transition-transform duration-500"
              />
            </div>
          )}
          <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
            Hungry right now? Send us a message on WhatsApp and we'll have your
            order sizzling on the grill.
          </p>
          <a
            href={waLink(DEFAULT_WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with NAAN STOP on WhatsApp"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Chat with us
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}