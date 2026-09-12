# NAAN STOP — French Tacos 🍟🌮

A minimalist, single-page website for the NAAN STOP FRENCH TACOS restaurant.
Built with **TypeScript**, **React** and **Tailwind CSS** in a black & red
color scheme, with WhatsApp ordering built in.

## Run locally

```bash
npm install
npm run dev        # start dev server → http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # preview the production build
```

## Layout

```
api/                     one serverless function — content, auth, uploads, publish
brand/                   design sources, never served
  fonts/                 licensed originals (gitignored)  -> npm run brand
  logo/                  logo artwork                     -> npm run brand
public/                  served verbatim
  admin/                 the CMS panel (plain HTML/CSS/JS, no build step)
  fonts/                 generated woff2
  logo.png favicon.png robots.txt
scripts/
  build-brand.mjs        brand/ -> public/            (npm run brand)
  gen-defaults.mjs       src/cms/content.ts -> public/admin/defaults.json
  check.mjs              npm run check
src/
  cart/                  basket, totals, WhatsApp message
  cms/                   editable shape, defaults, overlay merge, SEO + tags
  components/            the page
  data/site.ts           the shipped content defaults
  i18n/                  language context, copy, placeholder helper
```

Published content overlays `src/data/site.ts` and `src/i18n/translations.ts`,
so the site still renders if the API is unreachable.

## Admin panel

The site has a CMS at **`/admin/`** — menu, copy, photos, logo, settings,
analytics, with draft → publish. Setup and day-to-day use:
**[SITE-MANAGER.md](SITE-MANAGER.md)**.

## Look and feel

Type is all self-hosted in `public/fonts/` — no Google Fonts request.

| Role | Face |
|---|---|
| Headings, hero, body copy | **Supra Classic** — the face in the logo |
| Dish names, nav, buttons, prices, labels | **Gilroy** |

Both families live in `fonts/` and are converted to woff2 by hand. Gilroy
still ships only Bold and Black — the other sixteen files there are 0-byte
stubs — which is why body copy is Supra Classic Book and not Gilroy Regular.
Drop the full Gilroy in and point `--font-body` at it.

Dark is the default theme; the toggle in the header switches to light and the
choice is remembered. Colours are semantic tokens in `src/index.css`
(`--color-bg`, `--color-fg`, `--color-muted`, `--color-line`, …) redeclared
under `html[data-theme="light"]`, so components use `text-muted` or
`border-line` and follow the theme without knowing which one is on.

## Customize the shipped defaults — edit `src/data/site.ts`

Everything about your business lives in this one file:

| What | Where |
| --- | --- |
| **WhatsApp number** | `SITE.phone` — country code + digits only, e.g. `923001234567` |
| **Address** | `SITE.address` |
| **Opening hours** | `SITE.hours` |
| **Currency symbol** | `SITE.currency` |
| **Menu items & prices** | `MENU` — numeric prices, optional sizes |
| **Ordering rules** | `SITE.delivery`, `deliveryFee`, `minDeliveryOrder`, `currency` |
| **Hero / About photos** | `HERO_SLIDES`, `ABOUT_SLIDES` |
| **Nav links** | `NAV_LINKS` |

Customers build a basket, choose pickup or delivery, add their details, and the
site writes the whole order — lines, subtotal, delivery fee, total — into a
WhatsApp message they send from their own account.

```bash
npm run check      # merge, order-message totals, session cookie, panel shape
```

## Tech

- Vite 7 + React 19 + TypeScript (strict)
- Tailwind CSS v4 (brand colors `#E31E24` / `#15151B` / `#F5F5F5` in `src/index.css`)
- Logo: `public/logo.svg` (vector sign-style badge); original PNG kept as `public/logo.png`
- No other dependencies