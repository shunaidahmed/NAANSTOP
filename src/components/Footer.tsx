import { DEFAULT_WA_MESSAGE, NAV_LINKS, SITE, waLink } from "../data/site";
import { WhatsAppIcon } from "./icons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-8 lg:px-12">
        <a href="#home" className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt={`${SITE.name} logo`}
            className="h-12 w-12 rounded-full ring-1 ring-neutral-700"
          />
          <span className="font-display text-xl tracking-wider text-white">
            NAAN <span className="text-brand">STOP</span>
          </span>
        </a>

        <div className="flex flex-col justify-between gap-8 border-y border-white/10 py-8 sm:flex-row sm:items-center">
          <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
            Grilled in El Masnou. Wrapped for the road. Open when the craving
            gets specific.
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-xs font-semibold uppercase tracking-widest text-neutral-400 transition hover:text-brand"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={waLink(DEFAULT_WA_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand transition hover:text-white"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              Order
            </a>
          </li>
          </ul>
        </div>

        <p className="text-center text-xs tracking-wide text-neutral-600">
          © {year} {SITE.name} {SITE.subtitle}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}