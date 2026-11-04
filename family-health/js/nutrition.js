/*
 * Family Health Guide — nutrition scores: a meal's nutrients against one
 * person's needs.
 *
 *  - Needs: Dietary Reference Intakes (RDA or AI) by age, sex, pregnancy and
 *    breastfeeding; protein and fiber from the person's calorie and protein
 *    targets; limits from the Dietary Guidelines (sodium, saturated fat,
 *    added sugar). Blood tests and conditions raise the weight of the
 *    nutrients that matter for that person (low ferritin → iron) or tighten
 *    a limit (high LDL → saturated fat under 6%).
 *  - Meal score (0–100): how much of the meal's share of each daily need the
 *    plate covers (each capped at 100%), weighted, minus points for going
 *    over a limit or far over the meal's calories.
 *  - Food grade (A–E): a Nutrient Rich Foods (NRF) style index — the nine
 *    NRF9.3 nutrients plus folate, vitamin D and B12, minus the three limits,
 *    per 100 kcal — using the person's own needs in place of label Daily
 *    Values.
 */
(function (root) {
  'use strict';

  var node = typeof module !== 'undefined' && module.exports;
  var Foods = node ? require('./foods.js') : root.FHFoods;

  // NRF9.3's nine nutrients to encourage, plus three that blood tests often flag.
  var NUTRIENTS = [
    { id: 'protein', label: 'Protein', unit: 'g', nrf: true },
    { id: 'fiber', label: 'Fiber', unit: 'g', nrf: true },
    { id: 'vitA', label: 'Vitamin A', unit: 'mcg', nrf: true },
    { id: 'vitC', label: 'Vitamin C', unit: 'mg', nrf: true },
    { id: 'vitE', label: 'Vitamin E', unit: 'mg', nrf: true },
    { id: 'calcium', label: 'Calcium', unit: 'mg', nrf: true },
    { id: 'iron', label: 'Iron', unit: 'mg', nrf: true },
    { id: 'magnesium', label: 'Magnesium', unit: 'mg', nrf: true },
    { id: 'potassium', label: 'Potassium', unit: 'mg', nrf: true },
    { id: 'folate', label: 'Folate', unit: 'mcg', nrf: false },
    { id: 'vitD', label: 'Vitamin D', unit: 'mcg', nrf: false },
    { id: 'b12', label: 'Vitamin B12', unit: 'mcg', nrf: false }
  ];
  var LIMITS = [
    { id: 'sodium', label: 'Sodium', unit: 'mg' },
    { id: 'satFat', label: 'Saturated fat', unit: 'g' },
    { id: 'addedSugar', label: 'Added sugar', unit: 'g' }
  ];


  /*
   * What each nutrient does and what too little (or, for limits, too much)
   * causes. Plain-language summaries of the NIH Office of Dietary Supplements
   * fact sheets and the Dietary Reference Intakes.
   */
  var ODS = 'https://ods.od.nih.gov/factsheets/';
  var INFO = {
    protein: { does: 'Builds and repairs muscle, skin, organs and bones; makes enzymes, hormones and antibodies; keeps you full.',
      low: 'Muscle loss and weakness, slow wound healing, more infections, poor growth in children; older adults lose strength and balance.', url: 'https://nap.nationalacademies.org/read/10490/chapter/12' },
    fiber: { does: 'Feeds healthy gut bacteria, keeps bowels regular, lowers LDL cholesterol, slows sugar absorption and keeps you full.',
      low: 'Constipation and hemorrhoids; higher risk of heart disease, type 2 diabetes and colon cancer.', url: 'https://nap.nationalacademies.org/read/10490/chapter/9' },
    vitA: { does: 'Vision (especially in dim light), a healthy immune system, skin and the lining of the gut and lungs; growth in children.',
      low: 'Night blindness and dry eyes, more frequent infections, dry skin. Rare in the US except with gut absorption problems.', url: ODS + 'VitaminA-Consumer/' },
    vitC: { does: 'Makes collagen for skin, gums, blood vessels and healing; an antioxidant; helps you absorb iron from plant foods.',
      low: 'Tiredness, bleeding gums, easy bruising and slow healing; severe lack causes scurvy. Smokers need more.', url: ODS + 'VitaminC-Consumer/' },
    vitE: { does: 'An antioxidant that protects cells from damage; supports immune function and healthy blood vessels.',
      low: 'Nerve and muscle damage, poor balance, weak immunity — rare, mostly with fat-absorption disorders.', url: ODS + 'VitaminE-Consumer/' },
    calcium: { does: 'Builds and keeps bones and teeth strong; needed for muscle contraction, nerve signals and heart rhythm.',
      low: 'Weaker bones over time (osteopenia, osteoporosis, fractures); in children, poor bone growth. Blood levels stay normal by taking calcium from bone.', url: ODS + 'Calcium-Consumer/' },
    iron: { does: 'Carries oxygen in red blood cells (hemoglobin) and muscles; needed for energy, brain development and immunity. Iron from meat and fish absorbs best; pair plant iron with vitamin C.',
      low: 'Iron-deficiency anemia: tiredness, weakness, shortness of breath, pale skin, cold hands, trouble concentrating, ice cravings; in children, slower development.', url: ODS + 'Iron-Consumer/' },
    magnesium: { does: 'Involved in 300+ body processes: muscle and nerve function, blood sugar and blood pressure control, energy, bone and DNA.',
      low: 'Muscle cramps, fatigue, weakness; long-term low intake is linked to high blood pressure, type 2 diabetes and weaker bones.', url: ODS + 'Magnesium-Consumer/' },
    potassium: { does: 'Balances fluids and sodium, lowers blood pressure, keeps heart rhythm, muscles and nerves working.',
      low: 'Higher blood pressure and stroke risk, kidney stones, bone loss; very low blood levels cause weakness, cramps and abnormal heart rhythm.', url: ODS + 'Potassium-Consumer/' },
    folate: { does: 'Makes DNA and new cells, including red blood cells; before and in early pregnancy it prevents birth defects of the brain and spine.',
      low: 'Megaloblastic anemia (tiredness, weakness, irritability), mouth sores; in pregnancy, higher risk of neural tube defects.', url: ODS + 'Folate-Consumer/' },
    vitD: { does: 'Lets your body absorb calcium for strong bones; supports muscles, nerves and the immune system.',
      low: 'Soft, weak bones (rickets in children, osteomalacia in adults), bone pain, muscle weakness, more falls and fractures.', url: ODS + 'VitaminD-Consumer/' },
    b12: { does: 'Keeps nerves and blood cells healthy, makes DNA, and prevents a type of anemia. Found naturally only in animal foods.',
      low: 'Tiredness, anemia, numbness or tingling in hands and feet, balance problems, memory trouble and low mood — nerve damage can become permanent. Common with vegan diets, metformin, acid reducers and age 50+.', url: ODS + 'VitaminB12-Consumer/' },
    sodium: { does: 'A small amount balances fluids and helps nerves and muscles work — most people get far more than they need.',
      high: 'Raises blood pressure, which increases the risk of heart attack, stroke and kidney disease; worsens swelling in heart and kidney failure.', url: 'https://www.fda.gov/food/nutrition-education-resources-materials/sodium-your-diet' },
    satFat: { does: 'A source of energy, but the body makes all the saturated fat it needs.',
      high: 'Raises LDL ("bad") cholesterol, which builds up in arteries and raises the risk of heart attack and stroke.', url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/saturated-fats' },
    addedSugar: { does: 'Quick energy with no other nutrients ("empty calories").',
      high: 'Weight gain, tooth decay, higher triglycerides and fatty liver; raises the risk of type 2 diabetes and heart disease.', url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/added-sugars' },
    carbs: { does: 'The body\'s main fuel — the brain alone uses about 130 g of glucose a day. Whole-grain and vegetable carbs bring fiber, B vitamins and minerals.',
      low: 'Below about 130 g a day: tiredness, headaches, poor focus and lower exercise performance; very low-carb diets often fall short on fiber.', url: 'https://nap.nationalacademies.org/read/10490/chapter/8' },
    fat: { does: 'Absorbs vitamins A, D, E and K; makes hormones and cell walls; provides essential omega-3 and omega-6 fats for brain, eyes and heart.',
      low: 'Too little fat (under ~20% of calories): poor absorption of fat-soluble vitamins, dry skin, and in children poor growth and brain development.', url: 'https://nap.nationalacademies.org/read/10490/chapter/10' },
    kcal: { does: 'Energy for everything the body does — breathing, thinking, moving and, in children, growing.',
      low: 'Weight loss, muscle loss, tiredness, feeling cold, and in children slowed growth; too much leads to weight gain.', url: 'https://www.dietaryguidelines.gov/' },
    water: { does: 'Carries nutrients, controls body temperature, cushions joints, removes waste through urine and keeps blood pressure steady.',
      low: 'Thirst, dark urine, headache, tiredness, dizziness, constipation and kidney stones; older adults may not feel thirsty.', url: 'https://nap.nationalacademies.org/read/10925/chapter/6' },
    vegetables: { does: 'Vitamins A, C and K, folate, potassium, magnesium and fiber with very few calories.',
      low: 'Missing these nutrients; eating few vegetables is linked to more heart disease, stroke and some cancers.', url: 'https://www.dietaryguidelines.gov/' },
    fruits: { does: 'Vitamin C, potassium, folate and fiber; natural sweetness that can replace sweets.',
      low: 'Lower vitamin C and fiber; low fruit intake is linked to more heart disease and stroke.', url: 'https://www.dietaryguidelines.gov/' },
    meats: { does: 'Complete protein plus the most absorbable iron, zinc and B12; fish adds omega-3 fats and vitamin D.',
      low: 'Without other protein sources: low protein, iron, zinc and B12 — plan plant proteins and fortified foods instead.', url: 'https://www.dietaryguidelines.gov/' },
    plants: { does: 'Protein, fiber, folate, magnesium and healthy fats, with no cholesterol; lowers LDL when they replace red meat.',
      low: 'Missing fiber, magnesium and folate; fewer plant proteins usually means more red and processed meat.', url: 'https://www.dietaryguidelines.gov/' },
    dairy: { does: 'Calcium, vitamin D (fortified), potassium and protein for bones and muscles.',
      low: 'Low calcium and vitamin D, weaker bones — choose fortified soy milk or other calcium foods if you skip dairy.', url: ODS + 'Calcium-Consumer/' }
  };

  var SOURCES = {
    dri: { title: 'Dietary Reference Intakes: the essential guide to nutrient requirements', org: 'National Academies', year: 2006, url: 'https://nap.nationalacademies.org/catalog/11537' },
    driNaK: { title: 'Dietary Reference Intakes for sodium and potassium', org: 'National Academies', year: 2019, url: 'https://nap.nationalacademies.org/catalog/25353' },
    driCaD: { title: 'Dietary Reference Intakes for calcium and vitamin D', org: 'National Academies', year: 2011, url: 'https://nap.nationalacademies.org/catalog/13050' },
    nrf: { title: 'The Nutrient Rich Foods index helps to identify healthy, affordable foods (Drewnowski, Am J Clin Nutr) — NRF9.3', org: 'Validated nutrient-density index', year: 2010, url: 'https://pubmed.ncbi.nlm.nih.gov/20181811/' },
    usda: { title: 'FoodData Central', org: 'USDA Agricultural Research Service', year: 2024, url: 'https://fdc.nal.usda.gov/' },
    dga: { title: 'Dietary Guidelines for Americans 2020–2025 (limits for sodium, saturated fat and added sugar)', org: 'USDA & HHS', year: 2020, url: 'https://www.dietaryguidelines.gov/' }
  };

  function band(age, kid1, kid4, kid9, teen, adult) {
    if (age < 4) return kid1; if (age < 9) return kid4; if (age < 14) return kid9; if (age < 19) return teen; return adult;
  }

  /*
   * p: { age, sex, kcal, protein (g/day), conditions, smoker, focus: [rule ids] }
   * Returns { amounts: { id: daily amount }, limits: { id: daily max }, weights: { id: w }, why: { id: text } }.
   */
  function needs(p) {
    var age = p.age === null || p.age === undefined ? 35 : p.age;
    var m = p.sex === 'male';
    var conds = p.conditions || [];
    var preg = conds.indexOf('pregnancy') !== -1, bf = conds.indexOf('breastfeeding') !== -1;
    var kcal = p.kcal || 2000;
    var focus = p.focus || [];
    var on = function (id) { return focus.indexOf(id) !== -1; };
    var a = {
      protein: p.protein || Math.round(kcal * 0.15 / 4),
      fiber: Math.round(kcal / 1000 * 14),
      vitA: preg ? 770 : bf ? 1300 : band(age, 300, 400, 600, m ? 900 : 700, m ? 900 : 700),
      vitC: (preg ? 85 : bf ? 120 : band(age, 15, 25, 45, m ? 75 : 65, m ? 90 : 75)) + (p.smoker ? 35 : 0),
      vitE: bf ? 19 : band(age, 6, 7, 11, 15, 15),
      calcium: age < 4 ? 700 : age < 9 ? 1000 : age < 19 ? 1300 : age < 51 ? 1000 : age < 71 ? (m ? 1000 : 1200) : 1200,
      iron: preg ? 27 : age < 4 ? 7 : age < 9 ? 10 : age < 14 ? 8 : age < 19 ? (m ? 11 : 15) : age < 51 ? (m ? 8 : 18) : 8,
      magnesium: preg ? 350 : age < 4 ? 80 : age < 9 ? 130 : age < 14 ? 240 : age < 19 ? (m ? 410 : 360) : age < 31 ? (m ? 400 : 310) : (m ? 420 : 320),
      potassium: preg ? 2900 : bf ? 2800 : age < 4 ? 2000 : age < 9 ? 2300 : age < 14 ? (m ? 2500 : 2300) : age < 19 ? (m ? 3000 : 2300) : (m ? 3400 : 2600),
      folate: preg ? 600 : bf ? 500 : band(age, 150, 200, 300, 400, 400),
      vitD: age >= 71 ? 20 : 15,
      b12: preg ? 2.6 : bf ? 2.8 : band(age, 0.9, 1.2, 1.8, 2.4, 2.4)
    };
    if (p.diet === 'vegetarian' || p.diet === 'vegan') a.iron = Math.round(a.iron * 1.8);
    var hasHtn = conds.indexOf('hypertension') !== -1 || conds.indexOf('heart') !== -1 || conds.indexOf('ckd') !== -1 || on('bp') || on('kidney');
    var lim = {
      sodium: hasHtn ? 1500 : age < 4 ? 1200 : age < 9 ? 1500 : age < 14 ? 1800 : 2300,
      satFat: Math.round(kcal * (on('ldl') || conds.indexOf('cholesterol') !== -1 ? 0.06 : 0.10) / 9),
      addedSugar: age < 19 ? 25 : Math.round(kcal * (on('tg') || on('sugar') ? 0.06 : 0.10) / 4)
    };
    var w = {}, why = {};
    NUTRIENTS.forEach(function (n) { w[n.id] = 1; });
    w.protein = 1.5; w.fiber = 1.5;
    function boost(id, text) { w[id] = 2.5; why[id] = text; }
    if (on('iron')) { boost('iron', 'Your blood test shows low iron'); boost('vitC', 'Vitamin C helps you absorb iron'); }
    if (on('vitd')) { boost('vitD', 'Your vitamin D is low'); boost('calcium', 'Bones need calcium with vitamin D'); }
    if (on('b12')) boost('b12', 'Your B12 is low');
    if (on('ldl') || on('sugar') || on('tg')) boost('fiber', 'Fiber lowers LDL and steadies blood sugar');
    if (on('bp')) boost('potassium', 'Potassium lowers blood pressure');
    if (preg) { boost('folate', 'Pregnancy needs extra folate'); boost('iron', 'Pregnancy needs extra iron'); }
    if (age >= 65 || on('protein')) boost('protein', 'Protein protects muscle');
    if (on('potassium-high') || conds.indexOf('ckd') !== -1) { w.potassium = 0; why.potassium = 'Your care team limits potassium — not scored'; }
    return { amounts: a, limits: lim, weights: w, why: why, kcal: kcal };
  }

  function nutrientsOf(items, lib) {
    var t = { kcal: 0 };
    NUTRIENTS.concat(LIMITS).forEach(function (n) { t[n.id] = 0; });
    var unknown = 0;
    (items || []).forEach(function (it) {
      var fd = (lib ? lib(it.foodId) : Foods.byId(it.foodId));
      if (!fd) return;
      var q = it.qty || 1;
      t.kcal += fd.kcal * q;
      NUTRIENTS.concat(LIMITS).forEach(function (n) { t[n.id] += (fd[n.id] || 0) * q; });
      if (fd.custom && !fd.hasMicros) unknown++;
    });
    t.unknown = unknown;
    return t;
  }

  /*
   * Scores a meal for one person. share: the meal's part of the day
   * (breakfast 0.25, lunch 0.30, dinner 0.35, snack 0.10).
   */
  function mealScore(items, need, share, lib) {
    var t = nutrientsOf(items, lib);
    if (!items || !items.length) return { score: 0, rows: [], limits: [], gaps: [], over: [], totals: t, grade: '–' };
    var rows = NUTRIENTS.map(function (n) {
      var target = need.amounts[n.id] * share;
      var pct = target ? t[n.id] / target : 0;
      return { id: n.id, label: n.label, unit: n.unit, amount: round(t[n.id]), target: round(target), pct: pct, weight: need.weights[n.id], why: need.why[n.id] || '' };
    });
    var wsum = 0, got = 0;
    rows.forEach(function (r) { if (!r.weight) return; wsum += r.weight; got += r.weight * Math.min(1, r.pct); });
    var score = wsum ? got / wsum * 100 : 0;
    var lims = LIMITS.map(function (n) {
      var max = need.limits[n.id] * share;
      var pct = max ? t[n.id] / max : 0;
      return { id: n.id, label: n.label, unit: n.unit, amount: round(t[n.id]), max: round(max), pct: pct };
    });
    // Each limit costs up to 15 points: nothing at or under the meal's share, all 15 at double it.
    lims.forEach(function (l) { if (l.pct > 1) score -= Math.min(15, (l.pct - 1) * 15); });
    var energyTarget = (need.kcal || 2000) * share;
    if (t.kcal > energyTarget * 1.3) score -= Math.min(10, (t.kcal / energyTarget - 1.3) * 20);
    score = Math.max(0, Math.min(100, Math.round(score)));
    var gaps = rows.filter(function (r) { return r.weight && r.pct < 0.5; }).sort(function (a, b) { return (b.weight * (1 - b.pct)) - (a.weight * (1 - a.pct)); });
    return { score: score, grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'E', rows: rows, limits: lims,
      gaps: gaps, over: lims.filter(function (l) { return l.pct > 1; }), totals: t, unknown: t.unknown };
  }

  /*
   * NRF9.3 for one food, per 100 kcal: sum of % of the person's need for nine
   * nutrients (each capped at 100%), minus % of the three daily limits.
   */
  function nrf(fd, need) {
    if (!fd.kcal) return null;
    var per = 100 / fd.kcal;
    var good = 0, bad = 0;
    NUTRIENTS.forEach(function (n) {
      if (!need.weights[n.id] && n.id === 'potassium') return;
      good += Math.min(100, (fd[n.id] || 0) * per / need.amounts[n.id] * 100);
    });
    LIMITS.forEach(function (n) { bad += (fd[n.id] || 0) * per / need.limits[n.id] * 100; });
    return Math.round(good - bad);
  }

  function foodGrade(fd, need) {
    if (fd.custom && !fd.hasMicros) return { grade: '?', nrf: null };
    var v = nrf(fd, need);
    if (v === null) return { grade: '–', nrf: null };
    return { nrf: v, grade: v >= 160 ? 'A' : v >= 90 ? 'B' : v >= 45 ? 'C' : v >= 15 ? 'D' : 'E' };
  }

  // Foods that best fill a gap, per calorie, from the allowed list.
  function fillers(gap, allowed, need, n) {
    return allowed.filter(function (fd) { return fd.kcal > 0 && (fd[gap.id] || 0) / need.amounts[gap.id] >= 0.1; })
      // Rank by % of the need per serving, discounted gently for calories.
      .map(function (fd) { var pct = fd[gap.id] / need.amounts[gap.id] * 100; return { food: fd, rank: pct / Math.sqrt(fd.kcal), pct: Math.round(pct) }; })
      .sort(function (a, b) { return b.rank - a.rank; }).slice(0, n || 3);
  }

  // A day of meals: totals against full daily needs.
  function dayScore(meals, need, lib) {
    var all = [];
    meals.forEach(function (m) { all = all.concat(m.items || []); });
    return mealScore(all, need, 1, lib);
  }

  function round(v) { return v >= 100 ? Math.round(v) : v >= 10 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100; }

  var Nutrition = { INFO: INFO, NUTRIENTS: NUTRIENTS, LIMITS: LIMITS, SOURCES: SOURCES, needs: needs, nutrientsOf: nutrientsOf, mealScore: mealScore, nrf: nrf, foodGrade: foodGrade, fillers: fillers, dayScore: dayScore };

  if (node) module.exports = Nutrition;
  else root.FHNutrition = Nutrition;
})(this);
