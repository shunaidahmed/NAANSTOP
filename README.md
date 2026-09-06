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

## Customize — edit `src/data/site.ts`

Everything about your business lives in this one file:

| What | Where |
| --- | --- |
| **WhatsApp number** | `SITE.phone` — country code + digits only, e.g. `923001234567` |
| **Address** | `SITE.address` |
| **Opening hours** | `SITE.hours` |
| **Currency symbol** | `SITE.currency` |
| **Menu items & prices** | `MENU` — add/remove categories and items freely |
| **Nav links** | `NAV_LINKS` |

Every "Order" button opens WhatsApp (`wa.me/<number>`) with a pre-filled
message naming the item, so orders arrive ready to read.

## Tech

- Vite 7 + React 19 + TypeScript (strict)
- Tailwind CSS v4 (brand colors `#E31E24` / `#15151B` / `#F5F5F5` in `src/index.css`)
- Logo: `public/logo.svg` (vector sign-style badge); original PNG kept as `public/logo.png`
- No other dependencies