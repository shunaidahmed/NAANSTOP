import type { NavLink } from "../cms/content";
import { useLanguage } from "../i18n/LanguageContext";
import { fmt } from "../i18n/fmt";
import { WhatsAppIcon } from "./icons";

export default function Footer() {
  const year = new Date().getFullYear();
  const { lang, t, SITE, NAV_LINKS, waLink, waMsg } = useLanguage();

  const navLabel = (link: NavLink) => lang === "es" ? link.labelEs : link.label;

  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-8 lg:px-12">
        <a href="#home" className="flex items-center gap-3">
          <span className="flex items-center rounded-2xl bg-[#f6f1ea] px-3 py-2 ring-1 ring-white/10">
            <img src="/logo.png" alt={`${SITE.name} ${SITE.subtitle}`} width={760} height={537} loading="lazy" className="h-14 w-auto" />
          </span>
          <span className="whitespace-nowrap font-logo text-xl tracking-wider text-white">NAAN <span className="text-brand">STOP</span></span>
        </a>

        <div className="flex flex-col justify-between gap-8 border-y border-white/10 py-8 sm:flex-row sm:items-center">
          <p className="max-w-sm text-sm leading-relaxed font-body text-neutral-500">
            {t.footer.description}
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="font-label text-xs font-semibold uppercase tracking-widest text-neutral-400 transition hover:text-brand">{navLabel(link)}</a>
              </li>
            ))}
            <li>
              <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex font-btn items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand transition hover:text-white">
                <WhatsAppIcon className="h-3.5 w-3.5" />
                {t.footer.order}
              </a>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs font-label tracking-wide text-neutral-600">
          {fmt(t.footer.allRightsReserved, { year })}
        </p>
      </div>
    </footer>
  );
}
