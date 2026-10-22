/*
 * Family Health Guide — user interface.
 * Plain JavaScript, no build step: open index.html in any browser.
 */
(function () {
  'use strict';

  var KB = window.FHKnowledge;
  var E = window.FHEngine;
  var Store = window.FHStore;
  var Q = window.FHQuestionnaire;
  var Foods = window.FHFoods;
  var Labs = window.FHLabs;
  var Docs = window.FHDocs;
  var Shop = window.FHShop;

  var state = Store.load();
  var app = document.getElementById('app');
  var AVATAR_COLORS = ['#2f7d5b', '#c0603a', '#3d6fb4', '#8a4fb0', '#b0842a', '#2a8a8a', '#b04a6e', '#5a6b2f'];
  var MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
  var STATUS_TEXT = { ok: 'Good to go', caution: 'OK — note', swap: 'Needs a swap', no: 'Can\'t eat' };
  var recipeFilter = 'all';

  // ---------------------------------------------------------------- helpers

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function today() { return new Date(); }

  function persist(message) {
    if (!Store.save(state)) toast('Could not save — this browser is blocking storage. Export a backup!');
    else if (message) toast(message);
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  function member(id) { return state.members.filter(function (m) { return m.id === id; })[0]; }

  function avatar(m, size) {
    var i = Math.max(0, state.members.indexOf(m));
    return '<span class="avatar ' + (size || '') + '" style="background:' + AVATAR_COLORS[i % AVATAR_COLORS.length] + '">' + esc((m.name || '?').charAt(0).toUpperCase()) + '</span>';
  }

  function ageText(g) {
    if (g.age === null) return 'Age unknown';
    if (g.ageMonths !== null && g.age < 2) return g.ageMonths + ' months';
    return g.age + ' yrs';
  }

  function splitList(s) {
    return String(s || '').split(/[,\n]/).map(function (x) { return x.trim(); }).filter(Boolean);
  }

  function splitLines(s) {
    return String(s || '').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean);
  }

  function recipes() { return KB.RECIPES.concat(state.customRecipes); }

  // Units
  function us() { return state.settings.units !== 'metric'; }
  function kgToLb(kg) { return Math.round(kg * 2.20462 * 10) / 10; }
  function lbToKg(lb) { return Math.round(lb / 2.20462 * 100) / 100; }
  function fmtWeight(kg) {
    if (kg === null || kg === undefined || kg === '') return '—';
    return us() ? kgToLb(kg) + ' lb' : Math.round(kg * 10) / 10 + ' kg';
  }
  function fmtHeight(cm) {
    if (!cm) return '—';
    if (!us()) return Math.round(cm) + ' cm';
    var inches = Math.round(cm / 2.54);
    return Math.floor(inches / 12) + '′ ' + (inches % 12) + '″';
  }

  function tagLabel(t) { return KB.TAG_LABELS[t] || t; }

  // ---------------------------------------------------------------- routing

  function route() {
    var parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    var tab = 'family';
    var html;
    if (parts[0] === 'plan') { tab = 'plan'; html = viewBuilder(); }
    else if (parts[0] === 'week') { tab = 'plan'; html = viewWeek(); }
    else if (parts[0] === 'shop') { tab = 'plan'; html = viewShop(parts[1]); }
    else if (parts[0] === 'recipes') { tab = 'recipes'; html = viewRecipes(); }
    else if (parts[0] === 'data') { tab = 'data'; html = viewData(); }
    else if (parts[0] === 'new') { html = viewQuickAdd(); }
    else if (parts[0] === 'member' && member(parts[1])) {
      var m = member(parts[1]);
      if (parts[2] === 'edit') html = viewEdit(m);
      else if (parts[2] === 'log') html = viewLog(m);
      else if (parts[2] === 'check') html = viewCheck(m, Number(parts[3]) || 0);
      else if (parts[2] === 'results') html = viewResults(m);
      else if (parts[2] === 'records') html = '<div class="spread" style="margin-bottom:12px"><h1>' + esc(m.name) + '\'s health records</h1><a class="btn" href="#/member/' + esc(m.id) + '">Back to guide</a></div><section class="card">' + recordsInput(m) + '</section>';
      else html = viewGuide(m);
    } else html = viewFamily();

    app.innerHTML = html;
    fillDocList();
    document.querySelectorAll('.tabs a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-tab') === tab); });
    window.scrollTo(0, 0);
  }

  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  // ----------------------------------------------------------------- family

  function viewFamily() {
    if (!state.members.length) {
      return '<section class="card empty">' +
        '<h1>Your family\'s health guide</h1>' +
        '<p class="muted">Add each person\'s allergies, health conditions, medications and food preferences. ' +
        'No medical knowledge needed: you answer everyday questions (sleep, energy, digestion, what happens after certain foods, family history) and the app scores them with the same screening tools doctors use, ' +
        'then builds a personal guide for everyone and a weekly meal plan the whole family can eat. It updates itself whenever something changes.</p>' +
        '<div class="row" style="justify-content:center;margin-top:20px">' +
        '<a class="btn primary" href="#/new">Add the first person</a>' +
        '<button class="btn" data-action="load-demo">Try a demo family</button>' +
        '</div></section>';
    }

    var guides = state.members.map(function (m) { return E.buildGuide(m, today()); });
    var cards = guides.map(function (g) {
      var m = g.member;
      var badges = g.allergies.map(function (a) {
        return '<span class="badge ' + (a.severity === 'severe' ? 'danger' : 'warn') + '">' + esc(a.name) + '</span>';
      });
      m.conditions.forEach(function (c) { if (KB.CONDITIONS[c]) badges.push('<span class="badge info">' + esc(KB.CONDITIONS[c].label) + '</span>'); });
      if (m.diet && m.diet !== 'omnivore') badges.push('<span class="badge ok">' + esc(KB.DIETS[m.diet].label) + '</span>');
      var urgent = g.alerts.filter(function (a) { return a.level !== 'info'; }).length;
      var prog = Q.progress(m, g.age);
      if (!prog.done) badges.push('<span class="badge">Health questions not started</span>');
      else if (prog.pct < 100) badges.push('<span class="badge">Health questions ' + prog.pct + '%</span>');
      return '<a class="card member-card" href="#/member/' + esc(m.id) + '">' + avatar(m) +
        '<div><h2 style="margin:0">' + esc(m.name) + '</h2>' +
        '<div class="muted small">' + esc([m.relation, ageText(g), g.band ? g.band.label : ''].filter(Boolean).join(' · ')) + '</div>' +
        '<div class="badges">' + badges.join('') + (urgent ? '<span class="badge danger">' + urgent + ' alert' + (urgent > 1 ? 's' : '') + '</span>' : '') + '</div>' +
        '</div></a>';
    }).join('');

    var attention = [];
    guides.forEach(function (g) {
      g.alerts.forEach(function (a) {
        if (a.level !== 'info') attention.push('<div class="alert ' + a.level + '"><div><strong>' + esc(g.member.name) + ':</strong> ' + esc(a.text) + '</div></div>');
      });
    });

    var matrix = E.allergyMatrix(state.members);
    var matrixHtml = matrix.length
      ? '<div class="table-wrap"><table class="matrix"><thead><tr><th>Allergen</th>' +
        state.members.map(function (m) { return '<th>' + esc(m.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        matrix.map(function (r) {
          return '<tr><td>' + esc(r.label) + '</td>' + r.cells.map(function (c) {
            return '<td>' + (c ? '<span class="badge ' + (c === 'severe' ? 'danger' : 'warn') + '">' + esc(c) + '</span>' : '<span class="muted">—</span>') + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>'
      : '<p class="muted">No food allergies recorded.</p>';

    return '<div class="spread" style="margin-bottom:16px"><h1>Family</h1><a class="btn primary" href="#/new">+ Add person</a></div>' +
      '<div class="grid grid-3">' + cards + '<a class="card add-card" href="#/new">+ Add family member</a></div>' +
      (attention.length ? '<section class="card" style="margin-top:16px"><h2>Needs attention</h2>' + attention.join('') + '</section>' : '') +
      '<section class="card" style="margin-top:16px"><h2>Kitchen allergy chart</h2>' +
      '<p class="muted small">Post this on the fridge. Everything with a "severe" allergy should be kept out of shared dishes entirely.</p>' + matrixHtml + '</section>';
  }

  // ------------------------------------------------------------------ guide

  function foodList(items, kind) {
    if (!items.length) return '<p class="muted small">Nothing specific.</p>';
    return '<ul class="food-list">' + items.map(function (i) {
      var why = i.conflict ? i.conflict : i.why.join(' · ');
      return '<li class="' + (i.conflict ? 'conflict' : '') + '"><span class="text">' + esc(i.text) + '</span><span class="why">' + esc(why) + '</span></li>';
    }).join('') + '</ul>';
  }

  function tipsBlock(title, tips) {
    if (!tips || !tips.length) return '';
    return '<div style="margin-bottom:12px"><h3>' + esc(title) + '</h3><ul>' + tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
  }

  function viewGuide(m) {
    var g = E.buildGuide(m, today());
    var t = g.targets;

    var alerts = g.alerts.map(function (a) {
      return '<div class="alert ' + a.level + '"><div>' + esc(a.text) + '</div>' +
        (a.action === 'review' ? '<button class="btn small no-print" data-action="mark-reviewed" data-id="' + esc(m.id) + '">Mark reviewed</button>' : '') + '</div>';
    }).join('');

    var targetRows = [
      ['Calories', t.kcal ? t.kcal.toLocaleString('en-US') + ' kcal' : '—'],
      ['Protein', t.protein], ['Fiber', t.fiber], ['Sodium', t.sodium], ['Added sugar', t.addedSugar],
      ['Saturated fat', t.satFat], ['Calcium', t.calcium], ['Iron', t.iron], ['Fluids', t.fluids]
    ].filter(function (r) { return r[1]; });
    var targetsHtml = t.missing ? '<p class="muted">' + esc(t.missing) + '</p>' :
      '<table class="targets"><tbody>' + targetRows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      (t.kcalSource ? '<p class="muted small" style="margin-top:8px">Calories: ' + esc(t.kcalSource) + '. Change in profile if your doctor gave you a number.</p>' : '') +
      t.notes.map(function (n) { return '<p class="small muted">' + esc(n) + '</p>'; }).join('');

    var stats = [];
    if (g.weightKg) stats.push('Weight ' + fmtWeight(g.weightKg));
    if (m.heightCm) stats.push('Height ' + fmtHeight(m.heightCm));
    if (g.bmi) stats.push('BMI ' + g.bmi);

    var meds = g.medications.filter(function (x) { return x.rules.length; }).map(function (x) {
      return '<div style="margin-bottom:12px"><h3>' + esc(x.name) + ' <span class="badge">' + esc(x.rules.map(function (r) { return r.label; }).join(', ')) + '</span></h3><ul>' +
        x.rules.reduce(function (all, r) { return all.concat(r.tips); }, []).map(function (tip) { return '<li>' + esc(tip) + '</li>'; }).join('') + '</ul></div>';
    }).join('');
    if (g.unknownMeds.length) meds += '<p class="small muted">No built-in food notes for: ' + esc(g.unknownMeds.join(', ')) + '. Ask the pharmacist about food timing and interactions.</p>';

    var severeAllergies = g.allergies.map(function (a) { return a.name + (a.severity ? ' (' + a.severity + ')' : ''); });
    var conditionNames = m.conditions.map(function (c) { return KB.CONDITIONS[c] ? KB.CONDITIONS[c].label : c; }).concat(m.otherConditions);
    var emergency = '<section class="card emergency"><h2>Emergency card</h2><dl>' +
      '<dt>Name</dt><dd>' + esc(m.name) + (m.birthdate ? ' · born ' + esc(m.birthdate) : '') + '</dd>' +
      '<dt>Blood type</dt><dd>' + esc(m.bloodType || 'Not recorded') + '</dd>' +
      '<dt>Allergies</dt><dd>' + esc(severeAllergies.join(', ') || 'None recorded') + '</dd>' +
      '<dt>Conditions</dt><dd>' + esc(conditionNames.join(', ') || 'None recorded') + '</dd>' +
      '<dt>Medications</dt><dd>' + esc(m.medications.join(', ') || 'None recorded') + '</dd>' +
      '<dt>Doctor</dt><dd>' + esc(m.doctor || '—') + '</dd>' +
      '<dt>Emergency contact</dt><dd>' + esc(m.emergencyContact || '—') + '</dd>' +
      '</dl></section>';

    var labels = g.labelWords.map(function (l) {
      return '<div style="margin-bottom:10px"><strong>' + esc(l.label) + '</strong><div class="words">' +
        l.words.map(function (w) { return '<span class="badge">' + esc(w) + '</span>'; }).join('') + '</div></div>';
    }).join('');

    var notes = tipsBlock('Life stage: ' + (g.band ? g.band.label : ''), g.lifeStageTips) +
      g.conditionNotes.map(function (c) { return tipsBlock(c.title, c.tips); }).join('') +
      g.dietTips.map(function (c) { return tipsBlock(c.title, c.tips); }).join('');

    return '<div class="stack">' +
      '<section class="card"><div class="guide-head">' + avatar(m, 'lg') +
      '<div class="meta"><h1 style="margin:0">' + esc(m.name) + '\'s guide</h1>' +
      '<div class="muted">' + esc([m.relation, ageText(g), g.band ? g.band.label : '', m.bloodType ? 'Blood ' + m.bloodType : ''].filter(Boolean).join(' · ')) + '</div>' +
      (stats.length ? '<div class="muted small">' + esc(stats.join(' · ')) + '</div>' : '') + '</div>' +
      '<div class="row no-print"><a class="btn primary" href="#/member/' + esc(m.id) + '/edit">Edit profile</a>' +
      '<a class="btn" href="#/member/' + esc(m.id) + '/log">Log readings</a>' +
      '<a class="btn" href="#/member/' + esc(m.id) + '/records">Records</a>' +
      '<button class="btn" data-action="print">Print</button></div></div></section>' +
      (alerts ? '<section>' + alerts + '</section>' : '') +
      healthCheckCard(m, g.age) +
      '<div class="grid grid-2"><section class="card"><h2>Daily targets</h2>' + targetsHtml + '</section>' + emergency + '</div>' +
      '<div class="grid grid-3">' +
      '<section class="card avoid"><h2>Avoid</h2>' + foodList(g.avoid) + '</section>' +
      '<section class="card limit"><h2>Limit</h2>' + foodList(g.limit) + '</section>' +
      '<section class="card more"><h2>Eat more of</h2>' + foodList(g.emphasize) + '</section></div>' +
      (meds ? '<section class="card"><h2>Medications &amp; food</h2>' + meds + '</section>' : '') +
      (notes ? '<section class="card"><h2>Notes for ' + esc(m.name) + '</h2>' + notes + '</section>' : '') +
      (g.supplements.length ? '<section class="card"><h2>Supplements to ask about</h2>' + foodList(g.supplements) + '</section>' : '') +
      (labels ? '<section class="card"><h2>Hidden names on food labels</h2><p class="muted small">These words on an ingredient list mean the allergen is inside.</p>' + labels + '</section>' : '') +
      (m.notes ? '<section class="card"><h2>Family notes</h2><p style="white-space:pre-wrap">' + esc(m.notes) + '</p></section>' : '') +
      '<p class="muted small">This guide rebuilds itself every time you open it from ' + esc(m.name) + '\'s profile, age and latest readings. ' +
      'Profile saved ' + esc((m.updatedAt || '').slice(0, 10) || '—') + ' · last reviewed ' + esc(m.reviewedAt || 'never') + '.</p>' +
      '</div>';
  }

  // ------------------------------------------------------------------- edit

  function opt(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (String(selected) === String(value) ? ' selected' : '') + '>' + esc(label) + '</option>';
  }

  function check(name, value, label, checked) {
    return '<label><input type="checkbox" name="' + esc(name) + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + '> ' + esc(label) + '</label>';
  }

  function viewEdit(m) {
    var isNew = !m;
    m = m || Store.normalizeMember({ id: '' });

    var heightFields;
    if (us()) {
      var inches = m.heightCm ? Math.round(m.heightCm / 2.54) : '';
      heightFields = '<div><label>Height <span class="hint">(ft / in)</span></label><div class="inline">' +
        '<input type="number" name="heightFt" min="0" max="8" placeholder="ft" value="' + (inches !== '' ? Math.floor(inches / 12) : '') + '">' +
        '<input type="number" name="heightIn" min="0" max="11" placeholder="in" value="' + (inches !== '' ? inches % 12 : '') + '"></div></div>' +
        '<div><label>Weight <span class="hint">(lb)</span></label><input type="number" step="0.1" name="weight" value="' + (m.weightKg ? kgToLb(m.weightKg) : '') + '"></div>';
    } else {
      heightFields = '<div><label>Height <span class="hint">(cm)</span></label><input type="number" name="heightCm" value="' + esc(m.heightCm || '') + '"></div>' +
        '<div><label>Weight <span class="hint">(kg)</span></label><input type="number" step="0.1" name="weight" value="' + esc(m.weightKg || '') + '"></div>';
    }

    var allergenGrid = Object.keys(KB.ALLERGENS).map(function (k) {
      var v = m.allergies[k] || '';
      return '<div><label>' + esc(KB.ALLERGENS[k].label) + '</label><select name="allergy-' + k + '">' +
        opt('', 'No allergy', v) + opt('mild', 'Mild', v) + opt('moderate', 'Moderate', v) + opt('severe', 'Severe', v) + '</select></div>';
    }).join('');

    var groups = {};
    Object.keys(KB.CONDITIONS).forEach(function (k) {
      var g = KB.CONDITIONS[k].group;
      (groups[g] = groups[g] || []).push(check('conditions', k, KB.CONDITIONS[k].label, m.conditions.indexOf(k) !== -1));
    });
    var conditionHtml = Object.keys(groups).map(function (g) {
      return '<div style="margin-bottom:10px"><div class="hint" style="margin-bottom:4px">' + esc(g) + '</div><div class="checks">' + groups[g].join('') + '</div></div>';
    }).join('');

    var otherAllergyText = m.otherAllergies.map(function (o) { return o.name + (o.severity ? ', ' + o.severity : ''); }).join('\n');

    return '<form id="member-form" data-id="' + esc(m.id) + '">' +
      '<div class="spread" style="margin-bottom:16px"><h1>' + (isNew ? 'Add a family member' : 'Edit ' + esc(m.name)) + '</h1>' +
      (!isNew ? '<a class="btn" href="#/member/' + esc(m.id) + '">Back to guide</a>' : '') + '</div>' +

      '<fieldset><legend>About</legend><div class="fields">' +
      '<div><label>Name *</label><input type="text" name="name" required value="' + esc(m.name) + '"></div>' +
      '<div><label>Relationship</label><input type="text" name="relation" placeholder="Mom, Son, Grandpa…" value="' + esc(m.relation) + '"></div>' +
      '<div><label>Birth date</label><input type="date" name="birthdate" value="' + esc(m.birthdate) + '"></div>' +
      '<div><label>Sex <span class="hint">(for nutrition formulas)</span></label><select name="sex">' + opt('', 'Prefer not to say', m.sex) + opt('female', 'Female', m.sex) + opt('male', 'Male', m.sex) + '</select></div>' +
      heightFields +
      '<div><label>Activity</label><select name="activity">' + Object.keys(KB.ACTIVITY).map(function (k) { return opt(k, KB.ACTIVITY[k].label, m.activity); }).join('') + '</select></div>' +
      '<div><label>Goal</label><select name="goal">' + Object.keys(KB.GOALS).map(function (k) { return opt(k, KB.GOALS[k].label, m.goal); }).join('') + '</select></div>' +
      '<div><label>Blood type</label><select name="bloodType">' + KB.BLOOD_TYPES.map(function (b) { return opt(b, b || 'Not recorded', m.bloodType); }).join('') + '</select></div>' +
      '</div><p class="hint" style="margin-top:10px">Blood type is kept for the emergency card. Research doesn\'t support "blood-type diets", so it doesn\'t change food advice.</p></fieldset>' +

      '<fieldset><legend>Food allergies</legend><p class="hint" style="margin-top:0">Choose "Severe" for anything that has caused anaphylaxis or needs an epinephrine auto-injector.</p><div class="allergen-grid">' + allergenGrid + '</div>' +
      '<div style="margin-top:14px"><label>Other allergies <span class="hint">— one per line, e.g. "Kiwi, mild" or "Strawberry, severe"</span></label>' +
      '<textarea name="otherAllergies">' + esc(otherAllergyText) + '</textarea></div>' +
      '<div style="margin-top:10px" class="checks">' + Object.keys(KB.INTOLERANCES).map(function (k) { return check('intolerances', k, KB.INTOLERANCES[k].label, m.intolerances.indexOf(k) !== -1); }).join('') + '</div></fieldset>' +

      '<fieldset><legend>Health conditions</legend>' + conditionHtml +
      '<label style="margin-top:8px">Other conditions <span class="hint">— one per line (shown on the emergency card)</span></label>' +
      '<textarea name="otherConditions">' + esc(m.otherConditions.join('\n')) + '</textarea></fieldset>' +

      '<fieldset><legend>Medications</legend>' +
      '<label>One per line <span class="hint">— brand or generic name; the guide adds food-timing and interaction notes it recognises</span></label>' +
      '<textarea name="medications" placeholder="Metformin 500 mg&#10;Lisinopril">' + esc(m.medications.join('\n')) + '</textarea></fieldset>' +

      '<fieldset><legend>Eating style &amp; preferences</legend><div class="fields">' +
      '<div><label>Diet</label><select name="diet">' + Object.keys(KB.DIETS).map(function (k) { return opt(k, KB.DIETS[k].label, m.diet); }).join('') + '</select></div>' +
      '<div><label>Calorie target override <span class="hint">(optional)</span></label><input type="number" name="calorieOverride" placeholder="e.g. 1800" value="' + esc(m.calorieOverride || '') + '"></div>' +
      '</div><div class="checks" style="margin-top:12px">' + Object.keys(KB.DIET_RULES).map(function (k) { return check('dietRules', k, KB.DIET_RULES[k].label, m.dietRules.indexOf(k) !== -1); }).join('') + '</div>' +
      '<div class="fields" style="margin-top:12px">' +
      '<div><label>Must avoid <span class="hint">— doctor\'s orders, comma separated</span></label><input type="text" name="avoidFoods" placeholder="e.g. avocado, licorice" value="' + esc(m.avoidFoods.join(', ')) + '"></div>' +
      '<div><label>Limit <span class="hint">— comma separated</span></label><input type="text" name="limitFoods" value="' + esc(m.limitFoods.join(', ')) + '"></div>' +
      '<div><label>Dislikes <span class="hint">— flagged in meal plans</span></label><input type="text" name="dislikes" placeholder="e.g. mushrooms, olives" value="' + esc(m.dislikes.join(', ')) + '"></div>' +
      '<div><label>Favorites</label><input type="text" name="favoriteFoods" value="' + esc(m.favoriteFoods.join(', ')) + '"></div>' +
      '</div></fieldset>' +

      '<fieldset><legend>Care team &amp; notes</legend><div class="fields">' +
      '<div><label>Doctor / clinic</label><input type="text" name="doctor" value="' + esc(m.doctor) + '"></div>' +
      '<div><label>Emergency contact</label><input type="text" name="emergencyContact" value="' + esc(m.emergencyContact) + '"></div>' +
      '</div><label style="margin-top:12px">Notes</label><textarea name="notes" placeholder="Anything the doctor or dietitian told you…">' + esc(m.notes) + '</textarea></fieldset>' +

      '<div class="form-actions">' +
      (!isNew ? '<button type="button" class="btn danger" data-action="delete-member" data-id="' + esc(m.id) + '" style="margin-right:auto">Delete</button>' : '') +
      '<a class="btn" href="' + (isNew ? '#/' : '#/member/' + esc(m.id)) + '">Cancel</a>' +
      '<button class="btn primary" type="submit">Save &amp; view guide</button></div></form>';
  }

  function readMemberForm(form, existing) {
    var f = form.elements;
    var val = function (n) { return f[n] ? f[n].value.trim() : ''; };
    var checked = function (n) { return Array.prototype.slice.call(form.querySelectorAll('input[name="' + n + '"]:checked')).map(function (i) { return i.value; }); };

    var allergies = {};
    Object.keys(KB.ALLERGENS).forEach(function (k) { var v = val('allergy-' + k); if (v) allergies[k] = v; });

    var otherAllergies = splitLines(val('otherAllergies')).map(function (line) {
      var m = line.match(/^(.*?)[\s,–—-]+\(?(mild|moderate|severe)\)?\s*$/i);
      return m ? { name: m[1].trim(), severity: m[2].toLowerCase() } : { name: line, severity: 'moderate' };
    });

    var heightCm = null;
    if (us()) {
      var ft = Number(val('heightFt')) || 0, inch = Number(val('heightIn')) || 0;
      if (ft || inch) heightCm = Math.round((ft * 12 + inch) * 2.54 * 10) / 10;
    } else if (val('heightCm')) heightCm = Number(val('heightCm'));
    var weightKg = val('weight') ? (us() ? lbToKg(Number(val('weight'))) : Number(val('weight'))) : null;

    var now = new Date().toISOString();
    return Store.normalizeMember(Object.assign({}, existing || {}, {
      id: (existing && existing.id) || Store.newId(),
      name: val('name'), relation: val('relation'), birthdate: val('birthdate'), sex: val('sex'),
      heightCm: heightCm, weightKg: weightKg, activity: val('activity'), goal: val('goal'), bloodType: val('bloodType'),
      allergies: allergies, otherAllergies: otherAllergies, intolerances: checked('intolerances'),
      conditions: checked('conditions'), otherConditions: splitLines(val('otherConditions')),
      medications: splitLines(val('medications')), diet: val('diet'), dietRules: checked('dietRules'),
      calorieOverride: val('calorieOverride') ? Number(val('calorieOverride')) : null,
      avoidFoods: splitList(val('avoidFoods')), limitFoods: splitList(val('limitFoods')),
      dislikes: splitList(val('dislikes')), favoriteFoods: splitList(val('favoriteFoods')),
      doctor: val('doctor'), emergencyContact: val('emergencyContact'), notes: f.notes.value,
      createdAt: (existing && existing.createdAt) || now, updatedAt: now,
      reviewedAt: E.isoDate(new Date())
    }));
  }

  // -------------------------------------------------------------------- log

  function viewLog(m) {
    var rows = m.log.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var wUnit = us() ? 'lb' : 'kg';
    return '<div class="spread" style="margin-bottom:16px"><h1>' + esc(m.name) + '\'s readings</h1><a class="btn" href="#/member/' + esc(m.id) + '">Back to guide</a></div>' +
      '<form id="log-form" class="card" data-id="' + esc(m.id) + '"><h2>Add a reading</h2><div class="fields">' +
      '<div><label>Date</label><input type="date" name="date" required value="' + E.isoDate(new Date()) + '"></div>' +
      '<div><label>Weight <span class="hint">(' + wUnit + ')</span></label><input type="number" step="0.1" name="weight"></div>' +
      '<div><label>Blood pressure</label><div class="inline"><input type="number" name="bpSys" placeholder="120"><input type="number" name="bpDia" placeholder="80"></div></div>' +
      '<div><label>A1C <span class="hint">(%)</span></label><input type="number" step="0.1" name="a1c"></div>' +
      '<div><label>LDL <span class="hint">(mg/dL)</span></label><input type="number" name="ldl"></div>' +
      '<div><label>Note</label><input type="text" name="note"></div>' +
      '</div><div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn primary" type="submit">Add reading</button></div>' +
      '<p class="muted small">The guide uses the latest weight for calorie targets and raises alerts when blood pressure, A1C or LDL cross common thresholds.</p></form>' +
      '<section class="card"><h2>History</h2>' + (rows.length ?
        '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Weight</th><th>BP</th><th>A1C</th><th>LDL</th><th>Note</th><th></th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><td>' + esc(r.date) + '</td><td>' + (r.weightKg ? fmtWeight(r.weightKg) : '') + '</td><td>' + (r.bpSys ? esc(r.bpSys + '/' + r.bpDia) : '') +
            '</td><td>' + esc(r.a1c ? r.a1c + '%' : '') + '</td><td>' + esc(r.ldl || '') + '</td><td>' + esc(r.note || '') + '</td>' +
            '<td><button class="btn small ghost" data-action="delete-log" data-id="' + esc(m.id) + '" data-date="' + esc(r.date) + '" data-at="' + esc(r.at || '') + '">Remove</button></td></tr>';
        }).join('') + '</tbody></table></div>' : '<p class="muted">No readings yet.</p>') + '</section>';
  }

  // ------------------------------------------------------------------- plan

  function fitDetails(fit) {
    var notes = fit.per.filter(function (p) { return p.result.status !== 'ok'; }).map(function (p) {
      var r = p.result, bits = [];
      if (r.status === 'no') {
        bits = r.blockedBy.map(function (b) { return 'contains ' + tagLabel(b.tag) + ' (' + b.why.join(', ') + ')'; })
          .concat(r.avoidHits.map(function (h) { return 'contains ' + h + ' (must avoid)'; }));
        bits.unshift('needs a separate meal');
      } else {
        bits = r.swaps.slice();
        r.cautions.forEach(function (c) { bits.push('go easy: ' + tagLabel(c.tag) + ' (' + c.why.join(', ') + ')'); });
        if (r.dislikes.length) bits.push('dislikes ' + r.dislikes.join(', '));
        r.tips.forEach(function (tip) { bits.push('tip: ' + tip); });
      }
      return '<li><span class="status-dot status-' + r.status + '"></span><strong>' + esc(p.member.name) + ':</strong> ' + esc(bits.join('; ')) + '</li>';
    });
    return notes;
  }

  // --------------------------------------------------------- meal builder

  var SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];
  var SLOT_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

  function builder() {
    state.builder = state.builder || {};
    var b = state.builder;
    if (!b.items) b.items = [];
    if (!b.meal) b.meal = 'dinner';
    if (!b.cat) b.cat = 'all';
    if (b.who !== 'family' && !member(b.who)) b.who = state.members.length > 1 ? 'family' : (state.members[0] && state.members[0].id);
    if (b.day === undefined) b.day = (new Date().getDay() + 6) % 7;
    return b;
  }

  function eatersFor(b) { return b.who === 'family' ? state.members.slice() : [member(b.who)].filter(Boolean); }

  function weekKey() { return E.isoDate(E.weekStart(today())); }

  // Daily calories + protein for one person, from their guide.
  function dayNeeds(m) {
    var g = E.buildGuide(m, today());
    var kcal = g.targets.kcal || 2000;
    var protein = parseInt(String(g.targets.protein || ''), 10) || Math.round(kcal * 0.15 / 4);
    return { kcal: kcal, protein: protein };
  }

  // Family meals are sized for an adult portion; kids take smaller servings.
  function targetPeople(b, eaters) {
    if (b.who !== 'family') return eaters;
    var adults = eaters.filter(function (m) { var a = E.ageYears(m.birthdate, today()); return a === null || a >= 18; });
    return adults.length ? adults : eaters;
  }

  function builderTargets(b, eaters) {
    eaters = targetPeople(b, eaters);
    if (!eaters.length) return Foods.mealTargets(2000, null, b.meal);
    var needs = eaters.map(dayNeeds);
    var kcal = needs.reduce(function (s, n) { return s + n.kcal; }, 0) / needs.length;
    var protein = needs.reduce(function (s, n) { return s + n.protein; }, 0) / needs.length;
    return Foods.mealTargets(kcal, protein, b.meal);
  }

  // ok | caution | no for each eater, using the same rules as recipes.
  function foodFit(food, eaters) {
    var pseudo = { id: food.id, ingredients: [food.name], tags: food.tags, swaps: [] };
    var per = eaters.map(function (m) { return { member: m, result: E.evaluateRecipe(pseudo, E.profileRules(m, today())) }; });
    var no = per.filter(function (p) { return p.result.status === 'no'; });
    var caution = per.filter(function (p) { return p.result.status === 'caution'; });
    return { per: per, status: no.length ? 'no' : caution.length ? 'caution' : 'ok', no: no, caution: caution };
  }

  function fitReason(fit) {
    var bits = [];
    fit.no.forEach(function (p) {
      var why = p.result.blockedBy.map(function (x) { return x.why.join(', '); }).concat(p.result.avoidHits.length ? ['on their must-avoid list'] : []);
      bits.push(p.member.name + ': ' + why.join(', '));
    });
    fit.caution.forEach(function (p) {
      var why = p.result.cautions.map(function (c) { return tagLabel(c.tag) + ' (' + c.why.join(', ') + ')'; }).concat(p.result.dislikes.length ? ['dislikes it'] : []);
      bits.push(p.member.name + ': go easy — ' + why.join(', '));
    });
    return bits.join(' · ');
  }

  function plateSvg(totals) {
    var total = Object.keys(totals.byCat).reduce(function (s, k) { return s + totals.byCat[k]; }, 0);
    var r = 70, c = 2 * Math.PI * r, offset = 0;
    var arcs = Foods.CATEGORIES.map(function (cat) {
      var share = total ? totals.byCat[cat.id] / total : 0;
      if (!share) return '';
      var len = share * c;
      var arc = '<circle r="' + r + '" cx="90" cy="90" fill="none" stroke="' + cat.color + '" stroke-width="34" stroke-dasharray="' + len + ' ' + (c - len) + '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 90 90)"><title>' + cat.label + ' ' + Math.round(share * 100) + '% of calories</title></circle>';
      offset += len;
      return arc;
    }).join('');
    return '<svg class="plate-svg" viewBox="0 0 180 180" role="img" aria-label="Plate by food group">' +
      '<circle r="88" cx="90" cy="90" class="plate-rim"/><circle r="70" cx="90" cy="90" fill="none" class="plate-empty" stroke-width="34"/>' + arcs +
      '<circle r="50" cx="90" cy="90" class="plate-center"/>' +
      '<text x="90" y="86" text-anchor="middle" class="plate-kcal">' + totals.kcal + '</text><text x="90" y="104" text-anchor="middle" class="plate-unit">kcal</text></svg>';
  }

  function bar(label, value, min, max, unit) {
    var target = max || min;
    var pct = target ? Math.min(100, Math.round(value / target * 100)) : 0;
    var status = value < min * 0.8 ? 'low' : (max && value > max * 1.15) ? 'over' : 'good';
    return '<div class="bar-row"><div class="bar-label"><span>' + label + '</span><span><strong>' + value + '</strong> / ' + (max && max !== min ? min + '–' + max : target) + ' ' + unit + '</span></div>' +
      '<div class="bar bar-' + status + '"><span style="width:' + pct + '%"></span></div></div>';
  }

  function viewBuilder() {
    if (!state.members.length) return '<section class="card empty"><h1>Build a meal</h1><p class="muted">Add family members first — the builder checks every food against their allergies and needs.</p><a class="btn primary" href="#/new">Add a person</a></section>';
    var b = builder();
    var eaters = eatersFor(b);
    var target = builderTargets(b, eaters);
    var sc = Foods.score(b.items, target);
    var t = sc.totals;
    var q = (b.search || '').toLowerCase();

    var whoChips = (state.members.length > 1 ? ['family'] : []).concat(state.members.map(function (m) { return m.id; })).map(function (id) {
      var label = id === 'family' ? '👨‍👩‍👧 Whole family' : esc(member(id).name);
      return '<button class="chip' + (b.who === id ? ' on' : '') + '" data-action="b-who" data-id="' + esc(id) + '">' + label + '</button>';
    }).join('');
    var slotChips = SLOTS.map(function (s) {
      return '<button class="chip' + (b.meal === s ? ' on' : '') + '" data-action="b-meal" data-id="' + s + '">' + SLOT_EMOJI[s] + ' ' + MEAL_LABELS[s] + '</button>';
    }).join('');

    var tabs = [{ id: 'all', label: 'All foods', emoji: '🍽️' }].concat(Foods.CATEGORIES).map(function (c) {
      var n = b.items.filter(function (it) { var f = Foods.byId(it.foodId); return f && (c.id === 'all' || f.cat === c.id); }).length;
      return '<button class="cat-tab' + (b.cat === c.id ? ' on' : '') + '" data-action="b-cat" data-id="' + c.id + '" style="--cat:' + (c.color || 'var(--brand)') + '">' +
        '<span class="cat-emoji">' + c.emoji + '</span>' + esc(c.label) + (n ? ' <span class="count">' + n + '</span>' : '') + '</button>';
    }).join('');

    var cats = b.cat === 'all' ? Foods.CATEGORIES : Foods.CATEGORIES.filter(function (c) { return c.id === b.cat; });
    var grids = cats.map(function (cat) {
      var foods = Foods.FOODS.filter(function (fd) { return fd.cat === cat.id && (!q || fd.name.toLowerCase().indexOf(q) !== -1); });
      var cards = foods.map(function (fd) {
        var fit = foodFit(fd, eaters);
        if (b.safeOnly && fit.status === 'no') return '';
        var onPlate = b.items.filter(function (it) { return it.foodId === fd.id; })[0];
        var reason = fitReason(fit);
        return '<div class="food-card fit-' + fit.status + (onPlate ? ' picked' : '') + '" style="--cat:' + cat.color + '">' +
          '<button class="food-add" data-action="b-add" data-id="' + fd.id + '"' + (fit.status === 'no' ? ' disabled' : '') + ' title="' + esc(fit.status === 'no' ? 'Not for ' + reason : 'Add to plate') + '">' +
          '<span class="food-emoji">' + fd.emoji + '</span><span class="food-name">' + esc(fd.name) + '</span><span class="food-serving">' + esc(fd.serving) + ' · ' + fd.kcal + ' kcal</span>' +
          '<span class="macros"><span>P ' + fd.protein + '</span><span>C ' + fd.carbs + '</span><span>F ' + fd.fat + '</span><span>Fib ' + fd.fiber + '</span></span>' +
          (onPlate ? '<span class="on-plate">×' + onPlate.qty + ' on plate</span>' : '') + '</button>' +
          (fit.status !== 'ok' ? '<div class="fit-note">' + (fit.status === 'no' ? '✕ ' : '! ') + esc(reason) + '</div>' : '') +
          '<a class="shop-link" href="#/shop/' + fd.id + '" title="Where to buy & which brand">🛒</a></div>';
      }).join('');
      return '<section class="food-section"><h2 style="--cat:' + cat.color + '"><span>' + cat.emoji + '</span> ' + cat.label + '</h2><p class="muted small">' + esc(cat.blurb) + '</p>' +
        '<div class="food-grid">' + (cards || '<p class="muted">No matches.</p>') + '</div></section>';
    }).join('');

    var plateItems = b.items.map(function (it, i) {
      var fd = Foods.byId(it.foodId);
      if (!fd) return '';
      return '<li><span>' + fd.emoji + ' ' + esc(fd.name) + '<small>' + esc(fd.serving) + '</small></span><span class="qty">' +
        '<button class="btn small ghost" data-action="b-qty" data-id="' + i + '" data-d="-1" aria-label="Less">−</button><strong>' + it.qty + '</strong>' +
        '<button class="btn small ghost" data-action="b-qty" data-id="' + i + '" data-d="1" aria-label="More">+</button></span></li>';
    }).join('');

    var days = E.DAYS.map(function (d, i) { return opt(i, d, b.day); }).join('');
    var plate = '<aside class="plate-panel card" id="plate-panel">' +
      '<div class="plate-head"><h2>Your plate</h2><span class="muted small">' + esc(b.who === 'family' ? 'one adult portion — kids take smaller servings' : (member(b.who) || {}).name) + ' · ' + MEAL_LABELS[b.meal].toLowerCase() + '</span></div>' +
      '<div class="plate-wrap">' + plateSvg(t) + '<div class="score' + (sc.score >= 85 ? ' great' : '') + '"><div class="score-num">' + sc.score + '</div><div class="score-label">balance score</div></div></div>' +
      '<div class="legend plate-legend">' + Foods.CATEGORIES.map(function (c) { return '<span><i style="background:' + c.color + '"></i>' + c.label + '</span>'; }).join('') + '</div>' +
      (sc.badges.length ? '<div class="badges-row">' + sc.badges.map(function (x) { return '<span class="badge ok">' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
      (b.items.length ? '<ul class="plate-items">' + plateItems + '</ul>' : '<p class="muted small">Tap foods to add them. Aim for one from each group — half the plate from 🥦 fiber.</p>') +
      bar('Calories', t.kcal, Math.round(target.kcal * 0.85), Math.round(target.kcal * 1.15), 'kcal') +
      bar('Protein', t.protein, target.protein, null, 'g') +
      bar('Carbs', t.carbs, target.carbsMin, target.carbsMax, 'g') +
      bar('Fat', t.fat, target.fatMin, target.fatMax, 'g') +
      bar('Fiber', t.fiber, target.fiber, null, 'g') +
      (sc.parts.length ? '<p class="small muted">' + esc(sc.parts.join(' · ')) + '</p>' : '') +
      '<div class="plate-actions"><input type="text" id="meal-name" placeholder="Name it (optional)" value="' + esc(b.name || '') + '">' +
      '<select id="meal-day">' + days + '</select>' +
      '<button class="btn primary" data-action="b-save"' + (b.items.length ? '' : ' disabled') + '>Save to my week</button></div>' +
      '<div class="row"><button class="btn small" data-action="b-surprise">🎲 Surprise me</button><button class="btn small ghost" data-action="b-clear">Clear plate</button></div>' +
      '<p class="hint">Targets: protein from body weight (0.8 g/kg), carbs 45–65% and fat 20–35% of calories, fiber 14 g per 1,000 kcal — Dietary Guidelines for Americans.</p>' +
      '</aside>';

    return '<div class="spread" style="margin-bottom:8px"><div><h1>Build a meal</h1><div class="muted">Pick what you feel like eating — the plate keeps score.</div></div>' +
      '<a class="btn" href="#/week">My week →</a></div>' +
      '<section class="card builder-controls"><div class="row"><strong>Who\'s eating?</strong>' + whoChips + '</div>' +
      '<div class="row" style="margin-top:8px"><strong>Which meal?</strong>' + slotChips + '</div></section>' +
      '<div class="builder">' +
      '<div class="builder-foods"><div class="cat-tabs">' + tabs + '</div>' +
      '<div class="row" style="margin:10px 0"><input type="text" id="food-search" placeholder="Search foods…" value="' + esc(b.search || '') + '" style="max-width:260px">' +
      '<label class="chip-check"><input type="checkbox" data-action="b-safe"' + (b.safeOnly ? ' checked' : '') + '> Hide foods someone can\'t eat</label></div>' +
      grids + '</div>' + plate + '</div>' +
      '<button class="mini-plate" data-action="b-scroll">🍽️ ' + b.items.length + ' item' + (b.items.length === 1 ? '' : 's') + ' · ' + t.kcal + ' kcal · score <strong>' + sc.score + '</strong> <span>View plate ↑</span></button>' +
      '<div id="confetti" aria-hidden="true"></div>';
  }

  function viewWeek() {
    var wk = weekKey();
    var meals = (state.meals && state.meals[wk]) || [];
    var b = builder();
    var dayHtml = E.DAYS.map(function (d, i) {
      var dm = meals.filter(function (m) { return m.day === i; }).sort(function (a, c) { return SLOTS.indexOf(a.slot) - SLOTS.indexOf(c.slot); });
      return '<div class="week-day"><div class="day">' + d + '</div><div class="week-meals">' + (dm.length ? dm.map(function (m) {
        var tt = Foods.totals(m.items);
        var who = m.who === 'family' ? 'Family' : (member(m.who) || {}).name || '—';
        return '<div class="week-meal"><div class="label">' + SLOT_EMOJI[m.slot] + ' ' + MEAL_LABELS[m.slot] + ' · ' + esc(who) + '</div>' +
          '<div class="name">' + esc(m.name) + '</div><div class="small muted">' + m.items.map(function (it) { var f = Foods.byId(it.foodId); return f ? f.emoji : ''; }).join(' ') + ' · ' + tt.kcal + ' kcal · P ' + tt.protein + ' g · Fib ' + tt.fiber + ' g</div>' +
          '<div class="row" style="margin-top:6px"><button class="btn small" data-action="w-edit" data-id="' + esc(m.id) + '">Edit</button><button class="btn small ghost" data-action="w-del" data-id="' + esc(m.id) + '">Remove</button></div></div>';
      }).join('') : '<a class="week-empty" href="#/plan" data-action="w-plan" data-day="' + i + '">+ Build a meal</a>') + '</div></div>';
    }).join('');

    var grocery = {};
    meals.forEach(function (m) {
      m.items.forEach(function (it) {
        var mult = m.who === 'family' ? state.members.length : 1;
        grocery[it.foodId] = (grocery[it.foodId] || 0) + it.qty * mult;
      });
    });
    var groceryHtml = Object.keys(grocery).map(function (id) { return { food: Foods.byId(id), n: grocery[id] }; }).filter(function (x) { return x.food; })
      .sort(function (a, c) { return Foods.CATEGORIES.map(function (k) { return k.id; }).indexOf(a.food.cat) - Foods.CATEGORIES.map(function (k) { return k.id; }).indexOf(c.food.cat); })
      .map(function (x) {
        return '<li><label><input type="checkbox"> ' + x.food.emoji + ' ' + esc(x.food.name) + ' <span class="muted small">' + x.n + ' × ' + esc(x.food.serving) + '</span></label><a href="#/shop/' + x.food.id + '" class="small">🛒 where to buy</a></li>';
      }).join('');

    return '<div class="spread" style="margin-bottom:12px"><div><h1>My week</h1><div class="muted">Week of ' + esc(wk) + ' · meals you built</div></div>' +
      '<div class="row no-print"><a class="btn primary" href="#/plan">+ Build a meal</a><button class="btn" data-action="print">Print</button></div></div>' +
      '<section class="card">' + dayHtml + '</section>' +
      '<section class="card" style="margin-top:16px"><h2>Grocery list</h2><p class="muted small">Totals for everyone eating each meal. Tap 🛒 to find stores nearby and compare brands.</p>' +
      (groceryHtml ? '<ul class="grocery plain">' + groceryHtml + '</ul>' : '<p class="muted">Save meals to build your list.</p>') + '</section>' +
      '<p class="muted small">Looking for ready-made ideas? The <a href="#/recipes">Recipes</a> tab checks 40 family dishes against everyone\'s profile.</p>';
  }

  // ----------------------------------------------------------------- shop

  var shopCache = { stores: null, storesFor: '', products: {}, error: {} };

  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; }

  function viewShop(foodId) {
    var fd = Foods.byId(foodId);
    if (!fd) return '<section class="card"><p>Unknown food.</p><a class="btn" href="#/plan">Back</a></section>';
    var b = builder();
    var eaters = eatersFor(b);
    var allergyKeys = [];
    eaters.forEach(function (m) { Object.keys(m.allergies || {}).forEach(function (k) { if (allergyKeys.indexOf(k) === -1) allergyKeys.push(k); }); });
    var loc = state.location;

    var storesHtml = '';
    var storesKey = loc ? loc.lat.toFixed(3) + ',' + loc.lon.toFixed(3) : '';
    if (shopCache.error.stores) storesHtml = '<div class="alert warn"><div>' + esc(shopCache.error.stores) + '</div></div>';
    else if (shopCache.stores && shopCache.storesFor === storesKey) {
      storesHtml = shopCache.stores.length ? '<ul class="store-list">' + shopCache.stores.map(function (s) {
        var links = Shop.mapLinks(s);
        var mi = s.km * 0.621;
        return '<li><div><strong>' + esc(s.name) + '</strong>' + (s.organic ? ' <span class="badge ok">organic / health</span>' : '') +
          '<div class="small muted">' + esc(s.address || s.kind) + (s.hours ? ' · ' + esc(s.hours) : '') + '</div></div>' +
          '<div class="store-meta"><span class="dist">' + (us() ? mi.toFixed(1) + ' mi' : s.km.toFixed(1) + ' km') + '</span>' +
          '<a href="' + links.apple + '" target="_blank" rel="noopener">Apple Maps</a> · <a href="' + links.google + '" target="_blank" rel="noopener">Google Maps</a></div></li>';
      }).join('') + '</ul><p class="hint">Store data © OpenStreetMap contributors. Stock isn\'t listed on maps — check the store\'s app or the links below before you go.</p>' : '<p class="muted">No grocery stores found within 5 km.</p>';
    }

    var prods = shopCache.products[fd.id];
    var prodHtml = '';
    if (shopCache.error[fd.id]) prodHtml = '<div class="alert warn"><div>' + esc(shopCache.error[fd.id]) + '</div></div>';
    else if (prods) {
      var nameOf = function (key) { return eaters.filter(function (m) { return (m.allergies || {})[key]; }).map(function (m) { return m.name; }).join(', '); };
      prodHtml = prods.length ? '<div class="product-grid">' + prods.map(function (p) {
        return '<a class="product' + (p.conflicts.length ? ' conflict' : '') + '" href="' + esc(p.url) + '" target="_blank" rel="noopener">' +
          (p.image ? '<img src="' + esc(p.image) + '" alt="" loading="lazy">' : '<span class="product-ph">' + fd.emoji + '</span>') +
          '<div class="product-name">' + esc(p.name) + '</div><div class="small muted">' + esc([p.brand, p.quantity].filter(Boolean).join(' · ')) + '</div>' +
          '<div class="row" style="gap:4px;margin-top:4px">' + (p.nutriscore && GRADE_OK.test(p.nutriscore) ? '<span class="nutri nutri-' + p.nutriscore + '">Nutri-Score ' + p.nutriscore.toUpperCase() + '</span>' : '') +
          (p.nova ? '<span class="badge' + (p.nova === 4 ? ' warn' : '') + '">NOVA ' + p.nova + '</span>' : '') + '</div>' +
          (p.conflicts.length ? '<div class="small" style="color:var(--danger);margin-top:4px">✕ Contains ' + p.conflicts.map(function (c) { return KB.ALLERGENS[c].label.toLowerCase() + ' (' + nameOf(c) + ')'; }).join(', ') + '</div>' : '') +
          '</a>';
      }).join('') + '</div>' : '<p class="muted">No packaged products found — fresh items usually aren\'t in the database.</p>';
    }

    var ratings = ((state.ratings || {})[fd.id] || []).slice().sort(function (a, c) { return c.stars - a.stars; });
    var ratingHtml = ratings.length ? '<ul class="plain">' + ratings.map(function (r, i) {
      return '<li><span class="stars">' + stars(r.stars) + '</span> <strong>' + esc(r.product) + '</strong> — ' + esc((member(r.who) || {}).name || 'Someone') +
        (r.note ? ': ' + esc(r.note) : '') + ' <button class="btn small ghost" data-action="r-del" data-id="' + fd.id + '" data-i="' + i + '">Remove</button></li>';
    }).join('') + '</ul>' : '<p class="muted small">No family ratings yet — be the first.</p>';

    return '<div class="spread" style="margin-bottom:12px"><div><h1>' + fd.emoji + ' ' + esc(fd.name) + '</h1><div class="muted">Where to buy it and which product to pick</div></div>' +
      '<div class="row"><a class="btn" href="#/plan">← Back to the builder</a><a class="btn" href="#/week">My week</a></div></div>' +
      '<div class="grid grid-2">' +
      '<section class="card"><h2>📍 Nearby grocery stores</h2>' +
      '<div class="row"><button class="btn primary" data-action="loc-me">Use my location</button><span class="muted small">or</span>' +
      '<input type="text" id="loc-q" placeholder="ZIP code or city" style="max-width:180px"><button class="btn" data-action="loc-set">Search</button></div>' +
      (loc ? '<p class="small muted" style="margin-top:8px">Near ' + esc(loc.label) + '</p>' : '<p class="small muted" style="margin-top:8px">Your location is only sent to OpenStreetMap to find stores, and saved on this device.</p>') +
      '<div id="stores">' + storesHtml + '</div>' +
      '<h3 style="margin-top:14px">Check stock & price online</h3><div class="row">' + Shop.retailerLinks(fd.name).map(function (l) { return '<a class="btn small" href="' + l[1] + '" target="_blank" rel="noopener">' + l[0] + '</a>'; }).join('') + '</div></section>' +
      '<section class="card"><h2>⭐ Family ratings</h2>' + ratingHtml +
      '<form id="rating-form" data-id="' + fd.id + '" class="rating-form"><input type="text" name="product" placeholder="Brand / product (e.g. Fage 0%)" required>' +
      '<select name="who">' + state.members.map(function (m) { return opt(m.id, m.name, b.who === m.id ? m.id : ''); }).join('') + '</select>' +
      '<select name="stars">' + [5, 4, 3, 2, 1].map(function (n) { return opt(n, stars(n) + ' taste', 5); }).join('') + '</select>' +
      '<input type="text" name="note" placeholder="Taste, texture, price… (optional)"><button class="btn primary" type="submit">Add rating</button></form>' +
      '<h3 style="margin-top:14px">What other people say</h3><div class="row">' + Shop.reviewLinks(fd.name).map(function (l) { return '<a class="btn small" href="' + l[1] + '" target="_blank" rel="noopener">' + l[0] + '</a>'; }).join('') + '</div>' +
      '<p class="hint">Online taste reviews aren\'t available through a free, reliable source, so these open the searches; your family\'s ratings stay here.</p></section>' +
      '</div>' +
      '<section class="card" style="margin-top:16px"><div class="spread"><div><h2>🏷️ Compare packaged products</h2><p class="muted small" style="margin:0">' +
      'Healthiest first, and anything containing ' + (allergyKeys.length ? 'an allergen for ' + esc(eaters.map(function (m) { return m.name; }).join(', ')) : 'a family allergen') + ' is flagged.</p></div>' +
      '<button class="btn primary" data-action="prod-load" data-id="' + fd.id + '">' + (prods ? 'Refresh' : 'Compare products') + '</button></div>' +
      '<div id="products" style="margin-top:12px">' + prodHtml + '</div>' +
      '<details class="small" style="margin-top:10px"><summary>What Nutri-Score and NOVA mean</summary><p><strong>Nutri-Score</strong> (A best → E) rates a product\'s overall nutrition per 100 g from sugar, salt, saturated fat, fiber, protein and fruit/vegetable content. It was developed by France\'s public-health agency and is used across Europe; it isn\'t an FDA label. ' +
      '<strong>NOVA</strong> groups foods by processing: 1 unprocessed, 4 ultra-processed. In a controlled NIH trial, people ate about 500 more calories a day on an ultra-processed diet (Hall et al., <em>Cell Metabolism</em> 2019).</p>' +
      '<p>Product data © Open Food Facts contributors (open database; entries can be incomplete — always check the label for allergens).</p></details></section>';
  }

  var GRADE_OK = /^[a-e]$/;

  // ---------------------------------------------------------------- recipes

  var CUSTOM_TAGS = ['peanut', 'treenut', 'milk', 'egg', 'wheat', 'soy', 'fish', 'shellfish', 'sesame', 'meat', 'pork', 'poultry', 'alcohol', 'honey', 'gelatin',
    'oats', 'high-sodium', 'high-satfat', 'added-sugar', 'refined-carb', 'high-purine', 'high-fodmap', 'high-potassium', 'aged-cheese', 'grapefruit', 'spicy', 'acidic', 'fried', 'caffeine', 'choking', 'deli-meat', 'raw-fish'];

  function viewRecipes() {
    var all = recipes();
    var shown = recipeFilter === 'all' ? all : all.filter(function (r) { return r.meal === recipeFilter; });
    var rules = state.members.map(function (m) { return { member: m, rules: E.profileRules(m, today()) }; });

    var filters = ['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(function (f) {
      return '<button class="btn small' + (recipeFilter === f ? ' primary' : '') + '" data-action="recipe-filter" data-filter="' + f + '">' + (f === 'all' ? 'All' : MEAL_LABELS[f]) + '</button>';
    }).join('');

    var rows = shown.map(function (r) {
      var per = rules.map(function (x) { return { member: x.member, result: E.evaluateRecipe(r, x.rules) }; });
      var fit = { per: per };
      var notes = fitDetails(fit);
      var custom = state.customRecipes.indexOf(r) !== -1;
      return '<tr><td><strong>' + esc(r.name) + '</strong>' + (custom ? ' <span class="badge info">yours</span>' : '') +
        '<div class="small muted">' + esc(r.ingredients.join(', ')) + '</div>' +
        (notes.length ? '<details><summary class="small">' + notes.length + ' note' + (notes.length > 1 ? 's' : '') + '</summary><ul class="small">' + notes.join('') + '</ul></details>' : '') + '</td>' +
        '<td>' + MEAL_LABELS[r.meal] + '</td>' +
        per.map(function (p) { return '<td style="text-align:center"><span class="status-dot status-' + p.result.status + '" title="' + esc(STATUS_TEXT[p.result.status]) + '"></span></td>'; }).join('') +
        '<td>' + (custom ? '<button class="btn small ghost" data-action="delete-recipe" data-id="' + esc(r.id) + '">Delete</button>' : '') + '</td></tr>';
    }).join('');

    var tagChecks = CUSTOM_TAGS.map(function (t) { return check('tags', t, tagLabel(t), false); }).join('');

    return '<div class="spread" style="margin-bottom:12px"><h1>Recipes</h1><div class="row">' + filters + '</div></div>' +
      '<section class="card"><div class="legend" style="margin-bottom:10px"><span><span class="status-dot status-ok"></span>good as-is</span><span><span class="status-dot status-caution"></span>OK, with a note</span><span><span class="status-dot status-swap"></span>needs a swap</span><span><span class="status-dot status-no"></span>can\'t eat</span></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Recipe</th><th>Meal</th>' + state.members.map(function (m) { return '<th style="text-align:center">' + esc(m.name) + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
      '<form id="recipe-form" class="card"><h2>Add your own recipe</h2><p class="muted small">Family favorites go into the meal plan too. Tick what the dish contains so the app can check it against everyone\'s profile.</p>' +
      '<div class="fields"><div><label>Name *</label><input type="text" name="name" required></div>' +
      '<div><label>Meal</label><select name="meal">' + opt('dinner', 'Dinner', 'dinner') + opt('lunch', 'Lunch', '') + opt('breakfast', 'Breakfast', '') + opt('snack', 'Snack', '') + '</select></div></div>' +
      '<label style="margin-top:12px">Ingredients <span class="hint">— comma separated</span></label><input type="text" name="ingredients" placeholder="chicken thighs, rice, garlic, soy sauce">' +
      '<label style="margin-top:12px">Contains</label><div class="checks">' + tagChecks + '</div>' +
      '<div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn primary" type="submit">Add recipe</button></div></form>';
  }

  // ------------------------------------------------------------ health check

  var LEVELS = {
    urgent: { title: 'Act soon', cls: 'danger', blurb: 'These need attention in the next few days.' },
    doctor: { title: 'Talk to a doctor / get tested', cls: 'warn', blurb: 'Worth raising at your next appointment, or booking one.' },
    change: { title: 'Everyday changes that help', cls: 'info', blurb: 'Things you can start on your own.' }
  };

  function viewQuickAdd() {
    return '<form id="quick-form" class="card" style="max-width:640px;margin:0 auto">' +
      '<h1>Add a family member</h1>' +
      '<p class="muted">Just the basics. Next comes a set of everyday questions — no medical knowledge needed — and the app works out the rest.</p>' +
      '<div class="fields">' +
      '<div><label>Name *</label><input type="text" name="name" required></div>' +
      '<div><label>Relationship</label><input type="text" name="relation" placeholder="Me, Mom, Son…"></div>' +
      '<div><label>Birth date *</label><input type="date" name="birthdate" required></div>' +
      '<div><label>Sex <span class="hint">(changes some advice)</span></label><select name="sex">' + opt('', 'Prefer not to say', '') + opt('female', 'Female', '') + opt('male', 'Male', '') + '</select></div>' +
      '</div>' +
      '<div class="row" style="justify-content:flex-end;margin-top:18px">' +
      '<button class="btn" type="submit" name="next" value="profile">Fill in the full form instead</button>' +
      '<button class="btn primary" type="submit" name="next" value="check">Start the health questions →</button></div></form>';
  }

  function ageOf(m) { return E.ageYears(m.birthdate, today()); }

  function healthCheckCard(m, age) {
    var prog = Q.progress(m, age);
    if (!prog.done) {
      return '<section class="card cta"><div class="spread"><div><h2>Health check-up questions</h2>' +
        '<p class="muted" style="margin:0">About 10 minutes of everyday questions — sleep, energy, digestion, what happens after certain foods, family history. ' +
        'They\'re scored with the same screening tools doctors use and turned into recommendations with sources.</p></div>' +
        '<a class="btn primary no-print" href="#/member/' + esc(m.id) + '/check/0">Start →</a></div></section>';
    }
    var r = Q.analyze(m, age);
    var counts = { urgent: 0, doctor: 0, change: 0 };
    r.findings.forEach(function (f) { counts[f.level]++; });
    var top = r.findings.slice(0, 3).map(function (f) {
      return '<li><span class="badge ' + LEVELS[f.level].cls + '">' + LEVELS[f.level].title + '</span> ' + esc(f.title) + '</li>';
    }).join('');
    return '<section class="card cta"><div class="spread"><h2>Health check-up</h2><div class="row no-print">' +
      '<a class="btn" href="#/member/' + esc(m.id) + '/check/0">' + (prog.pct < 100 ? 'Continue questions (' + prog.pct + '%)' : 'Update answers') + '</a>' +
      '<a class="btn primary" href="#/member/' + esc(m.id) + '/results">See all results</a></div></div>' +
      '<div class="row" style="margin:6px 0 10px">' +
      Object.keys(counts).map(function (k) { return '<span class="badge ' + LEVELS[k].cls + '">' + counts[k] + ' · ' + LEVELS[k].title + '</span>'; }).join('') +
      '<span class="badge ok">' + r.good.length + ' · Doing well</span></div>' +
      (top ? '<ul class="plain">' + top + '</ul>' : '<p class="muted">Nothing flagged so far.</p>') + '</section>';
  }

  function labUnit(def) { return !us() && def.si ? def.si.unit : def.unit; }
  function labShow(def, v) { return !us() && def.si ? Math.round(v * def.si.factor * 100) / 100 : v; }

  function wearableInput(m) {
    var w = m.wearable || {};
    var device = w.device || '';
    var deviceChips = Labs.DEVICES.map(function (d) {
      return '<label class="pill"><input type="radio" name="w-device" value="' + d[0] + '"' + (device === d[0] ? ' checked' : '') + '><span>' + esc(d[1]) + '</span></label>';
    }).join('');
    if (!device || device === 'none') return '<div class="qtext">Which tracker do you wear?</div><div class="pills">' + deviceChips + '</div>';
    var fields = Labs.WEARABLE_FIELDS.map(function (fd) {
      return '<div><label>' + esc(fd.label) + (fd.hint ? ' <span class="hint">' + esc(fd.hint) + '</span>' : '') + '</label><div class="inline">' +
        '<input type="number" step="' + (fd.step || 1) + '" min="0" name="w-' + fd.id + '" value="' + esc(w[fd.id] === undefined || w[fd.id] === null ? '' : w[fd.id]) + '"><span class="unit">' + esc(fd.unit) + '</span></div></div>';
    }).join('');
    var stress = Labs.STRESS.map(function (o) {
      return '<label class="pill"><input type="radio" name="w-stress" value="' + o[0] + '"' + (w.stress === o[0] ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>';
    }).join('');
    return '<div class="qtext">Which tracker do you wear?</div><div class="pills">' + deviceChips + '</div>' +
      '<div class="import-box"><div><strong>Fastest: import your export file</strong><div class="hint">In the ' + esc((Labs.DEVICES.filter(function (d) { return d[0] === device; })[0] || [])[1] || 'tracker') +
      ' app or website, look for <em>Export data</em> / <em>Download my data</em> and save the CSV. The app averages your last 30 days. The file never leaves this device.</div></div>' +
      '<label class="btn">Choose CSV file<input type="file" accept=".csv,text/csv" data-action="wearable-csv" hidden></label></div>' +
      (w.importNote ? '<div class="alert info"><div>' + esc(w.importNote) + '</div></div>' : '') +
      '<div class="qtext" style="margin-top:14px">Or type your 30-day averages from the app</div><div class="fields">' + fields + '</div>' +
      '<div class="qtext" style="margin-top:14px">How does your tracker (or how do you) rate your daytime stress?</div><div class="pills">' + stress + '</div>';
  }

  function labsInput(m) {
    var groups = {};
    Labs.LABS.forEach(function (l) { (groups[l.group] = groups[l.group] || []).push(l); });
    var form = Object.keys(groups).map(function (g) {
      return '<div class="lab-group"><div class="hint">' + esc(g) + '</div><div class="fields">' + groups[g].map(function (l) {
        return '<div><label>' + esc(l.label) + '</label><div class="inline"><input type="number" min="0" step="any" name="lab-' + l.id + '"><span class="unit">' + esc(labUnit(l)) + '</span></div></div>';
      }).join('') + '</div></div>';
    }).join('');
    var latest = Labs.latestLabs(m);
    var pregnant = (m.conditions || []).indexOf('pregnancy') !== -1;
    var rows = Object.keys(latest).map(function (id) {
      var def = Labs.labDef(id);
      if (!def) return '';
      var r = Labs.interpret(id, latest[id].value, m.sex, pregnant);
      return '<tr><td>' + esc(def.label) + '</td><td><strong>' + labShow(def, latest[id].value) + '</strong> ' + esc(labUnit(def)) + '</td><td><span class="badge ' + ({ ok: 'ok', watch: 'warn', high: 'warn', alert: 'danger' }[r.level] || '') + '">' + esc(r.text) + '</span></td><td class="small muted">' + esc(latest[id].date) + '</td></tr>';
    }).join('');
    var entries = (m.labs || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(function (e) {
      return '<li>' + esc(e.date) + ' — ' + Object.keys(e.values).length + ' result' + (Object.keys(e.values).length === 1 ? '' : 's') + (e.note ? ' · ' + esc(e.note) : '') +
        ' <button type="button" class="btn small ghost" data-action="lab-del" data-id="' + esc(e.id) + '">Remove</button></li>';
    }).join('');
    return (rows ? '<h3>Latest results</h3><div class="table-wrap"><table><thead><tr><th>Test</th><th>Result</th><th>Meaning</th><th>Date</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="hint">' + ((ageOf(m) !== null && ageOf(m) < 18) ? 'Children\'s ranges differ — the pediatrician should interpret these. ' : '') + 'Ranges from ADA, ACC/AHA, KDIGO, WHO and NIH guidance. If your report\'s printed range differs, trust the report.</p>' : '') +
      '<div class="lab-entry"><h3>Add results</h3><div class="fields"><div><label>Date of the blood test</label><input type="date" name="lab-date" value="' + E.isoDate(new Date()) + '"></div>' +
      '<div><label>Where from (optional)</label><input type="text" name="lab-note" placeholder="e.g. annual physical, Quest"></div></div>' + form +
      '<div class="row" style="justify-content:flex-end;margin-top:10px"><button type="button" class="btn primary" data-action="lab-add">Add these results</button></div></div>' +
      (entries ? '<h3>All entries</h3><ul class="plain">' + entries + '</ul>' : '');
  }

  function recordsInput(m) {
    return '<div class="upload-box"><div class="fields">' +
      '<div><label>What is it?</label><select name="doc-kind">' + Docs.KINDS.map(function (k) { return opt(k[0], k[1], 'lab'); }).join('') + '</select></div>' +
      '<div><label>Date on the document</label><input type="date" name="doc-date" value="' + E.isoDate(new Date()) + '"></div>' +
      '<div><label>Title (optional)</label><input type="text" name="doc-title" placeholder="e.g. Annual blood work"></div></div>' +
      '<label class="btn primary" style="margin-top:12px">📎 Choose file (PDF or photo)<input type="file" accept=".pdf,image/*,.txt,.csv" data-action="doc-upload" hidden></label>' +
      '<p class="hint">Stored only in this browser on this device and included in exported backups. The app doesn\'t read the file itself yet — copy key numbers into Blood test results.</p></div>' +
      '<div id="doc-list" data-member="' + esc(m.id) + '"><p class="muted small">Loading records…</p></div>';
  }

  function fillDocList() {
    var el = document.getElementById('doc-list');
    if (!el) return;
    var memberId = el.getAttribute('data-member');
    Docs.listFor(memberId).then(function (docs) {
      if (!document.body.contains(el)) return;
      var kindLabel = function (k) { return (Docs.KINDS.filter(function (x) { return x[0] === k; })[0] || [k, k])[1]; };
      el.innerHTML = docs.length ? '<ul class="doc-list">' + docs.map(function (d) {
        var icon = /pdf/.test(d.type) ? '📄' : /image/.test(d.type) ? '🖼️' : '📎';
        return '<li><span class="doc-icon">' + icon + '</span><div><strong>' + esc(d.title) + '</strong><div class="small muted">' + esc(kindLabel(d.kind)) + ' · ' + esc(d.date) + ' · ' + Docs.prettySize(d.size) + '</div></div>' +
          '<div class="row"><button type="button" class="btn small" data-action="doc-open" data-id="' + esc(d.id) + '">Open</button><button type="button" class="btn small ghost" data-action="doc-del" data-id="' + esc(d.id) + '">Delete</button></div></li>';
      }).join('') + '</ul>' : '<p class="muted small">No records yet.</p>';
    }).catch(function (e) { el.innerHTML = '<div class="alert warn"><div>' + esc(e.message) + '</div></div>'; });
  }

  function inputFor(q, m, c) {
    if (q.type === 'wearable') return wearableInput(m);
    if (q.type === 'labs') return labsInput(m);
    if (q.type === 'records') return recordsInput(m);
    var a = m.answers || {};
    var v = a[q.id];
    var name = 'q-' + q.id;
    if (q.type === 'single') {
      return '<div class="pills">' + q.options.map(function (o) {
        return '<label class="pill"><input type="radio" name="' + name + '" value="' + esc(o[0]) + '"' + (String(v) === String(o[0]) ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>';
      }).join('') + '</div>';
    }
    if (q.type === 'multi') {
      var vals = Array.isArray(v) ? v : [];
      return '<div class="pills">' + q.options.map(function (o) {
        return '<label class="pill"><input type="checkbox" name="' + name + '" value="' + esc(o[0]) + '"' + (vals.indexOf(o[0]) !== -1 ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>';
      }).join('') + '</div>';
    }
    if (q.type === 'number') {
      var unit = q.unit === 'waist' ? (us() ? 'inches' : 'cm') : q.unit;
      var shown = v;
      if (q.unit === 'waist' && v !== undefined && v !== '' && !us()) shown = Math.round(Number(v) * 2.54);
      return '<div class="inline" style="max-width:260px"><input type="number" step="0.5" min="0" name="' + name + '" value="' + esc(shown === undefined ? '' : shown) + '"><span class="unit">' + esc(unit) + '</span></div>';
    }
    if (q.type === 'text') return '<input type="text" name="' + name + '" value="' + esc(v === undefined ? (q.id === 'dislikes' ? m.dislikes.join(', ') : q.id === 'favorites' ? m.favoriteFoods.join(', ') : '') : v) + '">';
    if (q.type === 'textarea') return '<textarea name="' + name + '">' + esc(v === undefined ? (q.id === 'meds' ? m.medications.join('\n') : '') : v) + '</textarea>';
    if (q.type === 'body') {
      if (us()) {
        var inches = m.heightCm ? Math.round(m.heightCm / 2.54) : '';
        return '<div class="fields"><div><label>Height</label><div class="inline"><input type="number" name="heightFt" min="0" max="8" placeholder="ft" value="' + (inches !== '' ? Math.floor(inches / 12) : '') + '"><span class="unit">ft</span>' +
          '<input type="number" name="heightIn" min="0" max="11" placeholder="in" value="' + (inches !== '' ? inches % 12 : '') + '"><span class="unit">in</span></div></div>' +
          '<div><label>Weight</label><div class="inline"><input type="number" step="0.1" name="weight" value="' + (m.weightKg ? kgToLb(m.weightKg) : '') + '"><span class="unit">lb</span></div></div></div>';
      }
      return '<div class="fields"><div><label>Height</label><div class="inline"><input type="number" name="heightCm" value="' + esc(m.heightCm || '') + '"><span class="unit">cm</span></div></div>' +
        '<div><label>Weight</label><div class="inline"><input type="number" step="0.1" name="weight" value="' + esc(m.weightKg || '') + '"><span class="unit">kg</span></div></div></div>';
    }
    if (q.type === 'grid') {
      var grid = v || {};
      return '<div class="table-wrap"><table class="react-grid"><tbody>' + q.rows.map(function (r) {
        return '<tr><td>' + esc(r[1]) + '</td><td><select name="' + name + '-' + r[0] + '"><option value="">—</option>' +
          q.options.map(function (o) { return opt(o[0], o[1], grid[r[0]] || ''); }).join('') + '</select></td></tr>';
      }).join('') + '</tbody></table></div>';
    }
    return '';
  }

  function viewCheck(m, step) {
    var age = ageOf(m);
    var c = Q.context(m, m.answers || {}, age);
    var sections = Q.visibleSections(c);
    step = Math.max(0, Math.min(step, sections.length - 1));
    var sec = sections[step];
    var prog = Q.progress(m, age);
    var steps = sections.map(function (s, i) {
      return '<a class="step' + (i === step ? ' current' : '') + '" href="#/member/' + esc(m.id) + '/check/' + i + '">' + (i + 1) + '. ' + esc(s.title) + '</a>';
    }).join('');
    var qs = sec.questions.map(function (q) {
      return '<div class="question" data-q="' + esc(q.id) + '"><div class="qtext">' + esc(Q.textOf(q, c)) + '</div>' +
        (q.help ? '<div class="hint" style="margin-bottom:8px">' + esc(q.help) + '</div>' : '') + inputFor(q, m, c) + '</div>';
    }).join('');
    var last = step === sections.length - 1;
    return '<div class="spread" style="margin-bottom:6px"><div><h1>Health questions for ' + esc(m.name) + '</h1>' +
      '<div class="muted small">' + (age !== null && age < 18 ? 'Answer for ' + esc(m.name) + ' — "you" means them. ' : '') + 'Skip anything you don\'t know. Answers save as you go.</div></div>' +
      '<a class="btn" href="#/member/' + esc(m.id) + '">Back to guide</a></div>' +
      '<div class="progress" title="' + prog.pct + '% answered"><span style="width:' + prog.pct + '%"></span></div>' +
      '<nav class="steps no-print">' + steps + '</nav>' +
      '<form id="check-form" class="card" data-id="' + esc(m.id) + '" data-step="' + step + '">' +
      '<h2>' + esc(sec.title) + '</h2><p class="muted">' + esc(sec.intro || '') + '</p>' + qs +
      '<div class="form-actions">' +
      (step > 0 ? '<button type="submit" class="btn" name="go" value="' + (step - 1) + '" style="margin-right:auto">← Back</button>' : '') +
      '<button type="submit" class="btn" name="go" value="results">Save &amp; see results</button>' +
      (!last ? '<button type="submit" class="btn primary" name="go" value="' + (step + 1) + '">Next →</button>' : '') +
      '</div></form>';
  }

  function readCheckForm(form, m) {
    var age = ageOf(m);
    m.answers = m.answers || {};
    var c = Q.context(m, m.answers, age);
    var step = Number(form.getAttribute('data-step'));
    var sec = Q.visibleSections(c)[step];
    if (!sec) return;
    var f = form.elements;
    sec.questions.forEach(function (q) {
      var name = 'q-' + q.id;
      if (q.type === 'single') {
        var picked = form.querySelector('input[name="' + name + '"]:checked');
        if (picked) m.answers[q.id] = picked.value;
      } else if (q.type === 'multi') {
        m.answers[q.id] = Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (i) { return i.value; });
      } else if (q.type === 'number') {
        var raw = f[name] ? f[name].value : '';
        if (raw === '') delete m.answers[q.id];
        else m.answers[q.id] = q.unit === 'waist' && !us() ? Math.round(Number(raw) / 2.54 * 10) / 10 : Number(raw);
      } else if (q.type === 'text' || q.type === 'textarea') {
        if (f[name]) m.answers[q.id] = f[name].value.trim();
      } else if (q.type === 'grid') {
        var grid = {};
        q.rows.forEach(function (r) { var el = f[name + '-' + r[0]]; if (el && el.value) grid[r[0]] = el.value; });
        m.answers[q.id] = grid;
      } else if (q.type === 'wearable') {
        m.wearable = m.wearable || {};
        var dev = form.querySelector('input[name="w-device"]:checked');
        if (dev) m.wearable.device = dev.value;
        Labs.WEARABLE_FIELDS.forEach(function (fd) {
          var el = f['w-' + fd.id];
          if (el) m.wearable[fd.id] = el.value === '' ? null : Number(el.value);
        });
        var st = form.querySelector('input[name="w-stress"]:checked');
        if (st) m.wearable.stress = st.value;
        m.wearable.updatedAt = new Date().toISOString();
      } else if (q.type === 'body') {
        if (us()) {
          var ft = Number(f.heightFt.value) || 0, inch = Number(f.heightIn.value) || 0;
          if (ft || inch) m.heightCm = Math.round((ft * 12 + inch) * 2.54 * 10) / 10;
        } else if (f.heightCm.value) m.heightCm = Number(f.heightCm.value);
        if (f.weight.value) m.weightKg = us() ? lbToKg(Number(f.weight.value)) : Number(f.weight.value);
      }
    });
    Q.syncProfile(m);
    m.answersUpdatedAt = new Date().toISOString();
    m.updatedAt = m.answersUpdatedAt;
  }

  function sourceLinks(ids, index) {
    return ids.map(function (id) {
      var s = Q.SOURCES[id];
      if (index.indexOf(id) === -1) index.push(id);
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" title="' + esc(s.title) + '">[' + (index.indexOf(id) + 1) + '] ' + esc(s.org) + ' ' + s.year + '</a>';
    }).join(' · ');
  }

  function pendingSuggestions(m, list) {
    return list.filter(function (s) {
      if (s.kind === 'condition') return m.conditions.indexOf(s.key) === -1;
      if (s.kind === 'intolerance') return m.intolerances.indexOf(s.key) === -1;
      if (s.kind === 'allergy') return !m.allergies[s.key] || (s.severity === 'severe' && m.allergies[s.key] !== 'severe');
      if (s.kind === 'otherAllergy') return !m.otherAllergies.some(function (o) { return o.name.toLowerCase() === s.name.toLowerCase(); });
      return true;
    });
  }

  function viewResults(m) {
    var age = ageOf(m);
    var r = Q.analyze(m, age);
    var prog = Q.progress(m, age);
    var cited = [];

    var suggestions = pendingSuggestions(m, r.suggestions);
    var suggestHtml = suggestions.length ? '<form id="suggest-form" class="card" data-id="' + esc(m.id) + '"><h2>Update ' + esc(m.name) + '\'s profile?</h2>' +
      '<p class="muted small">Ticked items are things you told us directly or reactions serious enough to avoid until tested. Unticked items are only suspicions — add them once a doctor confirms, or if you want the meal plan to account for them now.</p>' +
      '<div class="checks">' + suggestions.map(function (s, i) {
        return '<label><input type="checkbox" name="s" value="' + i + '"' + (s.checked ? ' checked' : '') + '> ' + esc(s.label) + '</label>';
      }).join('') + '</div><div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn primary" type="submit">Add ticked items to profile</button></div></form>' : '';

    var groups = ['urgent', 'doctor', 'change'].map(function (lvl) {
      var items = r.findings.filter(function (f) { return f.level === lvl; });
      if (!items.length) return '';
      return '<section class="finding-group"><h2><span class="badge ' + LEVELS[lvl].cls + '">' + items.length + '</span> ' + LEVELS[lvl].title + '</h2>' +
        '<p class="muted small">' + LEVELS[lvl].blurb + '</p>' +
        items.map(function (f) {
          return '<article class="card finding ' + LEVELS[lvl].cls + '"><h3>' + esc(f.title) + '</h3>' +
            '<div class="small"><strong>Why:</strong> ' + esc(f.because.join(' ')) + '</div>' +
            '<ul>' + f.todo.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
            '<div class="evidence"><span class="badge">' + esc(f.strength) + '</span> ' + sourceLinks(f.sources, cited) + '</div></article>';
        }).join('') + '</section>';
    }).join('');

    var good = r.good.length ? '<section class="card"><h2>Doing well</h2><ul class="plain">' + r.good.map(function (g) {
      return '<li>✓ ' + esc(g.text) + ' <span class="small">' + sourceLinks([g.source], cited) + '</span></li>';
    }).join('') + '</ul></section>' : '';

    var screens = r.screenings.length ? '<section class="card"><h2>Check-ups recommended for ' + esc(m.name) + '\'s age</h2>' +
      '<p class="muted small">Routine preventive care for everyone this age (USPSTF grade A/B or AAP). Ask whether each is due.</p><ul class="plain">' +
      r.screenings.map(function (s) { return '<li>• ' + esc(s.text) + ' <span class="small">' + sourceLinks([s.source], cited) + '</span></li>'; }).join('') + '</ul></section>' : '';

    var sc = r.scores, scoreRows = [];
    if (sc.bmi !== null) scoreRows.push(['BMI', sc.bmi, sc.bmi < 18.5 ? 'Under 18.5: underweight' : sc.bmi < 25 ? '18.5–24.9: healthy range' : sc.bmi < 30 ? '25–29.9: overweight' : '30+: obesity']);
    if (sc.ada) scoreRows.push(['ADA diabetes risk', sc.ada.score + ' / 10', sc.ada.high ? '5+: high risk' : 'Under 5: lower risk']);
    if (sc.stopBang) scoreRows.push(['STOP-Bang (sleep apnea)', sc.stopBang.score + ' / 8', sc.stopBang.level + ' risk' + (sc.stopBang.unknown ? ' (' + sc.stopBang.unknown + ' "don\'t know")' : '')]);
    if (sc.phq2 !== null) scoreRows.push(['PHQ-2 (depression)', sc.phq2 + ' / 6', sc.phq2 >= 3 ? '3+: positive screen' : 'Negative screen']);
    if (sc.gad2 !== null) scoreRows.push(['GAD-2 (anxiety)', sc.gad2 + ' / 6', sc.gad2 >= 3 ? '3+: positive screen' : 'Negative screen']);
    if (sc.auditC) scoreRows.push(['AUDIT-C (alcohol)', sc.auditC.score + ' / 12', sc.auditC.positive ? 'Positive screen' : 'Low risk']);
    var scores = scoreRows.length ? '<section class="card"><h2>Screening scores</h2><div class="table-wrap"><table><thead><tr><th>Tool</th><th>Score</th><th>Meaning</th></tr></thead><tbody>' +
      scoreRows.map(function (row) { return '<tr><td>' + esc(row[0]) + '</td><td><strong>' + esc(row[1]) + '</strong></td><td>' + esc(row[2]) + '</td></tr>'; }).join('') + '</tbody></table></div></section>' : '';

    var refs = '<section class="card"><h2>Sources</h2><ol class="small">' + cited.map(function (id) {
      var s = Q.SOURCES[id];
      return '<li>' + esc(s.org) + ' (' + s.year + '). <a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></li>';
    }).join('') + '</ol></section>';

    return '<div class="stack">' +
      '<div class="spread"><div><h1>' + esc(m.name) + '\'s health check-up</h1><div class="muted small">' + prog.pct + '% of questions answered · ' +
      'results update automatically whenever answers or the profile change</div></div>' +
      '<div class="row no-print"><a class="btn" href="#/member/' + esc(m.id) + '/check/0">Edit answers</a><a class="btn" href="#/member/' + esc(m.id) + '">Guide</a><button class="btn" data-action="print">Print</button></div></div>' +
      (prog.pct < 100 ? '<div class="alert info"><div>Some questions are unanswered, so some checks couldn\'t run. <a href="#/member/' + esc(m.id) + '/check/0">Finish the questions</a> for a fuller picture.</div></div>' : '') +
      suggestHtml +
      (groups || '<section class="card"><p>Nothing flagged from the answers so far.</p></section>') +
      good + screens + scores + refs +
      '<p class="muted small">These are screening results, not diagnoses. Screening tools find people who would benefit from a closer look; only a clinician can confirm a condition. ' +
      'If something feels urgent, don\'t wait for an appointment — call your doctor, 911, or 988 for a mental-health crisis.</p></div>';
  }

  // ------------------------------------------------------------------- data

  function viewData() {
    var count = state.members.length;
    return '<h1>Your data</h1><div class="grid grid-2">' +
      '<section class="card"><h2>Settings</h2><label>Units</label><select data-action="units">' + opt('us', 'US (lb, ft/in)', state.settings.units) + opt('metric', 'Metric (kg, cm)', state.settings.units) + '</select></section>' +
      '<section class="card"><h2>Backup &amp; move</h2><p class="muted small">Your information is stored only in this browser on this computer. ' +
      'Export a backup regularly, and use it to move everything to another computer or browser.</p>' +
      '<div class="row"><button class="btn primary" data-action="export">Export backup</button>' +
      '<label class="btn" style="margin:0">Import backup<input type="file" accept=".json,application/json" data-action="import" hidden></label></div>' +
      '<p class="muted small" style="margin-top:10px">' + count + ' ' + (count === 1 ? 'person' : 'people') + ' · last saved ' + esc(state.savedAt ? state.savedAt.slice(0, 16).replace('T', ' ') : 'never') + '</p></section>' +
      '<section class="card"><h2>Demo</h2><p class="muted small">Load a made-up family of five to see how everything works. This replaces what\'s here.</p><button class="btn" data-action="load-demo">Load demo family</button></section>' +
      '<section class="card"><h2>Start over</h2><p class="muted small">Delete every profile and recipe from this browser. Export a backup first if you want to keep anything.</p><button class="btn danger" data-action="reset">Delete everything</button></section>' +
      '</div>' +
      '<section class="card" style="margin-top:16px"><h2>About this guide</h2>' +
      '<p>Guidance comes from mainstream sources (Dietary Guidelines for Americans, American Heart Association, American Diabetes Association, DASH, National Kidney Foundation, FDA food-safety advice). ' +
      'It is general information to help the family plan meals and remember what each person needs — it is <strong>not medical advice</strong>. ' +
      'When your doctor, pharmacist or dietitian says something different, follow them and record it in the profile ("Must avoid", "Limit", calorie override or Notes).</p>' +
      '<p class="muted small">Calories: Mifflin-St Jeor equation for adults; Dietary Guidelines estimates for ages 2–18. Medication notes cover common, well-documented food interactions only.</p>' +
      '<h3>Privacy</h3><p class="small">Profiles, answers, lab results, tracker data and records are stored only in this browser. The app goes online only when you ask it to: ' +
      '<strong>Find stores</strong> sends a location (or the ZIP you type) to OpenStreetMap, and <strong>Compare products</strong> sends a food name to Open Food Facts. No health information is ever sent.</p></section>';
  }

  function download(filename, text) {
    var blob = new Blob([text], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function keepScroll() {
    var y = window.scrollY;
    route();
    window.scrollTo(0, y);
  }

  function friendlyNetError(e) {
    var msg = (e && e.message) || '';
    if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return 'Couldn\'t reach the service — check your internet connection and try again.';
    return msg || 'Something went wrong. Try again in a minute.';
  }

  function confetti() {
    var box = document.getElementById('confetti');
    if (!box || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var bits = ['🥦', '⭐', '🍓', '💪', '🥑', '✨'];
    for (var i = 0; i < 18; i++) {
      var sp = document.createElement('span');
      sp.textContent = bits[i % bits.length];
      sp.style.left = (10 + Math.random() * 80) + '%';
      sp.style.animationDelay = (Math.random() * 0.3) + 's';
      box.appendChild(sp);
    }
    setTimeout(function () { box.innerHTML = ''; }, 1600);
  }

  function builderAction(action, el) {
    var b = builder();
    var id = el.getAttribute('data-id');
    if (action === 'b-scroll') { var pp = document.querySelector('.plate-panel'); if (pp) pp.scrollIntoView({ behavior: 'smooth' }); return; }
    var before = Foods.score(b.items, builderTargets(b, eatersFor(b))).score;
    if (action === 'b-who') b.who = id;
    else if (action === 'b-meal') b.meal = id;
    else if (action === 'b-cat') b.cat = id;
    else if (action === 'b-add') {
      var ex = b.items.filter(function (it) { return it.foodId === id; })[0];
      if (ex) ex.qty++; else b.items.push({ foodId: id, qty: 1 });
    } else if (action === 'b-qty') {
      var it = b.items[Number(id)];
      it.qty += Number(el.getAttribute('data-d'));
      if (it.qty <= 0) b.items.splice(Number(id), 1);
    } else if (action === 'b-clear') { b.items = []; b.name = ''; b.editing = null; }
    else if (action === 'b-surprise') {
      var eaters = eatersFor(b);
      var allowed = Foods.FOODS.filter(function (fd) { return foodFit(fd, eaters).status === 'ok'; }).map(function (fd) { return fd.id; });
      b.items = Foods.surprise(allowed);
      b.name = '';
    } else if (action === 'b-save') {
      var nameEl = document.getElementById('meal-name'), dayEl = document.getElementById('meal-day');
      var foods = b.items.map(function (x) { return Foods.byId(x.foodId); }).filter(Boolean);
      var auto = foods.filter(function (fd) { return fd.cat === 'protein'; }).concat(foods.filter(function (fd) { return fd.cat !== 'protein'; })).slice(0, 3).map(function (fd) { return fd.name.split(/[ ,(]/)[0]; }).join(', ');
      var wk = weekKey();
      state.meals = state.meals || {};
      state.meals[wk] = (state.meals[wk] || []).filter(function (x) { return x.id !== b.editing; });
      state.meals[wk].push({ id: b.editing || ('meal' + Date.now().toString(36)), day: Number(dayEl.value), slot: b.meal, who: b.who,
        name: (nameEl.value || '').trim() || auto + ' plate', items: JSON.parse(JSON.stringify(b.items)) });
      Object.keys(state.meals).forEach(function (k) { if (k < wk) delete state.meals[k]; });
      b.items = []; b.name = ''; b.editing = null;
      persist('Saved to ' + E.DAYS[Number(dayEl.value)] + ' ' + MEAL_LABELS[b.meal].toLowerCase());
      go('#/week');
      return;
    } else if (action === 'w-edit' || action === 'w-del') {
      var wk2 = weekKey();
      var meal = (state.meals[wk2] || []).filter(function (x) { return x.id === id; })[0];
      if (action === 'w-del') {
        state.meals[wk2] = state.meals[wk2].filter(function (x) { return x.id !== id; });
        persist('Meal removed');
        route();
        return;
      }
      b.items = JSON.parse(JSON.stringify(meal.items)); b.who = meal.who; b.meal = meal.slot; b.day = meal.day; b.name = meal.name; b.editing = meal.id;
      persist();
      go('#/plan');
      return;
    } else if (action === 'w-plan') {
      b.day = Number(el.getAttribute('data-day'));
      persist();
      return;
    }
    var nameNow = document.getElementById('meal-name');
    if (nameNow) b.name = nameNow.value;
    var dayNow = document.getElementById('meal-day');
    if (dayNow) b.day = Number(dayNow.value);
    persist();
    keepScroll();
    var after = Foods.score(b.items, builderTargets(b, eatersFor(b))).score;
    if (after >= 85 && before < 85) confetti();
  }

  function importWearable(el) {
    var file = el.files && el.files[0];
    if (!file) return;
    var form = el.closest('form');
    var m = member(form.getAttribute('data-id'));
    readCheckForm(form, m);
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var out = Labs.importWearableCSV(String(reader.result), 30);
        m.wearable = m.wearable || {};
        ['sleepHours', 'sleepScore', 'restingHr', 'hrv', 'recovery', 'spo2', 'stressScore'].forEach(function (k) { if (out[k] !== undefined) m.wearable[k] = out[k]; });
        m.wearable.importNote = 'Imported ' + out.importedRows + ' days from ' + file.name + '. Matched: ' + out.columns.join(', ') + '. Check the numbers below look right.';
        m.wearable.updatedAt = new Date().toISOString();
        persist('Tracker data imported');
      } catch (e) {
        alert('Could not read that file: ' + e.message);
      }
      keepScroll();
    };
    reader.readAsText(file);
  }

  function addLabEntry(el, silent) {
    var form = el.tagName === 'FORM' ? el : el.closest('form');
    var m = member(form.getAttribute('data-id'));
    var f = form.elements, values = {};
    Labs.LABS.forEach(function (l) {
      var v = f['lab-' + l.id] && f['lab-' + l.id].value;
      if (v === '' || v === undefined) return;
      var n = Number(v);
      if (!us() && l.si) n = Math.round(n / l.si.factor * 100) / 100;
      values[l.id] = n;
    });
    if (!Object.keys(values).length) { if (!silent) toast('Type at least one result first'); return; }
    m.labs = m.labs || [];
    m.labs.push({ id: 'lab' + Date.now().toString(36), date: f['lab-date'].value || E.isoDate(new Date()), note: f['lab-note'].value.trim(), values: values });
    m.updatedAt = new Date().toISOString();
    persist(Object.keys(values).length + ' result' + (Object.keys(values).length === 1 ? '' : 's') + ' added');
    if (!silent) keepScroll();
  }

  function uploadDoc(el) {
    var file = el.files && el.files[0];
    if (!file) return;
    var box = el.closest('.upload-box');
    var memberId = (document.getElementById('doc-list') || {}).getAttribute ? document.getElementById('doc-list').getAttribute('data-member') : null;
    var meta = {
      kind: box.querySelector('[name="doc-kind"]').value,
      date: box.querySelector('[name="doc-date"]').value,
      title: box.querySelector('[name="doc-title"]').value.trim() || file.name.replace(/\.[^.]+$/, '')
    };
    Docs.add(memberId, file, meta).then(function () {
      toast('Saved ' + meta.title);
      box.querySelector('[name="doc-title"]').value = '';
      el.value = '';
      fillDocList();
    }).catch(function (e) { alert(e.message); });
  }

  // ----------------------------------------------------------------- events

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-action]');
    if (!el || el.tagName === 'INPUT' || el.tagName === 'SELECT') return;
    var action = el.getAttribute('data-action');
    var id = el.getAttribute('data-id');

    if (action === 'print') window.print();
    else if (action === 'load-demo') {
      if (state.members.length && !confirm('Replace your current family with the demo family?')) return;
      state = Store.migrate(JSON.parse(JSON.stringify(window.FHDemo)));
      persist('Demo family loaded');
      go('#/');
    } else if (action === 'mark-reviewed') {
      member(id).reviewedAt = E.isoDate(new Date());
      persist('Marked as reviewed');
      route();
    } else if (action === 'delete-member') {
      var m = member(id);
      if (!confirm('Delete ' + m.name + ' and all their readings? This can\'t be undone.')) return;
      state.members = state.members.filter(function (x) { return x.id !== id; });
      Docs.removeFor(id).catch(function () {});
      persist('Deleted');
      go('#/');
    } else if (action === 'delete-log') {
      var mm = member(id), date = el.getAttribute('data-date'), at = el.getAttribute('data-at');
      var idx = -1;
      mm.log.forEach(function (r, i) { if (idx === -1 && r.date === date && String(r.at || '') === at) idx = i; });
      if (idx !== -1) mm.log.splice(idx, 1);
      persist('Removed');
      route();
    } else if (action === 'recipe-filter') {
      recipeFilter = el.getAttribute('data-filter');
      route();
    } else if (action === 'delete-recipe') {
      state.customRecipes = state.customRecipes.filter(function (r) { return r.id !== id; });
      persist('Recipe deleted');
      route();
    } else if (action.indexOf('b-') === 0 || action.indexOf('w-') === 0) {
      builderAction(action, el);
    } else if (action === 'loc-me' || action === 'loc-set') {
      var find = action === 'loc-me' ? Shop.currentLocation() : Shop.geocode((document.getElementById('loc-q') || {}).value || '');
      if (action === 'loc-set' && !((document.getElementById('loc-q') || {}).value || '').trim()) { toast('Type a ZIP code or city first'); return; }
      el.disabled = true; el.textContent = 'Finding stores…';
      shopCache.error.stores = null;
      find.then(function (loc) {
        state.location = loc;
        persist();
        return Shop.nearbyStores(loc).then(function (stores) {
          shopCache.stores = stores;
          shopCache.storesFor = loc.lat.toFixed(3) + ',' + loc.lon.toFixed(3);
        });
      }).catch(function (e) { shopCache.error.stores = friendlyNetError(e); }).then(function () { route(); });
    } else if (action === 'prod-load') {
      var pm = eatersFor(builder());
      var allergyKeys = [];
      pm.forEach(function (x) { Object.keys(x.allergies || {}).forEach(function (k) { if (allergyKeys.indexOf(k) === -1) allergyKeys.push(k); }); });
      el.disabled = true; el.textContent = 'Searching…';
      shopCache.error[id] = null;
      Shop.products(Foods.byId(id).name, allergyKeys).then(function (list) { shopCache.products[id] = list; })
        .catch(function (e) { shopCache.error[id] = friendlyNetError(e); }).then(function () { var y = window.scrollY; route(); window.scrollTo(0, y); });
    } else if (action === 'r-del') {
      (state.ratings[id] || []).splice(Number(el.getAttribute('data-i')), 1);
      persist('Rating removed');
      route();
    } else if (action === 'lab-add') {
      addLabEntry(el);
    } else if (action === 'lab-del') {
      var lm = member(el.closest('form').getAttribute('data-id'));
      lm.labs = (lm.labs || []).filter(function (x) { return x.id !== id; });
      persist('Lab entry removed');
      keepScroll();
    } else if (action === 'doc-open') {
      Docs.get(id).then(function (d) {
        var url = URL.createObjectURL(d.blob);
        var w = window.open(url, '_blank');
        if (!w) { var a = document.createElement('a'); a.href = url; a.download = d.fileName; a.click(); }
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      });
    } else if (action === 'doc-del') {
      if (!confirm('Delete this record from this device?')) return;
      Docs.remove(id).then(function () { toast('Record deleted'); fillDocList(); });
    } else if (action === 'export') {
      Docs.exportAll().catch(function () { return []; }).then(function (docs) {
        var data = JSON.parse(Store.exportJSON(state));
        data.documents = docs;
        download('family-health-backup-' + E.isoDate(new Date()) + '.json', JSON.stringify(data, null, 2));
        toast('Backup downloaded' + (docs.length ? ' (with ' + docs.length + ' record' + (docs.length === 1 ? '' : 's') + ')' : ''));
      });
    } else if (action === 'reset') {
      if (!confirm('Delete every profile, reading and custom recipe from this browser?')) return;
      state = Store.empty();
      Docs.clear().catch(function () {});
      persist('Everything deleted');
      go('#/');
    }
  });

  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el.type === 'file' && el.getAttribute('data-action') === 'wearable-csv') { importWearable(el); return; }
    if (el.type === 'file' && el.getAttribute('data-action') === 'doc-upload') { uploadDoc(el); return; }
    if (el.getAttribute('data-action') === 'b-safe') { builder().safeOnly = el.checked; persist(); keepScroll(); return; }
    var checkForm = el.form && el.form.id === 'check-form' ? el.form : null;
    if (checkForm) {
      // "None of these" is exclusive with the other choices.
      if (el.type === 'checkbox') {
        var boxes = checkForm.querySelectorAll('input[name="' + el.name + '"]');
        Array.prototype.forEach.call(boxes, function (b) {
          if (el.checked && el.value === 'none' && b !== el) b.checked = false;
          if (el.checked && el.value !== 'none' && (b.value === 'none' || (b.value === 'unsure' && el.value !== 'unsure') || (b.value === 'dk' && el.value !== 'dk'))) b.checked = false;
        });
      }
      var who = member(checkForm.getAttribute('data-id'));
      readCheckForm(checkForm, who);
      persist();
      // Typed fields never change which questions show; re-rendering on their blur would swallow a click.
      if (el.type !== 'radio' && el.type !== 'checkbox' && el.tagName !== 'SELECT') return;
      // Re-render so follow-up questions appear or disappear, keeping the scroll position.
      var y = window.scrollY;
      route();
      window.scrollTo(0, y);
      return;
    }
    var action = el.getAttribute('data-action');
    if (action === 'units') {
      state.settings.units = el.value;
      persist('Units updated');
    } else if (action === 'import') {
      var file = el.files && el.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = Store.importJSON(String(reader.result));
          if (state.members.length && !confirm('Replace what\'s here with the backup (' + data.members.length + ' people)?')) return;
          state = data;
          persist('Backup imported');
          var parsed = JSON.parse(String(reader.result));
          if (parsed.documents && parsed.documents.length) Docs.importAll(parsed.documents).then(function () { toast('Backup and ' + parsed.documents.length + ' records imported'); });
          go('#/');
        } catch (e) {
          alert('Could not import: ' + e.message);
        }
      };
      reader.readAsText(file);
    }
  });

  document.addEventListener('submit', function (ev) {
    var form = ev.target;
    ev.preventDefault();
    var submitter = ev.submitter;
    if (form.id === 'quick-form') {
      var qf = form.elements;
      var now = new Date().toISOString();
      var nm = Store.normalizeMember({ name: qf.name.value.trim(), relation: qf.relation.value.trim(), birthdate: qf.birthdate.value, sex: qf.sex.value, createdAt: now, updatedAt: now });
      state.members.push(nm);
      persist('Added ' + nm.name);
      go('#/member/' + nm.id + (submitter && submitter.value === 'profile' ? '/edit' : '/check/0'));
      return;
    }
    if (form.id === 'check-form') {
      var cm = member(form.getAttribute('data-id'));
      readCheckForm(form, cm);
      // Lab numbers typed but not yet added are saved rather than lost.
      if (form.querySelector('[name="lab-date"]')) addLabEntry(form, true);
      cm.reviewedAt = E.isoDate(new Date());
      persist();
      var dest = submitter ? submitter.value : 'results';
      go('#/member/' + cm.id + (dest === 'results' ? '/results' : '/check/' + dest));
      return;
    }
    if (form.id === 'suggest-form') {
      var sm = member(form.getAttribute('data-id'));
      var res = Q.analyze(sm, ageOf(sm));
      var shownS = pendingSuggestions(sm, res.suggestions);
      var picked = Array.prototype.slice.call(form.querySelectorAll('input[name="s"]:checked')).map(function (i) { return shownS[Number(i.value)]; });
      picked.forEach(function (s) { if (s) Q.applySuggestion(sm, s); });
      sm.updatedAt = new Date().toISOString();
      persist(picked.length + ' item' + (picked.length === 1 ? '' : 's') + ' added — guide and meal plan updated');
      route();
      return;
    }
    if (form.id === 'rating-form') {
      var rfE = form.elements, fid = form.getAttribute('data-id');
      state.ratings = state.ratings || {};
      (state.ratings[fid] = state.ratings[fid] || []).push({ product: rfE.product.value.trim(), who: rfE.who.value, stars: Number(rfE.stars.value), note: rfE.note.value.trim(), date: E.isoDate(new Date()) });
      persist('Thanks — rating saved');
      keepScroll();
      return;
    }
    if (form.id === 'member-form') {
      var existing = member(form.getAttribute('data-id'));
      var m = readMemberForm(form, existing);
      if (existing) state.members[state.members.indexOf(existing)] = m;
      else state.members.push(m);
      persist('Saved — guide updated');
      go('#/member/' + m.id);
    } else if (form.id === 'log-form') {
      var who = member(form.getAttribute('data-id'));
      var f = form.elements;
      var num = function (n) { return f[n].value === '' ? undefined : Number(f[n].value); };
      var entry = { date: f.date.value, at: Date.now().toString(36), note: f.note.value.trim() || undefined };
      var w = num('weight');
      if (w !== undefined) entry.weightKg = us() ? lbToKg(w) : w;
      ['bpSys', 'bpDia', 'a1c', 'ldl'].forEach(function (k) { if (num(k) !== undefined) entry[k] = num(k); });
      if (Object.keys(entry).length <= 3 && !entry.note) { toast('Enter at least one reading'); return; }
      who.log.push(entry);
      persist('Reading added');
      route();
    } else if (form.id === 'recipe-form') {
      var rf = form.elements;
      var tags = Array.prototype.slice.call(form.querySelectorAll('input[name="tags"]:checked')).map(function (i) { return i.value; });
      state.customRecipes.push({
        id: 'custom-' + Date.now().toString(36),
        name: rf.name.value.trim(),
        meal: rf.meal.value,
        ingredients: splitList(rf.ingredients.value),
        tags: tags,
        swaps: [],
        custom: true
      });
      persist('Recipe added — it can now appear in the meal plan');
      route();
    }
  });

  document.addEventListener('input', function (ev) {
    if (ev.target.id !== 'food-search') return;
    builder().search = ev.target.value;
    var pos = ev.target.selectionStart;
    keepScroll();
    var box = document.getElementById('food-search');
    if (box) { box.focus(); box.setSelectionRange(pos, pos); }
  });

  window.addEventListener('hashchange', route);
  route();
})();
