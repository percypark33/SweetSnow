/*
 * Family Health Guide — knowledge base.
 *
 * Everything the guide "knows" lives here as plain data, so it can be reviewed,
 * corrected and extended without touching the engine. Guidance is general and
 * drawn from mainstream sources (Dietary Guidelines for Americans, AHA, ADA,
 * DASH, NKF, FDA food-safety advice). It is not medical advice.
 *
 * Tags connect the pieces: an allergy, condition, diet or medication "blocks"
 * or "cautions" tags, and recipes / emphasised foods carry tags. The engine
 * (engine.js) matches them up.
 */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- allergens
  // Top-9 US allergens. `avoid` = foods to skip, `labelWords` = ingredient-list
  // names that hide the allergen.
  var ALLERGENS = {
    peanut: {
      label: 'Peanut',
      avoid: ['Peanuts & peanut butter', 'Peanut oil (cold-pressed / gourmet)', 'Satay & many Thai / West African sauces', 'Many baked goods, candy & granola bars (check "may contain")'],
      labelWords: ['arachis oil', 'groundnut', 'beer nuts', 'monkey nuts', 'mandelonas', 'hydrolyzed peanut protein']
    },
    treenut: {
      label: 'Tree nuts',
      avoid: ['Almonds, cashews, walnuts, pecans, pistachios, hazelnuts, macadamias, Brazil nuts, pine nuts', 'Nut butters, nut milks & nut oils', 'Pesto, marzipan, praline, nougat, gianduja', 'Many granolas, cereals & baked goods'],
      labelWords: ['marzipan', 'praline', 'nougat', 'gianduja', 'nut meal', 'nut paste', 'pignoli', 'amaretto', 'frangipane']
    },
    milk: {
      label: 'Milk (dairy)',
      avoid: ['Milk, cream, butter, ghee, cheese, yogurt, ice cream', 'Many breads, baked goods & creamy sauces', '"Non-dairy" creamers that contain casein'],
      labelWords: ['casein', 'caseinate', 'whey', 'lactalbumin', 'lactoglobulin', 'lactose', 'curds', 'ghee', 'milk solids', 'recaldent']
    },
    egg: {
      label: 'Egg',
      avoid: ['Eggs in any form', 'Mayonnaise, aioli, meringue, custard, hollandaise', 'Many baked goods, fresh pasta, breaded foods & some foam toppings'],
      labelWords: ['albumin', 'albumen', 'globulin', 'lysozyme', 'ovalbumin', 'ovomucoid', 'ovovitellin', 'surimi (sometimes)', 'livetin']
    },
    wheat: {
      label: 'Wheat',
      avoid: ['Bread, pasta, couscous, crackers, most cereals & baked goods', 'Soy sauce (brewed with wheat)', 'Breaded / battered foods, many gravies & sauces'],
      labelWords: ['flour', 'semolina', 'durum', 'spelt', 'farro', 'einkorn', 'kamut', 'farina', 'bulgur', 'seitan', 'triticale', 'graham']
    },
    soy: {
      label: 'Soy',
      avoid: ['Tofu, tempeh, edamame, miso, natto, soy milk', 'Soy sauce, tamari, teriyaki', 'Many processed foods, veggie burgers & protein bars'],
      labelWords: ['soya', 'shoyu', 'textured vegetable protein (TVP)', 'hydrolyzed soy protein', 'soy lecithin (ask your allergist)', 'edamame', 'yuba', 'okara']
    },
    fish: {
      label: 'Fish',
      avoid: ['All finned fish (salmon, tuna, cod, tilapia, anchovy …)', 'Fish sauce, Worcestershire sauce, Caesar dressing', 'Imitation crab (surimi), fish stock'],
      labelWords: ['anchovy', 'surimi', 'fish sauce', 'nam pla', 'fish gelatin', 'fish oil', 'bonito', 'dashi']
    },
    shellfish: {
      label: 'Shellfish',
      avoid: ['Shrimp, crab, lobster, crawfish, prawns', 'Bouillabaisse, cioppino, seafood stocks', 'Many fried-seafood restaurants (shared fryers)'],
      labelWords: ['crustacean', 'krill', 'langoustine', 'scampi', 'ecrevisse', 'seafood flavoring', 'glucosamine (some sources)']
    },
    sesame: {
      label: 'Sesame',
      avoid: ['Sesame seeds & sesame oil', 'Tahini, hummus, halva, baba ghanoush', 'Many breads, bagels, buns, crackers & Asian sauces'],
      labelWords: ['benne', 'gingelly', 'gomasio', 'tahini', 'tahina', 'sesamol', 'til', "za'atar"]
    }
  };

  // ------------------------------------------------------------- intolerances
  var INTOLERANCES = {
    lactose: {
      label: 'Lactose intolerance',
      caution: ['milk'],
      limit: ['Large servings of milk, ice cream & soft cheeses'],
      emphasize: [{ text: 'Lactose-free milk, hard aged cheeses & yogurt (often well tolerated)', tag: 'milk' }],
      tips: ['Small amounts of dairy with a meal are often fine — find your own threshold.', 'Lactase tablets taken with the first bite of dairy can help.']
    },
    fructose: {
      label: 'Fructose malabsorption',
      caution: ['high-fodmap'],
      limit: ['Apples, pears, mango, watermelon, honey, agave', 'Fruit juice & high-fructose corn syrup'],
      emphasize: [{ text: 'Berries, citrus, kiwi, banana (firm)' }],
      tips: ['Spread fruit through the day instead of eating a lot at once.']
    }
  };

  // --------------------------------------------------------------- conditions
  var CONDITIONS = {
    diabetes2: {
      label: 'Type 2 diabetes',
      group: 'Metabolic',
      caution: ['added-sugar', 'refined-carb'],
      avoid: ['Sugary drinks: soda, sweet tea, juice, energy drinks'],
      limit: ['White bread, white rice, pastries & sweets', 'Large portions of starchy foods at one meal'],
      emphasize: [
        { text: 'Non-starchy vegetables (half the plate)' },
        { text: 'Beans, lentils & whole grains for fiber' },
        { text: 'Nuts & seeds as snacks', tag: 'treenut' },
        { text: 'Lean protein with every meal' }
      ],
      tips: ['Plate method: ½ non-starchy veg, ¼ lean protein, ¼ carbohydrate.', 'Keep carbohydrate amounts roughly consistent meal to meal.', 'Pair carbs with protein or fat to soften blood-sugar spikes.', 'A 10–15 minute walk after meals helps lower post-meal glucose.']
    },
    prediabetes: {
      label: 'Prediabetes / insulin resistance',
      group: 'Metabolic',
      caution: ['added-sugar', 'refined-carb'],
      avoid: ['Sugary drinks'],
      limit: ['Refined grains, sweets & large starchy portions'],
      emphasize: [{ text: 'High-fiber foods: vegetables, beans, whole grains' }, { text: 'Lean protein at each meal' }],
      tips: ['Losing 5–7% of body weight (if overweight) and ~150 min/week of activity cut diabetes risk substantially.']
    },
    diabetes1: {
      label: 'Type 1 diabetes',
      group: 'Metabolic',
      caution: ['added-sugar'],
      avoid: [],
      limit: ['Sugary drinks except when treating a low'],
      emphasize: [{ text: 'Consistent, counted carbohydrates matched to the insulin plan' }],
      tips: ['Follow the carb-counting / insulin-to-carb ratios set by the care team.', 'Always carry fast-acting sugar (glucose tabs, juice box) for lows.', 'Alcohol can cause delayed lows — eat with it and check glucose.']
    },
    hypertension: {
      label: 'High blood pressure',
      group: 'Heart',
      caution: ['high-sodium'],
      avoid: ['Salt-heavy processed foods: deli meats, canned soups, instant noodles, salty snacks'],
      limit: ['Sodium — aim under 1,500–2,300 mg/day', 'Soy sauce, pickles, cheese, restaurant & fast food', 'Alcohol'],
      emphasize: [
        { text: 'DASH pattern: vegetables, fruit, low-fat dairy, whole grains', tag: 'milk' },
        { text: 'Potassium-rich produce: bananas, potatoes, beans, leafy greens', tag: 'high-potassium' }
      ],
      tips: ['Cook at home more — most sodium comes from packaged and restaurant food.', 'Season with herbs, citrus, garlic & vinegar instead of salt.', 'Check labels: 5% DV sodium or less is low, 20% or more is high.']
    },
    cholesterol: {
      label: 'High cholesterol',
      group: 'Heart',
      caution: ['high-satfat', 'fried'],
      avoid: ['Trans fats (partially hydrogenated oils)'],
      limit: ['Fatty red & processed meats, butter, full-fat cheese, coconut & palm oil', 'Fried foods & pastries'],
      emphasize: [
        { text: 'Soluble fiber: oats, barley, beans, lentils, apples' },
        { text: 'Fatty fish twice a week (salmon, sardines, trout)', tag: 'fish' },
        { text: 'Olive oil, avocado & nuts for fats', tag: 'treenut' }
      ],
      tips: ['Keep saturated fat under ~6% of calories when lowering LDL.', 'Plant sterols/stanols (2 g/day) can lower LDL further — ask the doctor.']
    },
    heart: {
      label: 'Heart disease / heart failure',
      group: 'Heart',
      caution: ['high-sodium', 'high-satfat', 'fried'],
      avoid: ['Very salty foods'],
      limit: ['Sodium', 'Saturated fat', 'Alcohol'],
      emphasize: [{ text: 'Mediterranean-style eating: vegetables, legumes, fish, olive oil', tag: 'fish' }],
      tips: ['With heart failure, the care team may also set a fluid limit — follow it.', 'Weigh daily if advised; sudden gain can mean fluid build-up.']
    },
    celiac: {
      label: 'Celiac disease',
      group: 'Digestive',
      block: ['gluten'],
      caution: ['oats'],
      avoid: ['Wheat, barley, rye, triticale, spelt, malt, brewer\'s yeast', 'Regular bread, pasta, beer, most cereals', 'Soy sauce (use certified GF tamari)'],
      limit: ['Oats unless labeled certified gluten-free'],
      emphasize: [{ text: 'Naturally GF grains: rice, quinoa, buckwheat, millet, corn, certified GF oats' }],
      tips: ['Strict, lifelong avoidance — even crumbs matter.', 'Use separate toaster, colander & cutting board.', 'Look for "certified gluten-free" (<20 ppm).']
    },
    gout: {
      label: 'Gout / high uric acid',
      group: 'Metabolic',
      caution: ['high-purine', 'alcohol', 'added-sugar'],
      avoid: ['Organ meats (liver, kidney)', 'Beer & spirits', 'Sugary drinks with high-fructose corn syrup'],
      limit: ['Red meat', 'Anchovies, sardines, mussels, scallops, shellfish'],
      emphasize: [{ text: 'Low-fat dairy', tag: 'milk' }, { text: 'Cherries, vegetables, whole grains' }, { text: 'Plenty of water' }],
      tips: ['Stay well hydrated, especially in hot weather.']
    },
    ckd: {
      label: 'Chronic kidney disease',
      group: 'Kidney',
      caution: ['high-potassium', 'high-sodium', 'high-phosphorus'],
      avoid: ['Salt substitutes (potassium chloride)', 'Dark colas & foods with "phos" additives'],
      limit: ['Sodium', 'Potassium & phosphorus — limits depend on stage and labs', 'Protein amount — set by the care team'],
      emphasize: [{ text: 'Plan with a renal dietitian — limits are individual' }],
      tips: ['Kidney diets differ by stage and dialysis status; lab results decide the limits.']
    },
    gerd: {
      label: 'Acid reflux (GERD)',
      group: 'Digestive',
      caution: ['spicy', 'acidic', 'fried', 'caffeine'],
      avoid: [],
      limit: ['Fried & fatty meals', 'Chocolate, peppermint, coffee, alcohol', 'Tomato sauce, citrus & spicy food'],
      emphasize: [{ text: 'Smaller meals; oatmeal, bananas, lean proteins, vegetables' }],
      tips: ['Finish eating 3 hours before lying down.', 'Raising the head of the bed can help night symptoms.']
    },
    ibs: {
      label: 'IBS',
      group: 'Digestive',
      caution: ['high-fodmap'],
      avoid: [],
      limit: ['Common triggers: onion, garlic, wheat, beans, apples, pears, sugar alcohols'],
      emphasize: [{ text: 'Regular meals, soluble fiber (oats, psyllium), enough water' }],
      tips: ['A short low-FODMAP trial with a dietitian can identify personal triggers.', 'Keep a symptom diary alongside meals.']
    },
    anemia: {
      label: 'Iron-deficiency anemia',
      group: 'Blood',
      caution: [],
      avoid: [],
      limit: ['Tea & coffee with iron-rich meals (blocks absorption)'],
      emphasize: [
        { text: 'Iron-rich foods: lean red meat, poultry, beans, lentils, fortified cereals, spinach', tag: 'meat' },
        { text: 'Vitamin C with iron foods (citrus, peppers, strawberries)' }
      ],
      tips: ['Separate calcium supplements / dairy from iron supplements by ~2 hours.']
    },
    osteoporosis: {
      label: 'Osteoporosis / low bone density',
      group: 'Bone',
      caution: [],
      avoid: [],
      limit: ['Excess alcohol', 'Very high sodium'],
      emphasize: [
        { text: 'Calcium: dairy, fortified plant milk, tofu set with calcium, canned salmon with bones', tag: 'milk' },
        { text: 'Vitamin D sources & adequate protein' }
      ],
      tips: ['Weight-bearing and balance exercise matter as much as food.']
    },
    fattyliver: {
      label: 'Fatty liver (MASLD)',
      group: 'Metabolic',
      caution: ['added-sugar', 'alcohol', 'fried'],
      avoid: ['Sugary drinks', 'Alcohol (ask the doctor)'],
      limit: ['Refined carbs & fried foods'],
      emphasize: [{ text: 'Mediterranean pattern, vegetables, legumes, olive oil' }, { text: 'Coffee (unsweetened) may be protective', tag: 'caffeine' }],
      tips: ['Gradual weight loss of 7–10% (if overweight) improves liver fat.']
    },
    hypothyroid: {
      label: 'Hypothyroidism',
      group: 'Hormonal',
      caution: [],
      avoid: [],
      limit: [],
      emphasize: [{ text: 'Balanced diet with iodized salt in normal amounts' }],
      tips: ['If on levothyroxine, timing around food matters — see medication notes.']
    },
    pcos: {
      label: 'PCOS',
      group: 'Hormonal',
      caution: ['added-sugar', 'refined-carb'],
      avoid: ['Sugary drinks'],
      limit: ['Refined carbohydrates'],
      emphasize: [{ text: 'High-fiber, lower-glycemic foods with protein at each meal' }],
      tips: ['Regular activity improves insulin sensitivity.']
    },
    pregnancy: {
      label: 'Pregnant',
      group: 'Life stage',
      block: ['alcohol', 'raw-fish', 'high-mercury-fish', 'unpasteurized'],
      caution: ['deli-meat', 'caffeine'],
      avoid: ['Alcohol (no safe amount)', 'High-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, orange roughy', 'Raw or undercooked meat, eggs, fish & sprouts', 'Unpasteurized milk, cheese & juice'],
      limit: ['Caffeine under 200 mg/day (~one 12 oz coffee)', 'Deli meats & hot dogs unless heated until steaming', 'Albacore tuna to 1 serving/week'],
      emphasize: [
        { text: 'Folate: leafy greens, beans, fortified grains' },
        { text: 'Low-mercury fish 2–3 servings/week (salmon, sardines, light tuna)', tag: 'fish' },
        { text: 'Iron, calcium, choline (eggs) & iodine', tag: 'egg' }
      ],
      tips: ['Take a prenatal vitamin with folic acid as directed.', 'Extra calories mainly in 2nd (~340) and 3rd (~450) trimester.']
    },
    breastfeeding: {
      label: 'Breastfeeding',
      group: 'Life stage',
      caution: ['caffeine', 'high-mercury-fish'],
      avoid: ['High-mercury fish'],
      limit: ['Caffeine (~200–300 mg/day)', 'Alcohol — wait at least 2 hours per drink before nursing'],
      emphasize: [{ text: 'Extra fluids and ~330–400 extra calories/day' }, { text: 'Low-mercury fish for DHA', tag: 'fish' }],
      tips: ['Continue a prenatal or postnatal vitamin if advised.']
    }
  };

  // ------------------------------------------------------------- medications
  // Matched by keyword against what the user types (brand or generic).
  var MEDICATIONS = [
    {
      id: 'warfarin', label: 'Warfarin (blood thinner)', match: ['warfarin', 'coumadin', 'jantoven'],
      tips: ['Keep vitamin K intake CONSISTENT week to week (kale, spinach, broccoli, Brussels sprouts) — don\'t suddenly add or cut them.', 'Limit alcohol; avoid large amounts of cranberry or grapefruit juice.', 'Ask before starting fish oil, vitamin E, ginkgo, turmeric or other supplements.']
    },
    {
      id: 'statin-cyp', label: 'Statin affected by grapefruit', match: ['simvastatin', 'zocor', 'lovastatin', 'mevacor', 'atorvastatin', 'lipitor'],
      block: ['grapefruit'],
      tips: ['Avoid grapefruit and grapefruit juice (raises drug levels and side-effect risk).']
    },
    {
      id: 'ccb', label: 'Calcium-channel blocker', match: ['felodipine', 'nifedipine', 'nisoldipine', 'amlodipine', 'norvasc', 'procardia'],
      block: ['grapefruit'],
      tips: ['Avoid grapefruit (especially with felodipine / nifedipine).']
    },
    {
      id: 'maoi', label: 'MAO inhibitor', match: ['phenelzine', 'nardil', 'tranylcypromine', 'parnate', 'isocarboxazid', 'marplan', 'selegiline', 'emsam'],
      block: ['aged-cheese'],
      avoidFoods: ['Aged cheeses, cured / fermented meats, tap beer, sauerkraut, soy sauce & fermented soy (tyramine)'],
      tips: ['High-tyramine foods can trigger a dangerous blood-pressure spike — follow the full list from the pharmacist.']
    },
    {
      id: 'levothyroxine', label: 'Levothyroxine (thyroid)', match: ['levothyroxine', 'synthroid', 'levoxyl', 'unithroid', 'euthyrox', 'tirosint'],
      tips: ['Take on an empty stomach with water, 30–60 min before breakfast (or at bedtime, 3+ h after eating).', 'Separate from calcium, iron, antacids and multivitamins by 4 hours.', 'Coffee, soy and high-fiber meals right after the dose can reduce absorption — keep the routine consistent.']
    },
    {
      id: 'ace-arb', label: 'ACE inhibitor / ARB / potassium-sparing diuretic', match: ['lisinopril', 'enalapril', 'ramipril', 'benazepril', 'losartan', 'valsartan', 'olmesartan', 'irbesartan', 'spironolactone', 'eplerenone', 'triamterene', 'pril', 'sartan'],
      tips: ['Avoid potassium-based salt substitutes unless the doctor OKs them.', 'Ask before eating large amounts of high-potassium foods if kidney function is reduced.']
    },
    {
      id: 'metformin', label: 'Metformin', match: ['metformin', 'glucophage', 'glumetza', 'fortamet'],
      tips: ['Take with meals to reduce stomach upset.', 'Long-term use can lower vitamin B12 — ask about periodic checks.', 'Limit alcohol.']
    },
    {
      id: 'insulin-su', label: 'Insulin / sulfonylurea (low-sugar risk)', match: ['insulin', 'glipizide', 'glyburide', 'glimepiride', 'humalog', 'novolog', 'lantus', 'basaglar', 'tresiba', 'levemir'],
      tips: ['Don\'t skip meals after taking it — risk of low blood sugar.', 'Alcohol raises the risk of lows; always eat with it.']
    },
    {
      id: 'antibiotic-chelate', label: 'Tetracycline / quinolone antibiotic', match: ['doxycycline', 'minocycline', 'tetracycline', 'ciprofloxacin', 'cipro', 'levofloxacin', 'moxifloxacin'],
      tips: ['Separate from dairy, calcium, iron, zinc and antacids by at least 2 hours.']
    },
    {
      id: 'no-alcohol', label: 'Must avoid alcohol', match: ['metronidazole', 'flagyl', 'tinidazole', 'disulfiram', 'antabuse'],
      block: ['alcohol'],
      tips: ['No alcohol during the course and for 3 days after (including sauces & mouthwash with alcohol).']
    },
    {
      id: 'lithium', label: 'Lithium', match: ['lithium', 'lithobid'],
      tips: ['Keep salt and fluid intake steady day to day — big changes alter lithium levels.', 'Drink extra water in heat or when exercising.']
    },
    {
      id: 'bisphosphonate', label: 'Bisphosphonate (bone)', match: ['alendronate', 'fosamax', 'risedronate', 'actonel', 'ibandronate', 'boniva'],
      tips: ['Take first thing with a full glass of plain water, then nothing else and stay upright for 30–60 min.']
    },
    {
      id: 'glp1', label: 'GLP-1 medicine', match: ['semaglutide', 'ozempic', 'wegovy', 'rybelsus', 'tirzepatide', 'mounjaro', 'zepbound', 'liraglutide', 'victoza', 'saxenda', 'dulaglutide', 'trulicity'],
      tips: ['Prioritise protein at each meal to protect muscle while appetite is low.', 'Smaller meals, less fat and slow eating reduce nausea.', 'Keep up fluids and fiber to prevent constipation.']
    }
  ];

  // ------------------------------------------------------------------- diets
  var DIETS = {
    omnivore: { label: 'No restrictions', block: [], emphasize: [], supplements: [], tips: [] },
    vegetarian: {
      label: 'Vegetarian', block: ['meat', 'pork', 'poultry', 'fish', 'shellfish', 'gelatin'],
      emphasize: [{ text: 'Protein at each meal: eggs, dairy, beans, lentils, tofu', tag: 'egg' }, { text: 'Iron + vitamin C pairing (beans with peppers, tomatoes)' }],
      supplements: ['Vitamin B12 (check levels)'], tips: ['Watch for gelatin, rennet in some cheeses, and fish sauce / anchovy in sauces.']
    },
    vegan: {
      label: 'Vegan', block: ['meat', 'pork', 'poultry', 'fish', 'shellfish', 'egg', 'milk', 'honey', 'gelatin'],
      emphasize: [{ text: 'Beans, lentils, tofu, tempeh, seitan for protein', tag: 'soy' }, { text: 'Calcium-fortified plant milk & calcium-set tofu', tag: 'soy' }, { text: 'Ground flax, chia, walnuts for omega-3', tag: 'treenut' }],
      supplements: ['Vitamin B12 (essential)', 'Vitamin D', 'Algae-based omega-3 (DHA/EPA)', 'Iodine (if not using iodized salt)'],
      tips: ['B12 is not reliably available from plant foods — supplement or use fortified foods.']
    },
    pescatarian: {
      label: 'Pescatarian', block: ['meat', 'pork', 'poultry'],
      emphasize: [{ text: 'Fatty fish 2×/week for omega-3', tag: 'fish' }],
      supplements: [], tips: []
    },
    mediterranean: {
      label: 'Mediterranean', block: [],
      emphasize: [{ text: 'Olive oil, vegetables, legumes, whole grains, fish', tag: 'fish' }, { text: 'Nuts a few times a week', tag: 'treenut' }],
      supplements: [], tips: ['Red meat a few times a month rather than daily.']
    },
    lowcarb: {
      label: 'Lower-carb', block: [], caution: ['refined-carb', 'added-sugar'],
      emphasize: [{ text: 'Non-starchy vegetables, protein, healthy fats' }],
      supplements: [], tips: ['Keep fiber up with vegetables, nuts, seeds and berries.']
    }
  };

  var DIET_RULES = {
    halal: { label: 'Halal', block: ['pork', 'alcohol', 'gelatin'], tips: ['Meat & poultry should be halal-certified; check gelatin and vanilla extract (alcohol).'] },
    kosher: { label: 'Kosher', block: ['pork', 'shellfish', 'meat-with-dairy'], tips: ['Meat should be kosher-certified; keep meat and dairy separate.'] },
    'no-pork': { label: 'No pork', block: ['pork'], tips: [] },
    'no-beef': { label: 'No beef', block: ['meat'], tips: [] },
    'no-alcohol': { label: 'No alcohol', block: ['alcohol'], tips: [] }
  };

  // --------------------------------------------------------------- life stage
  // Age bands, in years. Checked in order; first match wins.
  var AGE_BANDS = [
    {
      id: 'infant', label: 'Infant (under 1)', maxAge: 1,
      block: ['honey', 'alcohol'], caution: ['choking', 'added-sugar', 'high-sodium'],
      avoid: ['Honey (botulism risk)', 'Cow\'s milk as a main drink', 'Added sugar & salt', 'Whole nuts, grapes, popcorn, hard raw vegetables'],
      tips: ['Breast milk or formula is the main food; start solids around 6 months as the pediatrician advises.', 'Introduce peanut and egg early (around 4–6 months) unless the pediatrician says otherwise — it lowers allergy risk.']
    },
    {
      id: 'toddler', label: 'Toddler (1–3)', maxAge: 4,
      block: ['alcohol'], caution: ['choking', 'caffeine'],
      avoid: ['Choking hazards: whole grapes & cherry tomatoes (quarter them), whole nuts, popcorn, hot-dog coins, hard candy', 'Added sugar before age 2'],
      tips: ['Whole milk from 1–2 years, then low-fat; about 16–24 oz/day max.', 'Offer new foods many times — it can take 10+ tries.']
    },
    {
      id: 'child', label: 'Child (4–8)', maxAge: 9,
      block: ['alcohol'], caution: ['caffeine'],
      avoid: ['Sugary drinks as a habit'],
      tips: ['Water and milk as the main drinks.', 'Kids eat better when they help shop and cook.']
    },
    {
      id: 'preteen', label: 'Pre-teen (9–13)', maxAge: 14,
      block: ['alcohol'], caution: ['caffeine'],
      avoid: ['Energy drinks'],
      tips: ['Calcium needs peak now (1,300 mg/day) — bones are building fast.']
    },
    {
      id: 'teen', label: 'Teen (14–18)', maxAge: 19,
      block: ['alcohol'], caution: [],
      avoid: ['Energy drinks'],
      tips: ['Calcium 1,300 mg/day; teen girls need extra iron (15 mg/day).', 'Watch for very restrictive eating — talk to the pediatrician if worried.']
    },
    {
      id: 'adult', label: 'Adult (19–50)', maxAge: 51,
      block: [], caution: [], avoid: [],
      tips: []
    },
    {
      id: 'older', label: 'Adult (51–64)', maxAge: 65,
      block: [], caution: [], avoid: [],
      tips: ['Vitamin B12 absorption drops with age — fortified foods or a supplement help.', 'Calcium 1,200 mg/day for women 51+.']
    },
    {
      id: 'senior', label: 'Senior (65+)', maxAge: 200,
      block: [], caution: [], avoid: [],
      tips: ['Protein ~1.0–1.2 g/kg/day helps keep muscle strength.', 'Vitamin D (800 IU) and B12 often need supplementing — ask.', 'Thirst signals weaken with age; drink on a schedule.']
    }
  ];

  // Dietary Guidelines estimated calorie needs, ages 2–18:
  // [sedentary, moderately active, active] by sex.
  var KID_CALORIES = {
    male: { 2: [1000, 1000, 1000], 3: [1000, 1400, 1400], 4: [1200, 1400, 1600], 5: [1200, 1400, 1600], 6: [1400, 1600, 1800], 7: [1400, 1600, 1800], 8: [1400, 1600, 2000], 9: [1600, 1800, 2000], 10: [1600, 1800, 2200], 11: [1800, 2000, 2200], 12: [1800, 2200, 2400], 13: [2000, 2200, 2600], 14: [2000, 2400, 2800], 15: [2200, 2600, 3000], 16: [2400, 2800, 3200], 17: [2400, 2800, 3200], 18: [2400, 2800, 3200] },
    female: { 2: [1000, 1000, 1000], 3: [1000, 1200, 1400], 4: [1200, 1400, 1400], 5: [1200, 1400, 1600], 6: [1200, 1400, 1600], 7: [1200, 1600, 1800], 8: [1400, 1600, 1800], 9: [1400, 1600, 1800], 10: [1400, 1800, 2000], 11: [1600, 1800, 2000], 12: [1600, 2000, 2200], 13: [1600, 2000, 2200], 14: [1800, 2000, 2400], 15: [1800, 2000, 2400], 16: [1800, 2000, 2400], 17: [1800, 2000, 2400], 18: [1800, 2000, 2400] }
  };

  var ACTIVITY = {
    sedentary: { label: 'Sedentary (little exercise)', factor: 1.2, kid: 0 },
    light: { label: 'Lightly active (1–3 days/week)', factor: 1.375, kid: 1 },
    moderate: { label: 'Moderately active (3–5 days/week)', factor: 1.55, kid: 1 },
    active: { label: 'Very active (6–7 days/week)', factor: 1.725, kid: 2 },
    athlete: { label: 'Athlete / physical job', factor: 1.9, kid: 2 }
  };

  var GOALS = {
    maintain: { label: 'Maintain weight', kcal: 0 },
    lose: { label: 'Lose weight gradually', kcal: -500 },
    gain: { label: 'Gain weight / build muscle', kcal: 300 }
  };

  var BLOOD_TYPES = ['', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'];

  // Readable names for tags shown in the meal planner.
  var TAG_LABELS = {
    peanut: 'peanut', treenut: 'tree nuts', milk: 'dairy', egg: 'egg', wheat: 'wheat', soy: 'soy', fish: 'fish', shellfish: 'shellfish', sesame: 'sesame',
    gluten: 'gluten', oats: 'non-certified oats', meat: 'beef / red meat', pork: 'pork', poultry: 'poultry', alcohol: 'alcohol', honey: 'honey', gelatin: 'gelatin',
    'meat-with-dairy': 'meat with dairy', 'high-sodium': 'high sodium', 'high-satfat': 'high saturated fat', 'added-sugar': 'added sugar', 'refined-carb': 'refined carbs',
    'high-purine': 'high purine', 'high-fodmap': 'high FODMAP', 'high-potassium': 'high potassium', 'high-phosphorus': 'high phosphorus', 'aged-cheese': 'aged cheese (tyramine)',
    grapefruit: 'grapefruit', spicy: 'spicy', acidic: 'acidic (tomato / citrus)', fried: 'fried', 'high-mercury-fish': 'high-mercury fish', 'raw-fish': 'raw fish / meat',
    unpasteurized: 'unpasteurized', 'deli-meat': 'deli meat', caffeine: 'caffeine', choking: 'choking hazard for small kids'
  };

  // ----------------------------------------------------------------- recipes
  // `tags` = what the dish contains. `swaps` = ways to remove tags:
  // removes: tags it takes away, adds: tags the substitute brings in.
  // `wheat` automatically implies `gluten`; meat/poultry + milk implies
  // `meat-with-dairy` (engine adds these).
  var RECIPES = [
    // Breakfast
    { id: 'overnight-oats', name: 'Overnight oats with berries', meal: 'breakfast', ingredients: ['rolled oats', 'milk', 'chia seeds', 'mixed berries', 'maple syrup'], tags: ['milk', 'oats', 'added-sugar'],
      swaps: [{ removes: ['milk'], text: 'Use fortified soy or oat milk', adds: ['soy'] }, { removes: ['milk'], text: 'Use fortified oat milk', adds: [] }, { removes: ['oats'], text: 'Use certified gluten-free oats', adds: [] }, { removes: ['added-sugar'], text: 'Skip the maple syrup; sweeten with mashed banana', adds: [] }] },
    { id: 'veggie-eggs-toast', name: 'Veggie scrambled eggs on whole-grain toast', meal: 'breakfast', ingredients: ['eggs', 'spinach', 'tomato', 'whole-grain bread', 'olive oil'], tags: ['egg', 'wheat'],
      swaps: [{ removes: ['wheat'], text: 'Serve on gluten-free toast or with potatoes', adds: [] }, { removes: ['egg'], text: 'Make a tofu scramble instead', adds: ['soy'] }] },
    { id: 'yogurt-parfait', name: 'Yogurt parfait with berries & pumpkin seeds', meal: 'breakfast', ingredients: ['plain yogurt', 'mixed berries', 'pumpkin seeds', 'honey'], tags: ['milk', 'honey'],
      swaps: [{ removes: ['milk'], text: 'Use coconut or soy yogurt', adds: [] }, { removes: ['honey'], text: 'Use maple syrup or no sweetener', adds: [] }] },
    { id: 'pb-banana-toast', name: 'Peanut butter & banana toast', meal: 'breakfast', ingredients: ['whole-grain bread', 'peanut butter', 'banana'], tags: ['peanut', 'wheat', 'high-potassium'],
      swaps: [{ removes: ['peanut'], text: 'Use sunflower-seed butter', adds: [] }, { removes: ['wheat'], text: 'Use gluten-free bread or rice cakes', adds: [] }] },
    { id: 'tofu-scramble', name: 'Tofu veggie scramble with corn tortillas', meal: 'breakfast', ingredients: ['firm tofu', 'bell peppers', 'spinach', 'turmeric', 'corn tortillas'], tags: ['soy'],
      swaps: [{ removes: ['soy'], text: 'Scramble eggs instead of tofu', adds: ['egg'] }] },
    { id: 'congee', name: 'Ginger rice porridge (congee) with scallions', meal: 'breakfast', ingredients: ['white rice', 'chicken broth', 'ginger', 'scallions', 'soft-boiled egg'], tags: ['poultry', 'egg', 'high-sodium'],
      swaps: [{ removes: ['poultry'], text: 'Use vegetable broth', adds: [] }, { removes: ['egg'], text: 'Leave off the egg', adds: [] }, { removes: ['high-sodium'], text: 'Use low-sodium broth', adds: [] }] },
    { id: 'sweet-potato-hash', name: 'Sweet potato & black bean hash', meal: 'breakfast', ingredients: ['sweet potato', 'black beans', 'onion', 'bell peppers', 'eggs'], tags: ['egg', 'high-fodmap', 'high-potassium'],
      swaps: [{ removes: ['egg'], text: 'Leave off the eggs; add avocado', adds: [] }, { removes: ['high-fodmap'], text: 'Skip onion & beans; use scallion greens', adds: [] }] },
    { id: 'buckwheat-pancakes', name: 'Buckwheat banana pancakes (gluten-free)', meal: 'breakfast', ingredients: ['buckwheat flour', 'banana', 'eggs', 'milk', 'berries'], tags: ['egg', 'milk'],
      swaps: [{ removes: ['egg'], text: 'Use flax eggs (1 Tbsp ground flax + 3 Tbsp water each)', adds: [] }, { removes: ['milk'], text: 'Use oat or rice milk', adds: [] }] },

    // Lunch
    { id: 'chicken-quinoa-bowl', name: 'Chicken & quinoa salad bowl', meal: 'lunch', ingredients: ['chicken breast', 'quinoa', 'cucumber', 'cherry tomatoes', 'chickpeas', 'olive oil', 'lemon'], tags: ['poultry', 'high-fodmap', 'acidic', 'choking'],
      swaps: [{ removes: ['poultry'], text: 'Double the chickpeas instead of chicken', adds: [] }, { removes: ['choking'], text: 'Quarter the cherry tomatoes for little ones', adds: [] }, { removes: ['high-fodmap'], text: 'Skip chickpeas', adds: [] }] },
    { id: 'lentil-soup', name: 'Hearty lentil & vegetable soup', meal: 'lunch', ingredients: ['lentils', 'carrots', 'celery', 'onion', 'garlic', 'canned tomatoes', 'vegetable broth'], tags: ['high-fodmap', 'high-potassium', 'acidic'],
      swaps: [] },
    { id: 'turkey-wrap', name: 'Turkey & avocado wrap', meal: 'lunch', ingredients: ['whole-wheat tortilla', 'sliced turkey', 'avocado', 'lettuce', 'tomato'], tags: ['wheat', 'poultry', 'high-sodium', 'deli-meat'],
      swaps: [{ removes: ['wheat'], text: 'Use a corn tortilla or lettuce wrap', adds: [] }, { removes: ['deli-meat', 'high-sodium'], text: 'Use leftover roast turkey instead of deli slices', adds: [] }, { removes: ['poultry'], text: 'Fill with hummus & veggies', adds: ['sesame'] }] },
    { id: 'tuna-sandwich', name: 'Tuna salad sandwich', meal: 'lunch', ingredients: ['canned light tuna', 'mayonnaise', 'celery', 'whole-grain bread'], tags: ['fish', 'egg', 'wheat'],
      swaps: [{ removes: ['egg'], text: 'Bind with mashed avocado instead of mayo', adds: [] }, { removes: ['wheat'], text: 'Serve on gluten-free bread or lettuce', adds: [] }, { removes: ['fish'], text: 'Make it a chickpea "tuna" salad', adds: ['high-fodmap'] }] },
    { id: 'hummus-plate', name: 'Hummus & veggie plate with pita', meal: 'lunch', ingredients: ['hummus', 'carrots', 'cucumber', 'bell peppers', 'pita bread'], tags: ['sesame', 'wheat', 'high-fodmap'],
      swaps: [{ removes: ['sesame'], text: 'Use a white-bean dip without tahini', adds: [] }, { removes: ['wheat'], text: 'Use gluten-free crackers', adds: [] }] },
    { id: 'burrito-bowl', name: 'Black bean & corn burrito bowl', meal: 'lunch', ingredients: ['brown rice', 'black beans', 'corn', 'salsa', 'avocado', 'shredded cheese'], tags: ['milk', 'high-fodmap', 'acidic'],
      swaps: [{ removes: ['milk'], text: 'Skip the cheese', adds: [] }] },
    { id: 'minestrone', name: 'Minestrone with parmesan', meal: 'lunch', ingredients: ['white beans', 'small pasta', 'canned tomatoes', 'zucchini', 'carrots', 'parmesan'], tags: ['wheat', 'milk', 'aged-cheese', 'high-fodmap', 'acidic'],
      swaps: [{ removes: ['wheat'], text: 'Use gluten-free pasta or rice', adds: [] }, { removes: ['milk', 'aged-cheese'], text: 'Skip the parmesan', adds: [] }] },
    { id: 'fried-rice', name: 'Vegetable egg fried rice', meal: 'lunch', ingredients: ['brown rice', 'eggs', 'peas', 'carrots', 'soy sauce', 'sesame oil', 'scallions'], tags: ['egg', 'soy', 'wheat', 'sesame', 'high-sodium'],
      swaps: [{ removes: ['soy', 'wheat', 'high-sodium'], text: 'Use coconut aminos instead of soy sauce', adds: [] }, { removes: ['sesame'], text: 'Use avocado oil instead of sesame oil', adds: [] }, { removes: ['egg'], text: 'Leave out the egg', adds: [] }] },
    { id: 'caprese-pasta', name: 'Caprese pasta salad', meal: 'lunch', ingredients: ['pasta', 'fresh mozzarella', 'cherry tomatoes', 'basil', 'olive oil'], tags: ['wheat', 'milk', 'acidic', 'choking'],
      swaps: [{ removes: ['wheat'], text: 'Use gluten-free pasta', adds: [] }, { removes: ['milk'], text: 'Skip the mozzarella; add white beans', adds: [] }, { removes: ['choking'], text: 'Quarter the tomatoes for little ones', adds: [] }] },

    // Dinner
    { id: 'sheet-pan-salmon', name: 'Sheet-pan salmon, broccoli & potatoes', meal: 'dinner', ingredients: ['salmon fillets', 'broccoli', 'baby potatoes', 'olive oil', 'lemon'], tags: ['fish', 'high-potassium'],
      swaps: [{ removes: ['fish'], text: 'Roast chicken thighs on the same pan', adds: ['poultry'] }, { removes: ['fish'], text: 'Roast extra-firm tofu on the same pan', adds: ['soy'] }] },
    { id: 'chicken-stir-fry', name: 'Chicken & vegetable stir-fry with brown rice', meal: 'dinner', ingredients: ['chicken breast', 'broccoli', 'bell peppers', 'snap peas', 'garlic', 'ginger', 'low-sodium soy sauce', 'brown rice'], tags: ['poultry', 'soy', 'wheat', 'high-fodmap'],
      swaps: [{ removes: ['soy', 'wheat'], text: 'Use coconut aminos instead of soy sauce', adds: [] }, { removes: ['poultry'], text: 'Use tofu instead of chicken', adds: ['soy'] }, { removes: ['high-fodmap'], text: 'Use garlic-infused oil; skip snap peas', adds: [] }] },
    { id: 'turkey-chili', name: 'Turkey & bean chili', meal: 'dinner', ingredients: ['ground turkey', 'kidney beans', 'canned tomatoes', 'onion', 'chili powder', 'bell peppers'], tags: ['poultry', 'high-fodmap', 'spicy', 'acidic', 'high-potassium'],
      swaps: [{ removes: ['poultry'], text: 'Make it all-bean with extra lentils', adds: [] }, { removes: ['spicy'], text: 'Make it mild; hot sauce at the table', adds: [] }] },
    { id: 'beef-stew', name: 'Beef & vegetable stew', meal: 'dinner', ingredients: ['beef chuck', 'potatoes', 'carrots', 'onion', 'beef broth', 'thyme'], tags: ['meat', 'high-satfat', 'high-purine', 'high-potassium', 'high-sodium'],
      swaps: [{ removes: ['meat', 'high-satfat', 'high-purine'], text: 'Use mushrooms & lentils instead of beef', adds: ['high-fodmap'] }, { removes: ['high-sodium'], text: 'Use low-sodium broth', adds: [] }] },
    { id: 'baked-cod', name: 'Lemon baked cod with herbed quinoa & green beans', meal: 'dinner', ingredients: ['cod fillets', 'quinoa', 'green beans', 'lemon', 'olive oil', 'parsley'], tags: ['fish'],
      swaps: [{ removes: ['fish'], text: 'Bake chicken breast instead', adds: ['poultry'] }] },
    { id: 'shrimp-tacos', name: 'Shrimp tacos with cabbage slaw', meal: 'dinner', ingredients: ['shrimp', 'corn tortillas', 'cabbage', 'lime', 'Greek yogurt sauce'], tags: ['shellfish', 'milk', 'high-purine', 'acidic'],
      swaps: [{ removes: ['shellfish', 'high-purine'], text: 'Use seasoned chicken instead of shrimp', adds: ['poultry'] }, { removes: ['shellfish', 'high-purine'], text: 'Use black beans instead of shrimp', adds: ['high-fodmap'] }, { removes: ['milk'], text: 'Use avocado crema', adds: [] }] },
    { id: 'chickpea-curry', name: 'Chickpea & spinach coconut curry', meal: 'dinner', ingredients: ['chickpeas', 'coconut milk', 'canned tomatoes', 'spinach', 'curry spices', 'onion', 'garlic', 'basmati rice'], tags: ['high-fodmap', 'spicy', 'high-potassium', 'acidic'],
      swaps: [{ removes: ['spicy'], text: 'Use mild curry powder', adds: [] }] },
    { id: 'turkey-meatballs', name: 'Spaghetti & turkey meatballs', meal: 'dinner', ingredients: ['spaghetti', 'ground turkey', 'egg', 'breadcrumbs', 'marinara sauce', 'parmesan'], tags: ['wheat', 'egg', 'poultry', 'milk', 'aged-cheese', 'acidic', 'high-sodium'],
      swaps: [{ removes: ['wheat'], text: 'Gluten-free pasta and GF breadcrumbs', adds: [] }, { removes: ['milk', 'aged-cheese'], text: 'Skip the parmesan', adds: [] }, { removes: ['egg'], text: 'Bind meatballs with a flax egg', adds: [] }, { removes: ['high-sodium'], text: 'Use no-salt-added marinara', adds: [] }] },
    { id: 'pork-apples', name: 'Pork tenderloin with apples & sweet potato', meal: 'dinner', ingredients: ['pork tenderloin', 'apples', 'sweet potatoes', 'thyme', 'olive oil'], tags: ['pork', 'high-fodmap', 'high-potassium'],
      swaps: [{ removes: ['pork'], text: 'Use chicken thighs instead of pork', adds: ['poultry'] }] },
    { id: 'peanut-noodles', name: 'Tofu peanut noodles with crunchy veg', meal: 'dinner', ingredients: ['rice noodles', 'tofu', 'peanut butter', 'soy sauce', 'lime', 'cabbage', 'carrots'], tags: ['soy', 'peanut', 'wheat'],
      swaps: [{ removes: ['peanut'], text: 'Use sunflower-seed butter in the sauce', adds: [] }, { removes: ['wheat'], text: 'Use certified GF tamari', adds: [] }] },
    { id: 'chicken-rice-broccoli', name: 'Grilled chicken, brown rice & steamed broccoli', meal: 'dinner', ingredients: ['chicken breast', 'brown rice', 'broccoli', 'olive oil', 'lemon'], tags: ['poultry'],
      swaps: [{ removes: ['poultry'], text: 'Grill tofu or serve with lentils', adds: [] }] },
    { id: 'bean-burgers', name: 'Black bean burgers on whole-wheat buns', meal: 'dinner', ingredients: ['black beans', 'rolled oats', 'egg', 'whole-wheat buns', 'lettuce', 'tomato'], tags: ['egg', 'wheat', 'oats', 'high-fodmap'],
      swaps: [{ removes: ['wheat', 'oats'], text: 'GF buns and certified GF oats', adds: [] }, { removes: ['egg'], text: 'Bind with a flax egg', adds: [] }] },
    { id: 'med-chicken', name: 'Mediterranean baked chicken with olives & potatoes', meal: 'dinner', ingredients: ['chicken thighs', 'potatoes', 'olives', 'cherry tomatoes', 'oregano', 'olive oil'], tags: ['poultry', 'high-sodium', 'high-potassium', 'choking'],
      swaps: [{ removes: ['high-sodium'], text: 'Halve the olives; no added salt', adds: [] }, { removes: ['choking'], text: 'Quarter the tomatoes & slice olives for little ones', adds: [] }] },
    { id: 'steak-veg', name: 'Steak with roasted vegetables', meal: 'dinner', ingredients: ['sirloin steak', 'zucchini', 'bell peppers', 'red onion', 'olive oil'], tags: ['meat', 'high-satfat', 'high-purine'],
      swaps: [{ removes: ['meat', 'high-satfat', 'high-purine'], text: 'Grill portobello mushrooms instead', adds: [] }] },
    { id: 'homemade-pizza', name: 'Homemade veggie pizza night', meal: 'dinner', ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'mushrooms', 'bell peppers'], tags: ['wheat', 'milk', 'high-sodium', 'high-satfat', 'acidic'],
      swaps: [{ removes: ['wheat'], text: 'Use a gluten-free crust', adds: [] }, { removes: ['milk', 'high-satfat'], text: 'Dairy-free cheese or extra veg, no cheese', adds: [] }] },

    // Snacks
    { id: 'apple-sunbutter', name: 'Apple slices with sunflower-seed butter', meal: 'snack', ingredients: ['apple', 'sunflower-seed butter'], tags: ['high-fodmap'], swaps: [] },
    { id: 'carrots-hummus', name: 'Carrot sticks & hummus', meal: 'snack', ingredients: ['carrots', 'hummus'], tags: ['sesame', 'high-fodmap', 'choking'],
      swaps: [{ removes: ['sesame'], text: 'Use tahini-free bean dip', adds: [] }, { removes: ['choking'], text: 'Steam carrots soft for little ones', adds: [] }] },
    { id: 'trail-mix', name: 'Trail mix', meal: 'snack', ingredients: ['almonds', 'cashews', 'raisins', 'dark chocolate chips'], tags: ['treenut', 'choking', 'added-sugar', 'caffeine'],
      swaps: [{ removes: ['treenut'], text: 'Use pumpkin & sunflower seeds instead of nuts', adds: [] }] },
    { id: 'cheese-crackers', name: 'Cheese & whole-grain crackers', meal: 'snack', ingredients: ['cheddar cheese', 'whole-grain crackers'], tags: ['milk', 'wheat', 'aged-cheese', 'high-sodium'],
      swaps: [{ removes: ['wheat'], text: 'Use rice crackers', adds: [] }] },
    { id: 'edamame', name: 'Steamed edamame', meal: 'snack', ingredients: ['edamame'], tags: ['soy'], swaps: [] },
    { id: 'fruit-cup', name: 'Fresh fruit cup', meal: 'snack', ingredients: ['grapes', 'melon', 'berries', 'orange segments'], tags: ['choking', 'acidic'],
      swaps: [{ removes: ['choking'], text: 'Quarter grapes lengthwise for little ones', adds: [] }] },
    { id: 'hard-eggs', name: 'Hard-boiled eggs', meal: 'snack', ingredients: ['eggs'], tags: ['egg'], swaps: [] },
    { id: 'popcorn', name: 'Air-popped popcorn', meal: 'snack', ingredients: ['popcorn kernels', 'olive oil'], tags: ['choking'], swaps: [] },
    { id: 'yogurt-fruit', name: 'Yogurt with sliced banana', meal: 'snack', ingredients: ['plain yogurt', 'banana'], tags: ['milk', 'high-potassium'],
      swaps: [{ removes: ['milk'], text: 'Use coconut or soy yogurt', adds: [] }] }
  ];

  var KB = {
    ALLERGENS: ALLERGENS,
    INTOLERANCES: INTOLERANCES,
    CONDITIONS: CONDITIONS,
    MEDICATIONS: MEDICATIONS,
    DIETS: DIETS,
    DIET_RULES: DIET_RULES,
    AGE_BANDS: AGE_BANDS,
    KID_CALORIES: KID_CALORIES,
    ACTIVITY: ACTIVITY,
    GOALS: GOALS,
    BLOOD_TYPES: BLOOD_TYPES,
    TAG_LABELS: TAG_LABELS,
    RECIPES: RECIPES
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = KB;
  else root.FHKnowledge = KB;
})(this);
