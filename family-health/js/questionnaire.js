/*
 * Family Health Guide — everyday health questionnaire.
 *
 * Plain-language questions anyone can answer, scored with published,
 * validated screening tools where they exist (ADA Diabetes Risk Test,
 * STOP-Bang, PHQ-2, GAD-2, AUDIT-C, Rome IV) and national guidelines
 * (USPSTF, Dietary Guidelines, Physical Activity Guidelines, NIAID, ACG).
 *
 * Screening is not diagnosis: findings say what to ask a clinician about,
 * and nothing unconfirmed is written into a profile unless the user ticks it.
 */
(function (root) {
  'use strict';

  var KB = (typeof module !== 'undefined' && module.exports) ? require('./knowledge.js') : root.FHKnowledge;
  var Labs = (typeof module !== 'undefined' && module.exports) ? require('./labs.js') : root.FHLabs;

  // ------------------------------------------------------------------ sources

  var SOURCES = {
    dga: { title: 'Dietary Guidelines for Americans, 2020–2025', org: 'USDA & HHS', year: 2020, url: 'https://www.dietaryguidelines.gov' },
    pag: { title: 'Physical Activity Guidelines for Americans, 2nd edition', org: 'HHS', year: 2018, url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines' },
    sleepAdult: { title: 'Recommended amount of sleep for a healthy adult (joint consensus)', org: 'AASM & Sleep Research Society', year: 2015, url: 'https://aasm.org/resources/pdf/pressroom/adult-sleep-duration-consensus.pdf' },
    sleepKids: { title: 'Recommended amount of sleep for pediatric populations', org: 'AASM (endorsed by AAP)', year: 2016, url: 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866' },
    adaRisk: { title: 'ADA Diabetes Risk Test (Bang et al., Annals of Internal Medicine)', org: 'American Diabetes Association', year: 2009, url: 'https://diabetes.org/diabetes-risk-test' },
    uspstfDiabetes: { title: 'Screening for prediabetes and type 2 diabetes', org: 'USPSTF', year: 2021, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes' },
    adaSymptoms: { title: 'Standards of Care in Diabetes — diagnosis and classification', org: 'American Diabetes Association', year: 2025, url: 'https://diabetesjournals.org/care/issue/48/Supplement_1' },
    uspstfBP: { title: 'Screening for hypertension in adults', org: 'USPSTF', year: 2021, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening' },
    uspstfStatin: { title: 'Statin use for the primary prevention of cardiovascular disease in adults', org: 'USPSTF', year: 2022, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/statin-use-in-adults-preventive-medication' },
    nhlbiKids: { title: 'Integrated guidelines for cardiovascular health in children (universal lipid screening at 9–11 and 17–21)', org: 'NHLBI, endorsed by AAP', year: 2011, url: 'https://www.nhlbi.nih.gov/health-topics/integrated-guidelines-for-cardiovascular-health-and-risk-reduction-in-children-and-adolescents' },
    stopBang: { title: 'STOP-Bang questionnaire (Chung et al., Anesthesiology 2008; Chest 2016)', org: 'Validated screening tool', year: 2016, url: 'http://www.stopbang.ca' },
    aapSnoring: { title: 'Diagnosis and management of childhood obstructive sleep apnea', org: 'American Academy of Pediatrics', year: 2012, url: 'https://publications.aap.org/pediatrics/article/130/3/576/30230' },
    phq2: { title: 'PHQ-2 (Kroenke, Spitzer & Williams, Medical Care)', org: 'Validated screening tool', year: 2003, url: 'https://pubmed.ncbi.nlm.nih.gov/14583691/' },
    gad2: { title: 'GAD-2 (Kroenke et al., Annals of Internal Medicine)', org: 'Validated screening tool', year: 2007, url: 'https://pubmed.ncbi.nlm.nih.gov/17339617/' },
    uspstfDepression: { title: 'Screening for depression and suicide risk in adults; anxiety in adults', org: 'USPSTF', year: 2023, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-adults' },
    auditC: { title: 'AUDIT-C (Bush et al., Archives of Internal Medicine)', org: 'Validated screening tool', year: 1998, url: 'https://pubmed.ncbi.nlm.nih.gov/9738608/' },
    uspstfAlcohol: { title: 'Unhealthy alcohol use in adolescents and adults: screening and counseling', org: 'USPSTF', year: 2018, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/unhealthy-alcohol-use-in-adolescents-and-adults-screening-and-behavioral-counseling-interventions' },
    niaidFood: { title: 'Guidelines for the diagnosis and management of food allergy', org: 'NIAID expert panel', year: 2010, url: 'https://www.niaid.nih.gov/diseases-conditions/guidelines-clinicians-and-patients-food-allergy' },
    aaaaiIgG: { title: 'Choosing Wisely: don\'t perform unproven diagnostic tests such as IgG testing for food allergy', org: 'American Academy of Allergy, Asthma & Immunology', year: 2012, url: 'https://www.aaaai.org/tools-for-the-public/conditions-library/allergies/igg-food-test' },
    niaidPeanut: { title: 'Addendum guidelines for the prevention of peanut allergy', org: 'NIAID', year: 2017, url: 'https://www.niaid.nih.gov/diseases-conditions/peanut-allergy-prevention' },
    acgCeliac: { title: 'ACG clinical guidelines: diagnosis and management of celiac disease', org: 'American College of Gastroenterology', year: 2023, url: 'https://journals.lww.com/ajg/fulltext/2023/01000/acg_clinical_guidelines__diagnosis_and_management.17.aspx' },
    acgGerd: { title: 'ACG clinical guideline for the diagnosis and management of GERD', org: 'American College of Gastroenterology', year: 2022, url: 'https://journals.lww.com/ajg/fulltext/2022/01000/acg_clinical_guideline_for_the_diagnosis_and.14.aspx' },
    acgIbs: { title: 'ACG clinical guideline: management of irritable bowel syndrome (Rome IV criteria)', org: 'American College of Gastroenterology', year: 2021, url: 'https://journals.lww.com/ajg/fulltext/2021/01000/acg_clinical_guideline__management_of_irritable.11.aspx' },
    niddkLactose: { title: 'Lactose intolerance', org: 'NIDDK (NIH)', year: 2018, url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance' },
    odsIron: { title: 'Iron — fact sheet for health professionals', org: 'NIH Office of Dietary Supplements', year: 2024, url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/' },
    odsB12: { title: 'Vitamin B12 — fact sheet for health professionals', org: 'NIH Office of Dietary Supplements', year: 2024, url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/' },
    acrGout: { title: 'Guideline for the management of gout', org: 'American College of Rheumatology', year: 2020, url: 'https://rheumatology.org/gout-guideline' },
    uspstfBone: { title: 'Screening for osteoporosis to prevent fractures', org: 'USPSTF', year: 2025, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening' },
    iarcMeat: { title: 'Carcinogenicity of consumption of red and processed meat (IARC Monographs vol. 114)', org: 'WHO International Agency for Research on Cancer', year: 2015, url: 'https://www.iarc.who.int/wp-content/uploads/2018/11/Monographs-QA_Vol114.pdf' },
    ahaFish: { title: 'Seafood long-chain n-3 fatty acids and cardiovascular disease (science advisory)', org: 'American Heart Association', year: 2018, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000574' },
    ahaSugar: { title: 'Added sugars and cardiovascular disease risk in children', org: 'American Heart Association', year: 2016, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000439' },
    kidsDrinks: { title: 'Healthy beverage consumption in early childhood (AAP, AHA, AND & AAPD consensus)', org: 'Healthy Eating Research', year: 2019, url: 'https://healthyeatingresearch.org/research/consensus-statement-healthy-beverage-consumption-in-early-childhood-recommendations-from-key-national-health-and-nutrition-organizations/' },
    whoDiet: { title: 'Healthy diet fact sheet (at least 400 g of fruit and vegetables a day)', org: 'World Health Organization', year: 2020, url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet' },
    fdaCaffeine: { title: 'Spilling the beans: how much caffeine is too much? (400 mg/day for healthy adults)', org: 'FDA', year: 2018, url: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much' },
    aapCaffeine: { title: 'Sports drinks and energy drinks for children and adolescents', org: 'American Academy of Pediatrics', year: 2011, url: 'https://publications.aap.org/pediatrics/article/127/6/1182/65174' },
    nhlbiWaist: { title: 'Assessing your weight and health risk (waist circumference)', org: 'NHLBI', year: 2013, url: 'https://www.nhlbi.nih.gov/health/educational/lose_wt/risk.htm' },
    dpp: { title: 'Diabetes Prevention Program: lifestyle intervention reduced diabetes incidence 58% (NEJM)', org: 'NIH / NIDDK', year: 2002, url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa012512' },
    uspstfTobacco: { title: 'Tobacco smoking cessation in adults', org: 'USPSTF', year: 2021, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/tobacco-use-in-adults-and-pregnant-women-counseling-and-interventions' },
    uspstfLung: { title: 'Screening for lung cancer', org: 'USPSTF', year: 2021, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening' },
    uspstfFolic: { title: 'Folic acid supplementation to prevent neural tube defects', org: 'USPSTF', year: 2023, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/folic-acid-for-the-prevention-of-neural-tube-defects-preventive-medication' },
    cdcAlcoholPregnancy: { title: 'Alcohol use during pregnancy — no known safe amount', org: 'CDC', year: 2024, url: 'https://www.cdc.gov/fasd/prevention/' },
    uspstfColon: { title: 'Screening for colorectal cancer (ages 45–75)', org: 'USPSTF', year: 2021, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening' },
    uspstfBreast: { title: 'Screening for breast cancer (every 2 years, ages 40–74)', org: 'USPSTF', year: 2024, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening' },
    uspstfCervical: { title: 'Screening for cervical cancer (ages 21–65)', org: 'USPSTF', year: 2018, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening' },
    uspstfAAA: { title: 'Screening for abdominal aortic aneurysm (men 65–75 who ever smoked)', org: 'USPSTF', year: 2019, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/abdominal-aortic-aneurysm-screening' },
    uspstfHepC: { title: 'Screening for hepatitis C (once, ages 18–79)', org: 'USPSTF', year: 2020, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hepatitis-c-screening' },
    uspstfHIV: { title: 'Screening for HIV (ages 15–65)', org: 'USPSTF', year: 2019, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/human-immunodeficiency-virus-hiv-infection-screening' },
    uspstfTeenDep: { title: 'Screening for depression and anxiety in children and adolescents', org: 'USPSTF', year: 2022, url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-children-adolescents' },
    brightFutures: { title: 'Bright Futures / AAP recommendations for preventive pediatric health care', org: 'American Academy of Pediatrics', year: 2025, url: 'https://www.aap.org/periodicityschedule' },
    niddkConstipation: { title: 'Eating, diet & nutrition for constipation', org: 'NIDDK (NIH)', year: 2018, url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition' },
    ahaSodium: { title: 'Sodium and health: AHA recommends under 2,300 mg/day, ideally 1,500 mg', org: 'American Heart Association', year: 2021, url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium/how-much-sodium-should-i-eat-per-day' },
    aap988: { title: '988 Suicide & Crisis Lifeline', org: 'SAMHSA', year: 2022, url: 'https://988lifeline.org' }
  };

  Object.keys(Labs.SOURCES).forEach(function (k) { if (!SOURCES[k]) SOURCES[k] = Labs.SOURCES[k]; });

  // Strength-of-evidence labels shown on each finding.
  var STRENGTH = {
    tool: 'Validated screening tool',
    guideline: 'National guideline',
    strong: 'Strong evidence (large trials / systematic reviews)',
    moderate: 'Moderate evidence (consistent observational studies)',
    consensus: 'Expert consensus'
  };

  // ---------------------------------------------------------------- questions

  var FREQ = [['0', 'Not at all'], ['1', 'Several days'], ['2', 'More than half the days'], ['3', 'Nearly every day']];
  var YN = [['yes', 'Yes'], ['no', 'No']];
  var YND = [['yes', 'Yes'], ['no', 'No'], ['dk', 'Don\'t know']];
  var REACTIONS = [
    ['ok', 'Eats it, no problem'],
    ['never', 'Never eaten it'],
    ['gi', 'Stomach upset hours later'],
    ['mild', 'Itchy mouth, rash or hives within 2 h'],
    ['severe', 'Swelling, trouble breathing, vomiting or fainting'],
    ['avoid', 'Avoids it — told it\'s an allergy']
  ];

  function adult(c) { return c.age === null || c.age >= 18; }
  function female(c) { return c.sex === 'female'; }
  function ageAtLeast(n) { return function (c) { return c.age === null || c.age >= n; }; }

  var SECTIONS = [
    {
      id: 'body', title: 'Body & activity', intro: 'Rough answers are fine. These feed calorie targets and several risk scores.',
      questions: [
        { id: 'body', type: 'body', text: 'Height and weight', help: 'Used for calorie needs and for the BMI part of the diabetes and sleep-apnea scores.' },
        { id: 'asian', type: 'single', show: adult, text: 'Are you of Asian descent?', options: [['yes', 'Yes'], ['no', 'No'], ['skip', 'Prefer not to say']],
          help: 'Diabetes risk starts at a lower weight for people of Asian descent, so the ADA and USPSTF use a lower BMI cut-off (23 instead of 25).' },
        { id: 'waist', type: 'number', unit: 'waist', optional: true, show: adult, text: 'Waist size at the belly button (optional)',
          help: 'Belly fat is a separate risk marker from weight. Measure just above the hip bones, relaxed, after breathing out.' },
        { id: 'active_days', type: 'single', show: ageAtLeast(6),
          text: function (c) { return c.age !== null && c.age < 18 ? 'On how many days a week does this child get at least 60 minutes of active play or sport?' : 'On how many days in a typical week do you get at least 30 minutes of activity that makes you breathe harder (brisk walking, cycling, dancing, sport)?'; },
          options: [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7']] },
        { id: 'strength_days', type: 'single', show: adult, text: 'On how many days a week do you do muscle-strengthening activity (weights, resistance bands, push-ups, heavy gardening)?',
          options: [['0', 'None'], ['1', '1 day'], ['2', '2 or more days']] },
        { id: 'sleep_hours', type: 'number', unit: 'hours', show: ageAtLeast(1),
          text: function (c) { return c.age !== null && c.age < 6 ? 'Hours of sleep in 24 hours, including naps' : 'Hours of sleep on a typical night'; } }
      ]
    },
    {
      id: 'eating', title: 'Eating habits', intro: 'Think about a normal week, not your best or worst one.',
      questions: [
        { id: 'diet', type: 'single', text: 'Which best describes how you eat?', options: Object.keys(KB.DIETS).map(function (k) { return [k, KB.DIETS[k].label]; }) },
        { id: 'diet_rules', type: 'multi', optional: true, text: 'Any of these rules? (optional)', options: Object.keys(KB.DIET_RULES).map(function (k) { return [k, KB.DIET_RULES[k].label]; }) },
        { id: 'fruitveg', type: 'single', show: ageAtLeast(2), text: 'Servings of fruit and vegetables on a typical day?',
          help: 'One serving ≈ a fist-sized piece of fruit, a cup of salad, or half a cup of cooked vegetables. Juice and fries don\'t count.',
          options: [['0', '0–1'], ['2', '2–3'], ['4', '4'], ['5', '5 or more']] },
        { id: 'sugary_drinks', type: 'single', show: ageAtLeast(1), text: 'How often are sugary drinks had — soda, sweet tea, juice, sports or energy drinks, sweetened coffee?',
          options: [['none', 'Rarely or never'], ['week1', '1–3 a week'], ['week4', '4–6 a week'], ['day1', 'About 1 a day'], ['day2', '2 or more a day']] },
        { id: 'milk_cups', type: 'single', show: function (c) { return c.age !== null && c.age >= 1 && c.age < 6; }, text: 'Cups (8 oz) of milk a day?',
          options: [['0', 'None'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4 or more']] },
        { id: 'fast_food', type: 'single', show: ageAtLeast(2), text: 'Restaurant, take-out or fast-food meals a week?', options: [['0', 'None'], ['1', '1–2'], ['3', '3–4'], ['5', '5 or more']] },
        { id: 'processed_meat', type: 'single', show: ageAtLeast(2), text: 'Servings of processed meat a week — bacon, ham, sausage, hot dogs, deli meat, jerky?', options: [['0', 'None'], ['1', '1–2'], ['3', '3–4'], ['5', '5 or more']] },
        { id: 'fish', type: 'single', show: ageAtLeast(2), text: 'Servings of fish or seafood a week?', options: [['0', 'None'], ['1', '1'], ['2', '2 or more']] },
        { id: 'whole_grains', type: 'single', show: ageAtLeast(2), text: 'When you eat bread, rice, pasta or cereal, how often is it whole-grain (brown rice, whole-wheat, oats)?', options: [['rarely', 'Rarely'], ['some', 'Sometimes'], ['mostly', 'Mostly']] },
        { id: 'salty', type: 'single', show: ageAtLeast(2), text: 'Most days, do you add salt at the table or eat salty foods (chips, instant noodles, canned soup, pickles)?', options: YN },
        { id: 'caffeine', type: 'single', show: ageAtLeast(12), text: 'Cups of coffee, energy drinks or strong tea a day?', options: [['0', 'None'], ['1', '1–2'], ['3', '3–4'], ['5', '5 or more']] },
        { id: 'constipation', type: 'single', show: ageAtLeast(2), text: 'Usually fewer than 3 bowel movements a week, or hard, painful stools?', options: YN },
        { id: 'dislikes', type: 'text', optional: true, text: 'Foods you dislike (comma separated, optional)' },
        { id: 'favorites', type: 'text', optional: true, text: 'Favorite foods (optional)' }
      ]
    },
    {
      id: 'reactions', title: 'Food reactions', intro: 'Most people don\'t know if they have an allergy — but everyone knows what happens when they eat something. Pick what has happened, ever.',
      questions: [
        { id: 'reactions', type: 'grid', rows: Object.keys(KB.ALLERGENS).map(function (k) { return [k, KB.ALLERGENS[k].label + ' — ' + exampleFoods(k)]; }), options: REACTIONS },
        { id: 'other_food', type: 'text', optional: true, text: 'Any other food that has caused a reaction? (optional)', help: 'e.g. kiwi, strawberries, mustard' },
        { id: 'other_reaction', type: 'single', optional: true, text: 'If you named a food above: what happened?', options: REACTIONS.slice(2) },
        { id: 'dairy_gi', type: 'single', show: ageAtLeast(4), text: 'Does milk, ice cream or soft cheese give you bloating, gas, cramps or diarrhea within a few hours?',
          options: [['never', 'Never'], ['sometimes', 'Sometimes'], ['usually', 'Usually'], ['none', 'Don\'t eat dairy']] },
        { id: 'atopy', type: 'multi', text: 'Have you had any of these?', options: [['eczema', 'Eczema (itchy, dry skin patches)'], ['asthma', 'Asthma'], ['hayfever', 'Hay fever / seasonal allergies'], ['none', 'None of these']] },
        { id: 'peanut_intro', type: 'single', show: function (c) { return c.age !== null && c.age < 1; }, text: 'Has your baby started eating peanut-containing foods (thinned peanut butter, puffs)?',
          options: [['yes', 'Yes'], ['no', 'Not yet'], ['solids', 'Hasn\'t started solids']] }
      ]
    },
    {
      id: 'digestion', title: 'Stomach & digestion', show: ageAtLeast(4), intro: 'Gut symptoms are common and often fixable with food changes once the cause is clear.',
      questions: [
        { id: 'heartburn', type: 'single', text: 'How often do you get heartburn (burning behind the breastbone) or sour liquid coming up into your throat?',
          options: [['never', 'Never or rarely'], ['lt1', 'Less than once a week'], ['w1', 'About once a week'], ['w2', '2 or more times a week']] },
        { id: 'ibs_pain', type: 'single', text: 'In the last 3 months, belly pain on at least 1 day a week that is linked to bowel movements — better or worse after going, or with changes in how often you go or what stools look like?', options: YN },
        { id: 'chronic_diarrhea', type: 'single', text: 'Loose or watery stools on most days for 4 weeks or more?', options: YN },
        { id: 'red_flags', type: 'multi', text: 'Any of these recently?', options: [
          ['blood', 'Blood in stool, or black tarry stool'], ['weightloss', 'Losing weight without trying'], ['swallow', 'Trouble or pain swallowing'],
          ['vomit', 'Vomiting often'], ['night', 'Waking at night with diarrhea or belly pain'], ['none', 'None of these']] }
      ]
    },
    {
      id: 'energy', title: 'Energy & body signals', intro: 'These are common, everyday signs that can point to things worth a simple blood test.',
      questions: [
        { id: 'tired', type: 'single', show: ageAtLeast(6), text: 'Feel tired or low on energy most days, even after enough sleep?', options: [['no', 'No'], ['sometimes', 'Sometimes'], ['most', 'Most days']] },
        { id: 'breathless', type: 'single', show: ageAtLeast(12), text: 'Get short of breath, dizzy, or a racing heart from mild effort like one flight of stairs?', options: YN },
        { id: 'pica', type: 'single', show: ageAtLeast(2), text: 'Crave or chew ice, or feel an urge to eat non-food things (clay, dirt, starch)?', options: YN },
        { id: 'heavy_periods', type: 'single', show: function (c) { return female(c) && c.age !== null && c.age >= 12 && c.age <= 55; },
          text: 'Are periods heavy — soaking a pad or tampon every 1–2 hours, lasting more than 7 days, or with large clots?', options: [['yes', 'Yes'], ['no', 'No'], ['na', 'No periods']] },
        { id: 'thirst', type: 'single', show: ageAtLeast(2), text: 'Lately: very thirsty, peeing a lot (or waking at night to pee), or blurry vision?', options: YN },
        { id: 'tingling', type: 'single', show: adult, text: 'Numbness, tingling or "pins and needles" in hands or feet?', options: YN },
        { id: 'joint_attack', type: 'single', show: adult, text: 'Ever had sudden attacks of a hot, swollen, very painful joint — often the big toe — that came on overnight?', options: YN },
        { id: 'acid_reducers', type: 'single', show: adult, text: 'Take acid reducers most days (omeprazole, pantoprazole, esomeprazole, famotidine)?', options: YN },
        { id: 'fracture', type: 'single', show: ageAtLeast(50), text: 'Broken a bone from a fall from standing height or less, since age 50?', options: YN }
      ]
    },
    {
      id: 'sleepmood', title: 'Sleep & mood', show: ageAtLeast(2), intro: 'Sleep and mood affect appetite, blood sugar and blood pressure.',
      questions: [
        { id: 'snore', type: 'single', show: adult, text: 'Do you snore loudly — louder than talking, or loud enough to be heard through a closed door?', options: YND },
        { id: 'daytime_tired', type: 'single', show: adult, text: 'Do you often feel tired, fatigued or sleepy during the day (e.g. dozing while driving or watching TV)?', options: YN },
        { id: 'apnea_seen', type: 'single', show: adult, text: 'Has anyone seen you stop breathing, choke or gasp during sleep?', options: YND },
        { id: 'neck', type: 'single', show: adult, text: 'Is your shirt collar size 16 inches (41 cm) or more?', options: YND },
        { id: 'snore_kid', type: 'single', show: function (c) { return c.age !== null && c.age < 18; }, text: 'Does this child snore on 3 or more nights a week?', options: YN },
        { id: 'phq1', type: 'single', show: ageAtLeast(12), text: 'Over the last 2 weeks, how often have you had little interest or pleasure in doing things?', options: FREQ },
        { id: 'phq2', type: 'single', show: ageAtLeast(12), text: 'Over the last 2 weeks, how often have you felt down, depressed or hopeless?', options: FREQ },
        { id: 'gad1', type: 'single', show: ageAtLeast(12), text: 'Over the last 2 weeks, how often have you felt nervous, anxious or on edge?', options: FREQ },
        { id: 'gad2', type: 'single', show: ageAtLeast(12), text: 'Over the last 2 weeks, how often have you not been able to stop or control worrying?', options: FREQ }
      ]
    },
    {
      id: 'habits', title: 'Smoking & alcohol', show: ageAtLeast(12), intro: 'Answers stay on this device. Honest answers give the most useful advice.',
      questions: [
        { id: 'tobacco', type: 'single', text: 'Tobacco or nicotine use?', options: [['never', 'Never'], ['quit', 'Used to smoke, quit'], ['cig', 'Smoke cigarettes now'], ['vape', 'Vape / e-cigarettes'], ['other', 'Cigars, chew or hookah']] },
        { id: 'cig_years', type: 'number', unit: 'years', show: function (c) { return (c.a.tobacco === 'cig' || c.a.tobacco === 'quit') && c.age >= 50; }, text: 'For about how many years have you smoked (in total)?' },
        { id: 'cig_ppd', type: 'single', show: function (c) { return (c.a.tobacco === 'cig' || c.a.tobacco === 'quit') && c.age >= 50; }, text: 'How much, on average, per day?',
          options: [['0.25', 'Less than half a pack'], ['0.75', 'Half to one pack'], ['1.5', '1–2 packs'], ['2.5', 'More than 2 packs']] },
        { id: 'quit_years', type: 'number', unit: 'years', show: function (c) { return c.a.tobacco === 'quit' && c.age >= 50; }, text: 'How many years ago did you quit?' },
        { id: 'audit1', type: 'single', show: adult, text: 'How often do you have a drink containing alcohol?',
          options: [['0', 'Never'], ['1', 'Monthly or less'], ['2', '2–4 times a month'], ['3', '2–3 times a week'], ['4', '4 or more times a week']] },
        { id: 'audit2', type: 'single', show: function (c) { return adult(c) && c.a.audit1 && c.a.audit1 !== '0'; }, text: 'On a day you drink, how many drinks do you usually have? (1 drink = 12 oz beer, 5 oz wine, 1.5 oz spirits)',
          options: [['0', '1–2'], ['1', '3–4'], ['2', '5–6'], ['3', '7–9'], ['4', '10 or more']] },
        { id: 'audit3', type: 'single', show: function (c) { return adult(c) && c.a.audit1 && c.a.audit1 !== '0'; }, text: 'How often do you have 6 or more drinks on one occasion?',
          options: [['0', 'Never'], ['1', 'Less than monthly'], ['2', 'Monthly'], ['3', 'Weekly'], ['4', 'Daily or almost daily']] },
        { id: 'teen_alcohol', type: 'single', show: function (c) { return c.age !== null && c.age < 18; }, text: 'Any alcohol in the past month?', options: YN }
      ]
    },
    {
      id: 'history', title: 'Medical history & checkups', intro: 'Only what a doctor or nurse has actually told you. "Not sure" is a fine answer.',
      questions: [
        { id: 'diagnosed', type: 'multi', text: 'Has a doctor or nurse ever told you that you have…', options: [
          ['hypertension', 'High blood pressure'], ['cholesterol', 'High cholesterol'], ['prediabetes', 'Prediabetes / borderline sugar'], ['diabetes2', 'Type 2 diabetes'],
          ['diabetes1', 'Type 1 diabetes'], ['heart', 'Heart disease or heart failure'], ['ckd', 'Kidney disease'], ['celiac', 'Celiac disease'], ['gerd', 'Acid reflux (GERD)'],
          ['ibs', 'IBS'], ['anemia', 'Low iron / anemia'], ['osteoporosis', 'Osteoporosis or low bone density'], ['hypothyroid', 'Underactive thyroid'], ['gout', 'Gout'],
          ['fattyliver', 'Fatty liver'], ['pcos', 'PCOS'], ['none', 'None of these'], ['unsure', 'Not sure']] },
        { id: 'gdm', type: 'single', show: function (c) { return female(c) && adult(c); }, text: 'Ever had diabetes during a pregnancy (gestational diabetes)?', options: [['yes', 'Yes'], ['no', 'No'], ['na', 'Never pregnant']] },
        { id: 'pregnancy', type: 'single', show: function (c) { return female(c) && c.age !== null && c.age >= 12 && c.age <= 55; }, text: 'Right now, are you…',
          options: [['no', 'None of these'], ['pregnant', 'Pregnant'], ['breastfeeding', 'Breastfeeding'], ['planning', 'Trying or planning to get pregnant within a year']] },
        { id: 'meds', type: 'textarea', optional: true, text: 'Medicines and supplements you take regularly (one per line, optional)', help: 'Brand or generic names. The guide adds food-timing and interaction notes it recognises.' },
        { id: 'bp_checked', type: 'single', show: adult, text: 'When was your blood pressure last checked?', options: [['1y', 'Within the last year'], ['2y', '1–2 years ago'], ['old', 'More than 2 years ago'], ['dk', 'Never / don\'t know']] },
        { id: 'lipids_checked', type: 'single', show: ageAtLeast(20), text: 'When was your cholesterol last checked (blood test)?', options: [['5y', 'Within 5 years'], ['old', 'More than 5 years ago'], ['dk', 'Never / don\'t know']] },
        { id: 'sugar_checked', type: 'single', show: ageAtLeast(30), text: 'When was your blood sugar or A1C last tested?', options: [['3y', 'Within 3 years'], ['old', 'More than 3 years ago'], ['dk', 'Never / don\'t know']] },
        { id: 'checkup', type: 'single', text: 'Last routine check-up (physical / well-child visit)?', options: [['1y', 'Within a year'], ['2y', '1–2 years ago'], ['old', 'More than 2 years ago'], ['dk', 'Don\'t know']] }
      ]
    },
    {
      id: 'family', title: 'Family history', intro: 'Parents, brothers and sisters (for a child, that means the child\'s parents and siblings). Family history changes which tests are worth doing, and when.',
      questions: [
        { id: 'family', type: 'multi', text: 'Has a parent, brother or sister had…', options: [
          ['diabetes', 'Type 2 diabetes'], ['earlyheart', 'Heart attack or stroke young (men under 55, women under 65)'], ['cholesterol', 'High cholesterol'],
          ['fh', 'Very high cholesterol from birth (familial hypercholesterolemia)'], ['hypertension', 'High blood pressure'], ['colon', 'Colon cancer or colon polyps'],
          ['celiac', 'Celiac disease'], ['atopy', 'Food allergies, eczema or asthma'], ['osteoporosis', 'Osteoporosis or hip fracture'], ['kidney', 'Kidney disease'],
          ['none', 'None of these'], ['dk', 'Don\'t know']] }
      ]
    },
    {
      id: 'wearable', title: 'Sleep & stress tracker', intro: 'If you wear an Oura Ring, WHOOP, Apple Watch, Fitbit or Garmin, its 30-day averages make the sleep and stress advice much more precise. Skip this if you don\'t have one.',
      questions: [{ id: 'wearable', type: 'wearable', optional: true }]
    },
    {
      id: 'labs', title: 'Blood test results', intro: 'Copy numbers from your latest blood work (the patient portal or a printed report), and drop in a link to the results so they\'re one tap away. Enter only what you have — even one value helps.',
      questions: [{ id: 'labs', type: 'labs', optional: true }]
    },
    {
      id: 'records', title: 'Health records', intro: 'Keep lab reports, doctor\'s notes, prescriptions and vaccine records in one place — upload files or drop in links to your patient portal or shared files. Everything stays on this device.',
      questions: [{ id: 'records', type: 'records', optional: true }]
    }
  ];

  function exampleFoods(k) {
    return {
      peanut: 'peanut butter, peanuts', treenut: 'almonds, cashews, walnuts', milk: 'milk, cheese, yogurt', egg: 'eggs, mayo, baked goods',
      wheat: 'bread, pasta', soy: 'tofu, soy milk, edamame', fish: 'salmon, tuna, cod', shellfish: 'shrimp, crab, lobster', sesame: 'hummus, tahini, sesame seeds'
    }[k];
  }

  // ------------------------------------------------------------------ helpers

  function list(v) { return Array.isArray(v) ? v : []; }
  function has(arr, v) { return list(arr).indexOf(v) !== -1; }
  function num(v) { return v === undefined || v === null || v === '' ? null : Number(v); }

  function context(member, answers, ageYears) {
    return { age: ageYears, sex: member.sex || '', name: member.name || '', a: answers || {}, member: member };
  }

  function textOf(q, c) { return typeof q.text === 'function' ? q.text(c) : q.text; }

  function visibleSections(c) {
    return SECTIONS.filter(function (s) { return !s.show || s.show(c); }).map(function (s) {
      return { id: s.id, title: s.title, intro: s.intro, questions: s.questions.filter(function (q) { return !q.show || q.show(c); }) };
    }).filter(function (s) { return s.questions.length; });
  }

  function answered(q, a) {
    if (q.type === 'body') return !!(a.member && a.member.heightCm && a.member.weightKg);
    var v = a[q.id];
    if (q.type === 'multi') return list(v).length > 0;
    if (q.type === 'grid') return v && Object.keys(v).length > 0;
    return v !== undefined && v !== null && v !== '';
  }

  function progress(member, ageYears) {
    var c = context(member, member.answers, ageYears);
    var total = 0, done = 0;
    visibleSections(c).forEach(function (s) {
      s.questions.forEach(function (q) {
        if (q.optional) return;
        total++;
        if (q.type === 'body' ? (member.heightCm && member.weightKg) : answered(q, c.a)) done++;
      });
    });
    return { total: total, done: done, pct: total ? Math.round(done / total * 100) : 0 };
  }

  function bmiOf(member) {
    if (!member.heightCm || !member.weightKg) return null;
    var h = member.heightCm / 100;
    return Math.round(member.weightKg / (h * h) * 10) / 10;
  }

  // ------------------------------------------------------------------- scores

  // ADA Diabetes Risk Test (Bang et al. 2009). Score >= 5 = high risk.
  function adaRisk(c, bmi) {
    var a = c.a;
    if (c.age === null || c.age < 18) return null;
    if (bmi === null || a.active_days === undefined) return null;
    var s = 0, parts = [];
    var agePts = c.age < 40 ? 0 : c.age < 50 ? 1 : c.age < 60 ? 2 : 3;
    if (agePts) { s += agePts; parts.push('age ' + c.age + ' (+' + agePts + ')'); }
    if (c.sex === 'male') { s += 1; parts.push('male (+1)'); }
    if (a.gdm === 'yes') { s += 1; parts.push('gestational diabetes (+1)'); }
    if (has(a.family, 'diabetes')) { s += 1; parts.push('parent or sibling with diabetes (+1)'); }
    if (has(a.diagnosed, 'hypertension')) { s += 1; parts.push('high blood pressure (+1)'); }
    // "Are you physically active?" — counted as yes at 3+ days of 30 minutes.
    if (Number(a.active_days) < 3) { s += 1; parts.push('not physically active (+1)'); }
    var cut = a.asian === 'yes' ? [23, 27.5, 37.5] : [25, 30, 40];
    var bmiPts = bmi >= cut[2] ? 3 : bmi >= cut[1] ? 2 : bmi >= cut[0] ? 1 : 0;
    if (bmiPts) { s += bmiPts; parts.push('BMI ' + bmi + ' (+' + bmiPts + ')'); }
    return { score: s, high: s >= 5, parts: parts };
  }

  // STOP-Bang. 0–2 low, 3–4 intermediate, 5–8 high risk of obstructive sleep apnea.
  function stopBang(c, bmi) {
    var a = c.a;
    if (c.age === null || c.age < 18 || a.snore === undefined || a.daytime_tired === undefined) return null;
    var items = [
      [a.snore === 'yes', 'loud snoring'], [a.daytime_tired === 'yes', 'daytime tiredness'], [a.apnea_seen === 'yes', 'breathing stops seen'],
      [has(a.diagnosed, 'hypertension'), 'high blood pressure'], [bmi !== null && bmi > 35, 'BMI over 35'], [c.age > 50, 'age over 50'],
      [a.neck === 'yes', 'collar 16 in+'], [c.sex === 'male', 'male']
    ];
    var hits = items.filter(function (i) { return i[0]; }).map(function (i) { return i[1]; });
    var unknown = [a.snore, a.apnea_seen, a.neck].filter(function (v) { return v === 'dk' || v === undefined; }).length;
    return { score: hits.length, hits: hits, unknown: unknown, level: hits.length >= 5 ? 'high' : hits.length >= 3 ? 'intermediate' : 'low' };
  }

  function sumScale(a, ids) {
    var vals = ids.map(function (id) { return num(a[id]); });
    if (vals.some(function (v) { return v === null; })) return null;
    return vals.reduce(function (s, v) { return s + v; }, 0);
  }

  function auditC(c) {
    var a = c.a;
    if (a.audit1 === undefined) return null;
    if (a.audit1 === '0') return { score: 0, positive: false };
    var s = sumScale(a, ['audit1', 'audit2', 'audit3']);
    if (s === null) return null;
    return { score: s, positive: s >= (c.sex === 'female' ? 3 : 4) };
  }

  function sleepRange(age) {
    if (age === null) return null;
    if (age < 1) return null;
    if (age < 3) return [11, 14];
    if (age < 6) return [10, 13];
    if (age < 13) return [9, 12];
    if (age < 18) return [8, 10];
    return [7, 9];
  }

  // ----------------------------------------------------------------- analysis

  /*
   * analyze(member, ageYears) -> { findings, good, screenings, suggestions, scores }
   * finding: { id, level: urgent|doctor|change, title, because[], todo[], strength, sources[] }
   */
  function analyze(member, ageYears) {
    var a = member.answers || {};
    var c = context(member, a, ageYears);
    var age = ageYears;
    var isKid = age !== null && age < 18;
    var bmi = !isKid && age !== null && age >= 18 ? bmiOf(member) : null;
    var diag = list(a.diagnosed);
    var fam = list(a.family);
    var findings = [], good = [], suggestions = [];
    var vegan = a.diet === 'vegan', veg = vegan || a.diet === 'vegetarian';

    function add(f) { findings.push(f); }
    function suggest(s) {
      if (!suggestions.some(function (x) { return x.kind === s.kind && x.key === s.key && x.name === s.name; })) suggestions.push(s);
    }
    function profileHas(kind, key) {
      if (kind === 'condition') return has(member.conditions, key);
      if (kind === 'intolerance') return has(member.intolerances, key);
      if (kind === 'allergy') return !!(member.allergies || {})[key];
      return false;
    }

    // --- Food reactions (NIAID 2010) -----------------------------------------
    var reactions = a.reactions || {};
    var severe = [], hives = [], gi = [], told = [];
    Object.keys(reactions).forEach(function (k) {
      var label = KB.ALLERGENS[k] ? KB.ALLERGENS[k].label : k;
      if (reactions[k] === 'severe') severe.push({ key: k, label: label });
      if (reactions[k] === 'mild') hives.push({ key: k, label: label });
      if (reactions[k] === 'gi') gi.push({ key: k, label: label });
      if (reactions[k] === 'avoid') told.push({ key: k, label: label });
    });
    if (a.other_food && a.other_reaction) {
      var o = { key: null, label: a.other_food };
      if (a.other_reaction === 'severe') severe.push(o);
      else if (a.other_reaction === 'mild') hives.push(o);
      else if (a.other_reaction === 'gi') gi.push(o);
      else if (a.other_reaction === 'avoid') told.push(o);
    }
    if (severe.length) {
      add({ id: 'food-severe', level: 'urgent', title: 'Possible serious food allergy: ' + severe.map(function (x) { return x.label; }).join(', '),
        because: ['Swelling, trouble breathing, repeated vomiting or fainting after eating is how anaphylaxis presents.'],
        todo: ['Avoid ' + severe.map(function (x) { return x.label.toLowerCase(); }).join(', ') + ' completely until seen by an allergist.', 'Ask a doctor soon about an allergist referral and whether an epinephrine auto-injector should be prescribed.', 'If it happens again: use epinephrine if prescribed and call 911.'],
        strength: STRENGTH.guideline, sources: ['niaidFood'] });
      severe.forEach(function (x) { suggest(x.key ? { kind: 'allergy', key: x.key, severity: 'severe', label: x.label + ' allergy (severe) — avoid until tested', checked: true } : { kind: 'otherAllergy', name: x.label, severity: 'severe', label: x.label + ' allergy (severe) — avoid until tested', checked: true }); });
    }
    if (hives.length) {
      add({ id: 'food-hives', level: 'doctor', title: 'Possible food allergy: ' + hives.map(function (x) { return x.label; }).join(', '),
        because: ['Itching, rash or hives within 2 hours of eating is a typical allergic (IgE) reaction.'],
        todo: ['Ask about allergy testing with an allergist (skin-prick or blood IgE test, interpreted with your history).', 'Avoid the food until then; reactions can get worse.', 'Skip "IgG food sensitivity" tests sold online — they don\'t diagnose allergy.'],
        strength: STRENGTH.guideline, sources: ['niaidFood', 'aaaaiIgG'] });
      hives.forEach(function (x) { suggest(x.key ? { kind: 'allergy', key: x.key, severity: 'moderate', label: x.label + ' allergy (suspected) — avoid until tested', checked: true } : { kind: 'otherAllergy', name: x.label, severity: 'moderate', label: x.label + ' allergy (suspected)', checked: true }); });
    }
    told.forEach(function (x) {
      if (!x.key || !profileHas('allergy', x.key)) suggest(x.key ? { kind: 'allergy', key: x.key, severity: 'moderate', label: x.label + ' allergy (already avoided)', checked: true } : { kind: 'otherAllergy', name: x.label, severity: 'moderate', label: x.label + ' allergy (already avoided)', checked: true });
    });
    var giNotMilkWheat = gi.filter(function (x) { return x.key !== 'milk' && x.key !== 'wheat'; });
    if (giNotMilkWheat.length) {
      add({ id: 'food-gi', level: 'change', title: 'Stomach trouble after: ' + giNotMilkWheat.map(function (x) { return x.label; }).join(', '),
        because: ['Upset hours later points more to an intolerance or sensitivity than to an allergy.'],
        todo: ['Keep a 2-week food and symptom diary to confirm the pattern.', 'Mention it at your next check-up, especially if it\'s getting worse.'],
        strength: STRENGTH.consensus, sources: ['niaidFood'] });
    }

    // Lactose (NIDDK)
    var dairyUpset = a.dairy_gi === 'usually' || reactions.milk === 'gi';
    if (dairyUpset && !profileHas('intolerance', 'lactose')) {
      add({ id: 'lactose', level: 'change', title: 'Pattern fits lactose intolerance',
        because: ['Bloating, gas or diarrhea within a few hours of dairy.'],
        todo: ['Try 2 weeks with lactose-free milk, yogurt and hard cheese, then reintroduce regular dairy to see if symptoms return.', 'Keep calcium up (lactose-free dairy, fortified plant milk, canned salmon, calcium-set tofu).', 'If symptoms continue without dairy, talk to a doctor — other gut problems can look the same.'],
        strength: STRENGTH.guideline, sources: ['niddkLactose'] });
      suggest({ kind: 'intolerance', key: 'lactose', label: 'Lactose intolerance (suspected)', checked: false });
    } else if (a.dairy_gi === 'sometimes') {
      add({ id: 'lactose-mild', level: 'change', title: 'Some trouble with dairy', because: ['Occasional symptoms after dairy.'],
        todo: ['Smaller portions with meals, yogurt and hard cheeses are usually tolerated.'], strength: STRENGTH.guideline, sources: ['niddkLactose'] });
    }

    // Peanut introduction in infants (NIAID 2017)
    if (age !== null && age < 1 && a.peanut_intro !== 'yes') {
      var eczemaBaby = has(a.atopy, 'eczema') || reactions.egg === 'mild' || reactions.egg === 'severe';
      add({ id: 'peanut-intro', level: 'doctor', title: 'Ask the pediatrician about early peanut introduction',
        because: ['Introducing peanut in infancy lowers the chance of peanut allergy (LEAP trial).'].concat(eczemaBaby ? ['Severe eczema or egg allergy means the pediatrician may want to check first.'] : []),
        todo: eczemaBaby ? ['Ask whether testing is needed before introducing peanut (around 4–6 months).'] : ['Most babies can start peanut-containing foods (thinned peanut butter, not whole peanuts) around 6 months along with other solids.'],
        strength: STRENGTH.strong, sources: ['niaidPeanut'] });
    }

    // --- Diabetes ------------------------------------------------------------
    var hasDiabetes = has(diag, 'diabetes1') || has(diag, 'diabetes2') || has(member.conditions, 'diabetes1') || has(member.conditions, 'diabetes2');
    if (a.thirst === 'yes' && !hasDiabetes) {
      add({ id: 'hyperglycemia', level: isKid ? 'urgent' : 'doctor',
        title: isKid ? 'Possible signs of high blood sugar — call the pediatrician today' : 'Possible signs of high blood sugar — get tested soon',
        because: ['Strong thirst, frequent urination and blurry vision are classic symptoms of high blood sugar.'].concat(isKid ? ['In children, type 1 diabetes can become dangerous within days, especially with weight loss, vomiting or unusual tiredness.'] : []),
        todo: isKid ? ['Call the pediatrician today; go to urgent care or the ER if there is vomiting, fast breathing or confusion.'] : ['Ask for a blood sugar or A1C test within the next week or two.', 'Go to urgent care if you also have vomiting, confusion or very fast breathing.'],
        strength: STRENGTH.guideline, sources: ['adaSymptoms'] });
    }
    var ada = adaRisk(c, bmi);
    var bmiCut = a.asian === 'yes' ? 23 : 25;
    var uspstfDiab = age !== null && age >= 35 && age <= 70 && bmi !== null && bmi >= bmiCut;
    // A blood test entered in the app counts as recent testing.
    var labLatest = Labs.latestLabs(member);
    var withinYears = function (lab, yrs) { return lab && (Date.now() - new Date(lab.date).getTime()) / 31557600000 <= yrs; };
    var sugarLab = withinYears(labLatest.a1c, 3) || withinYears(labLatest.glucose, 3);
    var recentSugar = a.sugar_checked === '3y' || sugarLab;
    if (!hasDiabetes && ((ada && ada.high) || uspstfDiab) && !(sugarLab && Labs.interpret(labLatest.a1c ? 'a1c' : 'glucose', (labLatest.a1c || labLatest.glucose).value).level !== 'ok')) {
      var because = [];
      if (ada && ada.high) because.push('ADA Diabetes Risk Test score ' + ada.score + ' of 10 (5 or more = high risk): ' + ada.parts.join(', ') + '.');
      if (uspstfDiab) because.push('Age 35–70 with BMI ' + bmi + ' (' + bmiCut + '+) — the group USPSTF recommends screening.');
      if (has(diag, 'prediabetes')) because.push('Already told you have prediabetes.');
      add({ id: 'diabetes-risk', level: recentSugar ? 'change' : 'doctor', title: recentSugar ? 'Higher diabetes risk — keep up regular testing' : 'Get a blood sugar test (A1C or fasting glucose)',
        because: because,
        todo: (recentSugar ? ['You were tested within 3 years — repeat about every 3 years, or sooner if advised.'] : ['Ask your doctor for an A1C or fasting glucose test.'])
          .concat(['Moving 150 minutes a week and losing 5–7% of body weight (if overweight) cut the chance of developing diabetes by about 58% in the Diabetes Prevention Program.']),
        strength: STRENGTH.tool, sources: ['adaRisk', 'uspstfDiabetes', 'dpp'] });
    } else if (ada && !ada.high && !hasDiabetes) {
      good.push({ text: 'Low diabetes risk on the ADA risk test (score ' + ada.score + ')', source: 'adaRisk' });
    }

    // --- Weight / waist --------------------------------------------------------
    if (bmi !== null) {
      if (bmi < 18.5) add({ id: 'underweight', level: 'doctor', title: 'Weight is below the healthy range (BMI ' + bmi + ')', because: ['BMI under 18.5 can mean low reserves of energy, protein and nutrients.'],
        todo: ['Mention it at your next check-up, especially if you\'ve lost weight without trying.'], strength: STRENGTH.guideline, sources: ['nhlbiWaist'] });
      else if (bmi >= 25) {
        var waistIn = num(a.waist);
        var bigWaist = waistIn !== null && waistIn > (c.sex === 'male' ? 40 : 35);
        add({ id: 'weight', level: 'change', title: 'Weight is a lever for blood sugar, blood pressure and joints (BMI ' + bmi + ')',
          because: ['BMI ' + bmi + ' is in the ' + (bmi >= 30 ? 'obesity' : 'overweight') + ' range.'].concat(bigWaist ? ['Waist ' + waistIn + ' in is above the ' + (c.sex === 'male' ? '40' : '35') + ' in risk threshold.'] : []).concat(['BMI is a screening number — it doesn\'t account for muscle.']),
          todo: ['A steady 5–7% loss improves blood sugar and blood pressure; aim for ~1 lb a week.', 'Set "Lose weight gradually" as the goal in the profile to adjust calorie targets.'],
          strength: STRENGTH.strong, sources: ['dpp', 'nhlbiWaist'] });
      }
    } else if (isKid && age >= 2) {
      // Kids' weight needs growth charts; nothing to score here.
    }

    // --- Heart: blood pressure & cholesterol ----------------------------------
    if (!isKid && age !== null && a.bp_checked) {
      var bpDue = a.bp_checked === 'dk' || a.bp_checked === 'old' || (age >= 40 && a.bp_checked !== '1y');
      if (bpDue && !has(diag, 'hypertension')) add({ id: 'bp-check', level: 'doctor', title: 'Get your blood pressure checked',
        because: [a.bp_checked === 'dk' ? 'You don\'t know when it was last checked.' : 'It hasn\'t been checked recently' + (age >= 40 ? ' — yearly is advised from age 40.' : '.'), 'High blood pressure usually has no symptoms.'],
        todo: ['A pharmacy machine or home cuff is fine to start; log the reading on the Log tab.', 'Readings of 130/80 or higher are worth discussing with a doctor.'],
        strength: STRENGTH.guideline, sources: ['uspstfBP'] });
    }
    var lipidRisk = has(fam, 'earlyheart') || has(fam, 'fh') || has(diag, 'diabetes2') || has(diag, 'hypertension');
    if (!isKid && age !== null && a.lipids_checked && a.lipids_checked !== '5y' && !withinYears(labLatest.ldl, 5) && !has(diag, 'cholesterol') && (age >= 40 || lipidRisk)) {
      add({ id: 'lipids', level: 'doctor', title: 'Get a cholesterol test (lipid panel)',
        because: [a.lipids_checked === 'dk' ? 'No cholesterol test you know of.' : 'Last test over 5 years ago.'].concat(age >= 40 ? ['From 40 to 75, cholesterol results decide whether a statin would lower heart-attack risk.'] : ['Family history or other risk factors make an earlier check worthwhile.']),
        todo: ['Ask for a lipid panel at your next visit (fasting usually isn\'t needed).'], strength: STRENGTH.guideline, sources: ['uspstfStatin'] });
    }
    if (isKid && age >= 2 && has(fam, 'fh')) {
      add({ id: 'kid-fh', level: 'doctor', title: 'Ask the pediatrician about a cholesterol test',
        because: ['A parent or sibling with familial hypercholesterolemia — it\'s inherited, and children can be tested from age 2.'],
        todo: ['Mention the family history at the next well-child visit.'], strength: STRENGTH.guideline, sources: ['nhlbiKids'] });
    }

    // --- Sleep -----------------------------------------------------------------
    var sb = stopBang(c, bmi);
    if (sb && sb.score >= 3) {
      add({ id: 'sleep-apnea', level: 'doctor', title: (sb.level === 'high' ? 'High' : 'Intermediate') + ' risk of sleep apnea',
        because: ['STOP-Bang score ' + sb.score + ' of 8 (' + sb.hits.join(', ') + '). 3–4 is intermediate, 5+ is high risk.'],
        todo: ['Ask your doctor about a sleep study (home tests are common).', 'Untreated sleep apnea raises blood pressure and makes weight and blood sugar harder to control.'],
        strength: STRENGTH.tool, sources: ['stopBang'] });
    } else if (sb) good.push({ text: 'Low sleep-apnea risk (STOP-Bang ' + sb.score + ')', source: 'stopBang' });
    if (a.snore_kid === 'yes') add({ id: 'kid-snore', level: 'doctor', title: 'Regular snoring — mention it to the pediatrician',
      because: ['Children who snore 3+ nights a week should be asked about sleep apnea, which can affect behaviour, attention and growth.'],
      todo: ['Ask at the next visit; mention pauses in breathing, mouth-breathing or daytime sleepiness if you notice them.'], strength: STRENGTH.guideline, sources: ['aapSnoring'] });
    var hrs = num(a.sleep_hours), range = sleepRange(age);
    if (hrs !== null && range) {
      if (hrs < range[0]) add({ id: 'sleep-short', level: 'change', title: 'Not enough sleep (' + hrs + ' h; ' + range[0] + '–' + range[1] + ' h recommended)',
        because: ['Short sleep is linked to weight gain, higher blood pressure, poorer blood-sugar control and mood problems.'],
        todo: ['Keep the same wake time every day, including weekends.', 'Screens off 30–60 minutes before bed; keep the bedroom dark and cool.', 'Avoid caffeine after early afternoon.'],
        strength: STRENGTH.consensus, sources: [isKid ? 'sleepKids' : 'sleepAdult'] });
      else good.push({ text: 'Sleep in the recommended range (' + hrs + ' h)', source: isKid ? 'sleepKids' : 'sleepAdult' });
    }

    // --- Mood ------------------------------------------------------------------
    var phq = sumScale(a, ['phq1', 'phq2']), gad = sumScale(a, ['gad1', 'gad2']);
    if (phq !== null && phq >= 3) add({ id: 'mood', level: 'doctor', title: 'Screen suggests possible depression',
      because: ['PHQ-2 score ' + phq + ' of 6 (3 or more = positive screen). A positive screen means a fuller check is worthwhile — it is not a diagnosis.'],
      todo: ['Talk to a doctor or counselor; depression is common and treatable.', 'If you ever have thoughts of harming yourself, call or text 988 (US) any time.'],
      strength: STRENGTH.tool, sources: ['phq2', isKid ? 'uspstfTeenDep' : 'uspstfDepression', 'aap988'] });
    if (gad !== null && gad >= 3) add({ id: 'anxiety', level: 'doctor', title: 'Screen suggests possible anxiety',
      because: ['GAD-2 score ' + gad + ' of 6 (3 or more = positive screen).'],
      todo: ['Talk to a doctor or counselor; therapy and other treatments work well.'], strength: STRENGTH.tool, sources: ['gad2', isKid ? 'uspstfTeenDep' : 'uspstfDepression'] });
    if (phq !== null && phq < 3 && gad !== null && gad < 3) good.push({ text: 'Mood and anxiety screens negative', source: 'phq2' });

    // --- Digestion ---------------------------------------------------------------
    var flags = list(a.red_flags).filter(function (f) { return f !== 'none'; });
    if (flags.length) {
      var flagText = { blood: 'blood in stool or black stool', weightloss: 'unexplained weight loss', swallow: 'trouble swallowing', vomit: 'frequent vomiting', night: 'waking at night with gut symptoms' };
      add({ id: 'gi-redflags', level: 'urgent', title: 'Gut warning signs — see a doctor soon',
        because: ['You reported: ' + flags.map(function (f) { return flagText[f]; }).join(', ') + '. These "alarm features" need a proper check rather than diet changes.'],
        todo: ['Book a doctor\'s appointment in the next few days; go to urgent care for heavy bleeding or black stools with dizziness.'],
        strength: STRENGTH.guideline, sources: ['acgIbs', 'acgGerd'] });
    }
    if (a.heartburn === 'w2' && !has(diag, 'gerd')) {
      add({ id: 'gerd', level: 'doctor', title: 'Frequent heartburn — likely acid reflux (GERD)',
        because: ['Heartburn or regurgitation twice a week or more is the classic GERD pattern.'],
        todo: ['Talk to a doctor — a short trial of acid-reducing medicine is the usual first step.', 'Smaller meals, no food 3 hours before bed, raise the head of the bed, and cut back on personal trigger foods.'],
        strength: STRENGTH.guideline, sources: ['acgGerd'] });
      suggest({ kind: 'condition', key: 'gerd', label: 'Acid reflux (GERD) — likely', checked: false });
    } else if (a.heartburn === 'w1') {
      add({ id: 'heartburn', level: 'change', title: 'Occasional heartburn', because: ['About once a week.'],
        todo: ['Smaller evening meals, no food 3 hours before lying down, and note which foods trigger it.'], strength: STRENGTH.guideline, sources: ['acgGerd'] });
    }
    if (a.ibs_pain === 'yes' && !has(diag, 'ibs')) {
      add({ id: 'ibs', level: 'doctor', title: 'Symptoms match the IBS pattern (Rome IV)',
        because: ['Belly pain at least weekly for 3 months, linked to bowel movements, meets the Rome IV symptom criteria.'],
        todo: ['See a doctor to confirm and rule out other causes (celiac testing is often part of this).', 'Once confirmed, a low-FODMAP trial guided by a dietitian helps many people.'],
        strength: STRENGTH.guideline, sources: ['acgIbs'] });
      suggest({ kind: 'condition', key: 'ibs', label: 'IBS — possible, to confirm with a doctor', checked: false });
    }
    var celiacSignals = [];
    if (a.chronic_diarrhea === 'yes') celiacSignals.push('long-lasting diarrhea');
    if (has(fam, 'celiac')) celiacSignals.push('a parent or sibling with celiac disease');
    if (has(diag, 'diabetes1')) celiacSignals.push('type 1 diabetes');
    if (has(diag, 'anemia') || a.pica === 'yes') celiacSignals.push('signs of low iron');
    if (reactions.wheat === 'gi') celiacSignals.push('stomach trouble after wheat');
    if (has(flags, 'weightloss')) celiacSignals.push('weight loss');
    var celiacStrong = a.chronic_diarrhea === 'yes' || has(fam, 'celiac') || has(diag, 'diabetes1') || reactions.wheat === 'gi' || celiacSignals.length >= 2;
    if (celiacStrong && !has(diag, 'celiac') && !has(member.conditions, 'celiac')) {
      add({ id: 'celiac', level: 'doctor', title: 'Ask about a celiac disease blood test (tTG-IgA)',
        because: ['Reported: ' + celiacSignals.join(', ') + '. These raise the chance of celiac disease, which affects about 1 in 100 people and is often missed.'],
        todo: ['Keep eating gluten until tested — going gluten-free first can make the test falsely negative.', 'The blood test is simple; a positive result is confirmed by the gastroenterologist.'],
        strength: STRENGTH.guideline, sources: ['acgCeliac'] });
    }
    if (a.constipation === 'yes') add({ id: 'constipation', level: 'change', title: 'Constipation',
      because: ['Fewer than 3 bowel movements a week or hard stools.'],
      todo: ['Build up fiber slowly (fruit, vegetables, beans, whole grains — 25–34 g/day for adults) and drink enough water.', 'Daily movement helps; see a doctor if it\'s new, severe or with blood.'],
      strength: STRENGTH.guideline, sources: ['niddkConstipation'] });

    // --- Iron & B12 ---------------------------------------------------------------
    var ironSignals = [];
    if (a.heavy_periods === 'yes') ironSignals.push('heavy periods');
    if (a.pica === 'yes') ironSignals.push('craving ice or non-food items (a specific sign of low iron)');
    if (a.tired === 'most') ironSignals.push('tired most days');
    if (a.breathless === 'yes') ironSignals.push('short of breath with mild effort');
    if (veg) ironSignals.push('plant-based diet');
    if (a.acid_reducers === 'yes') ironSignals.push('daily acid reducers');
    var toddlerMilk = age !== null && age >= 1 && age < 6 && Number(a.milk_cups) >= (age < 2 ? 4 : 3);
    if (toddlerMilk) ironSignals.push('a lot of milk (fills little stomachs and blocks iron absorption)');
    if (!has(diag, 'anemia') && (a.pica === 'yes' || a.heavy_periods === 'yes' || toddlerMilk || ironSignals.length >= 2)) {
      add({ id: 'iron', level: 'doctor', title: 'Ask for a blood count and ferritin (iron) test',
        because: ['Signs that fit low iron: ' + ironSignals.join(', ') + '.'],
        todo: ['A complete blood count plus ferritin shows iron stores; don\'t start iron pills without testing — too much iron is harmful.', 'Iron-rich foods with vitamin C help either way: beans, lentils, lean meat, fortified cereal, with citrus or peppers.']
          .concat(toddlerMilk ? ['For children 1–2, about 2–3 cups (16–24 oz) of milk a day; for ages 2–5, about 2 cups.'] : []),
        strength: STRENGTH.guideline, sources: ['odsIron'].concat(toddlerMilk ? ['kidsDrinks'] : []) });
    }
    var metformin = list(member.medications).concat(String(a.meds || '').split('\n')).some(function (m) { return /metformin|glucophage/i.test(m); });
    var b12Risk = [];
    if (vegan) b12Risk.push('vegan diet');
    if (metformin) b12Risk.push('metformin');
    if (a.acid_reducers === 'yes') b12Risk.push('daily acid reducers');
    if (age !== null && age >= 50) b12Risk.push('age 50+');
    if (a.tingling === 'yes' && b12Risk.length) {
      add({ id: 'b12', level: 'doctor', title: 'Ask for a vitamin B12 test',
        because: ['Numbness or tingling plus ' + b12Risk.join(', ') + ', which lower B12 absorption or intake.'],
        todo: ['Ask your doctor for a B12 level. Low B12 is easy to treat, and nerve symptoms can become permanent if missed.'],
        strength: STRENGTH.guideline, sources: ['odsB12'] });
    } else if (vegan) {
      add({ id: 'b12-vegan', level: 'change', title: 'Take a vitamin B12 supplement (vegan diet)', because: ['Plants don\'t provide reliable B12.'],
        todo: ['Use a B12 supplement or B12-fortified foods every day.'], strength: STRENGTH.guideline, sources: ['odsB12'] });
    }

    // --- Gout & bones -----------------------------------------------------------------
    if (a.joint_attack === 'yes' && !has(diag, 'gout')) {
      add({ id: 'gout', level: 'doctor', title: 'Joint attacks that sound like gout',
        because: ['Sudden, hot, swollen, very painful joint — often the big toe — is the typical gout attack.'],
        todo: ['See a doctor, ideally during an attack; a uric acid blood test and joint exam confirm it.', 'Limit beer, spirits, sugary drinks and organ meats; stay hydrated.'],
        strength: STRENGTH.guideline, sources: ['acrGout'] });
      suggest({ kind: 'condition', key: 'gout', label: 'Gout — possible, to confirm with a doctor', checked: false });
    }
    if (a.fracture === 'yes' && !has(diag, 'osteoporosis')) {
      add({ id: 'bone', level: 'doctor', title: 'Ask about a bone density (DXA) scan',
        because: ['A broken bone from a minor fall after 50 is a warning sign of osteoporosis.'],
        todo: ['Ask your doctor about a DXA scan and fracture-risk assessment.', 'Calcium, vitamin D, protein and balance/strength exercise all help.'],
        strength: STRENGTH.guideline, sources: ['uspstfBone'] });
    }

    // --- Smoking & alcohol --------------------------------------------------------------
    if (a.tobacco === 'cig' || a.tobacco === 'other' || a.tobacco === 'vape') {
      add({ id: 'tobacco', level: 'doctor', title: isKid ? 'Nicotine use — get support to quit' : 'Quitting tobacco is the single biggest health win',
        because: [a.tobacco === 'vape' ? 'Vaping delivers nicotine, which is addictive and especially harmful to developing brains.' : 'Tobacco raises the risk of heart disease, stroke, cancer and diabetes complications.'],
        todo: ['Call 1-800-QUIT-NOW (free) or ask a doctor — medicine plus counseling roughly doubles quit success.'], strength: STRENGTH.strong, sources: ['uspstfTobacco'] });
    } else if (a.tobacco === 'never') good.push({ text: 'Never used tobacco', source: 'uspstfTobacco' });
    var packYears = num(a.cig_years) !== null && a.cig_ppd ? num(a.cig_years) * Number(a.cig_ppd) : null;
    var quitOk = a.tobacco === 'cig' || (a.tobacco === 'quit' && num(a.quit_years) !== null && num(a.quit_years) <= 15);
    if (age !== null && age >= 50 && age <= 80 && packYears !== null && packYears >= 20 && quitOk) {
      add({ id: 'lung', level: 'doctor', title: 'You qualify for yearly lung cancer screening',
        because: ['Age ' + age + ', about ' + Math.round(packYears) + ' pack-years, and ' + (a.tobacco === 'cig' ? 'currently smoking' : 'quit within 15 years') + '.'],
        todo: ['Ask about a yearly low-dose CT scan — it finds lung cancer early, when it\'s most treatable.'], strength: STRENGTH.strong, sources: ['uspstfLung'] });
    }
    var ac = auditC(c);
    var pregnantOrPlanning = a.pregnancy === 'pregnant' || a.pregnancy === 'planning';
    if (ac && ac.score > 0 && pregnantOrPlanning) {
      add({ id: 'alcohol-pregnancy', level: 'doctor', title: 'No alcohol during pregnancy or when trying to conceive',
        because: ['There is no known safe amount of alcohol during pregnancy.'], todo: ['Stop drinking now; ask your doctor for support if that\'s hard.'], strength: STRENGTH.guideline, sources: ['cdcAlcoholPregnancy'] });
    } else if (ac && ac.positive) {
      add({ id: 'alcohol', level: 'doctor', title: 'Drinking above the low-risk level',
        because: ['AUDIT-C score ' + ac.score + ' of 12 (' + (c.sex === 'female' ? '3' : '4') + ' or more = positive screen).'],
        todo: ['Cutting back lowers blood pressure, weight, liver fat and cancer risk.', 'A short talk with a doctor helps; NIAAA\'s Rethinking Drinking site has free tools.'],
        strength: STRENGTH.tool, sources: ['auditC', 'uspstfAlcohol'] });
    }
    if (age !== null && age >= 18 && age < 21 && ac && ac.score > 0) {
      add({ id: 'alcohol-under21', level: 'change', title: 'Alcohol under 21', because: ['The brain is still developing until the mid-20s.'], todo: ['Avoiding alcohol until at least 21 is safest.'], strength: STRENGTH.guideline, sources: ['uspstfAlcohol'] });
    }
    if (a.teen_alcohol === 'yes') add({ id: 'teen-alcohol', level: 'doctor', title: 'Alcohol use as a teen', because: ['Drinking in the past month.'],
      todo: ['Talk about it openly and mention it to the pediatrician, who can screen and support confidentially.'], strength: STRENGTH.guideline, sources: ['uspstfAlcohol'] });

    // --- Pregnancy --------------------------------------------------------------------
    if (a.pregnancy === 'planning') add({ id: 'folic', level: 'change', title: 'Planning pregnancy: start folic acid now',
      because: ['Folic acid taken before and in early pregnancy prevents most neural-tube defects.'], todo: ['Take 400–800 mcg folic acid daily, starting at least a month before conception.'],
      strength: STRENGTH.strong, sources: ['uspstfFolic'] });

    // --- Eating habits ----------------------------------------------------------------
    var drinks = a.sugary_drinks;
    if (drinks) {
      var under5 = age !== null && age < 5;
      if ((under5 && drinks !== 'none') || drinks === 'day1' || drinks === 'day2' || drinks === 'week4') {
        add({ id: 'sugary', level: 'change', title: 'Cut back on sugary drinks',
          because: [under5 ? 'Children under 5 shouldn\'t have sugary drinks; juice should be limited to a small daily amount.' : 'Sugary drinks are the largest source of added sugar and are linked to weight gain, type 2 diabetes and tooth decay.'],
          todo: ['Swap for water, sparkling water or plain milk; dilute juice while cutting down.', 'Kids and adults: aim for under 10% of calories from added sugar (AHA: under 25 g/day for children).'],
          strength: STRENGTH.strong, sources: under5 ? ['kidsDrinks'] : ['dga', 'ahaSugar'] });
      } else if (drinks === 'none') good.push({ text: 'Rarely has sugary drinks', source: 'dga' });
    }
    if (a.fruitveg === '0' || a.fruitveg === '2') add({ id: 'fruitveg', level: 'change', title: 'Eat more fruit and vegetables',
      because: ['About ' + (a.fruitveg === '0' ? '0–1' : '2–3') + ' servings a day; at least 5 (about 400 g) is linked to lower heart disease, stroke and early death.'],
      todo: ['Add one serving at a time: fruit at breakfast, a salad or vegetable at lunch, half the dinner plate as vegetables.', 'Frozen and canned (no added salt/sugar) count too.'],
      strength: STRENGTH.strong, sources: ['whoDiet', 'dga'] });
    else if (a.fruitveg === '5') good.push({ text: '5+ servings of fruit and vegetables a day', source: 'whoDiet' });
    if (a.processed_meat === '3' || a.processed_meat === '5') add({ id: 'processed-meat', level: 'change', title: 'Cut down on processed meat',
      because: ['Processed meat is classed as causing colorectal cancer; each 50 g a day (about 2 slices of ham) raises risk by about 18%. It is also high in salt.'],
      todo: ['Swap deli meat for leftover roast chicken, eggs, beans, tuna or hummus; keep bacon and sausage occasional.'], strength: STRENGTH.strong, sources: ['iarcMeat'] });
    var noFishOk = veg || (member.allergies || {}).fish || (member.allergies || {}).shellfish || reactions.fish === 'severe' || reactions.fish === 'mild';
    if (a.fish === '0') add({ id: 'fish', level: 'change', title: noFishOk ? 'Get omega-3s from other sources' : 'Add fish twice a week',
      because: ['Eating seafood about twice a week is linked to lower risk of heart disease.'],
      todo: noFishOk ? ['Use walnuts (if no nut allergy), ground flax, chia and canola oil; ask your doctor whether an algae-based omega-3 is worthwhile.'] : ['Choose lower-mercury fish such as salmon, sardines, trout, canned light tuna or cod.'],
      strength: STRENGTH.moderate, sources: ['ahaFish'] });
    else if (a.fish === '2') good.push({ text: 'Fish twice a week or more', source: 'ahaFish' });
    if (a.whole_grains === 'rarely') add({ id: 'whole-grains', level: 'change', title: 'Switch to whole grains',
      because: ['Whole grains add fiber and are linked to lower risk of heart disease and type 2 diabetes. Aim for at least half your grains whole.'],
      todo: ['Brown rice, whole-wheat bread and pasta, oats, quinoa' + (has(member.conditions, 'celiac') || has(diag, 'celiac') ? ' (gluten-free options: brown rice, quinoa, buckwheat, certified GF oats)' : '') + '.'],
      strength: STRENGTH.moderate, sources: ['dga'] });
    var saltHeavy = a.salty === 'yes' || a.fast_food === '3' || a.fast_food === '5';
    if (saltHeavy) add({ id: 'sodium', level: 'change', title: 'Probably eating too much salt',
      because: [a.salty === 'yes' ? 'Salty foods or added salt most days.' : 'Several restaurant or take-out meals a week — most sodium comes from packaged and restaurant food.'].concat(has(diag, 'hypertension') ? ['With high blood pressure, aim for about 1,500 mg a day.'] : []),
      todo: ['Cook at home more, rinse canned beans, choose "no salt added" products, season with herbs, citrus, garlic and vinegar.', 'Under 2,300 mg a day for adults; less for children.'],
      strength: STRENGTH.strong, sources: ['ahaSodium', 'dga'] });
    if (a.caffeine) {
      if (age !== null && age < 18 && a.caffeine !== '0') add({ id: 'teen-caffeine', level: 'change', title: 'Keep caffeine low for teens',
        because: ['Pediatricians advise teens to keep caffeine to about 100 mg a day (one cup of coffee) and avoid energy drinks.'], todo: ['Swap energy drinks for water; no caffeine after school.'], strength: STRENGTH.guideline, sources: ['aapCaffeine'] });
      else if (a.caffeine === '5' || (a.caffeine === '3' && a.pregnancy === 'pregnant')) add({ id: 'caffeine', level: 'change', title: 'Caffeine above the safe limit',
        because: [a.pregnancy === 'pregnant' ? 'In pregnancy the limit is about 200 mg a day (one 12-oz coffee).' : 'Five or more cups is usually over 400 mg a day, the FDA\'s limit for healthy adults.'],
        todo: ['Cut back gradually by half a cup every few days to avoid headaches.'], strength: STRENGTH.guideline, sources: ['fdaCaffeine'] });
    }

    // --- Activity ------------------------------------------------------------------------
    if (a.active_days !== undefined) {
      var d = Number(a.active_days);
      if (isKid) {
        if (d < 7) add({ id: 'activity-kid', level: 'change', title: 'Aim for 60 minutes of activity every day',
          because: ['Currently about ' + d + ' day' + (d === 1 ? '' : 's') + ' a week. Kids 6–17 need 60 minutes daily, including running/jumping play 3 days a week.'],
          todo: ['Active family time (walks, bikes, ball games), walking to school, and sports clubs all count.'], strength: STRENGTH.strong, sources: ['pag'] });
        else good.push({ text: 'Active 60 minutes every day', source: 'pag' });
      } else {
        if (d * 30 < 150) add({ id: 'activity', level: 'change', title: 'Move more: 150 minutes a week',
          because: ['About ' + d * 30 + ' minutes a week now. 150 minutes of moderate activity lowers the risk of heart disease, diabetes, depression and early death.'],
          todo: ['Start with 10-minute brisk walks, e.g. after meals (this also lowers blood sugar).', 'Anything counts — even short bouts add up.'], strength: STRENGTH.strong, sources: ['pag'] });
        else good.push({ text: 'Meets the 150 minutes/week activity guideline', source: 'pag' });
        if (a.strength_days === '0' || a.strength_days === '1') add({ id: 'strength', level: 'change', title: 'Add strength exercise twice a week',
          because: ['Muscle-strengthening on 2+ days protects bones, joints and blood sugar, and becomes more important with age.'],
          todo: ['Body-weight moves (squats, wall push-ups), bands or weights — all major muscle groups.'], strength: STRENGTH.strong, sources: ['pag'] });
      }
    }

    // --- Direct profile updates from "doctor told me" ------------------------------------
    diag.forEach(function (k) {
      if (KB.CONDITIONS[k] && !profileHas('condition', k)) suggest({ kind: 'condition', key: k, label: KB.CONDITIONS[k].label + ' (diagnosed)', checked: true });
    });
    if (a.pregnancy === 'pregnant' && !profileHas('condition', 'pregnancy')) suggest({ kind: 'condition', key: 'pregnancy', label: 'Pregnant', checked: true });
    if (a.pregnancy === 'breastfeeding' && !profileHas('condition', 'breastfeeding')) suggest({ kind: 'condition', key: 'breastfeeding', label: 'Breastfeeding', checked: true });

    // Blood tests and wearable data.
    var labRes = Labs.analyzeLabs(member, age);
    labRes.findings.forEach(add);
    labRes.suggestions.forEach(function (s) { if (!profileHas(s.kind, s.key)) suggest(s); });
    good = good.concat(labRes.good);
    var wRes = Labs.analyzeWearable(member, age);
    wRes.findings.forEach(function (f) {
      // Device short-sleep duplicates the self-reported one; keep the more precise device finding.
      if (f.id === 'w-sleep') findings = findings.filter(function (x) { return x.id !== 'sleep-short'; });
      add(f);
    });
    good = good.concat(wRes.good);

    var order = { urgent: 0, doctor: 1, change: 2 };
    findings.sort(function (x, y) { return order[x.level] - order[y.level]; });

    return {
      findings: findings,
      good: good,
      screenings: screenings(member, a, age, packYears),
      suggestions: suggestions,
      scores: { bmi: bmi, ada: ada, stopBang: sb, phq2: phq, gad2: gad, auditC: ac, packYears: packYears }
    };
  }

  // Age- and sex-based preventive care (USPSTF A/B recommendations, AAP Bright Futures).
  function screenings(member, a, age, packYears) {
    if (age === null) return [];
    var out = [], sex = member.sex;
    function s(text, source) { out.push({ text: text, source: source }); }
    if (age < 18) {
      s('Yearly well-child visit (growth, development, vision, hearing, vaccines)', 'brightFutures');
      if ((age >= 9 && age <= 11) || age >= 17) s('Cholesterol test once between ages 9–11 and again at 17–21', 'nhlbiKids');
      if (age >= 12) s('Yearly depression and anxiety screening at check-ups', 'uspstfTeenDep');
      if (age >= 15) s('HIV test at least once (ages 15–65)', 'uspstfHIV');
      return out;
    }
    s('Blood pressure check — every year from 40 (or if high-normal), every 3–5 years at 18–39', 'uspstfBP');
    s('Depression' + (age <= 64 ? ' and anxiety' : '') + ' screening at check-ups', 'uspstfDepression');
    if (age <= 79) s('Hepatitis C test once (ages 18–79)', 'uspstfHepC');
    if (age <= 65) s('HIV test at least once (ages 15–65)', 'uspstfHIV');
    if (age >= 35 && age <= 70) s('Blood sugar test every 3 years if overweight (ages 35–70)', 'uspstfDiabetes');
    if (age >= 40 && age <= 75) s('Cholesterol test and heart-risk estimate to decide about a statin (ages 40–75)', 'uspstfStatin');
    if (age >= 45 && age <= 75) s('Colorectal cancer screening (colonoscopy every 10 years, or yearly stool test) — ages 45–75' + (has(a.family, 'colon') ? '; with a parent or sibling affected, ask about starting earlier' : ''), 'uspstfColon');
    if (sex === 'female' && age >= 21 && age <= 65) s('Cervical cancer screening (Pap every 3 years, or HPV test every 5 years from 30)', 'uspstfCervical');
    if (sex === 'female' && age >= 40 && age <= 74) s('Mammogram every 2 years (ages 40–74)', 'uspstfBreast');
    if (sex === 'female' && age >= 65) s('Bone density (DXA) scan', 'uspstfBone');
    if (sex === 'male' && age >= 65 && age <= 75 && a.tobacco && a.tobacco !== 'never') s('One-time ultrasound for abdominal aortic aneurysm (men 65–75 who ever smoked)', 'uspstfAAA');
    if (age >= 50 && age <= 80 && packYears !== null && packYears >= 20) s('Yearly low-dose CT for lung cancer (20+ pack-years, smoking now or quit within 15 years)', 'uspstfLung');
    return out;
  }

  // Writes the direct answers (not suspicions) into the profile.
  function syncProfile(member) {
    var a = member.answers || {};
    if (a.active_days !== undefined && a.active_days !== '') {
      var d = Number(a.active_days);
      member.activity = d <= 1 ? 'sedentary' : d <= 3 ? 'light' : d <= 5 ? 'moderate' : 'active';
    }
    if (a.diet) member.diet = a.diet;
    if (a.diet_rules) member.dietRules = list(a.diet_rules).slice();
    if (a.dislikes !== undefined) member.dislikes = String(a.dislikes).split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    if (a.favorites !== undefined) member.favoriteFoods = String(a.favorites).split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    if (a.meds !== undefined) member.medications = String(a.meds).split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    if (a.pregnancy) {
      var conds = list(member.conditions).filter(function (k) { return k !== 'pregnancy' && k !== 'breastfeeding'; });
      if (a.pregnancy === 'pregnant') conds.push('pregnancy');
      if (a.pregnancy === 'breastfeeding') conds.push('breastfeeding');
      member.conditions = conds;
    }
    return member;
  }

  function applySuggestion(member, s) {
    member.allergies = member.allergies || {};
    var rank = { mild: 1, moderate: 2, severe: 3 };
    if (s.kind === 'allergy') {
      if (!member.allergies[s.key] || rank[s.severity] > rank[member.allergies[s.key]]) member.allergies[s.key] = s.severity;
    } else if (s.kind === 'otherAllergy') {
      member.otherAllergies = list(member.otherAllergies);
      var existing = member.otherAllergies.filter(function (o) { return o.name.toLowerCase() === s.name.toLowerCase(); })[0];
      if (existing) { if (rank[s.severity] > rank[existing.severity]) existing.severity = s.severity; }
      else member.otherAllergies.push({ name: s.name, severity: s.severity });
    } else if (s.kind === 'condition') {
      member.conditions = list(member.conditions);
      if (member.conditions.indexOf(s.key) === -1) member.conditions.push(s.key);
    } else if (s.kind === 'intolerance') {
      member.intolerances = list(member.intolerances);
      if (member.intolerances.indexOf(s.key) === -1) member.intolerances.push(s.key);
    }
    return member;
  }

  var Q = {
    SOURCES: SOURCES,
    STRENGTH: STRENGTH,
    SECTIONS: SECTIONS,
    REACTIONS: REACTIONS,
    context: context,
    textOf: textOf,
    visibleSections: visibleSections,
    progress: progress,
    analyze: analyze,
    adaRisk: adaRisk,
    stopBang: stopBang,
    auditC: auditC,
    syncProfile: syncProfile,
    applySuggestion: applySuggestion
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Q;
  else root.FHQuestionnaire = Q;
})(this);
