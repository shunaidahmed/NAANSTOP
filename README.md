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

## Admin panel

The site has a CMS at **`/admin/`** — menu, copy, images, settings, analytics,
with draft → publish. Setup and day-to-day use: **[SITE-MANAGER.md](SITE-MANAGER.md)**.

```
api/cms.ts             one serverless function — content, auth, uploads, history
public/admin/          the panel itself (plain HTML/CSS/JS, no build step)
src/cart/                the basket, order totals and the WhatsApp message
src/cms/content.ts     the editable shape + defaults + overlay merge
src/cms/head.ts        applies SEO and analytics tags to the live page
scripts/gen-defaults.mjs   writes public/admin/defaults.json from src/cms/content.ts
scripts/check.mjs      `npm run check` — merge + session-cookie checks
```

Storage is Vercel Blob. Published content overlays the files below, so the site
still renders if the API is unreachable.

## Look and feel

Type is **Gilroy** (self-hosted in `public/fonts/`, converted from the `fonts/`
folder in this repo) for display and UI, **Manrope** for body copy. Only
Gilroy Bold and Black carry bytes in that folder — the rest of the family
downloaded as 0-byte stubs — so the hierarchy is built from those two weights
plus case and slant.

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