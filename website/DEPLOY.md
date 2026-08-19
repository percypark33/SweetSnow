# Deploy sweetsnow.org

This folder is the **source** for the Sweet Snow website. What you upload to
Netlify is a trimmed copy of it — see "Publishing an update" below.

**Canonical URL: `https://sweetsnow.org`** (bare domain). `www.sweetsnow.org`
redirects to it. Every config file in here assumes that direction — if you'd
rather make `www` primary, flip it in `_redirects`, `netlify.toml`,
`vercel.json`, and the `<link rel="canonical">` in `index.html`, or the site
will fight itself.

## What the page is

It's a **menu first**, not a marketing page. People reach it by scanning the QR
code on the business card while standing in the market, so the food starts
immediately — there is no hero banner to scroll past. The order runs:

1. Masthead — logo, address, and a live **Open now / Closed** pill (no hero
   slogan; the page opens straight into the menu)
2. Sticky index bar, which doubles as the menu's contents
3. A big **MENU** banner, then the menu: Premium Bingsu, Toppings, Hot &
   Fresh — numbered 1–12 in one continuous run, matching how guests order
   at the counter. (Cup Bingsu was removed 2026-08-18; its data is saved in
   `cup-bingsu-saved.js` for when it goes on sale.)
4. **In the works** — deliberately vague coming-soon notes, no dates
5. **Our story** — how the business started, in one quote and three short
   paragraphs. It sits directly above the ballot on purpose: once you know
   we're a family still figuring this out, the ask below reads as genuine.
6. **The ballot** — the dark section where customers vote on what we make next
7. Find us — address, hours, contact form

## What's included

| File | Purpose |
|------|---------|
| `index.html` | The whole page |
| `menu-2026-august.js` | **All menu content, prices, hours, and the ballot options — the only file to edit for a price change.** The in-store TV boards symlink to this same file. (Renamed from `menu-data.js` 2026-08-18.) |
| `cup-bingsu-saved.js` | Cup Bingsu data, parked for later. Not loaded by any page. |
| `menu-art.js` | Every bowl, cup, taiyaki and cookie, drawn as SVG in code. No food photos are used on the page. |
| `styles.css` / `app.js` | Design + interactivity |
| `assets/` | Logo, QR, the link-preview card, plus a photo library the page no longer loads |
| `share-card/` | Builds `assets/share-card.png` — the picture shown when the link is shared. Not published; it's a source folder. |
| `robots.txt` / `sitemap.xml` | SEO |
| `site.webmanifest` | Mobile "Add to Home Screen" |
| `CNAME` | GitHub Pages custom domain |
| `netlify.toml` / `vercel.json` / `_redirects` | Hosting + HTTPS redirects |

## Publishing an update

The page only loads four images, but `assets/` holds ~6 MB of older food
photos. Rather than publish those, deploy the trimmed copy:

- **`~/sweet-snow/sweetsnow-deploy/`** — the folder to drag onto Netlify
- **`~/sweet-snow/sweetsnow-deploy.zip`** — the same thing zipped, if you'd
  rather drop a single file

Both are ~800 KB and contain only what the page actually requests. They are
build artifacts, not the source — **never edit them.** Edit `website/`, then
rebuild:

```bash
cd ~/sweet-snow && rm -rf sweetsnow-deploy sweetsnow-deploy.zip \
  && mkdir -p sweetsnow-deploy/assets sweetsnow-deploy/netlify/functions \
  && cd website \
  && cp index.html thanks.html styles.css app.js menu-2026-august.js menu-art.js \
        _redirects netlify.toml robots.txt sitemap.xml site.webmanifest \
        ../sweetsnow-deploy/ \
  && cp assets/logo-primary.png assets/logo-icon.png assets/qr-website.png \
        assets/share-card.png ../sweetsnow-deploy/assets/ \
  && cp netlify/functions/inventory.js ../sweetsnow-deploy/netlify/functions/ \
  && cd ../sweetsnow-deploy && zip -r -X ../sweetsnow-deploy.zip . -x '.*' >/dev/null \
  && echo "rebuilt"
```

Dragging the full `website/` folder also works and is not wrong — it just
publishes the unused photos too.

### Where to drop it

Drop it onto the **existing** site, not the "new site" area. The live site is
`profound-gecko-9f3329` — that's the one holding the sweetsnow.org domain.
Creating a second site would deploy fine but leave the domain pointing at the
old version.

