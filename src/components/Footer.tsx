import type { NavLink } from "../cms/content";
import { useLanguage } from "../i18n/LanguageContext";
import { fmt } from "../i18n/fmt";
import { WhatsAppIcon } from "./icons";

export default function Footer() {
  const year = new Date().getFullYear();
  const { lang, t, SITE, NAV_LINKS, waLink, waMsg } = useLanguage();

  const navLabel = (link: NavLink) => lang === "es" ? link.labelEs : link.label;

  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-8 lg:px-12">
        <a href="#home" aria-label={SITE.name} className="flex w-fit items-center">
          <img
            src="/logo.png"
            alt={`${SITE.name} ${SITE.subtitle}`}
            width={400}
            height={400}
            loading="lazy"
            className="h-20 w-20 rounded-full"
          />
        </a>

        <div className="flex flex-col justify-between gap-8 border-y border-line py-8 sm:flex-row sm:items-center">
          <p className="max-w-sm text-sm leading-relaxed font-body text-faint">
            {t.footer.description}
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="font-label text-xs font-semibold uppercase tracking-widest text-muted transition hover:text-brand">{navLabel(link)}</a>
              </li>
            ))}
            <li>
              <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex font-btn items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand transition hover:text-fg">
                <WhatsAppIcon className="h-3.5 w-3.5" />
                {t.footer.order}
              </a>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs font-label tracking-wide text-faint">
          {fmt(t.footer.allRightsReserved, { year })}
        </p>
      </div>
    </footer>
  );
}
