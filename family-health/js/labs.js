/*
 * Family Health Guide — blood tests and wearable data (Oura, WHOOP, etc.).
 *
 * Lab cut-offs come from the guideline named on each test. Labs differ a
 * little in their reference ranges, so the printed range on a report wins
 * when it disagrees. Wearable numbers are consumer-device estimates: useful
 * for trends, not for diagnosis.
 */
(function (root) {
  'use strict';

  var SOURCES = {
    adaDx: { title: 'Standards of Care in Diabetes — diagnosis (A1C, fasting glucose; confirm with a repeat test)', org: 'American Diabetes Association', year: 2025, url: 'https://diabetesjournals.org/care/article/48/Supplement_1/S27/157566' },
    accCholesterol: { title: 'Guideline on the management of blood cholesterol', org: 'ACC/AHA', year: 2018, url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625' },
    atp3: { title: 'Third Report of the NCEP Expert Panel (ATP III) — lipid categories', org: 'NHLBI', year: 2002, url: 'https://www.nhlbi.nih.gov/files/docs/resources/heart/atp3full.pdf' },
    kdigo: { title: 'Clinical practice guideline for the evaluation and management of CKD', org: 'KDIGO', year: 2024, url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/' },
    acgLiver: { title: 'ACG clinical guideline: evaluation of abnormal liver chemistries (healthy ALT ≈ 29–33 U/L men, 19–25 U/L women)', org: 'American College of Gastroenterology', year: 2017, url: 'https://journals.lww.com/ajg/fulltext/2017/01000/acg_clinical_guideline__evaluation_of_abnormal.13.aspx' },
    ataThyroid: { title: 'Thyroid function tests (typical TSH reference range about 0.4–4.5 mIU/L)', org: 'American Thyroid Association', year: 2024, url: 'https://www.thyroid.org/thyroid-function-tests/' },
    agaIron: { title: 'Guidelines on the gastrointestinal evaluation of iron deficiency anemia (ferritin cut-off 45 ng/mL)', org: 'American Gastroenterological Association', year: 2020, url: 'https://www.gastrojournal.org/article/S0016-5085(20)35066-0/fulltext' },
    whoHb: { title: 'Guideline on haemoglobin cutoffs to define anaemia', org: 'World Health Organization', year: 2024, url: 'https://www.who.int/publications/i/item/9789240088542' },
    namVitD: { title: 'Dietary Reference Intakes for calcium and vitamin D (20 ng/mL meets the needs of 97.5% of people)', org: 'National Academy of Medicine', year: 2011, url: 'https://nap.nationalacademies.org/catalog/13050' },
    endoVitD: { title: 'Vitamin D for the prevention of disease (no routine testing for healthy adults under 75)', org: 'Endocrine Society', year: 2024, url: 'https://academic.oup.com/jcem/article/109/8/1907/7685305' },
    odsB12: { title: 'Vitamin B12 — fact sheet for health professionals', org: 'NIH Office of Dietary Supplements', year: 2024, url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/' },
    acrGout: { title: 'Guideline for the management of gout (urate saturation ≈ 6.8 mg/dL)', org: 'American College of Rheumatology', year: 2020, url: 'https://rheumatology.org/gout-guideline' },
    potassium: { title: 'Potassium — fact sheet (normal serum 3.6–5.2 mmol/L in most labs)', org: 'NIH Office of Dietary Supplements', year: 2022, url: 'https://ods.od.nih.gov/factsheets/Potassium-HealthProfessional/' },
    ahaRhr: { title: 'All about heart rate (normal resting 60–100 bpm)', org: 'American Heart Association', year: 2024, url: 'https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse' },
    rhrMeta: { title: 'Resting heart rate and all-cause and cardiovascular mortality: meta-analysis (Zhang et al., CMAJ)', org: 'Peer-reviewed meta-analysis', year: 2016, url: 'https://www.cmaj.ca/content/188/3/E53' },
    deviceSleep: { title: 'Performance of seven consumer sleep-tracking devices compared with polysomnography (Chinoy et al., Sleep)', org: 'Peer-reviewed validation study', year: 2021, url: 'https://academic.oup.com/sleep/article/44/5/zsaa291/6055610' },
    sleepAdult: { title: 'Recommended amount of sleep for a healthy adult (joint consensus)', org: 'AASM & Sleep Research Society', year: 2015, url: 'https://aasm.org/resources/pdf/pressroom/adult-sleep-duration-consensus.pdf' },
    fdaOximeter: { title: 'Pulse oximeter accuracy and limitations', org: 'FDA', year: 2024, url: 'https://www.fda.gov/medical-devices/safety-communications/pulse-oximeter-accuracy-and-limitations-fda-safety-communication' },
    apaStress: { title: 'Stress effects on the body', org: 'American Psychological Association', year: 2023, url: 'https://www.apa.org/topics/stress/body' },
    hrvReview: { title: 'An overview of heart rate variability metrics and norms (Shaffer & Ginsberg, Frontiers in Public Health) — HRV is individual; compare with your own baseline', org: 'Peer-reviewed review', year: 2017, url: 'https://www.frontiersin.org/articles/10.3389/fpubh.2017.00258/full' }
  };

  var STRENGTH = {
    guideline: 'National guideline',
    lab: 'Lab reference range',
    moderate: 'Moderate evidence (consistent observational studies)',
    device: 'Consumer-device estimate — good for trends, not diagnosis'
  };

  // US units; `si` converts US → SI for metric display.
  var LABS = [
    { id: 'a1c', label: 'Hemoglobin A1C', unit: '%', step: 0.1, group: 'Blood sugar' },
    { id: 'glucose', label: 'Fasting glucose', unit: 'mg/dL', si: { unit: 'mmol/L', factor: 1 / 18 }, group: 'Blood sugar' },
    { id: 'tc', label: 'Total cholesterol', unit: 'mg/dL', si: { unit: 'mmol/L', factor: 1 / 38.67 }, group: 'Cholesterol' },
    { id: 'ldl', label: 'LDL cholesterol', unit: 'mg/dL', si: { unit: 'mmol/L', factor: 1 / 38.67 }, group: 'Cholesterol' },
    { id: 'hdl', label: 'HDL cholesterol', unit: 'mg/dL', si: { unit: 'mmol/L', factor: 1 / 38.67 }, group: 'Cholesterol' },
    { id: 'tg', label: 'Triglycerides', unit: 'mg/dL', si: { unit: 'mmol/L', factor: 1 / 88.57 }, group: 'Cholesterol' },
    { id: 'egfr', label: 'eGFR (kidney filtering)', unit: 'mL/min/1.73m²', group: 'Kidney & liver' },
    { id: 'alt', label: 'ALT (liver enzyme)', unit: 'U/L', group: 'Kidney & liver' },
    { id: 'potassium', label: 'Potassium', unit: 'mmol/L', step: 0.1, group: 'Kidney & liver' },
    { id: 'hgb', label: 'Hemoglobin', unit: 'g/dL', step: 0.1, group: 'Blood count & iron' },
    { id: 'ferritin', label: 'Ferritin (iron stores)', unit: 'ng/mL', group: 'Blood count & iron' },
    { id: 'tsh', label: 'TSH (thyroid)', unit: 'mIU/L', step: 0.01, group: 'Vitamins & hormones' },
    { id: 'vitd', label: 'Vitamin D, 25-OH', unit: 'ng/mL', si: { unit: 'nmol/L', factor: 2.5 }, group: 'Vitamins & hormones' },
    { id: 'b12', label: 'Vitamin B12', unit: 'pg/mL', si: { unit: 'pmol/L', factor: 0.738 }, group: 'Vitamins & hormones' },
    { id: 'uric', label: 'Uric acid', unit: 'mg/dL', step: 0.1, si: { unit: 'µmol/L', factor: 59.48 }, group: 'Vitamins & hormones' }
  ];

  function labDef(id) { return LABS.filter(function (l) { return l.id === id; })[0]; }

  function list(v) { return Array.isArray(v) ? v : []; }

  // Latest value of each test across all lab entries, with its date.
  function latestLabs(member) {
    var out = {};
    list(member.labs).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (entry) {
      Object.keys(entry.values || {}).forEach(function (k) {
        var v = entry.values[k];
        if (v !== null && v !== undefined && v !== '' && !isNaN(Number(v))) out[k] = { value: Number(v), date: entry.date };
      });
    });
    return out;
  }

  // Interprets one value: { level: ok|low|high|watch|alert, text }.
  function interpret(id, v, sex, pregnant) {
    var male = sex === 'male';
    switch (id) {
      case 'a1c': return v >= 6.5 ? { level: 'alert', text: 'In the diabetes range (6.5%+)' } : v >= 5.7 ? { level: 'watch', text: 'Prediabetes range (5.7–6.4%)' } : { level: 'ok', text: 'Normal (under 5.7%)' };
      case 'glucose': return v >= 126 ? { level: 'alert', text: 'In the diabetes range (126+ fasting)' } : v >= 100 ? { level: 'watch', text: 'Prediabetes range (100–125)' } : v < 70 ? { level: 'watch', text: 'Low (under 70)' } : { level: 'ok', text: 'Normal (70–99 fasting)' };
      case 'tc': return v >= 240 ? { level: 'high', text: 'High (240+)' } : v >= 200 ? { level: 'watch', text: 'Borderline high (200–239)' } : { level: 'ok', text: 'Desirable (under 200)' };
      case 'ldl': return v >= 190 ? { level: 'alert', text: 'Very high (190+)' } : v >= 160 ? { level: 'high', text: 'High (160–189)' } : v >= 130 ? { level: 'watch', text: 'Borderline high (130–159)' } : v >= 100 ? { level: 'ok', text: 'Near optimal (100–129)' } : { level: 'ok', text: 'Optimal (under 100)' };
      case 'hdl': return v < (male ? 40 : 50) ? { level: 'watch', text: 'Low (under ' + (male ? 40 : 50) + ')' } : v >= 60 ? { level: 'ok', text: 'Protective (60+)' } : { level: 'ok', text: 'Normal' };
      case 'tg': return v >= 500 ? { level: 'alert', text: 'Very high (500+) — pancreatitis risk' } : v >= 200 ? { level: 'high', text: 'High (200–499)' } : v >= 150 ? { level: 'watch', text: 'Borderline high (150–199)' } : { level: 'ok', text: 'Normal (under 150)' };
      case 'egfr': return v < 30 ? { level: 'alert', text: 'Severely reduced (under 30)' } : v < 60 ? { level: 'high', text: 'Reduced (under 60)' } : v < 90 ? { level: 'ok', text: 'Mildly reduced or normal for age (60–89)' } : { level: 'ok', text: 'Normal (90+)' };
      case 'alt': return v > (male ? 33 : 25) * 2 ? { level: 'high', text: 'Raised (more than twice the healthy upper limit)' } : v > (male ? 33 : 25) ? { level: 'watch', text: 'Above the healthy upper limit (' + (male ? 33 : 25) + ')' } : { level: 'ok', text: 'Normal' };
      case 'potassium': return v >= 6 || v < 3 ? { level: 'alert', text: v >= 6 ? 'Dangerously high (6.0+)' : 'Dangerously low (under 3.0)' } : v > 5.2 || v < 3.5 ? { level: 'high', text: v > 5.2 ? 'High (over 5.2)' : 'Low (under 3.5)' } : { level: 'ok', text: 'Normal (3.5–5.2)' };
      case 'hgb':
        var cut = pregnant ? 11 : male ? 13 : 12;
        return v < cut - 2 ? { level: 'alert', text: 'Anemia, moderate or worse (under ' + (cut - 2) + ')' } : v < cut ? { level: 'high', text: 'Anemia (under ' + cut + ')' } : { level: 'ok', text: 'Normal' };
      case 'ferritin': return v < 30 ? { level: 'high', text: 'Low iron stores (under 30)' } : v < 45 ? { level: 'watch', text: 'Possibly low iron stores (30–44)' } : v > 300 ? { level: 'watch', text: 'High (over 300) — can be inflammation or iron overload' } : { level: 'ok', text: 'Normal' };
      case 'tsh': return v > 10 ? { level: 'high', text: 'High (over 10)' } : v > 4.5 ? { level: 'watch', text: 'Above typical range (over 4.5)' } : v < 0.4 ? { level: 'watch', text: 'Below typical range (under 0.4)' } : { level: 'ok', text: 'Typical range (0.4–4.5)' };
      case 'vitd': return v < 12 ? { level: 'high', text: 'Deficient (under 12)' } : v < 20 ? { level: 'watch', text: 'Inadequate for some people (12–19)' } : v > 50 ? { level: 'watch', text: 'High (over 50) — check supplement dose' } : { level: 'ok', text: 'Adequate (20–50)' };
      case 'b12': return v < 200 ? { level: 'high', text: 'Low (under 200)' } : v < 300 ? { level: 'watch', text: 'Borderline (200–300)' } : { level: 'ok', text: 'Normal' };
      case 'uric': return v > 6.8 ? { level: 'watch', text: 'Above the level where crystals can form (6.8)' } : { level: 'ok', text: 'Normal' };
    }
    return { level: 'ok', text: '' };
  }

  var LAB_SOURCES = { a1c: 'adaDx', glucose: 'adaDx', tc: 'atp3', ldl: 'accCholesterol', hdl: 'atp3', tg: 'accCholesterol', egfr: 'kdigo', alt: 'acgLiver',
    potassium: 'potassium', hgb: 'whoHb', ferritin: 'agaIron', tsh: 'ataThyroid', vitd: 'namVitD', b12: 'odsB12', uric: 'acrGout' };

  // Advice for each test when out of range: [level, title, todo[], suggestion?]
  function adviceFor(id, r, v, member) {
    var conds = list(member.conditions);
    var has = function (c) { return conds.indexOf(c) !== -1; };
    switch (id) {
      case 'a1c':
      case 'glucose':
        if (has('diabetes1') || has('diabetes2')) return null;
        if (r.level === 'alert') return ['doctor', 'Blood sugar in the diabetes range', ['A diagnosis needs a second abnormal test (unless there are clear symptoms) — book a follow-up to confirm.', 'If confirmed, ask about diabetes education and nutrition counseling.'], { kind: 'condition', key: 'diabetes2', label: 'Type 2 diabetes — confirm with a repeat test', checked: false }];
        if (r.level === 'watch' && (id === 'a1c' ? v >= 5.7 : v >= 100)) return ['doctor', 'Blood sugar in the prediabetes range', ['Losing 5–7% of body weight and 150 minutes a week of activity cut progression to diabetes by about half.', 'Retest yearly.'], { kind: 'condition', key: 'prediabetes', label: 'Prediabetes (from lab result)', checked: true }];
        return null;
      case 'ldl':
        if (r.level === 'alert') return ['doctor', 'Very high LDL cholesterol (190+)', ['At this level guidelines recommend a statin regardless of other risks, and checking family members for inherited high cholesterol.'], { kind: 'condition', key: 'cholesterol', label: 'High cholesterol (from lab result)', checked: true }];
        if (r.level === 'high') return ['doctor', 'High LDL cholesterol', ['Ask for a 10-year heart-risk estimate to decide about treatment.', 'Cut saturated fat, add soluble fiber (oats, beans) and move more.'], { kind: 'condition', key: 'cholesterol', label: 'High cholesterol (from lab result)', checked: true }];
        if (r.level === 'watch') return ['change', 'LDL a little high', ['Diet changes can lower LDL 10–20%: less saturated fat, more soluble fiber, nuts and plant sterols.']];
        return null;
      case 'tc':
        return null;
      case 'hdl':
        return r.level === 'watch' ? ['change', 'Low HDL ("good") cholesterol', ['Regular aerobic exercise, not smoking and losing extra weight raise HDL.']] : null;
      case 'tg':
        if (r.level === 'alert') return ['urgent', 'Very high triglycerides (500+)', ['Call your doctor soon — this level raises the risk of pancreatitis.', 'Avoid alcohol and sugary drinks until it\'s rechecked.']];
        if (r.level === 'high' || r.level === 'watch') return ['change', 'Triglycerides above normal', ['Cut sugary drinks, refined carbs and alcohol; eat fatty fish; lose extra weight.']];
        return null;
      case 'egfr':
        if (r.level === 'alert' || r.level === 'high') return ['doctor', 'Reduced kidney function (eGFR ' + v + ')', ['Kidney disease is confirmed when eGFR stays under 60 for 3+ months — ask about a repeat test and a urine albumin test.', 'Don\'t start potassium supplements or salt substitutes without your doctor.'], { kind: 'condition', key: 'ckd', label: 'Chronic kidney disease — confirm with a repeat test', checked: false }];
        return null;
      case 'alt':
        if (r.level === 'high' || r.level === 'watch') return [r.level === 'high' ? 'doctor' : 'change', 'Liver enzyme (ALT) above the healthy range', ['The most common cause is fatty liver; others include alcohol, medicines and hepatitis — mention it to your doctor.', 'Cutting alcohol and sugary drinks and losing extra weight lowers ALT.']];
        return null;
      case 'potassium':
        if (r.level === 'alert') return ['urgent', 'Potassium dangerously ' + (v >= 6 ? 'high' : 'low'), ['Call your doctor today — this can affect heart rhythm.']];
        if (r.level === 'high') return ['doctor', 'Potassium out of range', ['Ask your doctor whether medicines or diet need adjusting.']];
        return null;
      case 'hgb':
        if (r.level === 'alert' || r.level === 'high') return ['doctor', 'Hemoglobin shows anemia', ['Ask what\'s causing it — iron, B12 or folate tests are usually next.'], { kind: 'condition', key: 'anemia', label: 'Anemia (from lab result)', checked: true }];
        return null;
      case 'ferritin':
        if (r.level === 'high') return ['doctor', 'Low iron stores (ferritin ' + v + ')', ['Ask your doctor about iron treatment and the cause (heavy periods, diet, gut absorption).', 'Eat iron-rich foods with vitamin C; keep tea and coffee away from meals.'], { kind: 'condition', key: 'anemia', label: 'Iron deficiency (from lab result)', checked: false }];
        if (r.level === 'watch' && v < 45) return ['change', 'Iron stores on the low side', ['Iron-rich foods with vitamin C; recheck at your next blood test.']];
        if (r.level === 'watch') return ['doctor', 'High ferritin', ['Ask your doctor whether it reflects inflammation or iron overload.']];
        return null;
      case 'tsh':
        if (r.level === 'high' || r.level === 'watch') return ['doctor', 'Thyroid test (TSH) out of the typical range', ['TSH can shift with illness and some supplements (biotin) — a repeat test with free T4 confirms it.']];
        return null;
      case 'vitd':
        if (r.level === 'high' && v < 12) return ['doctor', 'Vitamin D deficient', ['Ask your doctor about a supplement dose.', 'Food sources: fatty fish, fortified milk or plant milk, eggs.']];
        if (r.level === 'watch' && v < 20) return ['change', 'Vitamin D on the low side', ['Fortified foods, fatty fish and some sunlight; ask whether a standard supplement makes sense for you.']];
        if (r.level === 'watch') return ['change', 'High vitamin D', ['Check your supplement dose — over 4,000 IU a day long-term isn\'t advised without a doctor.']];
        return null;
      case 'b12':
        if (r.level === 'high') return ['doctor', 'Low vitamin B12', ['Ask about treatment; low B12 can cause tiredness, anemia and nerve damage.']];
        if (r.level === 'watch') return ['change', 'Borderline vitamin B12', ['Ask whether a follow-up test (methylmalonic acid) is needed; B12-fortified foods help.']];
        return null;
      case 'uric':
        return r.level === 'watch' ? ['change', 'High uric acid', ['Limit beer, spirits, sugary drinks and organ meats; stay hydrated. Treatment is usually only needed with gout attacks or kidney stones.']] : null;
    }
    return null;
  }

  function analyzeLabs(member, age) {
    var latest = latestLabs(member);
    var findings = [], suggestions = [], good = [];
    if (age !== null && age < 18 && Object.keys(latest).length) {
      findings.push({ id: 'labs-kids', level: 'doctor', title: 'Children\'s lab results need child reference ranges', because: ['Normal ranges for children differ by age.'],
        todo: ['Ask the pediatrician to go over the results.'], strength: STRENGTH.lab, sources: ['whoHb'] });
      return { findings: findings, suggestions: suggestions, good: good, latest: latest };
    }
    var pregnant = list(member.conditions).indexOf('pregnancy') !== -1;
    var normal = [];
    Object.keys(latest).forEach(function (id) {
      var def = labDef(id);
      if (!def) return;
      var v = latest[id].value;
      var r = interpret(id, v, member.sex, pregnant);
      var adv = adviceFor(id, r, v, member);
      var same = adv && findings.filter(function (f) { return f.title === adv[1]; })[0];
      if (same) { same.because.push(def.label + ' ' + v + ' ' + def.unit + ' on ' + latest[id].date + ': ' + r.text + '.'); return; }
      if (adv) {
        findings.push({ id: 'lab-' + id, level: adv[0], title: adv[1],
          because: [def.label + ' ' + v + ' ' + def.unit + ' on ' + latest[id].date + ': ' + r.text + '.'],
          todo: adv[2], strength: STRENGTH.lab, sources: [LAB_SOURCES[id]] });
        if (adv[3]) suggestions.push(adv[3]);
      } else if (r.level === 'ok') normal.push(def.label);
    });
    if (normal.length) good.push({ text: 'In range: ' + normal.join(', '), source: 'atp3' });
    return { findings: findings, suggestions: suggestions, good: good, latest: latest };
  }

  // ------------------------------------------------------------- wearables

  var DEVICES = [['none', 'No wearable'], ['oura', 'Oura Ring'], ['whoop', 'WHOOP'], ['apple', 'Apple Watch'], ['fitbit', 'Fitbit / Google'], ['garmin', 'Garmin'], ['samsung', 'Samsung'], ['other', 'Other']];

  var WEARABLE_FIELDS = [
    { id: 'sleepHours', label: 'Average sleep per night', unit: 'hours', step: 0.1, hint: 'Total sleep time, last 30 days' },
    { id: 'sleepScore', label: 'Sleep score', unit: '/ 100', hint: 'Oura sleep score, WHOOP sleep performance %' },
    { id: 'restingHr', label: 'Resting heart rate', unit: 'bpm' },
    { id: 'hrv', label: 'HRV (average)', unit: 'ms', hint: 'Heart rate variability' },
    { id: 'hrvBaseline', label: 'Your usual HRV (optional)', unit: 'ms', hint: 'From a few months ago, to spot a drop' },
    { id: 'recovery', label: 'Readiness / recovery', unit: '/ 100', hint: 'Oura readiness, WHOOP recovery %, Garmin Body Battery' },
    { id: 'spo2', label: 'Night-time blood oxygen (SpO2)', unit: '%', step: 0.1 },
    { id: 'stressScore', label: 'Daytime stress score (optional)', unit: '/ 100', hint: 'Garmin or Samsung stress average' },
    { id: 'steps', label: 'Average daily steps', unit: 'steps', hint: 'Sets your personal step goal' }
  ];

  var STRESS = [['low', 'Mostly calm / restored'], ['normal', 'Normal'], ['high', 'Often stressed (most days)']];

  // Minimal CSV parser that handles quoted fields.
  function parseCSV(text) {
    var rows = [], row = [], field = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (ch === '"') q = false;
        else field += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else field += ch;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim() !== ''; }); });
  }

  var COLUMN_PATTERNS = [
    ['date', /^(date|day|summary_date|cycle start time|start time|calendar date)/i],
    ['sleepDur', /(total sleep( duration)?|asleep duration|sleep duration|time asleep|total_sleep_duration)/i],
    ['sleepScore', /(sleep score|sleep performance|sleep_score)/i],
    ['restingHr', /(resting heart rate|lowest resting|average resting|rhr|resting_heart_rate)/i],
    ['hrv', /(hrv|heart rate variability)/i],
    ['recovery', /(recovery score|readiness score|readiness|body battery|recovery)/i],
    ['spo2', /(spo2|blood oxygen|oxygen saturation)/i],
    ['stressScore', /(stress score|average stress|stress level)/i],
    ['steps', /^(steps|daily steps|step count|total steps)$/i]
  ];

  /*
   * Reads an Oura / WHOOP / Garmin style CSV export and averages the last
   * `days` rows. Columns are matched by name, so it is tolerant of format changes.
   */
  function importWearableCSV(text, days) {
    days = days || 30;
    var rows = parseCSV(text);
    if (rows.length < 2) throw new Error('No data rows found in that file.');
    var header = rows[0].map(function (h) { return h.trim(); });
    var cols = {};
    COLUMN_PATTERNS.forEach(function (p) {
      for (var i = 0; i < header.length; i++) {
        if (p[1].test(header[i]) && Object.keys(cols).map(function (k) { return cols[k]; }).indexOf(i) === -1) { cols[p[0]] = i; break; }
      }
    });
    if (Object.keys(cols).filter(function (k) { return k !== 'date'; }).length === 0) throw new Error('Couldn\'t recognise any sleep or heart columns. Expected names like "Total Sleep Duration", "Resting Heart Rate", "HRV", "Recovery score".');
    var data = rows.slice(1);
    if (cols.date !== undefined) data.sort(function (a, b) { return String(a[cols.date]) < String(b[cols.date]) ? -1 : 1; });
    data = data.slice(-days);
    function avg(key) {
      if (cols[key] === undefined) return null;
      var vals = data.map(function (r) { return parseFloat(String(r[cols[key]]).replace('%', '')); }).filter(function (v) { return !isNaN(v); });
      return vals.length ? vals.reduce(function (s, v) { return s + v; }, 0) / vals.length : null;
    }
    var out = { importedRows: data.length, columns: Object.keys(cols).map(function (k) { return k + ' ← "' + header[cols[k]] + '"'; }) };
    var sd = avg('sleepDur');
    if (sd !== null) {
      var h = header[cols.sleepDur];
      // Oura exports seconds, WHOOP minutes; some apps hours.
      var hours = /\(min/i.test(h) || (sd > 24 && sd < 1440) ? sd / 60 : sd >= 1440 ? sd / 3600 : sd;
      out.sleepHours = Math.round(hours * 10) / 10;
    }
    ['sleepScore', 'restingHr', 'hrv', 'recovery', 'spo2', 'stressScore', 'steps'].forEach(function (k) {
      var v = avg(k);
      if (v !== null) out[k] = k === 'steps' ? Math.round(v) : Math.round(v * 10) / 10;
    });
    return out;
  }

  function analyzeWearable(member, age) {
    var w = member.wearable || {};
    var findings = [], good = [];
    if (!w.device || w.device === 'none') return { findings: findings, good: good };
    var num = function (v) { return v === undefined || v === null || v === '' ? null : Number(v); };
    var sleep = num(w.sleepHours), rhr = num(w.restingHr), hrv = num(w.hrv), base = num(w.hrvBaseline), rec = num(w.recovery), spo2 = num(w.spo2), score = num(w.sleepScore), stress = num(w.stressScore);
    var adult = age === null || age >= 18;

    if (sleep !== null && adult) {
      if (sleep < 7) findings.push({ id: 'w-sleep', level: 'change', title: 'Your tracker shows short sleep (' + sleep + ' h a night)',
        because: ['Adults need 7+ hours. Consumer trackers measure total sleep reasonably well (usually within about 20–30 minutes of a sleep lab), though they tend to overestimate a little.'],
        todo: ['Same wake time every day; aim to get into bed 30–45 minutes earlier.', 'Use the tracker\'s trend, not single nights, to see if changes help.'],
        strength: STRENGTH.device, sources: ['sleepAdult', 'deviceSleep'] });
      else good.push({ text: 'Tracker sleep ' + sleep + ' h a night', source: 'sleepAdult' });
    }
    if (score !== null && score < 70) findings.push({ id: 'w-sleepscore', level: 'change', title: 'Sleep score usually below 70',
      because: ['Sleep scores are each company\'s own formula (not medically validated), but a consistently low score usually reflects short, broken or late sleep.'],
      todo: ['Look at which part drags the score down (total sleep, timing, restfulness) in the app and target that.'], strength: STRENGTH.device, sources: ['deviceSleep'] });
    if (rhr !== null && adult) {
      if (rhr > 100) findings.push({ id: 'w-rhr-high', level: 'doctor', title: 'Resting heart rate above 100 bpm',
        because: ['A resting rate over 100 is called tachycardia; it can come from illness, dehydration, thyroid problems, anemia or heart-rhythm problems.'],
        todo: ['Mention it to your doctor, especially with dizziness, palpitations or shortness of breath.'], strength: STRENGTH.guideline, sources: ['ahaRhr'] });
      else if (rhr >= 80) findings.push({ id: 'w-rhr', level: 'change', title: 'Resting heart rate on the high side (' + rhr + ' bpm)',
        because: ['Normal is 60–100, but in large studies each 10 bpm higher resting rate was linked to about 9% higher risk of death from any cause.'],
        todo: ['Regular aerobic exercise, better sleep and less alcohol all lower resting heart rate over weeks to months.'], strength: STRENGTH.moderate, sources: ['ahaRhr', 'rhrMeta'] });
      else good.push({ text: 'Resting heart rate ' + rhr + ' bpm', source: 'ahaRhr' });
    }
    if (hrv !== null && base !== null && base > 0 && hrv < base * 0.8) findings.push({ id: 'w-hrv', level: 'change', title: 'HRV is ' + Math.round((1 - hrv / base) * 100) + '% below your usual',
      because: ['HRV varies hugely between people, so it only means something compared with your own baseline. A sustained drop often follows poor sleep, stress, alcohol, illness or overtraining.'],
      todo: ['Prioritise sleep, ease off hard training for a few days, skip alcohol, and watch whether it recovers.'], strength: STRENGTH.device, sources: ['hrvReview'] });
    if (rec !== null && rec < 50) findings.push({ id: 'w-recovery', level: 'change', title: 'Readiness / recovery usually low (' + rec + ')',
      because: ['These are proprietary device scores built from HRV, resting heart rate, sleep and temperature. They\'re useful for spotting strain, not for diagnosis.'],
      todo: ['Treat low-recovery days as easier days; look for the pattern (late meals, alcohol, short sleep, stress).'], strength: STRENGTH.device, sources: ['hrvReview'] });
    if (spo2 !== null && spo2 < 92) findings.push({ id: 'w-spo2', level: 'doctor', title: 'Night-time blood oxygen averages ' + spo2 + '%',
      because: ['A low night-time average can be a sign of sleep apnea or lung problems. Finger and ring sensors are less accurate than medical oximeters, especially on darker skin.'],
      todo: ['Mention it to your doctor and ask whether a sleep study is worthwhile — particularly if you snore or wake unrefreshed.'], strength: STRENGTH.device, sources: ['fdaOximeter'] });
    var highStress = w.stress === 'high' || (stress !== null && stress >= 50);
    if (highStress) findings.push({ id: 'w-stress', level: 'change', title: 'Stress is high most days',
      because: ['Long-running stress raises blood pressure, disrupts sleep and drives cravings for sugary, salty food.'],
      todo: ['Regular exercise, consistent sleep and short daily relaxation (breathing, walks, mindfulness) have good evidence.', 'If it\'s affecting daily life, talk to a doctor or counselor — the mood questions are a good starting point.'],
      strength: STRENGTH.moderate, sources: ['apaStress'] });
    return { findings: findings, good: good };
  }


  // ------------------------------------------------------- report reading
  // Pulls results out of text copied from a patient portal or a lab PDF.
  // Each test has name patterns, lines to skip, and a plausible range so a
  // reference range or a date is never mistaken for the result.

  var REPORT = {
    a1c: { re: /(hemoglobin a1c|hb ?a1c|\ba1c\b|glycated h(a)?emoglobin|glycohemoglobin)/i, skip: /estimated average|eag/i, range: [3, 20] },
    glucose: { re: /(glucose|blood sugar)/i, skip: /average|tolerance|urine|eag|hour|ogtt/i, range: [30, 700] },
    tc: { re: /(total cholesterol|cholesterol,? total|^\s*cholesterol\b)/i, skip: /ratio|hdl|ldl|non-?hdl|vldl/i, range: [50, 700] },
    ldl: { re: /(\bldl\b|low[- ]density)/i, skip: /ratio|particle|vldl|non-?hdl|ldl[- ]?p\b|size/i, range: [5, 600] },
    hdl: { re: /(\bhdl\b|high[- ]density)/i, skip: /ratio|non-?hdl|particle|ldl/i, range: [5, 200] },
    tg: { re: /triglyceride/i, skip: /ratio/i, range: [10, 6000] },
    egfr: { re: /(\begfr\b|glomerular filtration)/i, skip: /african|non-?black(?! ).*\bblack\b/i, range: [1, 200] },
    alt: { re: /(\balt\b|\bsgpt\b|alanine amino ?transferase)/i, skip: /alk|alkaline/i, range: [1, 3000] },
    potassium: { re: /potassium/i, skip: /urine/i, range: [1.5, 9] },
    hgb: { re: /(h(a)?emoglobin|\bhgb\b|\bhb\b)/i, skip: /a1c|glyc|corpuscular|\bmch|urine|eag/i, range: [3, 25] },
    ferritin: { re: /ferritin/i, skip: null, range: [1, 5000] },
    tsh: { re: /(\btsh\b|thyroid[- ]stimulating)/i, skip: /reflex to/i, range: [0.001, 200] },
    vitd: { re: /(vitamin d|25[- ]?(oh|hydroxy))/i, skip: /1,25|dihydroxy/i, range: [2, 200] },
    b12: { re: /(\bb[- ]?12\b|cobalamin)/i, skip: /folate only/i, range: [50, 5000] },
    uric: { re: /(uric acid|\burate\b)/i, skip: /urine/i, range: [0.5, 20] }
  };

  var MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

  function findDate(text) {
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var pick = function (m) {
      if (!m) return null;
      var y, mo, d;
      if (m[1].length === 4) { y = +m[1]; mo = +m[2]; d = +m[3]; } else { mo = +m[1]; d = +m[2]; y = +m[3]; if (y < 100) y += 2000; }
      if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return null;
      return y + '-' + pad(mo) + '-' + pad(d);
    };
    var nums = /(\d{4})-(\d{1,2})-(\d{1,2})|(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
    var words = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.? (\d{1,2}),? (\d{4})/i;
    var asDate = function (line) {
      var m = line.match(nums);
      if (m) return pick(m[1] ? [m[0], m[1], m[2], m[3]] : [m[0], m[4], m[5], m[6]]);
      var w = line.match(words);
      return w ? w[3] + '-' + pad(MONTHS[w[1].toLowerCase()]) + '-' + pad(+w[2]) : null;
    };
    var lines = String(text).split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      if (/collect|drawn|specimen|result(ed)? date|date of service|test date/i.test(lines[i])) {
        var d = asDate(lines[i]) || (lines[i + 1] && asDate(lines[i + 1]));
        if (d) return d;
      }
    }
    for (var j = 0; j < lines.length; j++) { var any = asDate(lines[j]); if (any) return any; }
    return null;
  }

  // First plausible number after the test name on this line, or on the next
  // two lines when the portal puts the value below the name.
  function valueAfter(rest, nextLines, def, spec) {
    var candidates = [rest].concat(nextLines);
    for (var i = 0; i < candidates.length; i++) {
      var t = String(candidates[i] || '')
        .replace(/25[\s-]*(oh|hydroxy)\b,?\s*(d[23]?\b)?/ig, ' ')
        .replace(/\bb[- ]?12\b|\ba1c\b|\bd[23]\b/ig, ' ')
        .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}:\d{2}/g, ' ');
      if (i > 0 && /[a-z]{4,}/i.test(t.split(/\d/)[0])) return null; // next line is another test
      var m = t.match(/(^|[^\d.\-])([<>]?)\s*(\d+(?:\.\d+)?)/);
      if (!m) continue;
      var v = Number(m[3]);
      var after = t.slice(t.indexOf(m[0]) + m[0].length, t.indexOf(m[0]) + m[0].length + 14);
      // Convert SI units when the line says so.
      var unitText = after + ' ' + t + ' ' + (candidates[i + 1] || '');
      var dp = def.step ? 100 : 1;
      if (def.si && new RegExp(def.si.unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(unitText)) v = Math.round(v / def.si.factor * dp) / dp;
      else if (def.id === 'a1c' && /mmol\/mol/i.test(t)) v = Math.round((v * 0.0915 + 2.15) * 10) / 10;
      if (v < spec.range[0] || v > spec.range[1]) return null;
      return v;
    }
    return null;
  }

  function parseReport(text) {
    var lines = String(text || '').replace(/\t/g, '  ').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    var values = {}, found = [];
    LABS.forEach(function (def) {
      var spec = REPORT[def.id];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var m = line.match(spec.re);
        if (!m || (spec.skip && spec.skip.test(line))) continue;
        var v = valueAfter(line.slice(m.index + m[0].length), lines.slice(i + 1, i + 3), def, spec);
        if (v === null) continue;
        values[def.id] = v;
        found.push({ id: def.id, label: def.label, value: v, unit: def.unit, line: line });
        break;
      }
    });
    return { values: values, found: found, date: findDate(text) };
  }

  var Labs = {
    SOURCES: SOURCES, LABS: LABS, DEVICES: DEVICES, WEARABLE_FIELDS: WEARABLE_FIELDS, STRESS: STRESS,
    labDef: labDef, latestLabs: latestLabs, interpret: interpret, analyzeLabs: analyzeLabs,
    parseCSV: parseCSV, importWearableCSV: importWearableCSV, analyzeWearable: analyzeWearable, parseReport: parseReport, findDate: findDate
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Labs;
  else root.FHLabs = Labs;
})(this);