1. [app.netlify.com](https://app.netlify.com) → open `profound-gecko-9f3329`
2. **Deploys** tab
3. Drag the folder (or the zip) onto the manual-deploy drop zone
4. Wait for **Published**, then hard-refresh sweetsnow.org (Cmd+Shift+R)

## The link preview picture

When someone texts or posts `sweetsnow.org`, the picture that comes up is
`assets/share-card.png` — the cartoon bowls, not a food photo. It's built
from `share-card/card.html`, which reads the same `menu-2026-august.js` and
`menu-art.js` as the site, so it can't drift from the brand:

```bash
cd ~/sweet-snow/website/share-card && ./export.sh
```

Then rebuild the deploy folder and publish, or the old picture stays live.

**Caching:** iMessage, Facebook, and WhatsApp hold onto a preview for a
long time. After publishing a change, the old picture can keep showing up
for days. Two ways around it:

- Paste the URL into [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/)
  and hit **Scrape Again** — that clears their copy
- If it still won't budge, rename the file (`share-card-2.png`) and update
  the two `og:image` / `twitter:image` tags in `index.html`. A new filename
  is a new picture as far as they're concerned.

## Forms — read this after the first deploy

The rebuild changed which forms exist. Netlify detects forms from the HTML at
deploy time, so check **Site settings → Forms** once the deploy finishes.

| Form name | Status | What it collects |
|---|---|---|
| `menu-request` | **Now the ballot.** New fields. | `want`, `flavors` (both comma-separated ticks), `idea`, `name`, `email` |
| `contact` | Unchanged | `email`, `message` |
| `snow-club` | **Gone.** | The newsletter box was removed; email capture is now an optional field on the ballot. Old submissions stay in Netlify — nothing is deleted. |

Re-check notification settings for `menu-request`, since the ballot is the main
thing you'll want emailed to you. See [SETUP-FORMS.md](SETUP-FORMS.md).

Submit one ballot and one contact message after deploying to confirm both land.

## First-time host setup

### Netlify (current host)
1. Site settings → **Domain management** → add `sweetsnow.org`, set it as the
   **primary domain**. Add `www.sweetsnow.org` as an alias.
2. At your registrar, point DNS. A bare domain can't use a plain CNAME, so pick one:
   - **Easiest:** switch the domain's nameservers to Netlify DNS.
   - **Or keep your registrar's DNS:** add an `ALIAS`/`ANAME` record for the
     root pointing at `your-site.netlify.app`. If your registrar doesn't support
     ALIAS records, use the A record to Netlify's load balancer IP shown in the
     UI. Then add a `CNAME` for `www` → `your-site.netlify.app`.
3. HTTPS provisions automatically once DNS resolves — can take up to an hour.
4. Confirm `https://sweetsnow.org` loads **and** `https://www.sweetsnow.org`
   redirects to it.

### Vercel
1. Import project; set **Root Directory** to `website`.
2. Domains → add both `sweetsnow.org` and `www.sweetsnow.org`, bare as primary.
3. `vercel.json` already redirects `www` → bare.

### GitHub Pages
1. Put these files in the repo root (or `/docs`).
2. Settings → Pages → Deploy from branch. Custom domain uses the `CNAME` file.
3. Enable **Enforce HTTPS**. An apex domain needs four A records — see their
   custom-domain docs for current IPs.

## Domain checklist
- [x] Register / own **sweetsnow.org**
- [ ] Point DNS to your host
- [ ] SSL certificate active (https)
- [ ] Bare domain is primary; `www` redirects to it
- [ ] Update Google Business Profile website URL to `https://sweetsnow.org`
- [ ] Update Yelp website field
- [ ] Create mailbox **hello@sweetsnow.org** (Google Workspace, ImprovMX, etc.)
- [ ] Turn on form notifications — see [SETUP-FORMS.md](SETUP-FORMS.md)

## Local preview
```bash
cd ~/sweet-snow/website && python3 -m http.server 8099
```
Then open http://localhost:8099. Use the server rather than opening the file
directly — form posts and some paths behave differently over `file://`.

## Brand notes
- Canonical URL: `https://sweetsnow.org/`
- Contact: `hello@sweetsnow.org`
- No phone number on the site by choice — social links only
- Hours live in two places that must agree: `hours` (what people read) and
  `schedule` (24-hour, drives the Open/Closed pill) in `menu-2026-august.js`, plus the
  `openingHoursSpecification` JSON-LD in `index.html`. Currently Tue–Thu
  12:00–21:30, Fri–Sun 12:00–22:30, closed Monday.
