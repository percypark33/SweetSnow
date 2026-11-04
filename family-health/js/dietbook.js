/*
 * Family Health Guide — the Diet Book.
 *
 * How much of each food group one person needs, from:
 *  - Calories (engine.js: Mifflin-St Jeor for adults, Dietary Guidelines
 *    estimates for children) → the matching USDA Healthy US-Style eating
 *    pattern (Dietary Guidelines 2020–2025, Appendix 3) for food groups.
 *  - Dietary Reference Intakes for protein (g/kg), the AMDR ranges for
 *    carbs/fat/protein, and 14 g fiber per 1,000 kcal.
 * Weekly limits (red and processed meat, fish) come from WCRF, IARC and the
 * FDA/EPA fish advice. Amounts are rounded the way the patterns are.
 */
(function (root) {
  'use strict';

  // Per day unless noted. veg/fruit/dairy in cup-equivalents, grains and
  // protein foods in ounce-equivalents, oils in grams. *Wk = per week.
  var KCAL = [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200];
  var PATTERN = {
    veg:        [1, 1.5, 1.5, 2, 2.5, 2.5, 3, 3, 3.5, 3.5, 4, 4],
    fruit:      [1, 1, 1.5, 1.5, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5],
    grains:     [3, 4, 5, 5, 6, 6, 7, 8, 9, 10, 10, 10],
    dairy:      [2, 2.5, 2.5, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    protein:    [2, 3, 4, 5, 5, 5.5, 6, 6.5, 6.5, 7, 7, 7],
    oils:       [15, 17, 17, 22, 24, 27, 29, 31, 34, 36, 44, 51],
    darkGreenWk: [0.5, 1, 1, 1.5, 1.5, 1.5, 2, 2, 2.5, 2.5, 2.5, 2.5],
    redOrangeWk: [2.5, 3, 3, 4, 5.5, 5.5, 6, 6, 7, 7, 7.5, 7.5],
    beansWk:    [0.5, 0.5, 0.5, 1, 1.5, 1.5, 2, 2, 2.5, 2.5, 3, 3],
    starchyWk:  [2, 3.5, 3.5, 4, 5, 5, 6, 6, 7, 7, 8, 8],
    otherVegWk: [1.5, 2.5, 2.5, 3.5, 4, 4, 5, 5, 5.5, 5.5, 7, 7],
    meatWk:     [10, 14, 19, 23, 23, 26, 28, 31, 31, 33, 33, 33],
    nutsWk:     [2, 2, 3, 4, 4, 5, 5, 5, 5, 6, 6, 6]
  };

  var SOURCES = {
    dga: { title: 'Dietary Guidelines for Americans 2020–2025 (Appendix 3: USDA food patterns)', org: 'USDA & HHS', year: 2020, url: 'https://www.dietaryguidelines.gov/resources/2020-2025-dietary-guidelines-online-materials' },
    myplate: { title: 'MyPlate food group gallery — what counts as a cup or ounce-equivalent', org: 'USDA', year: 2024, url: 'https://www.myplate.gov/eat-healthy/food-group-gallery' },
    dri: { title: 'Dietary Reference Intakes for energy, carbohydrate, fiber, fat, fatty acids, cholesterol, protein and amino acids (macronutrients)', org: 'National Academies', year: 2005, url: 'https://nap.nationalacademies.org/catalog/10490' },
    aune2017: { title: 'Fruit and vegetable intake and the risk of cardiovascular disease, cancer and all-cause mortality: meta-analysis (Aune et al., Int J Epidemiol)', org: 'Peer-reviewed meta-analysis', year: 2017, url: 'https://academic.oup.com/ije/article/46/3/1029/3039477' },
    cdcFv: { title: 'Adults meeting fruit and vegetable intake recommendations — United States, 2019 (MMWR)', org: 'CDC', year: 2022, url: 'https://www.cdc.gov/mmwr/volumes/71/wr/mm7101a1.htm' },
    aapJuice: { title: 'Fruit juice in infants, children and adolescents: current recommendations', org: 'American Academy of Pediatrics', year: 2017, url: 'https://publications.aap.org/pediatrics/article/139/6/e20170967/38735' },
    iarc: { title: 'Carcinogenicity of consumption of red and processed meat (IARC Monographs, Lancet Oncology)', org: 'WHO International Agency for Research on Cancer', year: 2015, url: 'https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(15)00444-1/fulltext' },
    wcrf: { title: 'Cancer prevention recommendations — limit red and processed meat', org: 'World Cancer Research Fund / AICR', year: 2018, url: 'https://www.wcrf.org/research-policy/evidence-for-our-recommendations/limit-red-processed-meat/' },
    fdaFish: { title: 'Advice about eating fish (for adults and children)', org: 'FDA & EPA', year: 2021, url: 'https://www.fda.gov/food/consumers/advice-about-eating-fish' },
    guasch2019: { title: 'Red meat vs other diets and cardiovascular risk factors: meta-analysis of RCTs (Guasch-Ferré et al., Circulation)', org: 'Peer-reviewed meta-analysis', year: 2019, url: 'https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.118.035225' },
    predimed: { title: 'Primary prevention of cardiovascular disease with a Mediterranean diet supplemented with olive oil or nuts (PREDIMED, NEJM)', org: 'Randomised trial', year: 2018, url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1800389' },
    aune2016: { title: 'Whole grain consumption and risk of cardiovascular disease, cancer and mortality: meta-analysis (Aune et al., BMJ)', org: 'Peer-reviewed meta-analysis', year: 2016, url: 'https://www.bmj.com/content/353/bmj.i2716' },
    reynolds2019: { title: 'Carbohydrate quality and human health: systematic reviews and meta-analyses (Reynolds et al., Lancet)', org: 'WHO-commissioned meta-analysis', year: 2019, url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)31809-9/fulltext' },
    ahaSatFat: { title: 'Dietary fats and cardiovascular disease: a presidential advisory', org: 'American Heart Association', year: 2017, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000510' },
    protAge: { title: 'Evidence-based recommendations for optimal dietary protein intake in older people (PROT-AGE)', org: 'PROT-AGE Study Group', year: 2013, url: 'https://pubmed.ncbi.nlm.nih.gov/23867520/' },
    acsmProtein: { title: 'Nutrition and athletic performance — joint position statement (protein 1.2–2.0 g/kg)', org: 'ACSM, Academy of Nutrition and Dietetics, Dietitians of Canada', year: 2016, url: 'https://pubmed.ncbi.nlm.nih.gov/26891166/' },
    ahaSugar: { title: 'Added sugars and cardiovascular disease risk in children', org: 'American Heart Association', year: 2017, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000439' }
  };

  function nearestIndex(kcal) {
    var k = Math.max(1000, Math.min(3200, kcal || 2000));
    var best = 0;
    KCAL.forEach(function (c, i) { if (Math.abs(c - k) < Math.abs(KCAL[best] - k)) best = i; });
    return best;
  }

  function r1(n) { return Math.round(n * 10) / 10; }
  function r5(n) { return Math.round(n / 5) * 5; }

  // Protein RDA in g per kg of body weight (DRI 2005).
  function proteinPerKg(age) {
    if (age < 4) return 1.05;
    if (age < 14) return 0.95;
    if (age < 19) return 0.85;
    return 0.8;
  }

  // AMDR (% of calories) by age.
  function amdr(age) {
    if (age < 4) return { carbs: [45, 65], fat: [30, 40], protein: [5, 20] };
    if (age < 19) return { carbs: [45, 65], fat: [25, 35], protein: [10, 30] };
    return { carbs: [45, 65], fat: [20, 35], protein: [10, 35] };
  }

  // FDA/EPA: two servings a week; serving size grows with age.
  function fishOzWeek(age) {
    if (age < 4) return 2;
    if (age < 8) return 4;
    if (age < 11) return 6;
    return 8;
  }

  /*
   * p: { age, sex, heightCm, weightKg, kcal, activity, goal }
   * Returns the person's amounts for each chapter, or { tooYoung } under 2.
   */
  function amounts(p) {
    var age = p.age;
    if (age === null || age === undefined) return { missing: 'Add a birth date (or an age) to size the amounts.' };
    if (age < 2) return { tooYoung: true };
    var i = nearestIndex(p.kcal);
    var kcal = p.kcal || 2000;
    var pat = {};
    Object.keys(PATTERN).forEach(function (k) { pat[k] = PATTERN[k][i]; });
    var range = amdr(age);
    var notes = [];

    // Protein: g/kg of a healthy reference weight when BMI is 30+, as the DRIs use reference weights.
    var bmi = p.heightCm && p.weightKg ? p.weightKg / Math.pow(p.heightCm / 100, 2) : null;
    var refKg = p.weightKg || null;
    if (bmi && age >= 19 && bmi >= 30) {
      refKg = 25 * Math.pow(p.heightCm / 100, 2);
      notes.push('Protein uses the weight at a BMI of 25 for your height (' + Math.round(refKg) + ' kg), because protein needs follow lean mass, not total weight.');
    }
    var lo = proteinPerKg(age), hi = lo;
    var proteinWhy = 'RDA ' + lo + ' g per kg' + (age < 19 ? ' for this age' : '');
    if (age >= 65) { lo = 1.0; hi = 1.2; proteinWhy = '1.0–1.2 g/kg for adults 65+ to protect muscle (PROT-AGE)'; }
    if (age >= 19 && (p.activity === 'active' || p.activity === 'athlete')) { lo = Math.max(lo, 1.2); hi = Math.max(hi, p.activity === 'athlete' ? 2.0 : 1.6); proteinWhy = lo + '–' + hi + ' g/kg for regular hard training (ACSM)'; }
    if (age >= 19 && p.goal === 'gain') { lo = Math.max(lo, 1.2); hi = Math.max(hi, 1.6); proteinWhy = lo + '–' + hi + ' g/kg while building muscle (ACSM)'; }
    var protein = refKg ? { min: Math.round(refKg * lo), max: Math.round(refKg * hi), why: proteinWhy } : { min: Math.round(kcal * range.protein[0] / 100 / 4), max: Math.round(kcal * range.protein[0] / 100 / 4), why: range.protein[0] + '% of calories (add weight for a precise number)' };
    // Never below the AMDR floor.
    var floor = Math.round(kcal * range.protein[0] / 100 / 4);
    if (protein.min < floor) { protein.min = floor; protein.max = Math.max(protein.max, floor); }
    protein.perMeal = age >= 19 ? Math.round(protein.min / 3) : null;
    protein.pct = range.protein;

    var carbs = { min: Math.max(130, Math.round(kcal * range.carbs[0] / 100 / 4)), max: Math.round(kcal * range.carbs[1] / 100 / 4), pct: range.carbs,
      addedSugarMax: age < 2 ? 0 : (age < 19 ? 25 : Math.round(kcal * 0.10 / 4)), grains: pat.grains, wholeGrains: r1(pat.grains / 2) };
    if (carbs.min > carbs.max) carbs.min = carbs.max;
    var fat = { min: Math.round(kcal * range.fat[0] / 100 / 9), max: Math.round(kcal * range.fat[1] / 100 / 9), pct: range.fat,
      satMax: Math.round(kcal * 0.10 / 9), oils: pat.oils, oilsTsp: r1(pat.oils / 4.5) };
    var fiber = { grams: Math.round(kcal / 1000 * 14) };

    var fish = fishOzWeek(age);
    var meatWk = pat.meatWk;
    var redMax = age >= 19 ? 12 : null; // WCRF ≈350 g cooked ≈ 12 oz a week
    var vegetables = { perDay: pat.veg, darkGreenWk: pat.darkGreenWk, redOrangeWk: pat.redOrangeWk, beansWk: pat.beansWk, starchyWk: pat.starchyWk, otherWk: pat.otherVegWk,
      grams: Math.round(pat.veg * 130) };
    var fruits = { perDay: pat.fruit, juiceMaxOz: age < 4 ? 4 : age < 7 ? 6 : 8, grams: Math.round(pat.fruit * 150) };
    var meats = { meatWk: meatWk, perDay: r1(meatWk / 7), fishWk: fish, redMaxWk: redMax, proteinFoods: pat.protein };
    var plants = { beansWk: pat.beansWk, nutsWk: pat.nutsWk };
    var dairy = { perDay: pat.dairy };

    return { age: age, kcal: kcal, patternKcal: KCAL[i], bmi: bmi ? r1(bmi) : null, notes: notes,
      vegetables: vegetables, fruits: fruits, meats: meats, plants: plants, carbs: carbs, fat: fat, protein: protein, fiber: fiber, dairy: dairy };
  }

  function fmt(n) { return String(n).replace(/\.5$/, '½').replace(/^0½$/, '½'); }
  function cups(n) { return fmt(n) + (n <= 1 ? ' cup' : ' cups'); }

  // The chapters. Each builds its text from the person's amounts (a).
  var CHAPTERS = [
    {
      id: 'vegetables', title: 'Vegetables', emoji: '🥦', color: '#2f7d5b',
      headline: function (a) { return cups(a.vegetables.perDay) + ' a day'; },
      detail: function (a) {
        var v = a.vegetables;
        return ['About ' + v.grams + ' g of vegetables a day.', 'Each week: ' + fmt(v.darkGreenWk) + ' cups dark green · ' + fmt(v.redOrangeWk) + ' red & orange · ' + fmt(v.beansWk) + ' beans, peas & lentils · ' + fmt(v.starchyWk) + ' starchy · ' + fmt(v.otherWk) + ' other.'];
      },
      serving: ['1 cup raw or cooked vegetables', '2 cups raw leafy greens (salad)', '1 cup 100% vegetable juice', '1 large tomato or 2 medium carrots'],
      facts: [
        ['In a meta-analysis of 95 studies, risk of early death fell steadily up to about 800 g of fruit and vegetables a day (≈10 portions) — 31% lower than eating none.', 'aune2017'],
        ['Only about 1 in 10 US adults eats enough vegetables.', 'cdcFv'],
        ['Variety matters: different color groups supply different nutrients — dark greens bring folate and vitamin K, red/orange bring vitamin A and potassium.', 'dga']
      ],
      best: ['Broccoli, spinach, kale, Brussels sprouts', 'Carrots, sweet potato, tomatoes, red peppers', 'Beans, lentils, chickpeas', 'Mushrooms, onions, zucchini, cauliflower'],
      limit: ['Fried vegetables and creamy sauces', 'Canned vegetables with added salt — rinse or choose "no salt added"'],
      sources: ['dga', 'aune2017', 'cdcFv', 'myplate'], focus: ['ldl', 'bp', 'sugar', 'goal-lose', 'liver', 'pregnancy']
    },
    {
      id: 'fruits', title: 'Fruits', emoji: '🍎', color: '#c0603a',
      headline: function (a) { return cups(a.fruits.perDay) + ' a day'; },
      detail: function (a) { return ['About ' + a.fruits.grams + ' g of fruit a day; at least half as whole fruit.', '100% juice: no more than ' + a.fruits.juiceMaxOz + ' oz a day' + (a.age < 19 ? ' (AAP limit for this age).' : '.')]; },
      serving: ['1 cup fresh, frozen or canned fruit', '½ cup dried fruit', '1 large banana or 1 small apple', '8 large strawberries', '1 cup 100% juice (counts, but less filling)'],
      facts: [
        ['Whole fruit keeps its fiber; juice loses it and raises blood sugar faster — that\'s why at least half should be whole.', 'dga'],
        ['Only about 1 in 8 US adults eats enough fruit.', 'cdcFv'],
        ['The AAP advises no juice under age 1 and caps it at 4–8 oz a day for children.', 'aapJuice']
      ],
      best: ['Berries, citrus, kiwi (vitamin C)', 'Apples, pears (soluble fiber)', 'Bananas, oranges (potassium)', 'Frozen fruit without added sugar'],
      limit: ['Fruit drinks, cocktails and "-ades" (added sugar, not fruit)', 'Fruit canned in heavy syrup'],
      sources: ['dga', 'cdcFv', 'aapJuice', 'myplate'], focus: ['iron', 'bp', 'uric']
    },
    {
      id: 'meats', title: 'Meat, poultry, fish & eggs', emoji: '🍗', color: '#a34a3a',
      headline: function (a) { return a.meats.meatWk + ' oz a week + ' + a.meats.fishWk + ' oz fish'; },
      detail: function (a) {
        var m = a.meats;
        return ['Meat, poultry and eggs: about ' + fmt(m.perDay) + ' oz a day (' + m.meatWk + ' oz a week).', 'Fish and seafood: ' + m.fishWk + ' oz a week (two servings).',
          m.redMaxWk ? 'Red meat (beef, pork, lamb): no more than about ' + m.redMaxWk + '–18 oz cooked a week. Processed meat: as little as possible.' : 'Keep processed meats (hot dogs, deli meat, bacon) occasional.'];
      },
      serving: ['1 oz-eq = 1 oz cooked meat, poultry or fish', '1 egg', 'A palm-sized piece of meat ≈ 3–4 oz', 'A small can of tuna ≈ 3 oz'],
      facts: [
        ['Processed meat is a Group 1 carcinogen: every 50 g a day (about 2 slices of ham) raises colorectal cancer risk about 18%. Red meat is "probably carcinogenic" (Group 2A).', 'iarc'],
        ['WCRF advises at most about 3 portions (350–500 g cooked) of red meat a week and very little processed meat.', 'wcrf'],
        ['Two servings of fish a week supply omega-3s for heart and brain; pick low-mercury fish. Avoid king mackerel, marlin, orange roughy, shark, swordfish, Gulf tilefish and bigeye tuna.', 'fdaFish']
      ],
      best: ['Salmon, sardines, trout, light tuna (low mercury, omega-3)', 'Chicken and turkey without skin', 'Eggs', 'Lean beef or pork loin, in modest portions'],
      limit: ['Bacon, sausage, hot dogs, ham, deli meats, jerky', 'Fried and charred meats', 'High-mercury fish (see above)'],
      sources: ['dga', 'iarc', 'wcrf', 'fdaFish'], focus: ['ldl', 'iron', 'b12', 'vitd', 'uric', 'pregnancy', 'protein']
    },
    {
      id: 'plants', title: 'Plant proteins: beans, lentils, nuts, seeds & soy', emoji: '🫘', color: '#7a6a2f',
      headline: function (a) { return cups(a.plants.beansWk) + ' beans + ' + a.plants.nutsWk + ' oz nuts a week'; },
      detail: function (a) { return ['Beans, peas and lentils: at least ' + cups(a.plants.beansWk) + ' a week (they count as vegetables or protein).', 'Nuts, seeds and soy: ' + a.plants.nutsWk + ' oz-eq a week (½ oz nuts or 1 Tbsp nut butter = 1 oz-eq).', 'Swapping some meat for these is one of the best-supported changes for heart health.']; },
      serving: ['¼ cup cooked beans, lentils or peas = 1 oz-eq protein', '½ oz nuts or seeds (12 almonds) = 1 oz-eq', '1 Tbsp peanut butter = 1 oz-eq', '¼ cup (2 oz) tofu = 1 oz-eq'],
      facts: [
        ['In trials, replacing red meat with high-quality plant proteins lowered LDL and total cholesterol more than replacing it with refined carbs.', 'guasch2019'],
        ['In the PREDIMED trial, a Mediterranean diet with a daily handful of nuts cut heart attacks, strokes and cardiovascular deaths by about 30%.', 'predimed'],
        ['Beans and lentils are among the richest fiber sources: about 15 g per cooked cup.', 'myplate']
      ],
      best: ['Lentils, black beans, chickpeas, edamame', 'Almonds, walnuts, peanuts, pumpkin and chia seeds', 'Tofu, tempeh, soy milk'],
      limit: ['Candied or heavily salted nuts', 'Highly processed "meat-free" products high in sodium'],
      sources: ['dga', 'guasch2019', 'predimed', 'myplate'], focus: ['ldl', 'sugar', 'iron', 'hdl', 'tg', 'pregnancy']
    },
    {
      id: 'carbs', title: 'Carbs & grains', emoji: '🍚', color: '#b0842a',
      headline: function (a) { return a.carbs.min + '–' + a.carbs.max + ' g a day'; },
      detail: function (a) {
        var c = a.carbs;
        return [c.pct[0] + '–' + c.pct[1] + '% of calories; never below 130 g (the brain\'s minimum).', 'Grains: ' + c.grains + ' oz-eq a day, at least ' + fmt(c.wholeGrains) + ' of them whole grain.',
          'Added sugar: under ' + c.addedSugarMax + ' g a day' + (a.age < 19 ? ' (AHA limit for children).' : ' (10% of calories).')];
      },
      serving: ['1 oz-eq = 1 slice of bread', '½ cup cooked rice, pasta or oatmeal', '1 cup flaked cereal', '1 small (6") tortilla', '3 cups popped popcorn'],
      facts: [
        ['About 3 servings (90 g) of whole grains a day is linked to about 20% lower risk of heart disease and 17% lower risk of early death.', 'aune2016'],
        ['Carb quality matters more than quantity: whole grains and fiber lower risk of heart disease, stroke, type 2 diabetes and colon cancer.', 'reynolds2019'],
        ['The AHA advises children eat under 25 g (6 tsp) of added sugar a day and none under age 2.', 'ahaSugar']
      ],
      best: ['Oats, barley, quinoa, brown rice', 'Whole-wheat bread and pasta', 'Sweet potatoes, potatoes with skin, corn tortillas', 'Beans and lentils (carbs + protein + fiber)'],
      limit: ['White bread, white rice, regular pasta — make at least half whole', 'Sugary drinks, sweets and pastries', 'Sweetened cereals'],
      sources: ['dga', 'dri', 'aune2016', 'reynolds2019', 'ahaSugar'], focus: ['sugar', 'tg', 'liver', 'goal-lose']
    },
    {
      id: 'fat', title: 'Fats & oils', emoji: '🥑', color: '#3d6fb4',
      headline: function (a) { return a.fat.min + '–' + a.fat.max + ' g a day'; },
      detail: function (a) {
        var f = a.fat;
        return [f.pct[0] + '–' + f.pct[1] + '% of calories.', 'Oils: about ' + f.oils + ' g a day (≈' + fmt(Math.round(f.oilsTsp * 2) / 2) + ' tsp) — olive, canola and other plant oils, plus nuts, seeds, avocado and fish.', 'Saturated fat: under ' + f.satMax + ' g a day (10% of calories).'];
      },
      serving: ['1 tsp oil ≈ 4.5 g fat', '1 Tbsp oil ≈ 14 g fat', '½ avocado ≈ 15 g fat', '1 oz nuts ≈ 14–18 g fat'],
      facts: [
        ['In trials, replacing saturated fat with polyunsaturated vegetable oils lowered cardiovascular disease by about 30% — similar to statins.', 'ahaSatFat'],
        ['Children under 4 need more fat (30–40% of calories) for growth and brain development.', 'dri'],
        ['Artificial trans fats (partially hydrogenated oils) were removed from the US food supply in 2018 — still check imported foods.', 'dga']
      ],
      best: ['Extra-virgin olive oil, canola oil', 'Avocado, nuts, seeds, nut butters', 'Fatty fish (salmon, sardines)'],
      limit: ['Butter, lard, coconut and palm oil', 'Fatty and processed meats, full-fat cheese in large amounts', 'Fried foods and pastries'],
      sources: ['dga', 'dri', 'ahaSatFat'], focus: ['ldl', 'hdl', 'liver', 'tg']
    },
    {
      id: 'protein', title: 'Protein', emoji: '💪', color: '#8a4fb0',
      headline: function (a) { return (a.protein.min === a.protein.max ? a.protein.min : a.protein.min + '–' + a.protein.max) + ' g a day'; },
      detail: function (a) {
        var p = a.protein;
        return [p.why + '.', 'Protein foods: ' + fmt(a.meats.proteinFoods) + ' oz-eq a day from meat, fish, eggs, beans, nuts and soy — dairy adds more.', p.perMeal ? 'Spread it out: about ' + p.perMeal + '–' + Math.max(p.perMeal, 30) + ' g per meal works best for muscle.' : 'Growing kids get enough from regular meals and snacks — no supplements needed.'];
      },
      serving: ['3 oz chicken or fish ≈ 21–26 g', '1 cup Greek yogurt ≈ 23 g', '2 eggs ≈ 13 g', '1 cup cooked lentils ≈ 18 g', '½ cup firm tofu ≈ 22 g'],
      facts: [
        ['The RDA is 0.8 g per kg of body weight for adults — the amount that meets the needs of 97–98% of healthy people.', 'dri'],
        ['Adults over 65 keep more muscle with 1.0–1.2 g/kg.', 'protAge'],
        ['People who train hard benefit from 1.2–2.0 g/kg, spread over meals.', 'acsmProtein']
      ],
      best: ['Fish, poultry, eggs, Greek yogurt', 'Beans, lentils, tofu, tempeh, edamame', 'Lean meat in modest portions'],
      limit: ['Processed meats as a protein source', 'Protein bars and shakes with lots of added sugar', 'Very high protein (over 2 g/kg) with kidney disease — ask your doctor'],
      sources: ['dri', 'protAge', 'acsmProtein', 'dga'], focus: ['protein', 'goal-lose', 'b12', 'kidney']
    },
    {
      id: 'fiber', title: 'Fiber', emoji: '🌾', color: '#5a8a2f',
      headline: function (a) { return a.fiber.grams + ' g a day'; },
      detail: function (a) { return ['14 g for every 1,000 calories you eat.', 'Easy way to get there: the vegetables, fruit, beans and whole grains in this book already add up to about ' + a.fiber.grams + ' g.', 'Add it gradually and drink more water to avoid bloating.']; },
      serving: ['1 cup cooked lentils or black beans ≈ 15 g', '1 cup raspberries ≈ 8 g', '½ cup dry oats ≈ 4 g', '2 Tbsp chia seeds ≈ 10 g', '1 medium pear ≈ 6 g'],
      facts: [
        ['Eating 25–29 g of fiber a day was linked to 15–30% lower risk of early death, heart disease, stroke, type 2 diabetes and colon cancer, with more benefit above that.', 'reynolds2019'],
        ['Most Americans get only about half the fiber they need.', 'dga'],
        ['Soluble fiber (oats, barley, beans, apples) lowers LDL cholesterol; insoluble fiber (whole grains, vegetables) keeps you regular.', 'dri']
      ],
      best: ['Beans, lentils, chickpeas', 'Berries, pears, apples with skin', 'Oats, barley, whole grains', 'Chia, flax, nuts', 'Broccoli, Brussels sprouts, artichokes'],
      limit: ['Fiber pills in place of food — food fiber comes with vitamins and minerals'],
      sources: ['dri', 'reynolds2019', 'dga'], focus: ['ldl', 'sugar', 'tg', 'goal-lose', 'liver']
    },
    {
      id: 'dairy', title: 'Dairy & calcium', emoji: '🥛', color: '#4a7fa8',
      headline: function (a) { return cups(a.dairy.perDay) + ' a day'; },
      detail: function () { return ['Milk, yogurt, cheese — or lactose-free milk and calcium-fortified soy milk, which count the same.', 'Choose low-fat or fat-free most of the time.']; },
      serving: ['1 cup milk, yogurt or fortified soy milk', '1½ oz natural cheese (2 slices)', '2 oz processed cheese'],
      facts: [['Dairy and fortified soy milk supply calcium, vitamin D and potassium — nutrients most Americans fall short on.', 'dga'],
        ['Almond, rice and oat "milks" don\'t count as dairy in the guidelines: their protein and nutrients differ.', 'dga']],
      best: ['Plain yogurt and Greek yogurt', 'Low-fat milk or fortified soy milk', 'Cottage cheese'],
      limit: ['Flavored milks and yogurts with added sugar', 'Large amounts of full-fat cheese'],
      sources: ['dga', 'myplate'], focus: ['vitd', 'uric', 'bp']
    }
  ];

  // Reference people for the appendix: moderately active, typical sizes.
  var REFERENCE = [
    ['2–3', 2.5, 1200, 1200, 13, 14], ['4–8', 6, 1400, 1600, 21, 22], ['9–13', 11, 1800, 2000, 37, 38], ['14–18', 16, 2000, 2600, 55, 66],
    ['19–30', 25, 2000, 2600, 62, 77], ['31–50', 40, 2000, 2400, 62, 77], ['51–64', 57, 1800, 2200, 62, 77], ['65+', 70, 1800, 2200, 62, 77]
  ];

  function referenceTable() {
    return REFERENCE.map(function (r) {
      return {
        ages: r[0],
        female: amounts({ age: r[1], sex: 'female', kcal: r[2], weightKg: r[4], activity: 'moderate' }),
        male: amounts({ age: r[1], sex: 'male', kcal: r[3], weightKg: r[5], activity: 'moderate' })
      };
    });
  }

  var DietBook = { KCAL: KCAL, PATTERN: PATTERN, SOURCES: SOURCES, CHAPTERS: CHAPTERS, amounts: amounts, referenceTable: referenceTable, fmt: fmt, nearestIndex: nearestIndex };

  if (typeof module !== 'undefined' && module.exports) module.exports = DietBook;
  else root.FHDietBook = DietBook;
})(this);
