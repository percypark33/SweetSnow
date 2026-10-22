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

## What it does

| Screen | What you get |
|---|---|
| **Family** | Everyone at a glance, alerts that need attention, and a kitchen allergy chart for the fridge. |
| **Guide** (click a person) | Daily targets (calories, protein, fiber, sodium, sugar, sat fat, calcium, iron, fluids); Avoid / Limit / Eat more lists with the reason for each item; medication food interactions and timing; condition and life-stage notes; supplements to ask about; hidden allergen names on labels; a printable emergency card. |
| **Edit profile** | Top-9 allergens with severity plus any other allergy, intolerances, 18 conditions (incl. pregnancy), medications, diet (vegetarian, vegan, pescatarian, Mediterranean, lower-carb), halal/kosher/no-pork/no-beef/no-alcohol, must-avoid / limit / dislikes / favorites, calorie override, doctor and emergency contact. |
| **Log readings** | Weight, blood pressure, A1C, LDL. Latest weight drives calories; readings over common thresholds raise alerts. |
| **Meal plan** | 7-day breakfast/lunch/dinner that only uses dishes everyone at the table can eat, with per-person swaps ("Mia: use sunflower-seed butter"), snack ideas and a grocery list. Pick who's eating, shuffle the week, or ↻ any meal. |
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
  js/store.js           saving, loading, backup import/export
  js/app.js             screens and buttons
  sample/demo-family.js a made-up family for trying it out
  tests/engine.test.js  engine tests
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
