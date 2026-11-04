/*
 * Family Health Guide — an honest review of every food.
 *
 * Each food gets a verdict, what it's genuinely good for, and every
 * downside worth knowing: contaminants (mercury, arsenic), food-safety risks,
 * processing, sodium / saturated fat / sugar, and interactions with common
 * conditions and medicines. A "myth" line corrects worries the evidence
 * doesn't support. Personal warnings are matched to the person viewing.
 *
 * Downside format: [text, level, when, source]
 *   level: 'caution' (worth acting on) or 'note' (worth knowing)
 *   when: null = applies to everyone, or { med, cond, under, preg, allergy }
 */
(function (root) {
  'use strict';

  var node = typeof module !== 'undefined' && module.exports;
  var Foods = node ? require('./foods.js') : root.FHFoods;

  var SOURCES = {
    iarc: { title: 'Carcinogenicity of red and processed meat (IARC, Lancet Oncology)', org: 'WHO IARC', year: 2015, url: 'https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(15)00444-1/fulltext' },
    fdaFish: { title: 'Advice about eating fish — best choices, good choices, choices to avoid', org: 'FDA & EPA', year: 2021, url: 'https://www.fda.gov/food/consumers/advice-about-eating-fish' },
    fishBenefit: { title: 'Fish intake, contaminants and human health: evaluating the risks and the benefits (Mozaffarian & Rimm, JAMA)', org: 'Peer-reviewed review', year: 2006, url: 'https://jamanetwork.com/journals/jama/fullarticle/203640' },
    arsenic: { title: 'Arsenic in food — rice and rice products', org: 'FDA', year: 2024, url: 'https://www.fda.gov/food/environmental-contaminants-food/arsenic-food-and-dietary-supplements' },
    temps: { title: 'Safe minimum internal temperature chart', org: 'USDA Food Safety and Inspection Service', year: 2024, url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' },
    vitK: { title: 'Vitamin K and blood thinners — keep intake consistent', org: 'NIH Office of Dietary Supplements', year: 2021, url: 'https://ods.od.nih.gov/factsheets/VitaminK-Consumer/' },
    oxalate: { title: 'Kidney stones: diet and oxalate', org: 'National Kidney Foundation', year: 2024, url: 'https://www.kidney.org/kidney-topics/kidney-stones' },
    potassium: { title: 'Potassium and your CKD diet', org: 'National Kidney Foundation', year: 2024, url: 'https://www.kidney.org/nutrition/potassium' },
    fodmap: { title: 'FODMAPs and IBS', org: 'Monash University', year: 2024, url: 'https://www.monashfodmap.com/about-fodmap-and-ibs/' },
    choking: { title: 'Choking prevention for children', org: 'American Academy of Pediatrics', year: 2023, url: 'https://www.healthychildren.org/English/health-issues/injuries-emergencies/Pages/Choking-Prevention.aspx' },
    leafy: { title: 'Leafy greens and food safety', org: 'CDC', year: 2024, url: 'https://www.cdc.gov/food-safety/foods/leafy-greens.html' },
    eggs: { title: 'Dietary cholesterol and cardiovascular risk: a science advisory (Carson et al., Circulation)', org: 'American Heart Association', year: 2020, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000743' },
    soy: { title: 'Soy: intake does not increase cancer risk', org: 'American Institute for Cancer Research', year: 2024, url: 'https://www.aicr.org/cancer-prevention/food-facts/soy/' },
    levo: { title: 'Levothyroxine — take apart from soy, calcium and iron', org: 'MedlinePlus (NIH)', year: 2024, url: 'https://medlineplus.gov/druginfo/meds/a682461.html' },
    maoi: { title: 'MAOIs and tyramine-rich foods', org: 'Mayo Clinic', year: 2023, url: 'https://www.mayoclinic.org/diseases-conditions/depression/in-depth/maois/art-20043992' },
    rice: { title: 'White rice consumption and risk of type 2 diabetes: meta-analysis (Hu et al., BMJ)', org: 'Peer-reviewed meta-analysis', year: 2012, url: 'https://www.bmj.com/content/344/bmj.e1454' },
    fries: { title: 'Fried potato consumption is associated with elevated mortality (Veronese et al., AJCN)', org: 'Peer-reviewed cohort study', year: 2017, url: 'https://pubmed.ncbi.nlm.nih.gov/28592605/' },
    leap: { title: 'Randomized trial of peanut consumption in infants at risk for peanut allergy (LEAP, NEJM)', org: 'Randomised trial', year: 2015, url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1414850' },
    latex: { title: 'Latex allergy and cross-reacting foods (banana, avocado, kiwi)', org: 'American College of Allergy, Asthma & Immunology', year: 2024, url: 'https://acaai.org/allergies/allergic-conditions/latex-allergy/' },
    gout: { title: 'Guideline for the management of gout (limit purine-rich meat and seafood)', org: 'American College of Rheumatology', year: 2020, url: 'https://rheumatology.org/gout-guideline' },
    sodium: { title: 'Sodium in your diet — top sources include bread, deli meat, cheese and canned foods', org: 'FDA', year: 2024, url: 'https://www.fda.gov/food/nutrition-education-resources-materials/sodium-your-diet' },
    satfat: { title: 'Dietary fats and cardiovascular disease: presidential advisory', org: 'American Heart Association', year: 2017, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000510' },
    outbreaks: { title: 'Investigations of foodborne illness outbreaks', org: 'FDA', year: 2024, url: 'https://www.fda.gov/food/outbreaks-foodborne-illness/investigations-foodborne-illness-outbreaks' },
    oats: { title: 'Gluten-free oats and celiac disease', org: 'Celiac Disease Foundation', year: 2024, url: 'https://celiac.org/gluten-free-living/gluten-free-foods/oats/' },
    pregnancy: { title: 'Food safety for pregnant women (Listeria, raw eggs, deli meats, high-mercury fish)', org: 'FDA', year: 2024, url: 'https://www.fda.gov/food/people-risk-foodborne-illness/food-safety-pregnant-women-and-their-unborn-babies' }
  };

  var C = 'caution', T = 'note';
  var R = {
    chicken: { v: 'star', pros: ['Lean, complete protein for little saturated fat', 'Good source of niacin and vitamin B6'],
      cons: [['Raw chicken commonly carries Salmonella or Campylobacter — cook to 165°F (74°C) and don\'t rinse it in the sink (it splashes bacteria).', C, null, 'temps'],
        ['Fried, breaded and deli chicken add a lot of sodium and fat — the grilled or roasted breast is the healthy version.', T, null, 'sodium']] },
    turkey: { v: 'star', pros: ['One of the leanest proteins', 'B12, zinc and selenium'],
      cons: [['Deli turkey is a processed meat: ~500 mg sodium per 2 oz and in the same cancer category as ham. Roast your own.', C, null, 'iarc'],
        ['Cook to 165°F (74°C); deli turkey should be heated until steaming in pregnancy (Listeria).', T, { preg: true }, 'pregnancy']] },
    salmon: { v: 'star', pros: ['Richest common source of omega-3 fats (EPA/DHA) for heart and brain', 'One of the few foods with real vitamin D', 'Low in mercury'],
      cons: [['Farmed salmon has more fat and trace pollutants (PCBs) than wild — reviews find the heart benefits far outweigh the risk.', T, null, 'fishBenefit'],
        ['Smoked salmon (lox) is very salty and, in pregnancy, a Listeria risk unless cooked.', T, null, 'pregnancy'],
        ['Fish allergy.', C, { allergy: 'fish' }, null]] },
    cod: { v: 'star', pros: ['Very lean protein', 'Low mercury — an FDA "best choice"'],
      cons: [['Much less omega-3 than salmon or sardines.', T, null, 'fdaFish'],
        ['Fish and chips or breaded fillets add hundreds of calories of frying fat.', T, null, null]] },
    tuna: { v: 'good', pros: ['Cheap, shelf-stable protein', 'B12 and vitamin D'],
      cons: [['Contains mercury. Canned light tuna is a "best choice" (2–3 servings a week); albacore/white tuna has about 3× more — keep it to 1 serving a week.', C, null, 'fdaFish'],
        ['Children and pregnant women: stick to light tuna and the FDA\'s smaller serving sizes.', C, { preg: true }, 'fdaFish'],
        ['Children: use child-size servings (1–4 oz by age) and choose light, not albacore.', T, { under: 12 }, 'fdaFish'],
        ['Canned in brine: about 200 mg sodium per can — look for "low sodium".', T, null, 'sodium']] },
    sardines: { v: 'star', pros: ['Omega-3s, vitamin D and B12', 'Calcium from the soft edible bones', 'Among the lowest-mercury fish'],
      cons: [['High in purines — can trigger gout attacks.', C, { cond: 'gout' }, 'gout'],
        ['Canned sardines carry ~300 mg sodium; choose water-packed or low-sodium.', T, null, 'sodium']] },
    shrimp: { v: 'good', pros: ['Very lean protein', 'Low in mercury'],
      cons: [['Shellfish allergy is common in adults and usually lifelong.', C, { allergy: 'shellfish' }, null],
        ['High in dietary cholesterol (~190 mg per 4 oz) — for most people it raises blood cholesterol less than saturated fat does.', T, null, 'eggs'],
        ['Often soaked in salt or phosphate solutions and farmed under varying standards — check the sodium and look for a farming certification.', T, null, 'sodium'],
        ['Moderately high in purines.', T, { cond: 'gout' }, 'gout']] },
    eggs: { v: 'good', pros: ['Complete protein for very few calories', 'Choline for the brain, lutein for the eyes, B12 and vitamin D'],
      cons: [['Each yolk has ~185 mg cholesterol. Up to one egg a day isn\'t linked to heart disease in healthy people, but with diabetes or high LDL, favor whites or fewer yolks.', T, null, 'eggs'],
        ['Raw or runny eggs can carry Salmonella — cook until firm for pregnant women, young children and older adults.', C, { preg: true }, 'pregnancy'],
        ['Egg allergy is one of the most common in young children.', C, { allergy: 'egg' }, null]] },
    beef: { v: 'moderate', pros: ['The best-absorbed (heme) iron, plus zinc and B12', '93% lean keeps saturated fat moderate'],
      cons: [['Red meat is "probably carcinogenic" (IARC Group 2A, colorectal cancer). Keep red meat to about 12–18 oz cooked a week.', C, null, 'iarc'],
        ['Ground beef can carry E. coli — cook to 160°F (71°C), no pink.', C, null, 'temps'],
        ['Charring or high-heat grilling creates cancer-linked compounds (HCAs, PAHs); avoid blackened bits.', T, null, 'iarc'],
        ['Fattier ground beef (80/20) has 2–3× the saturated fat — raises LDL.', T, { cond: 'cholesterol' }, 'satfat'],
        ['High in purines.', C, { cond: 'gout' }, 'gout']] },
    steak: { v: 'moderate', pros: ['Heme iron, zinc and B12', 'Sirloin is one of the leaner cuts'],
      cons: [['Red meat — IARC Group 2A for colorectal cancer. Keep to about 12–18 oz cooked a week.', C, null, 'iarc'],
        ['~3 g saturated fat per 4 oz (ribeye has about twice that).', T, null, 'satfat'],
        ['Charred or well-done steak forms HCAs — trim charred parts, cook at moderate heat.', T, null, 'iarc'],
        ['High in purines.', C, { cond: 'gout' }, 'gout']] },
    pork: { v: 'good', pros: ['Tenderloin is as lean as chicken breast', 'Rich in thiamin (B1)'],
      cons: [['Bacon, ham, sausage and hot dogs are processed meats — IARC Group 1 (each 50 g/day raises colorectal cancer risk ~18%). Tenderloin is not.', C, null, 'iarc'],
        ['Cook to 145°F (63°C) and rest 3 minutes.', T, null, 'temps']] },
    tofu: { v: 'star', pros: ['Complete plant protein', 'Calcium-set tofu rivals milk for calcium; also iron and magnesium', 'Swapping meat for soy lowers LDL'],
      cons: [['Soy allergy.', C, { allergy: 'soy' }, null],
        ['Soy reduces levothyroxine absorption — take your thyroid pill 4 hours apart from soy.', C, { med: 'levothyroxine' }, 'levo'],
        ['Calcium content varies a lot by brand — check for calcium sulfate on the label.', T, null, null]],
      myth: 'Moderate soy does not raise breast-cancer risk and is safe even for breast-cancer survivors.', mythSource: 'soy' },
    tempeh: { v: 'star', pros: ['Fermented soy: protein plus fiber', 'Easier to digest for many people'],
      cons: [['Soy allergy.', C, { allergy: 'soy' }, null],
        ['Fermented soy contains tyramine — dangerous with MAOI antidepressants.', C, { med: 'maoi' }, 'maoi'],
        ['Take levothyroxine 4 hours apart from soy.', C, { med: 'levothyroxine' }, 'levo']] },
    lentils: { v: 'star', pros: ['Fiber, folate, iron and protein for pennies', 'Linked to lower LDL and steadier blood sugar'],
      cons: [['Gas and bloating (FODMAPs) — start with small portions, rinse canned lentils; red lentils are gentler.', T, null, 'fodmap'],
        ['High FODMAP — may trigger IBS symptoms.', C, { cond: 'ibs' }, 'fodmap'],
        ['High in potassium and phosphorus.', C, { cond: 'ckd' }, 'potassium'],
        ['Plant (non-heme) iron absorbs less well — pair with vitamin C (peppers, citrus).', T, null, null]] },
    edamame: { v: 'star', pros: ['Complete protein, folate and fiber', 'A rare vegetable with this much protein'],
      cons: [['Soy allergy.', C, { allergy: 'soy' }, null], ['Take levothyroxine 4 hours apart from soy.', C, { med: 'levothyroxine' }, 'levo'],
        ['Whole pods are a choking risk for small children.', T, { under: 4 }, 'choking']] },
    'greek-yogurt': { v: 'star', pros: ['High protein, calcium and B12', 'Live cultures support gut health', 'Lower in lactose than milk'],
      cons: [['Flavored and "fruit on the bottom" versions often have 10–15 g added sugar — buy plain and add fruit.', C, null, null],
        ['Straining removes some calcium — Greek has less than regular yogurt.', T, null, null],
        ['Milk allergy.', C, { allergy: 'milk' }, null]] },
    cottage: { v: 'good', pros: ['One of the highest-protein foods per calorie', 'Calcium and B12'],
      cons: [['Very salty: ~900 mg sodium per cup (40% of a day). Look for "no salt added".', C, null, 'sodium'],
        ['Sodium raises blood pressure.', C, { cond: 'hypertension' }, 'sodium'], ['Milk allergy.', C, { allergy: 'milk' }, null]] },
    'brown-rice': { v: 'good', pros: ['Whole grain with fiber and magnesium'],
      cons: [['Rice absorbs arsenic from soil, and brown rice has more than white (it\'s in the bran). Vary your grains and cook rice in lots of water, then drain — this removes about half.', C, null, 'arsenic'],
        ['Babies and toddlers: don\'t make rice cereal or rice drinks their main grain.', C, { under: 4 }, 'arsenic']] },
    'white-rice': { v: 'moderate', pros: ['Easy to digest; enriched with folate and iron', 'Gluten-free'],
      cons: [['Refined: little fiber, and it raises blood sugar quickly. Eating it daily in large amounts is linked to more type 2 diabetes.', C, null, 'rice'],
        ['Blood sugar spikes — pair with protein and vegetables, or swap for whole grains.', C, { cond: 'diabetes2' }, 'rice'],
        ['Contains arsenic too (less than brown) — cooking in excess water reduces it.', T, null, 'arsenic']] },
    quinoa: { v: 'star', pros: ['Complete protein, magnesium and iron', 'Gluten-free whole grain'],
      cons: [['Rinse before cooking to remove bitter saponins.', T, null, null], ['Moderate oxalate — fine for most, limit if you form kidney stones.', T, null, 'oxalate']] },
    oats: { v: 'star', pros: ['Beta-glucan fiber lowers LDL cholesterol (an FDA-approved health claim)', 'Steady energy'],
      cons: [['Regular oats are often cross-contaminated with wheat — people with celiac need certified gluten-free oats.', C, { cond: 'celiac' }, 'oats'],
        ['Instant flavored packets can have 10+ g added sugar — use plain oats.', T, null, null]] },
    'ww-pasta': { v: 'good', pros: ['Twice the fiber of regular pasta'],
      cons: [['Contains wheat and gluten.', C, { allergy: 'wheat' }, null], ['Easy to overeat — a restaurant portion is often 3–4 cups.', T, null, null]] },
    pasta: { v: 'moderate', pros: ['Enriched with iron and folate'],
      cons: [['Refined flour: less fiber and fewer minerals than whole wheat.', T, null, null], ['Portion creep — restaurant servings are 3–4× this; creamy sauces add saturated fat.', T, null, null],
        ['Contains wheat and gluten.', C, { allergy: 'wheat' }, null]] },
    'ww-bread': { v: 'good', pros: ['Whole grain fiber, B vitamins and magnesium'],
      cons: [['Bread is one of the top sources of sodium in the US diet (~270 mg per 2 slices).', T, null, 'sodium'],
        ['"Wheat" or "multigrain" isn\'t the same as whole grain — the first ingredient should say "100% whole wheat".', T, null, null],
        ['Contains wheat and gluten.', C, { allergy: 'wheat' }, null]] },
    'sweet-potato': { v: 'star', pros: ['A whole day\'s vitamin A (beta-carotene)', 'Fiber and potassium'],
      cons: [['High in oxalate — limit if you form kidney stones.', T, null, 'oxalate'], ['High in potassium.', C, { cond: 'ckd' }, 'potassium'],
        ['Candied or marshmallow-topped versions are dessert.', T, null, null]] },
    potato: { v: 'moderate', pros: ['More potassium than a banana', 'Vitamin C, especially with the skin'],
      cons: [['Raises blood sugar quickly (high glycemic index) — pair with protein and vegetables.', T, null, null],
        ['Fries and chips: eating fried potatoes 2+ times a week is linked to higher death risk; browning also forms acrylamide.', C, null, 'fries'],
        ['Cut away green parts and sprouts — they contain the toxin solanine.', T, null, null],
        ['High in potassium.', C, { cond: 'ckd' }, 'potassium']] },
    'corn-tortilla': { v: 'good', pros: ['Whole grain and gluten-free', 'Lime-treated corn adds calcium'],
      cons: [['Fried tortilla chips and tostadas add a lot of fat and salt.', T, null, null]] },
    'rice-noodles': { v: 'limit', pros: ['Gluten-free'],
      cons: [['Refined starch with almost no fiber, protein, vitamins or minerals.', C, null, null], ['Raises blood sugar quickly.', T, { cond: 'diabetes2' }, null]] },
    barley: { v: 'star', pros: ['Beta-glucan fiber lowers LDL', 'Very filling'],
      cons: [['Contains gluten.', C, { cond: 'celiac' }, null]] },
    broccoli: { v: 'star', pros: ['A full day\'s vitamin C per cup', 'Folate, vitamin K, fiber and cancer-studied sulforaphane'],
      cons: [['Can cause gas and bloating.', T, null, 'fodmap'],
        ['High in vitamin K — on warfarin, keep how much you eat consistent week to week (don\'t avoid it).', C, { med: 'warfarin' }, 'vitK']],
      myth: 'Broccoli only affects the thyroid with severe iodine deficiency and huge raw amounts.' },
    spinach: { v: 'star', pros: ['Vitamin A, K, folate, magnesium and iron', 'Almost no calories'],
      cons: [['Very high in oxalate — the top food to limit if you form kidney stones. Oxalate also blocks calcium: only ~5% of spinach\'s calcium is absorbed.', C, null, 'oxalate'],
        ['Extremely high in vitamin K — on warfarin, keep intake steady.', C, { med: 'warfarin' }, 'vitK'],
        ['Raw bagged spinach has been linked to E. coli outbreaks — wash and keep cold.', T, null, 'leafy'],
        ['High in potassium.', C, { cond: 'ckd' }, 'potassium'],
        ['Its iron is the poorly absorbed plant kind — eat with vitamin C.', T, null, null]] },
    salad: { v: 'star', pros: ['Vitamin K, folate and vitamin A for almost no calories'],
      cons: [['Leafy greens are one of the most common sources of E. coli and Salmonella outbreaks — rinse, refrigerate, and watch for recalls.', C, null, 'leafy'],
        ['Creamy dressings and toppings can add 300+ calories and lots of sodium.', T, null, null],
        ['High in vitamin K — keep steady on warfarin.', C, { med: 'warfarin' }, 'vitK']] },
    carrots: { v: 'star', pros: ['More than a day\'s vitamin A', 'Crunchy, cheap and kid-friendly'],
      cons: [['Raw carrot sticks and coins are a choking hazard under 4 — grate or cook until soft.', C, { under: 4 }, 'choking'],
        ['Eating lots can turn skin slightly orange — harmless (carotenemia).', T, null, null]] },
    peppers: { v: 'star', pros: ['More vitamin C than an orange — 2 days\' worth per cup (red)', 'Vitamin A'],
      cons: [['Often shows pesticide residues in USDA testing (within legal limits) — wash well.', T, null, null]] },
    'green-beans': { v: 'star', pros: ['Fiber, vitamin K and folate for few calories'],
      cons: [['Canned green beans can have 300+ mg sodium per cup — rinse or buy no-salt-added.', T, null, 'sodium']] },
    brussels: { v: 'star', pros: ['A day\'s vitamin C, plus vitamin K, folate and fiber'],
      cons: [['Gas and bloating for some.', T, null, 'fodmap'], ['Very high in vitamin K — keep steady on warfarin.', C, { med: 'warfarin' }, 'vitK']] },
    cauliflower: { v: 'star', pros: ['Vitamin C and fiber; a low-carb rice substitute'],
      cons: [['High FODMAP (mannitol) — a common IBS trigger.', C, { cond: 'ibs' }, 'fodmap'], ['Gas and bloating for some.', T, null, 'fodmap']] },
    zucchini: { v: 'star', pros: ['Very low calorie; vitamin C, potassium'],
      cons: [['If a zucchini tastes very bitter, spit it out and throw it away — rare cucurbitacin toxins cause severe stomach upset.', T, null, null]] },
    tomatoes: { v: 'star', pros: ['Lycopene, vitamin C and potassium', 'Lycopene is better absorbed from cooked tomatoes'],
      cons: [['Acidic — a common heartburn trigger.', C, { cond: 'gerd' }, null],
        ['Jarred sauces and ketchup add sodium and sugar.', T, null, 'sodium']],
      myth: 'Nightshades (tomatoes, peppers, potatoes) don\'t worsen arthritis for most people.' },
    mushrooms: { v: 'star', pros: ['B vitamins, selenium and potassium', 'UV-exposed mushrooms provide vitamin D'],
      cons: [['Never eat foraged wild mushrooms unless an expert identified them — some are deadly.', C, null, null],
        ['High FODMAP (mannitol) for IBS.', C, { cond: 'ibs' }, 'fodmap']] },
    'black-beans': { v: 'star', pros: ['15 g fiber per cup, plus folate, magnesium and protein'],
      cons: [['Canned beans carry sodium — rinsing removes about 40%.', T, null, 'sodium'], ['Gas and bloating; high FODMAP.', T, null, 'fodmap'],
        ['High FODMAP — may trigger IBS.', C, { cond: 'ibs' }, 'fodmap'], ['High in potassium and phosphorus.', C, { cond: 'ckd' }, 'potassium']] },
    chickpeas: { v: 'star', pros: ['Fiber, folate, iron and protein'],
      cons: [['Gas and bloating; high FODMAP (canned and rinsed is gentler).', T, null, 'fodmap'], ['Canned chickpeas carry sodium — rinse.', T, null, 'sodium']] },
    berries: { v: 'star', pros: ['Vitamin C, fiber and antioxidants with little sugar'],
      cons: [['Strawberries regularly top pesticide-residue lists — rinse well.', T, null, null],
        ['Frozen berries have occasionally been linked to hepatitis A and norovirus outbreaks — check recalls; cooking kills them.', T, null, 'outbreaks']] },
    apple: { v: 'good', pros: ['Pectin fiber (keep the skin)', 'Filling and portable'],
      cons: [['High FODMAP (fructose, sorbitol) — a common IBS trigger.', C, { cond: 'ibs' }, 'fodmap'], ['Apple juice keeps the sugar but loses the fiber.', T, null, null],
        ['Raw apple chunks are a choking risk under 4 — grate or cook.', C, { under: 4 }, 'choking']] },
    banana: { v: 'good', pros: ['Potassium, vitamin B6 and easy energy'],
      cons: [['Riper bananas have more sugar and raise blood sugar faster.', T, { cond: 'diabetes2' }, null], ['High in potassium.', C, { cond: 'ckd' }, 'potassium'],
        ['Can cross-react with latex allergy.', T, null, 'latex']] },
    orange: { v: 'star', pros: ['A day\'s vitamin C, folate and fiber'],
      cons: [['Acidic — may trigger heartburn.', C, { cond: 'gerd' }, null], ['Juice has the sugar of soda without the fiber.', T, null, null],
        ['Bitter Seville oranges (marmalade) interact with some statins and blood-pressure pills, like grapefruit. Sweet oranges are fine.', T, null, null]] },
    kiwi: { v: 'star', pros: ['More vitamin C than an orange', 'Two kiwis a day eased constipation in trials'],
      cons: [['Kiwi allergy is fairly common (mouth itching) and cross-reacts with latex allergy.', T, null, 'latex']] },
    grapes: { v: 'good', pros: ['Hydrating, sweet, some vitamin K'],
      cons: [['Whole grapes are one of the top choking hazards for children under 4 — cut lengthwise into quarters.', C, { under: 5 }, 'choking'],
        ['Higher in sugar than most fruit; raisins concentrate it.', T, null, null]] },
    chia: { v: 'star', pros: ['10 g fiber per 2 Tbsp, plus omega-3 (ALA) and calcium'],
      cons: [['Swallowing dry chia then drinking water can make it swell and block the esophagus — always soak it first.', C, null, null],
        ['A big jump in fiber can cause bloating — start small, drink water.', T, null, null]] },
    avocado: { v: 'star', pros: ['Heart-healthy monounsaturated fat', 'Fiber and potassium'],
      cons: [['Calorie-dense: half an avocado is 160 kcal.', T, null, null], ['High in potassium.', C, { cond: 'ckd' }, 'potassium'],
        ['Can cross-react with latex allergy.', T, null, 'latex']] },
    'olive-oil': { v: 'good', pros: ['Extra-virgin olive oil cut heart attacks and strokes ~30% in the PREDIMED trial', 'Polyphenols and vitamin E'],
      cons: [['120 kcal per tablespoon and few vitamins — measure rather than pour.', T, null, null]],
      myth: 'Extra-virgin olive oil is stable enough for normal home cooking.' },
    almonds: { v: 'star', pros: ['Highest vitamin E of any common food', 'Magnesium; linked to lower LDL'],
      cons: [['Tree-nut allergy can be severe.', C, { allergy: 'treenut' }, null], ['Whole nuts are a choking hazard under 4.', C, { under: 4 }, 'choking'],
        ['Calorie-dense; salted or candied nuts add sodium and sugar.', T, null, null]] },
    walnuts: { v: 'star', pros: ['The best nut source of omega-3 (ALA)', 'Linked to lower LDL'],
      cons: [['Tree-nut allergy.', C, { allergy: 'treenut' }, null], ['Choking hazard under 4.', C, { under: 4 }, 'choking'], ['Calorie-dense — a small handful is a serving.', T, null, null]] },
    'peanut-butter': { v: 'good', pros: ['Protein and healthy fats; cheap and kid-friendly'],
      cons: [['Peanut allergy is the leading cause of food-related anaphylaxis.', C, { allergy: 'peanut' }, null],
        ['Many brands add sugar, salt and hydrogenated oils — choose "peanuts (and salt)" only.', T, null, null],
        ['190 kcal per 2 Tbsp — easy to overdo.', T, null, null],
        ['Spoonfuls are a choking risk for toddlers — spread thinly.', C, { under: 4 }, 'choking']],
      myth: 'Introducing peanut early (around 4–6 months) prevents peanut allergy — ask your pediatrician first if baby has severe eczema.', mythSource: 'leap' },
    sunbutter: { v: 'good', pros: ['Nut- and peanut-free spread with vitamin E and magnesium'],
      cons: [['Some brands add sugar.', T, null, null], ['Turns green when baked with baking soda — harmless.', T, null, null], ['Calorie-dense.', T, null, null]] },
    'pumpkin-seeds': { v: 'star', pros: ['Magnesium, zinc and iron'],
      cons: [['Calorie-dense; salted versions add sodium.', T, null, null], ['Choking hazard under 4.', C, { under: 4 }, 'choking']] },
    flax: { v: 'star', pros: ['Omega-3 (ALA), lignans and fiber'],
      cons: [['Must be ground — whole seeds pass through undigested.', T, null, null], ['Its fiber can slow absorption of medicines — take pills 1–2 hours apart.', T, null, null]] },
    hummus: { v: 'good', pros: ['Fiber and plant protein; makes vegetables tastier'],
      cons: [['Store-bought hummus has ~230 mg sodium per ¼ cup.', T, null, 'sodium'], ['Contains sesame (tahini).', C, { allergy: 'sesame' }, null],
        ['Keep refrigerated; there have been Listeria recalls.', T, { preg: true }, 'pregnancy']] },
    tahini: { v: 'good', pros: ['Calcium, iron and healthy fats'],
      cons: [['Sesame is now a top-9 allergen.', C, { allergy: 'sesame' }, null], ['Tahini has had Salmonella recalls.', T, null, 'outbreaks'], ['Calorie-dense.', T, null, null]] },
    cheddar: { v: 'moderate', pros: ['Calcium and protein', 'Aged cheese is naturally very low in lactose'],
      cons: [['5 g saturated fat and 180 mg sodium per ounce — easy to eat 2–3 oz.', C, null, 'satfat'],
        ['Saturated fat raises LDL.', C, { cond: 'cholesterol' }, 'satfat'],
        ['Aged cheese is high in tyramine — dangerous with MAOI antidepressants.', C, { med: 'maoi' }, 'maoi'], ['Milk allergy.', C, { allergy: 'milk' }, null]] },
    butter: { v: 'limit', pros: ['Flavor; a little vitamin A'],
      cons: [['The most saturated fat per spoon of any food here (7 g/Tbsp) — raises LDL compared with olive or canola oil.', C, null, 'satfat'],
        ['Salted butter adds sodium.', T, null, 'sodium'], ['Milk allergy.', C, { allergy: 'milk' }, null]] },
    olives: { v: 'moderate', pros: ['Monounsaturated fat and vitamin E'],
      cons: [['Cured in brine: ~330 mg sodium per 10 olives.', C, null, 'sodium'], ['Sodium raises blood pressure.', C, { cond: 'hypertension' }, 'sodium'],
        ['Whole olives with pits are a choking hazard for young children.', C, { under: 4 }, 'choking']] }
  };

  var VERDICT = {
    star: ['Everyday star', 'Great to eat often'],
    good: ['Good choice', 'Healthy, with a few things to know'],
    moderate: ['Fine in moderation', 'Has real downsides — keep portions and frequency in check'],
    limit: ['Limit', 'Few nutrients or clear downsides — an occasional food']
  };

  /*
   * ctx (optional): { name, age, conds: [], meds: [rule ids], allergies: [tags], pregnant }
   * Returns { verdict, pros, general, personal, data, myth }.
   */
  function review(fd, ctx) {
    var r = R[fd.id] || { v: null, pros: [], cons: [] };
    var c = ctx || {};
    var general = [], personal = [];
    (r.cons || []).forEach(function (x) {
      var item = { text: x[0], level: x[1], source: x[3] };
      var w = x[2];
      if (!w) { general.push(item); return; }
      if (!ctx) return;
      var hit = (w.med && (c.meds || []).indexOf(w.med) !== -1) || (w.cond && ((c.conds || []).indexOf(w.cond) !== -1 || (w.cond === 'diabetes2' && (c.conds || []).some(function (k) { return k === 'prediabetes' || k === 'diabetes1'; })))) ||
        (w.under && c.age !== null && c.age !== undefined && c.age < w.under) || (w.preg && c.pregnant) || (w.allergy && (c.allergies || []).indexOf(w.allergy) !== -1);
      if (hit) personal.push(item);
    });
    // From the numbers: per-serving amounts against the label Daily Values.
    var data = [];
    if (fd.sodium >= 460) data.push({ text: 'High in sodium: ' + fd.sodium + ' mg per serving (' + Math.round(fd.sodium / 2300 * 100) + '% of the daily limit).', level: C });
    else if (fd.sodium >= 230) data.push({ text: 'Moderate sodium: ' + fd.sodium + ' mg per serving (' + Math.round(fd.sodium / 2300 * 100) + '% of the daily limit).', level: T });
    if (fd.satFat >= 4) data.push({ text: 'High in saturated fat: ' + fd.satFat + ' g per serving (' + Math.round(fd.satFat / 20 * 100) + '% of the daily limit).', level: C });
    if (fd.addedSugar >= 5) data.push({ text: 'Added sugar: ' + fd.addedSugar + ' g per serving.', level: T });
    if (fd.kcal >= 180 && fd.cat === 'fat') data.push({ text: fd.kcal + ' kcal per small serving — measure portions.', level: T });
    if (!R[fd.id]) data.push({ text: fd.custom ? 'You added this ingredient, so it has no expert review — check its label for sodium, saturated fat and added sugar.' : 'No review yet.', level: T });
    var v = VERDICT[r.v] || ['Not reviewed', ''];
    return { verdict: v[0], verdictText: v[1], verdictKey: r.v || 'none', pros: r.pros || [], general: general, personal: personal, data: data,
      myth: r.myth || null, mythSource: r.mythSource || null, cautions: general.concat(data).concat(personal).filter(function (x) { return x.level === C; }).length };
  }

  var Reviews = { SOURCES: SOURCES, REVIEWS: R, VERDICT: VERDICT, review: review };

  if (node) module.exports = Reviews;
  else root.FHReviews = Reviews;
})(this);
