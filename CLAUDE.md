# Sweet Snow

Korean bingsu shop in Garden Grove, CA. This repo is the source of truth for sweetsnow.org (`website/`, deployed by Vercel from `main`; see `website/DEPLOY.md`).

**This repo is public.** Never commit sales, payroll, staff, customer or account data. Private business details live in the `sweet-snow-operator` skill; reports go to the Google Drive folder `Sweet Snow Reports`.

## Subagents (`.claude/agents/`)

| Area | Agent | Job | Writes to |
|---|---|---|---|
| Run the shop | `ops-manager` | Daily brief, weekly review, pay-period close, month end; delegates to the agents below | Drive reports |
| | `sales-reporter` | Sales, top items, labor, long shifts | Nothing |
| | `inventory-tracker` | Square sales × Recipe Map grams → daily usage, stock left, reorders | Sheets; Square inventory after approval |
| | `shift-planner` | Weekly schedule from targets, demand and availability | Schedule sheet (draft tab); calendar after approval |
| | `payroll-prep` | Pay-period hours, gross, tips, flags | Drive report |
| Money | `money-tracker` | Monthly money sheet | Sheets |
| | `receipt-logger` | Receipt photos → price per lb + expenses | Sheets |
| Menu & site | `square-catalog` | Square items, prices, modifiers, kiosk | Square, after approval |
| | `menu-updater` | Website and TV menu, prices, hours | This repo |
| | `site-checker` | Website QA | Nothing |
| Marketing | `marketing-analyst` | Post and ad performance, keywords, top tweaks | Drive report |
| | `trend-scout` | Viral formats to copy right now | `content/formats/` |
| | `content-planner` | Next week's posts + staff filming list | Drive plan |
| | `content-creator` | Rebuilds a viral format with our footage | `content/` |
| | `brand-reviewer` | Final check of anything customer-facing | Nothing |
| | `social-poster` | Schedules posts via Postiz | Social accounts, after approval |
| Customers | `customer-care` | Review, comment and complaint replies, themes | Gmail drafts |
| | `inbox-triage` | Sorts the inbox, routes and drafts | Gmail drafts and labels |

## Workflows

- **Price change:** `square-catalog` (preview → approve) + `menu-updater` → `site-checker`.
- **Content:** `marketing-analyst` + `trend-scout` → `content-planner` → staff film → `content-creator` → `brand-reviewer` → `social-poster` (draft → approve → schedule).
- **Customers:** `inbox-triage` → `customer-care` → `brand-reviewer` → Percy sends.
- **Receipts:** `inbox-triage` or a photo → `receipt-logger`; daily `inventory-tracker`.

## Rules for handing off

- Subagents can't ask the user questions. Put every detail in the prompt (item, old and new price, dates), and relay any question they return.
- `square-catalog`, `social-poster`, Square posting in `inventory-tracker` and calendar events in `shift-planner` preview first. Show the user the preview, and only after they say yes, run the agent again with `APPROVED` plus the approved preview. `ops-manager` never approves.
- Run independent agents in parallel.
- Never write to QuickBooks. Never delete in Square (archive). Never send email or post without approval.

## Connectors

| Connector | Used by |
|---|---|
| Square | sales, inventory, catalog, payroll, shifts, money, marketing, planning |
| Google Sheets | money, receipts, inventory, shifts |
| Google Drive | reports, sheet lookup, footage |
| Gmail | inbox-triage, customer-care |
| Google Calendar | shift-planner |
| QuickBooks | money-tracker (read only) |
| Postiz (CLI + `POSTIZ_API_KEY`) | social-poster, marketing-analyst |
| Supermetrics | marketing-analyst (Meta and Google Ads, Instagram, GA4) |
| Notion (optional) | content-planner, marketing-analyst |
| Ahrefs (optional) | marketing-analyst keywords |
