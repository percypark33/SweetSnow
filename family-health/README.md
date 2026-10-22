# Family Health Guide

A personal health guide and diet manual for every member of the family, built
from each person's allergies, health conditions, medications, blood type, diet
and food preferences. Edit a profile and every guide, the weekly meal plan and
the grocery list rebuild themselves.

> General guidance only. It is not medical advice. When a doctor, pharmacist
> or dietitian says something different, follow them and record it in the
> profile ("Must avoid", "Limit", calorie override or Notes).

This folder is separate from `website/`. It is **not** deployed with
sweetsnow.org (Vercel only publishes `website/`).

## Run it on your MacBook

No install needed: it's plain HTML/CSS/JavaScript.

**Option A: one file (easiest)**
1. Download `Family-Health-Guide.html` and put it somewhere permanent, e.g. Documents.
2. Double-click it. It opens in Safari or Chrome; everything is inside that one file.
3. Optional: bookmark it in the browser.

`index.html` only works when its `css`, `js` and `sample` folders sit next to it.
After changing any source file, rebuild the single file with
`python3 family-health/build-single-file.py`.

**Option B: clone with git (best if you'll keep building it)**
```bash
cd ~/Documents
git clone https://github.com/percypark33/sweetsnow.git
cd sweetsnow
git checkout claude/family-health-guide
open family-health/index.html
```

### Where your data lives
- Profiles are saved in the browser you open the app in (`localStorage`), on
  that Mac only. Nothing is uploaded anywhere.
- Safari and Chrome keep **separate** copies, so pick one browser.
- **Data → Export backup** downloads a `family-health-backup-YYYY-MM-DD.json`.
  Do this regularly. **Import backup** restores it on any computer or browser.
- Backups contain private health information. `.gitignore` keeps them out of
  git, so don't commit them anywhere else either.

## Health check-up questions (the easy way to fill in a profile)

Most people don't know their allergies or conditions, so new profiles start with
about 10 minutes of everyday questions: body and activity, eating habits, what
happens after eating common foods, digestion, energy, sleep and mood, smoking and
alcohol, checkups and family history. Answers are scored with published tools:

| Tool | Screens for | Source |
|---|---|---|
| ADA Diabetes Risk Test | type 2 diabetes risk | Bang et al., Ann Intern Med 2009 |
| STOP-Bang | obstructive sleep apnea | Chung et al., Anesthesiology 2008 |
| PHQ-2 / GAD-2 | depression / anxiety | Kroenke et al. 2003 / 2007 |
| AUDIT-C | unhealthy drinking | Bush et al., Arch Intern Med 1998 |
| Rome IV | IBS pattern | ACG 2021 |
| USPSTF / AAP schedules | check-ups due by age and sex | uspreventiveservicestaskforce.org |

Every finding shows why it was triggered, what to do, the strength of evidence
and numbered sources. Findings are screening results, not diagnoses: only
things you state directly (e.g. "a doctor told me I have high blood pressure")
or reactions serious enough to avoid until tested are pre-ticked for the profile.
Suspicions (likely reflux, possible lactose intolerance) are offered unticked.
All scoring lives in `js/questionnaire.js` and is covered by
`tests/questionnaire.test.js`.

## New: trackers, blood tests, records and the meal builder

- **Sleep & stress tracker step** — pick Oura, WHOOP, Apple Watch, Fitbit, Garmin or
  Samsung, then import the app's CSV export (last 30 days are averaged; Oura seconds and
  WHOOP minutes are both handled) or type the averages. Findings use AASM sleep needs,
  AHA resting-heart-rate ranges and compare HRV with *your own* baseline. Device scores
  are labelled as consumer estimates, not diagnoses.
- **Blood test results step** — 15 common tests (A1C, glucose, lipids, eGFR, ALT,
  potassium, hemoglobin, ferritin, TSH, vitamin D, B12, uric acid) interpreted with ADA,
  ACC/AHA, KDIGO, WHO, AGA and NIH cut-offs. Metric units are converted. One abnormal
  diabetes-range result is offered unticked because a diagnosis needs a repeat test.
- **Health records step** — upload PDFs and photos (lab reports, visit notes, vaccine
  records). Stored in the browser's IndexedDB on this device and included in backups.
- **Build meals** (replaces the pre-made plan) — choose who's eating and which meal, then
  pick foods from Protein / Carbs / Fiber / Healthy-fat tabs. Every food card shows
  whether each person can eat it. The plate shows a live chart, macro bars against
  per-meal targets (RDA protein, AMDR carbs/fat, 14 g fiber per 1,000 kcal), a balance
  score and badges. Save meals to the week; the grocery list builds itself.
- **Where to buy** — each food links to nearby grocery stores (OpenStreetMap), a product
  comparison sorted by safety → Nutri-Score → processing level (Open Food Facts), links
  to Instacart/Walmart/Target/Whole Foods/Kroger, review searches, and the family's own
  taste ratings.

