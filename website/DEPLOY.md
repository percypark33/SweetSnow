# Deploy sweetsnow.org

This folder (`website/`) is the **source of truth** for the Sweet Snow website.
It was synced from the live site on 2026-10-06 and is meant to be deployed by
**Vercel** straight from this GitHub repo — no build step, no dependencies.

**Canonical URL: `https://www.sweetsnow.org/`** (`www`). The bare domain
`sweetsnow.org` 308-redirects to it (`vercel.json`), `http://` → `https://`.
`robots.txt`, `sitemap.xml`, every `<link rel="canonical">` and the JSON-LD all
use `www` — keep it that way or the site will fight itself.

## What the site is

| URL | File | What it is |
|---|---|---|
| `/` | `index.html` + `designs/production.js` | The home page ("01-photo-studio", pastel-sky palette). The HTML is a shell with the `<head>`, a `<template id="community-template">` holding the two Vote ballots, and a loader overlay; `designs/production.js` renders everything else into `#app` from `menu-2026-august.js` (menu grid, Catering, Coming soon, Visit, live Open/Closed status, Menu JSON-LD, Square stock badges). `designs/brand-story.js` appends the "Our story" section + nav link; `designs/loading.js` shows the logo loader for a second on each click. |
| `/thanks` | `thanks.html` | Form success page (`noindex`). |
| `/privacy` | `privacy.html` | Privacy notice for the Google tags. |
| `/community` | — | Retired 2026-10-07; `vercel.json` redirects it to `/#vote`. |
| any unknown URL | `404.html` | Branded not-found page (Vercel serves it automatically with status 404). |
| `/api/inventory` | `api/inventory.js` | Serverless function: live stock from Square → SOLD OUT / FEW LEFT badges. |
| `/api/form` | `api/form.js` | Serverless function: receives the two ballots and emails / forwards them. |

Other files: `menu-2026-august.js` (**all menu content, prices, hours — the only
file to edit for a price change**; the in-store TV boards read the same file),
`analytics.js` + `analytics-config.js` (GA4 + Google Ads, honours DNT/GPC),
`designs/base.css` + `designs/showcase.css` + `designs/production.css` (home
design system), `designs/loading.css`, `designs/brand-story.css`,
`designs/page.css` (thanks / privacy / 404), `designs/photos/*.webp` (640 and
1200 px product photos), `assets/` (logos, icon set, share card, QR),
`robots.txt`, `sitemap.xml`, `site.webmanifest`, `vercel.json`.
`cup-bingsu-saved.js` is an archive and is not loaded by any page.

## Publishing an update

1. Edit files in `website/`, preview locally (below), commit, push to `main`.
2. Vercel builds and publishes automatically within a minute. There is nothing
   to drag-and-drop any more.

### Vercel project settings (one-time)

- Import the GitHub repo; set **Root Directory** to `website`. Framework preset:
  **Other**. No build command, no output directory.
- Domains: `www.sweetsnow.org` (primary) and `sweetsnow.org` (redirect).
- Environment variables (Project → Settings → Environment Variables):

| Variable | Needed for | Notes |
|---|---|---|
| `RESEND_API_KEY` + `FORM_TO_EMAIL` | Vote / idea forms → email | Free account at resend.com. `FORM_TO_EMAIL` can be a comma-separated list. Optional `FORM_FROM_EMAIL` if you verify your own domain there (default sender is Resend's test address). |
| `FORM_WEBHOOK_URL` | Vote / idea forms → spreadsheet / Zapier / Make | Optional, can be used alongside or instead of Resend. Receives JSON `{ form, label, submittedAt, fields, userAgent }`. |
| `SQUARE_ACCESS_TOKEN` | SOLD OUT / FEW LEFT badges | Without it `/api/inventory` returns `{"items":[],"skipped":"no-token"}` and no badges show. Optional: `SQUARE_LOCATION_ID`, `SQUARE_LOW_STOCK` (default 3), `SQUARE_ENVIRONMENT=sandbox`. |

Until one of the form variables is set, submitting a ballot shows a plain
"Our idea box isn't connected yet" page instead of a false success. After
setting them, redeploy and **submit one idea and one vote yourself** to confirm
they arrive.

## Local preview

```bash
cd website && python3 -m http.server 8099
```

Then open http://localhost:8099. Clean URLs (`/thanks`, `/privacy`) and the
`/api/*` functions only work on Vercel; use `/thanks.html` etc. locally, or run
`npx vercel dev` from `website/` for the full behaviour.

## Hours and address — keep in step

Hours live in `menu-2026-august.js` as `hours` (display strings, used by the
TVs) and `schedule` (24-hour, drives the hours shown in the Visit section and
the live Open/Closed status on `/`). The same hours are repeated in the JSON-LD
of `index.html` — update that too when hours change. Currently Mon–Thu
5–10 pm, Fri–Sun 1–10 pm.

Address and Instagram handle are read from `brand` in the data file on `/`;
they are hard-coded in the footers of `thanks.html`, `privacy.html` and
`404.html`.

## The link preview picture

`/` uses the drawn `assets/share-card.png` (1200×630) as its `og:image`
(built from `share-card/card.html` in the owner's tree). iMessage / Facebook / WhatsApp cache
previews for days — use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
→ **Scrape Again** after changing either.

## Icons and logos

- Favicon / app icons: `assets/icon-32.png`, `icon-192.png`, `icon-512.png`,
  `icon-512-maskable.png`, `apple-touch-icon.png` — generated from
  `assets/logo-icon.png` (the yellow 달빙 badge, kept as the master).
- Header logo: `/` uses the master `assets/sweet-snow-arched-logo.png`
  (905×564) because the loader and brand-story section load it at full size
  anyway; `/thanks`, `/privacy` and `404` use the 3 KB `-240.png`. `-320.png`,
  `sweet-snow-stacked-logo.png` and `logo-primary.png` are no longer used by
  any page.

## Brand notes

- Canonical URL: `https://www.sweetsnow.org/`
- No phone number on the site by choice — Instagram `@sweetsnow_oc` only.
- Design system for `/`: Arial/Helvetica, navy text on white and pastel sky
  panels (`designs/production.css`), square dark buttons; `#747474` is the
  lightest text colour that still passes AA on white.
