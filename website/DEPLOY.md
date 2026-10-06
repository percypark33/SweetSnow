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
| `/` | `index.html` + `designs/production.js` | The new photo-studio home page ("01-photo-studio"). The HTML is a shell; `designs/production.js` renders the page into `#app` from `menu-2026-august.js`. `live.js` adds the address bar, Coming-soon / Cup Bingsu / idea sections and the Square stock badges. |
| `/community` | `community.html` + `app.js` + `menu-art.js` + `styles.css` | The previous illustrated menu page, kept for the **Vote / idea ballots** (linked from the home footer as "Share an idea"). Same data file. |
| `/thanks` | `thanks.html` | Form success page (`noindex`). |
| `/privacy` | `privacy.html` | Privacy notice for the Google tags. |
| any unknown URL | `404.html` | Branded not-found page (Vercel serves it automatically with status 404). |
| `/api/inventory` | `api/inventory.js` | Serverless function: live stock from Square → SOLD OUT / FEW LEFT badges. |
| `/api/form` | `api/form.js` | Serverless function: receives the two ballots and emails / forwards them. |

Other files: `menu-2026-august.js` (**all menu content, prices, hours — the only
file to edit for a price change**; the in-store TV boards read the same file),
`analytics.js` + `analytics-config.js` (GA4 + Google Ads, honours DNT/GPC),
`launch.css` (styles for the `live.js` sections), `designs/base.css` +
`designs/showcase.css` (home design system), `designs/page.css` (thanks /
privacy / 404), `designs/photos/*.webp` (640 and 1200 px product photos),
`assets/` (logos, icon set, share card, QR), `robots.txt`, `sitemap.xml`,
`site.webmanifest`, `vercel.json`. `cup-bingsu-saved.js` is an archive and is
not loaded by any page.

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

Then open http://localhost:8099. Clean URLs (`/community`, `/thanks`) and the
`/api/*` functions only work on Vercel; use `/community.html` etc. locally, or
run `npx vercel dev` from `website/` for the full behaviour.

## Hours and address — keep in step

Hours live in `menu-2026-august.js` as `hours` (display strings, used by the
TVs) and `schedule` (24-hour, drives the hours shown on `/` and the Open/Closed
pill on `/community`). The same hours are repeated in the JSON-LD and the
`<noscript>` block of `index.html` and in the JSON-LD of `community.html` —
update those three spots too when hours change. Currently Mon–Thu 5–10 pm,
Fri–Sun 1–10 pm.

Address and Instagram handle are read from `brand` in the data file on `/` and
`/community`; they are hard-coded in the footers of `thanks.html`,
`privacy.html` and `404.html`.

## The link preview picture

`/` uses the Mango Special hero photo (`designs/photos/mango-special-1200.webp`,
square) as its `og:image`; `/community` still uses the drawn
`assets/share-card.png` (1200×630). iMessage / Facebook / WhatsApp cache
previews for days — use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
→ **Scrape Again** after changing either.

## Icons and logos

- Favicon / app icons: `assets/icon-32.png`, `icon-192.png`, `icon-512.png`,
  `icon-512-maskable.png`, `apple-touch-icon.png` — generated from
  `assets/logo-icon.png` (the yellow 달빙 badge, kept as the master).
- Header logo: `assets/sweet-snow-arched-logo-240.png` on `/`, `/thanks`,
  `/privacy`, `404`; `-320.png` on `/community`; `sweet-snow-arched-logo.png`
  (905×564) is the master. `sweet-snow-stacked-logo.png` is the `/community`
  footer logo. `logo-primary.png` (old wordmark) is no longer used by any page.

## Brand notes

- Canonical URL: `https://www.sweetsnow.org/`
- No phone number on the site by choice — Instagram `@sweetsnow_oc` only.
- Design system for `/`: Arial/Helvetica, near-black `#181818`, `--muted #656565`,
  hairline `#e3e3e3`, square black buttons. `/community` keeps the illustrated
  sky-blue / navy / yellow "menu board" look (`styles.css :root`).
