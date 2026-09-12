import { useEffect, useState } from "react";
import type { NavLink } from "../cms/content";
import { useLanguage } from "../i18n/LanguageContext";
import { BagIcon, WhatsAppIcon } from "./icons";
import { useCart } from "../cart/CartContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const { lang, t, SITE, NAV_LINKS, waLink, waMsg } = useLanguage();
  const cart = useCart();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActive("contact");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    NAV_LINKS.forEach((link) => {
      const el = document.getElementById(link.href.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [NAV_LINKS]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navLabel = (link: NavLink) => lang === "es" ? link.labelEs : link.label;

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 transition-colors sm:px-8">
      <nav className="site-nav mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-4 sm:px-6" aria-label="Main navigation">
        <a href="#home" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {/* The brand lockup is dark ink on white, so it sits on its own light
              plate rather than being inverted or recoloured. */}
          <span className={`flex h-11 items-center rounded-xl bg-[#f6f1ea] px-2.5 ring-1 transition-all duration-500 ${scrolled ? "ring-brand/60" : "ring-white/15"}`}>
            <img src="/logo.png" alt={`${SITE.name} ${SITE.subtitle}`} width={760} height={537} className="h-8 w-auto" />
          </span>
          <span className="hidden whitespace-nowrap font-logo text-lg tracking-wider text-white sm:inline">NAAN<span className="text-brand"> STOP</span></span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} data-active={active === link.href.slice(1)} className="nav-link font-nav">{navLabel(link).toUpperCase()}</a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" className="hidden font-btn items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark md:inline-flex">
            <WhatsAppIcon className="h-4 w-4" />
            {t.nav.orderNow}
          </a>
          <button type="button" onClick={() => cart.setOpen(true)} aria-label={`${t.nav.cart}${cart.count ? ` — ${cart.count}` : ""}`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-200 transition hover:border-brand hover:text-brand">
            <BagIcon className="h-5 w-5" />
            {cart.count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{cart.count}</span>
            )}
          </button>
          <LanguageSwitcher />
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? t.nav.closeMenu : t.nav.openMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-700 text-neutral-200 transition hover:border-brand hover:text-brand md:hidden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-ink/98 md:hidden">
          <ul className="flex flex-col gap-2 px-6 pt-8">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <a href={link.href} onClick={() => setOpen(false)} className="block border-b border-neutral-800 py-4 font-nav text-2xl tracking-widest text-neutral-100 transition-colors hover:text-brand">{navLabel(link).toUpperCase()}</a>
              </li>
            ))}
            <li className="pt-6">
              <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex w-full font-btn items-center justify-center gap-2 rounded-full bg-brand px-5 py-4 text-base font-semibold text-white transition hover:bg-brand-dark">
                <WhatsAppIcon className="h-5 w-5" />
                {t.nav.orderOnWhatsApp}
              </a>
            </li>
            <li className="pt-2 text-center text-xs tracking-widest text-neutral-500">{SITE.name} · {SITE.subtitle}</li>
          </ul>
        </div>
      )}
    </header>
  );
}
