/*
 * Family Health Guide — what makes one person's plan different from another's.
 *
 *  - Diet focus: blood-test results, conditions and goals become "focus"
 *    rules. Each says what was found, which nutrients to favour and which
 *    food tags to go easy on. The guide, the meal builder and the daily
 *    targets all read these, so a new blood test changes them all at once.
 *  - Daily targets: steps, water, active minutes and sleep, sized to the
 *    person's age, sex, activity, conditions, labs and tracker data.
 *
 * Lab-based food rules are for adults; children's ranges differ, so their
 * results go to the pediatrician instead.
 */
(function (root) {
  'use strict';

  var node = typeof module !== 'undefined' && module.exports;
  var KB = node ? require('./knowledge.js') : root.FHKnowledge;
  var Labs = node ? require('./labs.js') : root.FHLabs;
  var Foods = node ? require('./foods.js') : root.FHFoods;

  function list(v) { return Array.isArray(v) ? v : []; }
  function has(arr, k) { return list(arr).indexOf(k) !== -1; }
  function num(v) { return v === undefined || v === null || v === '' || isNaN(Number(v)) ? null : Number(v); }

  // Foods in the meal builder that are good sources of each nutrient
  // (USDA FoodData Central; "good source" ≈ 10%+ of the daily value per serving).
  var NUTRIENTS = {
    solubleFiber: { label: 'soluble fiber', foods: ['oats', 'barley', 'black-beans', 'lentils', 'chickpeas', 'edamame', 'apple', 'berries', 'orange', 'kiwi', 'chia', 'flax', 'brussels', 'sweet-potato', 'avocado', 'carrots'] },
    omega3: { label: 'omega-3 fats', foods: ['salmon', 'sardines', 'tuna', 'walnuts', 'chia', 'flax'] },
    nuts: { label: 'nuts & seeds', foods: ['almonds', 'walnuts', 'peanut-butter', 'pumpkin-seeds', 'sunbutter', 'flax'] },
    unsatFat: { label: 'olive oil & avocado', foods: ['olive-oil', 'avocado', 'olives'] },
    iron: { label: 'iron', foods: ['beef', 'steak', 'sardines', 'lentils', 'spinach', 'tofu', 'tempeh', 'edamame', 'black-beans', 'chickpeas', 'pumpkin-seeds', 'quinoa'] },
    vitC: { label: 'vitamin C (helps absorb iron)', foods: ['peppers', 'broccoli', 'kiwi', 'orange', 'berries', 'brussels', 'tomatoes', 'cauliflower'] },
    vitD: { label: 'vitamin D', foods: ['salmon', 'sardines', 'eggs', 'tuna'] },
    b12: { label: 'vitamin B12', foods: ['salmon', 'sardines', 'tuna', 'cod', 'beef', 'steak', 'eggs', 'greek-yogurt', 'cottage', 'shrimp', 'turkey'] },
    calcium: { label: 'calcium', foods: ['greek-yogurt', 'cottage', 'tofu', 'sardines', 'chia', 'broccoli', 'almonds', 'edamame'] },
    slowCarbs: { label: 'slow-digesting carbs', foods: ['oats', 'barley', 'quinoa', 'lentils', 'black-beans', 'chickpeas', 'ww-pasta', 'ww-bread', 'sweet-potato', 'brown-rice', 'corn-tortilla'] },
    leanProtein: { label: 'lean protein', foods: ['chicken', 'turkey', 'cod', 'tuna', 'shrimp', 'greek-yogurt', 'cottage', 'pork', 'tofu', 'eggs'] },
    potassium: { label: 'potassium', foods: ['banana', 'potato', 'sweet-potato', 'spinach', 'avocado', 'black-beans', 'lentils', 'greek-yogurt', 'orange'] },
    lowFatDairy: { label: 'low-fat dairy', foods: ['greek-yogurt', 'cottage'] },
    folate: { label: 'folate', foods: ['lentils', 'black-beans', 'chickpeas', 'spinach', 'broccoli', 'edamame', 'avocado', 'orange', 'brussels'] }
  };

  var SOURCES = {
    ahaDiet: { title: '2021 Dietary guidance to improve cardiovascular health', org: 'American Heart Association', year: 2021, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001031' },
    adaNutrition: { title: 'Nutrition therapy for adults with diabetes or prediabetes: a consensus report', org: 'American Diabetes Association', year: 2019, url: 'https://diabetesjournals.org/care/article/42/5/731/40480' },
    ahaTg: { title: 'Triglycerides and cardiovascular disease: a scientific statement', org: 'American Heart Association', year: 2011, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0b013e3182160726' },
    odsIron: { title: 'Iron — fact sheet for health professionals', org: 'NIH Office of Dietary Supplements', year: 2024, url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/' },
    odsVitD: { title: 'Vitamin D — fact sheet for health professionals', org: 'NIH Office of Dietary Supplements', year: 2024, url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/' },
    aaslNafld: { title: 'Practice guidance on the clinical assessment and management of MASLD', org: 'AASLD', year: 2023, url: 'https://journals.lww.com/hep/fulltext/2023/05000/aasld_practice_guidance_on_the_clinical_assessment.31.aspx' },
    kdigoDiet: { title: 'CKD evaluation and management — diet and lifestyle (sodium under 2 g/day)', org: 'KDIGO', year: 2024, url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/' },
    dash: { title: 'DASH eating plan', org: 'NIH National Heart, Lung, and Blood Institute', year: 2021, url: 'https://www.nhlbi.nih.gov/education/dash-eating-plan' },
    dga: { title: 'Dietary Guidelines for Americans 2020–2025', org: 'USDA & HHS', year: 2020, url: 'https://www.dietaryguidelines.gov/' },
    pag: { title: 'Physical Activity Guidelines for Americans, 2nd edition', org: 'US Department of Health and Human Services', year: 2018, url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines' },
    steps: { title: 'Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts (Paluch et al., Lancet Public Health)', org: 'Peer-reviewed meta-analysis', year: 2022, url: 'https://www.thelancet.com/journals/lanpub/article/PIIS2468-2667(21)00302-9/fulltext' },
    kidSteps: { title: 'How many steps/day are enough? for children and adolescents (Tudor-Locke et al.)', org: 'Int J Behav Nutr Phys Act', year: 2011, url: 'https://ijbnpa.biomedcentral.com/articles/10.1186/1479-5868-8-78' },
    postMeal: { title: 'Walking after meals lowers post-meal blood sugar more than one daily walk (Reynolds et al., Diabetologia)', org: 'Randomised crossover trial', year: 2016, url: 'https://link.springer.com/article/10.1007/s00125-016-4085-2' },
    water: { title: 'Dietary Reference Intakes for water, potassium, sodium, chloride and sulfate', org: 'National Academies', year: 2005, url: 'https://nap.nationalacademies.org/catalog/10925' },
    acsmFluid: { title: 'Exercise and fluid replacement — position stand', org: 'American College of Sports Medicine', year: 2007, url: 'https://journals.lww.com/acsm-msse/fulltext/2007/02000/exercise_and_fluid_replacement.22.aspx' },
    sleepKids: { title: 'Recommended amount of sleep for pediatric populations', org: 'American Academy of Sleep Medicine', year: 2016, url: 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866' }
  };

  function lab(latest, id) { return latest[id] ? latest[id].value : null; }
  function labText(latest, id) {
    var d = Labs.labDef(id);
    return d.label + ' ' + latest[id].value + ' ' + d.unit + ' (' + latest[id].date + ')';
  }

  /*
   * Focus rules for one person. `weight` ranks how strongly a rule shapes
   * food picks: blood test 3, diagnosed condition 2, goal or life stage 1.
   */
  function focus(member, age) {
    var conds = list(member.conditions);
    var latest = (age === null || age >= 18) ? Labs.latestLabs(member) : {};
    var male = member.sex === 'male';
    var out = [];
    function add(r) { out.push(r); }

    // Blood sugar
    var a1c = lab(latest, 'a1c'), glu = lab(latest, 'glucose');
    var sugarLab = (a1c !== null && a1c >= 5.7) ? 'a1c' : (glu !== null && glu >= 100) ? 'glucose' : null;
    var diabetic = has(conds, 'diabetes1') || has(conds, 'diabetes2');
    if (sugarLab || diabetic || has(conds, 'prediabetes')) {
      add({ id: 'sugar', icon: '🩸', short: 'steadier blood sugar', weight: sugarLab ? 3 : 2,
        title: sugarLab ? 'Steady your blood sugar' : 'Blood-sugar friendly eating',
        because: sugarLab ? labText(latest, sugarLab) + (a1c >= 6.5 || glu >= 126 ? ' — diabetes range' : ' — prediabetes range') : 'Diagnosed ' + (diabetic ? 'diabetes' : 'prediabetes'),
        boost: ['slowCarbs', 'solubleFiber', 'leanProtein'], caution: ['refined-carb', 'added-sugar'],
        eatMore: ['Beans, lentils and whole grains instead of white rice, white bread and pasta', 'Protein and vegetables at every meal — they slow how fast sugar rises'],
        easyOn: ['White rice, white bread, regular pasta', 'Sugary drinks, juice and sweets'],
        tip: 'A 10–15 minute walk after meals lowers the blood-sugar rise more than one longer walk at another time.',
        sources: ['adaNutrition', 'postMeal'], lab: !!sugarLab });
    }

    // LDL / total cholesterol
    var ldl = lab(latest, 'ldl'), tc = lab(latest, 'tc');
    var ldlLab = ldl !== null ? (ldl >= 130 ? 'ldl' : null) : (tc !== null && tc >= 240 ? 'tc' : null);
    if (ldlLab || has(conds, 'cholesterol') || has(conds, 'heart')) {
      add({ id: 'ldl', icon: '❤️', short: 'lower LDL', weight: ldlLab ? 3 : 2, title: 'Lower your LDL cholesterol',
        because: ldlLab ? labText(latest, ldlLab) + ' — above the 130 mg/dL goal for most adults' : 'Diagnosed ' + (has(conds, 'heart') ? 'heart disease' : 'high cholesterol'),
        boost: ['solubleFiber', 'nuts', 'omega3', 'unsatFat'], caution: ['high-satfat'],
        eatMore: ['Oats, barley, beans and lentils (soluble fiber binds cholesterol)', 'A handful of nuts most days', 'Fish twice a week; olive oil instead of butter'],
        easyOn: ['Butter, cheese, fatty and processed meats', 'Pastries and fried foods'],
        tip: 'Diet alone typically lowers LDL by 10–20%. Saturated fat under 6% of calories is the AHA target when LDL is high.',
        sources: ['ahaDiet', 'accCholesterol'], lab: !!ldlLab, satFatPct: 0.06 });
    }

    // Triglycerides
    var tg = lab(latest, 'tg');
    if (tg !== null && tg >= 150) {
      add({ id: 'tg', icon: '🫀', short: 'lower triglycerides', weight: 3, title: 'Bring triglycerides down',
        because: labText(latest, 'tg') + ' — normal is under 150',
        boost: ['omega3', 'solubleFiber', 'slowCarbs'], caution: ['added-sugar', 'refined-carb', 'alcohol'],
        eatMore: ['Fatty fish (salmon, sardines) 2+ times a week', 'High-fiber carbs instead of refined ones'],
        easyOn: ['Sugary drinks and sweets', 'Alcohol', 'White bread, white rice, pasta'],
        tip: 'Triglycerides respond fastest of all blood fats — cutting added sugar and alcohol can drop them 20–50% in weeks.',
        sources: ['ahaTg'], lab: true, sugarPct: 0.06 });
    }

    // HDL
    var hdl = lab(latest, 'hdl');
    if (hdl !== null && hdl < (male ? 40 : 50)) {
      add({ id: 'hdl', icon: '🏃', short: 'raise HDL', weight: 2, title: 'Raise your HDL ("good") cholesterol',
        because: labText(latest, 'hdl') + ' — goal is ' + (male ? '40' : '50') + '+',
        boost: ['omega3', 'nuts', 'unsatFat'], caution: [],
        eatMore: ['Olive oil, nuts, avocado and fish in place of refined carbs'], easyOn: ['Refined carbs and trans fats'],
        tip: 'Aerobic exercise is the strongest lever — your step goal is nudged up for this.', sources: ['ahaDiet'], lab: true, moreSteps: true });
    }

    // Iron / anemia
    var fer = lab(latest, 'ferritin'), hgb = lab(latest, 'hgb');
    var hgbLow = hgb !== null && hgb < (male ? 13 : 12);
    var ironLab = fer !== null && fer < 45 ? 'ferritin' : hgbLow ? 'hgb' : null;
    if (ironLab || has(conds, 'anemia')) {
      add({ id: 'iron', icon: '🧲', short: 'rebuild iron', weight: ironLab ? 3 : 2, title: 'Rebuild your iron',
        because: ironLab ? labText(latest, ironLab) + (ironLab === 'ferritin' ? ' — iron stores are low' : ' — below the anemia cut-off') : 'Diagnosed anemia',
        boost: ['iron', 'vitC'], caution: [],
        eatMore: ['Lean red meat, sardines, lentils, beans, tofu, spinach', 'Pair them with vitamin C (peppers, citrus, kiwi, broccoli) — it can double plant-iron absorption'],
        easyOn: ['Tea and coffee with meals (wait 1 hour)', 'Calcium supplements at the same meal as iron-rich food'],
        tip: 'Food helps keep iron up, but low ferritin usually also needs an iron supplement — ask your doctor about the dose.',
        sources: ['odsIron', 'agaIron'], lab: !!ironLab });
    }

    // Vitamin D
    var vd = lab(latest, 'vitd');
    if ((vd !== null && vd < 20) || has(conds, 'osteoporosis')) {
      add({ id: 'vitd', icon: '☀️', short: 'vitamin D & bones', weight: vd !== null && vd < 20 ? 3 : 2, title: vd !== null && vd < 20 ? 'Raise your vitamin D' : 'Protect your bones',
        because: vd !== null && vd < 20 ? labText(latest, 'vitd') + ' — under 20 ng/mL is too low for bone health' : 'Diagnosed osteoporosis',
        boost: ['vitD', 'calcium'], caution: [],
        eatMore: ['Salmon, sardines, eggs; fortified milk or plant milk', 'Calcium foods: yogurt, tofu, sardines, broccoli'], easyOn: [],
        tip: 'Few foods have much vitamin D — a daily supplement is often needed. Ask your doctor what dose fits your level.',
        sources: ['odsVitD', 'namVitD'], lab: vd !== null && vd < 20 });
    }

    // B12
    var b12 = lab(latest, 'b12');
    if (b12 !== null && b12 < 300) {
      add({ id: 'b12', icon: '🧠', short: 'more B12', weight: 3, title: 'Get more vitamin B12',
        because: labText(latest, 'b12') + (b12 < 200 ? ' — low' : ' — borderline'),
        boost: ['b12'], caution: [],
        eatMore: ['Fish, eggs, dairy, lean meat — or B12-fortified cereals and plant milks if plant-based'], easyOn: [],
        tip: 'Metformin and long-term acid reducers lower B12 absorption — mention them to your doctor.', sources: ['odsB12'], lab: true });
    }

    // Uric acid / gout
    var ur = lab(latest, 'uric');
    if ((ur !== null && ur >= 6.8) || has(conds, 'gout')) {
      add({ id: 'uric', icon: '🦶', short: 'lower uric acid', weight: ur !== null && ur >= 6.8 ? 3 : 2, title: 'Lower uric acid',
        because: ur !== null && ur >= 6.8 ? labText(latest, 'uric') + ' — above 6.8, where crystals can form' : 'Diagnosed gout',
        boost: ['lowFatDairy', 'vitC', 'slowCarbs'], caution: ['high-purine', 'alcohol', 'added-sugar'],
        eatMore: ['Low-fat yogurt and milk', 'Plenty of water'], easyOn: ['Organ meats, shellfish, sardines, red meat', 'Beer and spirits', 'Sugary drinks (fructose raises uric acid)'],
        tip: 'Your water target is raised — staying well hydrated helps the kidneys clear uric acid.', sources: ['acrGout'], lab: ur !== null && ur >= 6.8, extraWater: 2 });
    }

    // Liver (ALT) / fatty liver
    var alt = lab(latest, 'alt');
    var altHigh = alt !== null && alt > (male ? 33 : 25);
    if (altHigh || has(conds, 'fattyliver')) {
      add({ id: 'liver', icon: '🫒', short: 'liver-friendly', weight: altHigh ? 3 : 2, title: 'Take load off your liver',
        because: altHigh ? labText(latest, 'alt') + ' — above the healthy range' : 'Diagnosed fatty liver',
        boost: ['solubleFiber', 'omega3', 'unsatFat'], caution: ['added-sugar', 'refined-carb', 'alcohol'],
        eatMore: ['Mediterranean-style meals: vegetables, beans, fish, olive oil', 'Coffee (2–3 cups) is linked with healthier livers'],
        easyOn: ['Sugary drinks and sweets', 'Alcohol', 'Refined carbs'],
        tip: 'Losing 7–10% of body weight is the most effective treatment for fatty liver.', sources: ['aaslNafld'], lab: altHigh });
    }

    // Kidneys
    var egfr = lab(latest, 'egfr'), k = lab(latest, 'potassium');
    var kidneyLab = egfr !== null && egfr < 60;
    if (kidneyLab || has(conds, 'ckd')) {
      add({ id: 'kidney', icon: '🫘', short: 'kidney-friendly', weight: kidneyLab ? 3 : 2, title: 'Go easy on your kidneys',
        because: kidneyLab ? labText(latest, 'egfr') + ' — below 60' : 'Diagnosed kidney disease',
        boost: ['unsatFat'], caution: ['high-sodium'],
        eatMore: ['Fresh home-cooked food (less salt)', 'Moderate protein — not more than you need'], easyOn: ['Salty, processed and restaurant food', 'Salt substitutes (they contain potassium)'],
        tip: 'Kidney diets are individual — ask for a referral to a renal dietitian.', sources: ['kdigoDiet'], lab: kidneyLab, sodiumMg: 2000 });
    }
    if (k !== null && k >= 5.1) {
      add({ id: 'potassium-high', icon: '🍌', short: 'less potassium', weight: 3, title: 'Limit high-potassium foods for now',
        because: labText(latest, 'potassium') + ' — above normal',
        boost: [], caution: ['high-potassium'], eatMore: [], easyOn: ['Bananas, potatoes, oranges, avocado, beans, spinach'],
        tip: 'Ask your doctor whether a medicine is causing it before changing your diet long-term.', sources: ['potassium'], lab: true });
    }

    // Blood pressure (condition only; readings are in the log)
    if (has(conds, 'hypertension')) {
      var kOk = !(k !== null && k >= 5.1) && !kidneyLab && !has(conds, 'ckd');
      add({ id: 'bp', icon: '🧂', short: 'lower blood pressure', weight: 2, title: 'Lower your blood pressure (DASH)',
        because: 'Diagnosed high blood pressure',
        boost: kOk ? ['potassium', 'lowFatDairy', 'solubleFiber'] : ['lowFatDairy', 'solubleFiber'], caution: ['high-sodium'],
        eatMore: kOk ? ['Fruit, vegetables and beans (potassium)', 'Low-fat dairy'] : ['Vegetables and low-fat dairy'], easyOn: ['Salty, processed and restaurant food'],
        tip: 'The DASH diet lowers systolic pressure by about 8–14 points; cutting salt adds another 2–8.', sources: ['dash'], lab: false, sodiumMg: 1500 });
    }

    // Pregnancy
    if (has(conds, 'pregnancy')) {
      add({ id: 'pregnancy', icon: '🤰', short: 'pregnancy needs', weight: 2, title: 'Pregnancy nutrition',
        because: 'Currently pregnant', boost: ['folate', 'iron', 'omega3', 'calcium'], caution: [],
        eatMore: ['Beans, leafy greens and citrus (folate)', 'Low-mercury fish 2–3 times a week (salmon, sardines, light tuna)'], easyOn: [],
        tip: 'Keep taking a prenatal vitamin with folic acid and iron.', sources: ['dga'], lab: false });
    }

    // Goals and life stage (light touch)
    if (member.goal === 'lose' && (age === null || age >= 18)) {
      add({ id: 'goal-lose', icon: '🎯', short: 'filling & lighter', weight: 1, title: 'Stay full on fewer calories',
        because: 'Your goal: lose weight gradually', boost: ['leanProtein', 'solubleFiber'], caution: [],
        eatMore: ['Protein and fiber at each meal — both keep you full longer'], easyOn: ['Calorie-dense extras (oils, nut butters, cheese) — measure them'],
        tip: 'A 500 kcal/day deficit is about 1 lb a week.', sources: ['dga'], lab: false });
    }
    if (member.goal === 'gain' || (age !== null && age >= 65)) {
      add({ id: 'protein', icon: '💪', short: 'more protein', weight: 1, title: member.goal === 'gain' ? 'Build muscle' : 'Keep your muscles strong',
        because: member.goal === 'gain' ? 'Your goal: gain weight / build muscle' : 'Age 65+: protein needs rise to 1.0–1.2 g/kg',
        boost: ['leanProtein'], caution: [], eatMore: ['Protein spread across 3 meals (25–30 g each)'], easyOn: [],
        tip: 'Pair it with strength exercise twice a week.', sources: ['pag'], lab: false });
    }
    return out;
  }

  var WEIGHT_TEXT = { 3: 'your blood test', 2: 'your health', 1: 'your goal' };

  // Per-food fit for one person: { score, reasons: [text], cautions: [text] }.
  function foodPicks(rules) {
    var picks = {};
    Foods.FOODS.forEach(function (fd) { picks[fd.id] = { score: 0, reasons: [], cautions: [] }; });
    rules.forEach(function (r) {
      var hit = {};
      r.boost.forEach(function (n) {
        (NUTRIENTS[n] ? NUTRIENTS[n].foods : []).forEach(function (id) {
          if (!picks[id] || hit[id]) return;
          hit[id] = true;
          picks[id].score += r.weight;
          picks[id].reasons.push(r.icon + ' ' + NUTRIENTS[n].label + ' → ' + r.short);
        });
      });
      Foods.FOODS.forEach(function (fd) {
        var bad = r.caution.filter(function (t) { return fd.tags.indexOf(t) !== -1; });
        if (bad.length) {
          picks[fd.id].score -= r.weight;
          picks[fd.id].cautions.push(r.short + ': ' + bad.map(function (t) { return KB.TAG_LABELS[t] || t; }).join(', '));
        }
      });
    });
    return picks;
  }

  function topFoods(rule, blockedTags, n) {
    var ids = [];
    rule.boost.forEach(function (b) { (NUTRIENTS[b] ? NUTRIENTS[b].foods : []).forEach(function (id) { if (ids.indexOf(id) === -1) ids.push(id); }); });
    return ids.map(Foods.byId).filter(function (fd) {
      return fd && !fd.tags.some(function (t) { return blockedTags.indexOf(t) !== -1 || rule.caution.indexOf(t) !== -1; });
    }).slice(0, n || 6);
  }

  // ------------------------------------------------------------ daily goals

  function round(n, step) { return Math.round(n / step) * step; }

  function sleepRange(age) {
    if (age === null) return null;
    if (age < 1) return [12, 16];
    if (age < 3) return [11, 14];
    if (age < 6) return [10, 13];
    if (age < 13) return [9, 12];
    if (age < 18) return [8, 10];
    if (age >= 65) return [7, 8];
    return [7, 9];
  }

  // Average steps from the daily log (last 7 entries with steps), else null.
  function loggedSteps(member) {
    var d = member.daily || {};
    var vals = Object.keys(d).sort().reverse().map(function (k) { return num(d[k].steps); }).filter(function (v) { return v !== null && v > 0; }).slice(0, 7);
    return vals.length >= 3 ? Math.round(vals.reduce(function (s, v) { return s + v; }, 0) / vals.length) : null;
  }

  var ACTIVITY_STEPS = { sedentary: 4000, light: 6000, moderate: 8000, active: 10000, athlete: 12000 };

  function daily(member, age, rules) {
    rules = rules || focus(member, age);
    var conds = list(member.conditions);
    var male = member.sex === 'male';
    var w = member.wearable || {};
    var hasRule = function (id) { return rules.some(function (r) { return r.id === id; }); };
    var out = { steps: null, water: null, active: null, sleep: null };

    // ---- steps
    if (age !== null && age >= 6 && age < 18) {
      var kid = age < 13 ? (male ? 13000 : 11000) : 10000;
      out.steps = { goal: kid, base: null, why: ['Kids and teens need 60+ minutes of active play a day; that is about ' + kid.toLocaleString('en-US') + ' steps at this age.'], sources: ['kidSteps', 'pag'] };
    } else if (age === null || age >= 18) {
      var tracked = num(w.steps), logged = loggedSteps(member);
      var base = tracked || logged;
      var baseFrom = tracked ? 'your tracker' : logged ? 'your last week of logged steps' : null;
      if (!base) {
        var ad = num((member.answers || {}).active_days);
        base = ad !== null ? (ad >= 5 ? 9000 : ad >= 3 ? 7000 : ad >= 1 ? 5500 : 4000) : ACTIVITY_STEPS[member.activity] || 6000;
      }
      var plateau = age !== null && age >= 60 ? 7000 : 9000;
      if (hasRule('hdl') || hasRule('sugar') || hasRule('tg') || member.goal === 'lose') plateau += 1000;
      var why = [];
      var goal;
      var easy = (num(w.recovery) !== null && num(w.recovery) < 50) || (num(w.hrv) && num(w.hrvBaseline) && num(w.hrv) < num(w.hrvBaseline) * 0.8);
      if (base >= plateau) {
        goal = round(base, 500);
        why.push('You average about ' + round(base, 500).toLocaleString('en-US') + ' steps — past the point (' + plateau.toLocaleString('en-US') + ') where the health benefit levels off. Keep it up.');
      } else if (easy) {
        goal = round(base, 500);
        why.push('Your tracker shows low recovery, so the goal holds at your usual ' + goal.toLocaleString('en-US') + ' until it bounces back.');
      } else {
        goal = Math.min(plateau, round(base + 1000, 500));
        why.push((baseFrom ? 'You average about ' + round(base, 500).toLocaleString('en-US') + ' steps (from ' + baseFrom + ').' : 'Estimated from your activity answers — log a few days or add tracker steps to fine-tune it.') +
          ' Adding 1,000 a day is a step-up most people keep; work toward ' + plateau.toLocaleString('en-US') + '.');
        why.push('In a 15-study analysis, risk of death fell steadily up to about ' + (age !== null && age >= 60 ? '6,000–8,000 steps for people 60+' : '8,000–10,000 steps for under-60s') + '.');
      }
      if (hasRule('sugar')) why.push('Split some of them into 10–15 minute walks after meals — it blunts blood-sugar spikes.');
      if (hasRule('hdl')) why.push('Brisk walking raises HDL — your goal is set a little higher for this.');
      if (has(conds, 'heart') || has(conds, 'ckd')) why.push('With a heart or kidney condition, check new exercise plans with your care team.');
      if (has(conds, 'pregnancy')) why.push('Pregnancy: keep moving at a pace where you can still talk — 150 minutes a week is the goal.');
      out.steps = { goal: goal, base: base, plateau: plateau, why: why, sources: hasRule('sugar') ? ['steps', 'postMeal'] : ['steps'] };
    }

    // ---- active minutes
    if (age !== null && age < 6 && age >= 3) out.active = { text: '3 hours of active play a day, including 1 hour energetic', sources: ['pag'] };
    else if (age !== null && age < 18 && age >= 6) out.active = { text: '60 minutes a day, with vigorous play and muscle/bone-strengthening 3 days a week', sources: ['pag'] };
    else if (age === null || age >= 18) out.active = { text: '150 minutes a week of moderate activity (or 75 vigorous), plus strength training 2 days' + (age !== null && age >= 65 ? ', plus balance exercises' : ''), sources: ['pag'] };

    // ---- water (cups of 8 oz from drinks)
    if (has(conds, 'heart') || (has(conds, 'ckd') && (lab(Labs.latestLabs(member), 'egfr') || 60) < 30)) {
      out.water = { cups: null, why: ['Your care team may set a fluid limit — follow theirs instead of a general goal.'], sources: ['water'] };
    } else if (age !== null && age >= 1) {
      var cups;
      if (age < 4) cups = 4; else if (age < 9) cups = 5; else if (age < 14) cups = male ? 8 : 7; else if (age < 19) cups = male ? 11 : 8; else cups = male ? 13 : 9;
      var why2 = ['Base: ' + cups + ' cups — the National Academies\' adequate intake from drinks for ' + (age < 19 ? 'this age' : male ? 'men' : 'women') + ' (food supplies the other ~20%).'];
      if (has(conds, 'pregnancy')) { cups = 10; why2.push('Pregnancy: 10 cups.'); }
      if (has(conds, 'breastfeeding')) { cups = 13; why2.push('Breastfeeding: 13 cups.'); }
      var extra = { moderate: 1, active: 2, athlete: 3 }[member.activity] || 0;
      if (extra && age >= 9) { cups += extra; why2.push('+' + extra + ' for your activity level — drink more on hot days or long workouts.'); }
      rules.forEach(function (r) { if (r.extraWater) { cups += r.extraWater; why2.push('+' + r.extraWater + ' to help ' + r.short + '.'); } });
      if (age >= 70) why2.push('Thirst fades with age — drink on a schedule rather than waiting to feel thirsty.');
      out.water = { cups: cups, liters: Math.round(cups * 0.237 * 10) / 10, why: why2, sources: ['water'].concat(extra ? ['acsmFluid'] : []) };
    }

    // ---- sleep
    var sr = sleepRange(age);
    if (sr) {
      var ws = num(w.sleepHours);
      out.sleep = { min: sr[0], max: sr[1], tracked: ws, sources: [age !== null && age < 18 ? 'sleepKids' : 'sleepAdult'] };
    }
    return out;
  }

  // Tweaks to the guide's daily nutrient targets from the focus rules.
  function targetTweaks(rules) {
    var t = {};
    rules.forEach(function (r) {
      if (r.satFatPct) t.satFatPct = Math.min(t.satFatPct || 1, r.satFatPct);
      if (r.sugarPct) t.sugarPct = Math.min(t.sugarPct || 1, r.sugarPct);
      if (r.sodiumMg) t.sodiumMg = Math.min(t.sodiumMg || 99999, r.sodiumMg);
    });
    return t;
  }

  var Personal = { NUTRIENTS: NUTRIENTS, SOURCES: SOURCES, focus: focus, foodPicks: foodPicks, topFoods: topFoods, daily: daily, sleepRange: sleepRange, targetTweaks: targetTweaks, WEIGHT_TEXT: WEIGHT_TEXT };

  if (node) module.exports = Personal;
  else root.FHPersonal = Personal;
})(this);
