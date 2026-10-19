/*
 * Family Health Guide — engine.
 *
 * Pure functions: profile in, guide out. No DOM, no storage, so the same code
 * can run in the browser, in Node tests, or later inside a mobile app.
 */
(function (root) {
  'use strict';

  var KB = (typeof module !== 'undefined' && module.exports) ? require('./knowledge.js') : root.FHKnowledge;

  var DAY_MS = 24 * 60 * 60 * 1000;
  var MEALS = ['breakfast', 'lunch', 'dinner'];
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var SEVERITY_RANK = { mild: 1, moderate: 2, severe: 3 };

  // ------------------------------------------------------------------ dates

  function parseDate(s) {
    if (!s) return null;
    var p = String(s).split('-');
    if (p.length !== 3) return null;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  function isoDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function ageYears(birthdate, today) {
    var b = parseDate(birthdate);
    if (!b) return null;
    var age = today.getFullYear() - b.getFullYear();
    if (today.getMonth() < b.getMonth() || (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) age--;
    return Math.max(0, age);
  }

  function ageMonths(birthdate, today) {
    var b = parseDate(birthdate);
    if (!b) return null;
    var m = (today.getFullYear() - b.getFullYear()) * 12 + today.getMonth() - b.getMonth();
    if (today.getDate() < b.getDate()) m--;
    return Math.max(0, m);
  }

  function ageBand(age) {
    if (age === null) return null;
    for (var i = 0; i < KB.AGE_BANDS.length; i++) if (age < KB.AGE_BANDS[i].maxAge) return KB.AGE_BANDS[i];
    return KB.AGE_BANDS[KB.AGE_BANDS.length - 1];
  }

  // Monday of the week containing `d`.
  function weekStart(d) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var dow = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - dow);
    return x;
  }

  // ---------------------------------------------------------------- helpers

  function list(v) { return Array.isArray(v) ? v : []; }

  function norm(s) { return String(s || '').toLowerCase().trim(); }

  function stem(s) { return norm(s).replace(/(es|s)$/, ''); }

  function ingredientMatches(ingredient, term) {
    var i = norm(ingredient), t = stem(term);
    return t.length > 1 && (i.indexOf(t) !== -1);
  }

  // Adds `reason` to a Map-like object of key -> [reasons].
  function addReason(map, key, reason) {
    if (!map[key]) map[key] = [];
    if (map[key].indexOf(reason) === -1) map[key].push(reason);
  }

  // Merge list entries with the same text, keeping all reasons.
  function addItem(listObj, text, reason, extra) {
    var k = norm(text);
    if (!listObj.index[k]) {
      listObj.index[k] = { text: text, why: [] };
      if (extra) for (var e in extra) listObj.index[k][e] = extra[e];
      listObj.items.push(listObj.index[k]);
    }
    if (reason && listObj.index[k].why.indexOf(reason) === -1) listObj.index[k].why.push(reason);
    return listObj.index[k];
  }

  function newList() { return { items: [], index: {} }; }

  function latest(member, field) {
    var log = list(member.log).filter(function (e) { return e[field] !== undefined && e[field] !== null && e[field] !== ''; });
    log.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    return log.length ? { value: Number(log[0][field]), date: log[0].date, entry: log[0] } : null;
  }

  function currentWeightKg(member) {
    var l = latest(member, 'weightKg');
    return l ? l.value : (member.weightKg ? Number(member.weightKg) : null);
  }

  function round(n, step) { return Math.round(n / step) * step; }

  function allergyEntries(member) {
    var out = [];
    var a = member.allergies || {};
    Object.keys(a).forEach(function (k) {
      if (a[k] && KB.ALLERGENS[k]) out.push({ key: k, name: KB.ALLERGENS[k].label, severity: a[k] });
    });
    list(member.otherAllergies).forEach(function (o) {
      if (o && o.name) out.push({ key: null, name: o.name, severity: o.severity || 'moderate' });
    });
    return out;
  }

  function matchMedications(meds) {
    return list(meds).filter(function (m) { return norm(m); }).map(function (m) {
      var n = norm(m);
      var hits = KB.MEDICATIONS.filter(function (rule) {
        return rule.match.some(function (word) {
          // Short suffix patterns ("pril", "sartan") match word endings only.
          if (word.length <= 6 && (word === 'pril' || word === 'sartan')) return new RegExp('[a-z]' + word + '\\b').test(n);
          return n.indexOf(word) !== -1;
        });
      });
      return { name: m, rules: hits };
    });
  }

  // -------------------------------------------------------------- the rules
  // Collects every hard block and soft caution for one person, with reasons.

  function profileRules(member, today) {
    var age = ageYears(member.birthdate, today);
    var band = ageBand(age);
    var block = {}, caution = {};
    var who = member.name || 'This person';

    allergyEntries(member).forEach(function (a) {
      if (a.key) addReason(block, a.key, a.name + ' allergy' + (a.severity ? ' (' + a.severity + ')' : ''));
    });
    list(member.intolerances).forEach(function (k) {
      var it = KB.INTOLERANCES[k];
      if (it) list(it.caution).forEach(function (t) { addReason(caution, t, it.label); });
    });
    list(member.conditions).forEach(function (k) {
      var c = KB.CONDITIONS[k];
      if (!c) return;
      list(c.block).forEach(function (t) { addReason(block, t, c.label); });
      list(c.caution).forEach(function (t) { addReason(caution, t, c.label); });
    });
    var diet = KB.DIETS[member.diet] || KB.DIETS.omnivore;
    list(diet.block).forEach(function (t) { addReason(block, t, diet.label + ' diet'); });
    list(diet.caution).forEach(function (t) { addReason(caution, t, diet.label + ' diet'); });
    list(member.dietRules).forEach(function (k) {
      var r = KB.DIET_RULES[k];
      if (r) list(r.block).forEach(function (t) { addReason(block, t, r.label); });
    });
    matchMedications(member.medications).forEach(function (m) {
      m.rules.forEach(function (r) { list(r.block).forEach(function (t) { addReason(block, t, m.name + ' (' + r.label + ')'); }); });
    });
    if (band) {
      list(band.block).forEach(function (t) { addReason(block, t, band.label); });
      list(band.caution).forEach(function (t) { addReason(caution, t, band.label); });
    }
    // Anything that's blocked doesn't also need a caution.
    Object.keys(block).forEach(function (t) { delete caution[t]; });

    return {
      who: who,
      age: age,
      band: band,
      block: block,
      caution: caution,
      avoidIngredients: list(member.avoidFoods).filter(Boolean),
      dislikes: list(member.dislikes).filter(Boolean)
    };
  }

  // ---------------------------------------------------------------- targets

  function proteinRDA(age, sex) {
    if (age < 1) return null;
    if (age < 4) return 13;
    if (age < 9) return 19;
    if (age < 14) return 34;
    if (age < 19) return sex === 'male' ? 52 : 46;
    return null;
  }

  function calciumMg(age, sex) {
    if (age < 1) return null;
    if (age < 4) return 700;
    if (age < 9) return 1000;
    if (age < 19) return 1300;
    if (age < 51) return 1000;
    if (age < 71) return sex === 'male' ? 1000 : 1200;
    return 1200;
  }

  function ironMg(age, sex, pregnant) {
    if (age < 1) return null;
    if (pregnant) return 27;
    if (age < 4) return 7;
    if (age < 9) return 10;
    if (age < 14) return 8;
    if (age < 19) return sex === 'male' ? 11 : 15;
    if (age < 51) return sex === 'male' ? 8 : 18;
    return 8;
  }

  function sodiumMg(age) {
    if (age < 1) return null;
    if (age < 4) return 1200;
    if (age < 9) return 1500;
    if (age < 14) return 1800;
    return 2300;
  }

  function fluidsCups(age, sex) {
    if (age < 1) return null;
    if (age < 4) return '4';
    if (age < 9) return '5';
    if (age < 14) return '7–8';
    if (age < 19) return sex === 'male' ? '11' : '8';
    return sex === 'male' ? '13' : (sex === 'female' ? '9' : '9–13');
  }

  function targets(member, rules, today) {
    var age = rules.age;
    if (age === null) return { missing: 'Add a birth date to calculate daily targets.' };
    var sex = member.sex;
    var conds = list(member.conditions);
    var has = function (c) { return conds.indexOf(c) !== -1; };
    var pregnant = has('pregnancy');
    var act = KB.ACTIVITY[member.activity] || KB.ACTIVITY.light;
    var goal = KB.GOALS[member.goal] || KB.GOALS.maintain;
    var weight = currentWeightKg(member);
    var height = member.heightCm ? Number(member.heightCm) : null;
    var t = { notes: [] };

    // Calories
    if (member.calorieOverride) {
      t.kcal = Number(member.calorieOverride);
      t.kcalSource = 'Set manually';
    } else if (age < 2) {
      t.kcal = null;
      t.notes.push('Under 2: follow the pediatrician\'s feeding plan rather than a calorie number.');
    } else if (age <= 18) {
      var row = (KB.KID_CALORIES[sex === 'male' ? 'male' : 'female'] || {})[age];
      if (row) {
        t.kcal = row[act.kid];
        t.kcalSource = 'Dietary Guidelines estimate for age ' + age;
      }
      if (goal.kcal) t.notes.push('Kids\' weight goals are best handled with the pediatrician — the calorie estimate isn\'t reduced.');
    } else if (weight && height) {
      var base = 10 * weight + 6.25 * height - 5 * age;
      var bmr = sex === 'male' ? base + 5 : sex === 'female' ? base - 161 : base - 78;
      var kcal = bmr * act.factor + goal.kcal;
      if (goal.kcal < 0) kcal = Math.max(kcal, sex === 'male' ? 1500 : 1200);
      t.kcal = round(kcal, 50);
      t.kcalSource = 'Mifflin-St Jeor × ' + act.label.toLowerCase() + (goal.kcal ? ', ' + goal.label.toLowerCase() : '');
    } else {
      t.kcal = null;
      t.notes.push('Add height and weight to estimate calories.');
    }
    if (pregnant) t.notes.push('Pregnancy: add ~340 kcal/day in the 2nd trimester and ~450 in the 3rd.');
    if (has('breastfeeding')) t.notes.push('Breastfeeding: add ~330–400 kcal/day.');

    // Protein
    if (age >= 19 && weight) {
      var lo = 0.8, hi = 0.8;
      if (age >= 65) { lo = 1.0; hi = 1.2; }
      if (member.goal === 'gain') { lo = 1.2; hi = 1.6; }
      if (pregnant) { lo = Math.max(lo, 1.1); hi = Math.max(hi, 1.1); }
      t.protein = lo === hi ? Math.round(weight * lo) + ' g' : Math.round(weight * lo) + '–' + Math.round(weight * hi) + ' g';
      if (has('ckd')) t.protein += ' (CKD: amount set by care team)';
    } else if (age < 19) {
      var p = proteinRDA(age, sex);
      if (p) t.protein = p + ' g';
    }

    if (t.kcal) {
      t.fiber = Math.round(t.kcal / 1000 * 14) + ' g';
      t.addedSugar = age < 2 ? 'None' : 'under ' + Math.round(t.kcal * 0.10 / 4) + ' g';
      var satPct = (has('cholesterol') || has('heart')) ? 0.06 : 0.10;
      t.satFat = 'under ' + Math.round(t.kcal * satPct / 9) + ' g';
    }
    var na = sodiumMg(age);
    if (na) {
      if (has('hypertension') || has('heart') || has('ckd')) na = Math.min(na, 1500);
      t.sodium = 'under ' + na.toLocaleString('en-US') + ' mg';
    }
    var ca = calciumMg(age, sex);
    if (ca) t.calcium = ca.toLocaleString('en-US') + ' mg';
    var fe = ironMg(age, sex, pregnant);
    if (fe) {
      if (member.diet === 'vegetarian' || member.diet === 'vegan') fe = Math.round(fe * 1.8);
      t.iron = fe + ' mg' + ((member.diet === 'vegetarian' || member.diet === 'vegan') ? ' (plant-based ×1.8)' : '');
    }
    var cups = fluidsCups(age, sex);
    if (cups) t.fluids = cups + ' cups';
    if (has('heart')) t.notes.push('Heart failure: the care team may set a fluid limit — it overrides the fluids guide.');
    if (has('ckd')) t.notes.push('Kidney disease: fluid, potassium and phosphorus limits come from the care team.');
    return t;
  }

  // ------------------------------------------------------------------ guide

  function buildGuide(member, today) {
    today = today || new Date();
    var rules = profileRules(member, today);
    var age = rules.age;
    var band = rules.band;
    var avoid = newList(), limit = newList(), emphasize = newList();
    var conditionNotes = [], supplements = newList(), alerts = [], labelWords = [], dietTips = [];

    // Allergies
    var allergies = allergyEntries(member);
    allergies.forEach(function (a) {
      var why = a.name + ' allergy';
      if (a.key) {
        var info = KB.ALLERGENS[a.key];
        info.avoid.forEach(function (f) { addItem(avoid, f, why); });
        labelWords.push({ label: info.label, words: info.labelWords, severity: a.severity });
      } else {
        addItem(avoid, a.name, why);
      }
    });
    var severe = allergies.filter(function (a) { return a.severity === 'severe'; });
    if (severe.length) {
      alerts.push({ level: 'danger', text: 'Severe allergy: ' + severe.map(function (a) { return a.name; }).join(', ') + '. Keep epinephrine auto-injectors (if prescribed) on hand and make sure caregivers know the emergency plan.' });
    }

    // Intolerances
    list(member.intolerances).forEach(function (k) {
      var it = KB.INTOLERANCES[k];
      if (!it) return;
      it.limit.forEach(function (f) { addItem(limit, f, it.label); });
      it.emphasize.forEach(function (e) { addItem(emphasize, e.text, it.label, { tag: e.tag }); });
      conditionNotes.push({ title: it.label, tips: it.tips });
    });

    // Conditions
    list(member.conditions).forEach(function (k) {
      var c = KB.CONDITIONS[k];
      if (!c) return;
      c.avoid.forEach(function (f) { addItem(avoid, f, c.label); });
      c.limit.forEach(function (f) { addItem(limit, f, c.label); });
      c.emphasize.forEach(function (e) { addItem(emphasize, e.text, c.label, { tag: e.tag }); });
      conditionNotes.push({ title: c.label, tips: c.tips });
    });
    list(member.otherConditions).forEach(function (oc) {
      if (oc) conditionNotes.push({ title: oc, tips: ['No built-in rules for this condition — add your doctor\'s guidance in "Must avoid" or Notes.'] });
    });

    // Diet & religious rules
    var diet = KB.DIETS[member.diet] || KB.DIETS.omnivore;
    if (member.diet && member.diet !== 'omnivore') {
      list(diet.emphasize).forEach(function (e) { addItem(emphasize, e.text, diet.label + ' diet', { tag: e.tag }); });
      list(diet.supplements).forEach(function (s) { addItem(supplements, s, diet.label + ' diet'); });
      if (diet.tips.length) dietTips.push({ title: diet.label + ' diet', tips: diet.tips });
    }
    list(member.dietRules).forEach(function (k) {
      var r = KB.DIET_RULES[k];
      if (r && r.tips.length) dietTips.push({ title: r.label, tips: r.tips });
    });

    // Medications
    var meds = matchMedications(member.medications);
    meds.forEach(function (m) {
      m.rules.forEach(function (r) {
        list(r.avoidFoods).forEach(function (f) { addItem(avoid, f, m.name); });
        if (r.block && r.block.indexOf('grapefruit') !== -1) addItem(avoid, 'Grapefruit, grapefruit juice, pomelo & Seville orange', m.name);
        if (r.block && r.block.indexOf('alcohol') !== -1) addItem(avoid, 'Alcohol', m.name);
      });
    });

    // Life stage
    if (band) band.avoid.forEach(function (f) { addItem(avoid, f, band.label); });
    if (age !== null && age >= 19 && age < 51 && member.sex === 'female' && list(member.conditions).indexOf('pregnancy') === -1) {
      addItem(supplements, 'Folic acid 400 mcg/day if pregnancy is possible', 'Women of reproductive age');
    }
    if (age !== null && age >= 51) addItem(supplements, 'Vitamin B12 from fortified foods or a supplement', band.label);
    if (age !== null && age >= 65) addItem(supplements, 'Vitamin D — ask about a daily supplement', band.label);
    if (age !== null && age < 1) addItem(supplements, 'Vitamin D drops for breastfed infants (ask the pediatrician)', band.label);
    if (list(member.conditions).indexOf('pregnancy') !== -1) addItem(supplements, 'Prenatal vitamin with folic acid, iron & iodine', 'Pregnancy');

    // Custom rules typed by the family
    list(member.avoidFoods).forEach(function (f) { if (f) addItem(avoid, f, 'Added by family'); });
    list(member.limitFoods).forEach(function (f) { if (f) addItem(limit, f, 'Added by family'); });
    list(member.favoriteFoods).forEach(function (f) { if (f) addItem(emphasize, f, 'Favorite', { favorite: true }); });

    // Emphasised foods that clash with this person's own restrictions.
    emphasize.items.forEach(function (e) {
      if (!e.tag) return;
      // A rule doesn't conflict with its own advice (lactose intolerance → lactose-free milk).
      var others = (rules.caution[e.tag] || []).filter(function (r) { return e.why.indexOf(r) === -1; });
      if (rules.block[e.tag]) e.conflict = 'Not for ' + rules.who + ': ' + rules.block[e.tag].join(', ');
      else if (others.length) e.conflict = 'Check with the care team — also limited for ' + others.join(', ');
    });
    var clashes = emphasize.items.filter(function (e) { return e.conflict && e.conflict.indexOf('Check') === 0; });
    clashes.forEach(function (e) {
      alerts.push({ level: 'warn', text: 'Conflicting advice: "' + e.text + '" is recommended for ' + e.why.join(', ') + ' but limited for another condition. Ask the doctor or dietitian which comes first.' });
    });
    // Remove items from "limit" that are already a full "avoid".
    limit.items = limit.items.filter(function (l) { return !avoid.index[norm(l.text)]; });

    // Measurements → alerts
    var bmi = null, weight = currentWeightKg(member);
    if (age !== null && age >= 20 && weight && member.heightCm) {
      var h = Number(member.heightCm) / 100;
      bmi = Math.round(weight / (h * h) * 10) / 10;
    }
    var sys = latest(member, 'bpSys'), dia = latest(member, 'bpDia');
    if (sys && dia) {
      if (sys.value >= 180 || dia.value >= 120) alerts.push({ level: 'danger', text: 'Last blood pressure ' + sys.value + '/' + dia.value + ' (' + sys.date + ') is in the crisis range. If it is still this high, seek care right away.' });
      else if ((sys.value >= 130 || dia.value >= 80) && list(member.conditions).indexOf('hypertension') === -1) alerts.push({ level: 'warn', text: 'Last blood pressure ' + sys.value + '/' + dia.value + ' is above 130/80. Worth mentioning to the doctor; consider adding "High blood pressure" if diagnosed.' });
    }
    var a1c = latest(member, 'a1c');
    if (a1c) {
      var diab = list(member.conditions).some(function (c) { return c === 'diabetes1' || c === 'diabetes2'; });
      if (!diab && a1c.value >= 6.5) alerts.push({ level: 'warn', text: 'Last A1C ' + a1c.value + '% is in the diabetes range (6.5%+). Discuss with the doctor.' });
      else if (!diab && a1c.value >= 5.7 && list(member.conditions).indexOf('prediabetes') === -1) alerts.push({ level: 'info', text: 'Last A1C ' + a1c.value + '% is in the prediabetes range (5.7–6.4%).' });
    }
    var ldl = latest(member, 'ldl');
    if (ldl && ldl.value >= 160 && list(member.conditions).indexOf('cholesterol') === -1) {
      alerts.push({ level: 'warn', text: 'Last LDL ' + ldl.value + ' mg/dL is high (160+). Discuss with the doctor; consider adding "High cholesterol".' });
    }

    // Unrecognised medications
    var unknownMeds = meds.filter(function (m) { return !m.rules.length; }).map(function (m) { return m.name; });

    // Self-updating reminders
    var reviewed = parseDate(member.reviewedAt);
    if (!reviewed || (today - reviewed) / DAY_MS > 182) {
      alerts.push({ level: 'info', text: reviewed ? 'Profile last reviewed ' + member.reviewedAt + ' — over 6 months ago. Check allergies, medications and conditions are still current.' : 'This profile has not been marked as reviewed yet.' , action: 'review' });
    }
    var hasChronic = list(member.conditions).some(function (c) { return KB.CONDITIONS[c] && KB.CONDITIONS[c].group !== 'Life stage'; });
    var lastLog = list(member.log).map(function (e) { return e.date; }).sort().pop();
    if (hasChronic && (!lastLog || (today - parseDate(lastLog)) / DAY_MS > 365)) {
      alerts.push({ level: 'info', text: lastLog ? 'No measurements logged since ' + lastLog + '. Add recent labs or readings so the guide stays current.' : 'Log blood pressure, weight or lab results to get alerts when numbers change.' });
    }
    var nextBand = nextBandChange(member, today);
    if (nextBand && nextBand.days <= 45) {
      alerts.push({ level: 'info', text: 'On ' + nextBand.date + ' this guide will update automatically to "' + nextBand.band.label + '" guidance.' });
    }

    return {
      member: member,
      today: isoDate(today),
      age: age,
      ageMonths: age !== null && age < 2 ? ageMonths(member.birthdate, today) : null,
      band: band,
      bmi: bmi,
      weightKg: weight,
      alerts: alerts,
      targets: targets(member, rules, today),
      avoid: avoid.items,
      limit: limit.items,
      emphasize: emphasize.items,
      supplements: supplements.items,
      medications: meds,
      unknownMeds: unknownMeds,
      conditionNotes: conditionNotes,
      dietTips: dietTips,
      lifeStageTips: band ? band.tips : [],
      labelWords: labelWords,
      allergies: allergies,
      rules: rules
    };
  }

  function nextBandChange(member, today) {
    var b = parseDate(member.birthdate);
    var age = ageYears(member.birthdate, today);
    if (!b || age === null) return null;
    var band = ageBand(age);
    var target = band.maxAge;
    if (target >= 200) return null;
    var d = new Date(b.getFullYear() + target, b.getMonth(), b.getDate());
    return { date: isoDate(d), days: Math.ceil((d - today) / DAY_MS), band: ageBand(target) };
  }

  // ----------------------------------------------------------- meal planner

  function recipeTags(recipe) {
    var tags = list(recipe.tags).slice();
    if (tags.indexOf('wheat') !== -1 && tags.indexOf('gluten') === -1) tags.push('gluten');
    var hasMeat = tags.indexOf('meat') !== -1 || tags.indexOf('poultry') !== -1 || tags.indexOf('pork') !== -1;
    if (hasMeat && tags.indexOf('milk') !== -1) tags.push('meat-with-dairy');
    return tags;
  }

  function swapRemoves(swap) {
    var r = list(swap.removes).slice();
    if (r.indexOf('wheat') !== -1 && r.indexOf('gluten') === -1) r.push('gluten');
    if (r.indexOf('milk') !== -1) r.push('meat-with-dairy');
    if (r.indexOf('meat') !== -1 || r.indexOf('poultry') !== -1 || r.indexOf('pork') !== -1) r.push('meat-with-dairy');
    return r;
  }

  // How one recipe works for one person: ok | caution | swap | no.
  function evaluateRecipe(recipe, rules) {
    var tags = recipeTags(recipe);
    var hard = tags.filter(function (t) { return rules.block[t]; });
    var soft = tags.filter(function (t) { return rules.caution[t]; });
    var ingredients = list(recipe.ingredients);
    var avoidHits = [], dislikeHits = [];
    rules.avoidIngredients.forEach(function (term) {
      ingredients.forEach(function (ing) { if (ingredientMatches(ing, term) && avoidHits.indexOf(ing) === -1) avoidHits.push(ing); });
    });
    rules.dislikes.forEach(function (term) {
      ingredients.forEach(function (ing) { if (ingredientMatches(ing, term) && dislikeHits.indexOf(ing) === -1) dislikeHits.push(ing); });
    });

    var remaining = hard.slice();
    var swaps = [];
    list(recipe.swaps).forEach(function (s) {
      var removes = swapRemoves(s);
      var helps = remaining.some(function (t) { return removes.indexOf(t) !== -1; });
      var safe = !list(s.adds).some(function (t) { return rules.block[t]; });
      if (helps && safe) {
        // Severe allergy: a per-plate swap risks cross-contact, so the whole dish changes.
        var severe = remaining.some(function (t) {
          return removes.indexOf(t) !== -1 && rules.block[t].some(function (why) { return /\(severe\)$/.test(why); });
        });
        swaps.push(severe ? 'Whole dish (severe allergy — avoid cross-contact): ' + s.text : s.text);
        remaining = remaining.filter(function (t) { return removes.indexOf(t) === -1; });
        soft = soft.filter(function (t) { return removes.indexOf(t) === -1; });
      }
    });
    // Optional swaps that ease a caution.
    var tips = [];
    list(recipe.swaps).forEach(function (s) {
      if (swaps.indexOf(s.text) !== -1) return;
      var removes = swapRemoves(s);
      var helps = soft.some(function (t) { return removes.indexOf(t) !== -1; });
      var safe = !list(s.adds).some(function (t) { return rules.block[t]; });
      if (helps && safe) tips.push(s.text);
    });

    var status;
    if (remaining.length || avoidHits.length) status = 'no';
    else if (swaps.length) status = 'swap';
    else if (soft.length || dislikeHits.length) status = 'caution';
    else status = 'ok';

    return {
      status: status,
      blockedBy: remaining.map(function (t) { return { tag: t, why: rules.block[t] }; }),
      avoidHits: avoidHits,
      swaps: swaps,
      cautions: soft.map(function (t) { return { tag: t, why: rules.caution[t] }; }),
      dislikes: dislikeHits,
      tips: tips
    };
  }

  // Small deterministic PRNG so a week's plan is stable until something changes.
  function seeded(seedStr) {
    var h = 2166136261;
    for (var i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var STATUS_WEIGHT = { ok: 1, caution: 0.45, swap: 0.6 };

  function familyFit(recipe, eaters) {
    var per = eaters.map(function (e) { return { member: e.member, result: evaluateRecipe(recipe, e.rules) }; });
    var noCount = per.filter(function (p) { return p.result.status === 'no'; }).length;
    var weight = per.reduce(function (w, p) {
      var severeSwap = p.result.swaps.some(function (s) { return s.indexOf('Whole dish') === 0; });
      return w * (STATUS_WEIGHT[p.result.status] || 0) * (severeSwap ? 0.3 : 1);
    }, 1);
    var worst = per.reduce(function (w, p) {
      var r = { ok: 0, caution: 1, swap: 2, no: 3 }[p.result.status];
      return Math.max(w, r);
    }, 0);
    return { recipe: recipe, per: per, noCount: noCount, weight: weight, worst: ['ok', 'caution', 'swap', 'no'][worst] };
  }

  /*
   * Builds a 7-day breakfast/lunch/dinner plan for the chosen eaters.
   * opts: { today, recipes, overrides: { 'dayIndex-meal': recipeId }, seed }
   */
  function buildPlan(members, opts) {
    opts = opts || {};
    var today = opts.today || new Date();
    var recipes = opts.recipes || KB.RECIPES;
    var overrides = opts.overrides || {};
    var ws = weekStart(today);
    var eaters = members.map(function (m) { return { member: m, rules: profileRules(m, today) }; });
    var rand = seeded(isoDate(ws) + '|' + (opts.seed || '') + '|' + members.map(function (m) { return m.id; }).join(','));
    var notices = [];

    var fits = {};
    recipes.forEach(function (r) { fits[r.id] = familyFit(r, eaters); });

    var days = DAYS.map(function (name, i) {
      var d = new Date(ws); d.setDate(ws.getDate() + i);
      return { name: name, date: isoDate(d), meals: {} };
    });

    MEALS.forEach(function (meal) {
      var pool = recipes.filter(function (r) { return r.meal === meal; }).map(function (r) { return fits[r.id]; });
      var safe = pool.filter(function (f) { return f.noCount === 0; });
      var used = {};

      days.forEach(function (day, i) {
        var key = i + '-' + meal;
        var chosen = null;

        if (overrides[key]) {
          var o = fits[overrides[key]];
          if (o && o.noCount === 0) chosen = o;
          else if (o) notices.push(day.name + ' ' + meal + ': "' + o.recipe.name + '" was replaced — it no longer works for ' + o.per.filter(function (p) { return p.result.status === 'no'; }).map(function (p) { return p.member.name; }).join(', ') + '.');
        }
        if (!chosen && safe.length) {
          var fresh = safe.filter(function (f) { return !used[f.recipe.id]; });
          var candidates = fresh.length ? fresh : safe;
          var total = candidates.reduce(function (s, f) { return s + f.weight; }, 0);
          var pick = rand() * total;
          for (var c = 0; c < candidates.length; c++) {
            pick -= candidates[c].weight;
            if (pick <= 0) { chosen = candidates[c]; break; }
          }
          if (!chosen) chosen = candidates[candidates.length - 1];
        }
        if (!chosen && pool.length) {
          // Nothing fits everyone: take the dish that leaves out the fewest people.
          chosen = pool.slice().sort(function (a, b) { return a.noCount - b.noCount || b.weight - a.weight; })[0];
        }
        if (chosen) used[chosen.recipe.id] = true;
        day.meals[meal] = chosen;
      });
    });

    var snacks = recipes.filter(function (r) { return r.meal === 'snack'; }).map(function (r) { return fits[r.id]; })
      .filter(function (f) { return f.noCount === 0; })
      .sort(function (a, b) { return b.weight - a.weight; });

    return { weekStart: isoDate(ws), days: days, snacks: snacks, eaters: eaters, notices: notices, fits: fits };
  }

  function groceryList(plan) {
    var counts = {};
    plan.days.forEach(function (d) {
      MEALS.forEach(function (m) {
        var f = d.meals[m];
        if (!f) return;
        list(f.recipe.ingredients).forEach(function (ing) {
          var k = stem(ing.replace(/^(soft|hard)-boiled /, ''));
          counts[k] = counts[k] || { name: ing, meals: 0 };
          counts[k].meals++;
        });
      });
    });
    return Object.keys(counts).sort().map(function (k) { return counts[k]; });
  }

  // Kitchen allergy matrix: which family members react to which allergen.
  function allergyMatrix(members) {
    var keys = Object.keys(KB.ALLERGENS);
    var rows = keys.map(function (k) {
      return {
        key: k,
        label: KB.ALLERGENS[k].label,
        cells: members.map(function (m) { return (m.allergies || {})[k] || ''; })
      };
    }).filter(function (r) { return r.cells.some(Boolean); });
    var other = {};
    members.forEach(function (m, i) {
      list(m.otherAllergies).forEach(function (o) {
        var k = norm(o.name);
        if (!other[k]) other[k] = { key: k, label: o.name, cells: members.map(function () { return ''; }) };
        other[k].cells[i] = o.severity || 'moderate';
      });
    });
    return rows.concat(Object.keys(other).map(function (k) { return other[k]; }));
  }

  var Engine = {
    MEALS: MEALS,
    DAYS: DAYS,
    SEVERITY_RANK: SEVERITY_RANK,
    parseDate: parseDate,
    isoDate: isoDate,
    ageYears: ageYears,
    ageMonths: ageMonths,
    ageBand: ageBand,
    weekStart: weekStart,
    profileRules: profileRules,
    matchMedications: matchMedications,
    buildGuide: buildGuide,
    evaluateRecipe: evaluateRecipe,
    recipeTags: recipeTags,
    buildPlan: buildPlan,
    groceryList: groceryList,
    allergyMatrix: allergyMatrix,
    allergyEntries: allergyEntries,
    currentWeightKg: currentWeightKg,
    nextBandChange: nextBandChange
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
  else root.FHEngine = Engine;
})(this);