**Privacy:** the app only goes online when you press *Find stores* (sends a location or
ZIP to OpenStreetMap) or *Compare products* (sends a food name to Open Food Facts). No
health data ever leaves the device.

## What it does

| Screen | What you get |
|---|---|
| **Family** | Everyone at a glance, alerts that need attention, and a kitchen allergy chart for the fridge. |
| **Guide** (click a person) | Daily targets (calories, protein, fiber, sodium, sugar, sat fat, calcium, iron, fluids); Avoid / Limit / Eat more lists with the reason for each item; medication food interactions and timing; condition and life-stage notes; supplements to ask about; hidden allergen names on labels; a printable emergency card. |
| **Edit profile** | Top-9 allergens with severity plus any other allergy, intolerances, 18 conditions (incl. pregnancy), medications, diet (vegetarian, vegan, pescatarian, Mediterranean, lower-carb), halal/kosher/no-pork/no-beef/no-alcohol, must-avoid / limit / dislikes / favorites, calorie override, doctor and emergency contact. |
| **Log readings** | Weight, blood pressure, A1C, LDL. Latest weight drives calories; readings over common thresholds raise alerts. |
| **Build meals** | Pick foods by category to build each meal, see the plate's balance live, save meals to the week, and get a grocery list with where-to-buy links. |
| **Recipes** | 40 built-in recipes with a can/can't-eat dot for each person; add your own family recipes. |
| **Data** | Units (US / metric), export, import, demo family, delete everything. |

### How it updates itself
- Guides are recalculated from the profile every time you open them, so any
  edit takes effect immediately.
- Ages come from birth dates, so guidance changes on its own as kids grow
  (toddler → child → pre-teen…) or adults reach 51+ / 65+. The guide tells you
  ahead of time when that's about to happen.
- Logged readings feed calorie targets and alerts.
- The meal plan regenerates every Monday. A meal you chose is replaced, with a
  notice, if a profile change makes it unsafe for someone.
- Reminders appear when a profile hasn't been reviewed for 6 months, or when
  someone with a chronic condition has no readings for a year.

### Safety rules built in
- Allergens, celiac gluten, diet/religious rules, pregnancy-unsafe foods,
  MAOI tyramine, grapefruit with certain statins and blood-pressure drugs, and
  honey for infants are **hard blocks**. A dish is only planned if a safe swap
  exists.
- For a **severe** allergy, a swap must change the whole dish, not just one
  plate, to avoid cross-contact.
- A swap that introduces something else a person can't have (e.g. a tofu swap
  for someone with a soy allergy) is never offered.
- Conflicting advice is flagged instead of silently picked. For example,
  potassium-rich foods for blood pressure vs. a potassium limit for kidney
  disease.
- Blood type is recorded for the emergency card only. "Blood-type diets"
  aren't supported by research, so it doesn't change food advice.

## Project layout

```
family-health/
  index.html            app shell, open this
  css/styles.css        styles (light + dark mode, print layout)
  js/knowledge.js       ALL health knowledge: allergens, conditions, meds, diets, age bands, recipes
  js/engine.js          pure logic: profile → guide, meal plan, grocery list (no UI)
  js/questionnaire.js   everyday questions + validated screening scores
  js/labs.js            blood-test interpretation, tracker CSV import & analysis
  js/foods.js           build-a-meal foods (USDA nutrition), targets, balance score
  js/shop.js            nearby stores (OpenStreetMap) and products (Open Food Facts)
  js/docs.js            health records stored in IndexedDB
  js/store.js           saving, loading, backup import/export
  js/app.js             screens and buttons
  sample/demo-family.js a made-up family for trying it out
  tests/*.test.js       42 automated tests (engine, screening scores, labs, foods)
```

To correct or extend what the guide knows (add a condition, medication,
recipe…), edit `js/knowledge.js`. The engine picks it up automatically.

Run the tests (needs Node.js, `brew install node`):
```bash
node --test family-health/tests/*.test.js
```

## Road to a real app

The engine and knowledge base have no UI or browser dependencies, so they can
move into a mobile app unchanged.

1. **Now:** local web app on the Mac. Export backups to move data.
2. **Installable app (PWA):** add a manifest + service worker so it installs on
   iPhone/iPad/Mac home screens and works offline.
3. **Family sync:** an encrypted backend (e.g. Supabase or Firebase with
   row-level security) so everyone's phone shares the same profiles, with
   per-person edit permissions. Health data needs care here: encryption at
   rest, no third-party analytics, and HIPAA-grade hosting if it ever handles
   data for people outside the family.
4. **Native app:** wrap with Capacitor or rebuild the UI in React Native/Expo,
   reusing `knowledge.js` + `engine.js`.
5. **Nice next features:** Apple Health import (weight, BP), barcode scanning
   against allergen lists, push reminders for medication timing, shared
   shopping list, recipe import from URLs, and a reviewed-by-dietitian
   knowledge base.
