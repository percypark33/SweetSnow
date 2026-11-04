/*
 * Shared data layer for the three design directions. Every direction reads
 * the same saved family (or the demo family when none exists) through the
 * app's own modules, so the numbers match the main app exactly.
 */
(function (root) {
  'use strict';

  var E = root.FHEngine, Store = root.FHStore, Foods = root.FHFoods, P = root.FHPersonal, DB = root.FHDietBook, W = root.FHWorkout, Planner = root.FHPlanner, Labs = root.FHLabs, KB = root.FHKnowledge;

  var state = Store.load();
  var demo = !state.members.length;
  if (demo) state = Store.migrate(JSON.parse(JSON.stringify(root.FHDemo)));
  Foods.setCustom(state.customIngredients);

  function today() { return new Date(); }
  function key() { return E.isoDate(today()); }
  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]; }); }

  function blocked(fd, m) {
    return E.evaluateRecipe({ id: fd.id, ingredients: [fd.name], tags: fd.tags, swaps: [] }, E.profileRules(m, today())).status === 'no';
  }

  // Everything a screen needs about one person.
  function person(m) {
    var g = E.buildGuide(m, today());
    var a = DB.amounts({ age: g.age, sex: m.sex, heightCm: m.heightCm, weightKg: g.weightKg, kcal: g.targets.kcal, activity: m.activity, goal: m.goal });
    var day = P.daily(m, g.age, g.focus);
    var w = W.plan({ age: g.age, sex: m.sex, conditions: m.conditions, goal: m.goal, fitness: m.fitness, wearable: m.wearable });
    var picks = P.foodPicks(g.focus);
    var top = Foods.FOODS.filter(function (fd) { return picks[fd.id].score > 0 && !blocked(fd, m); })
      .sort(function (x, y) { return picks[y.id].score - picks[x.id].score; }).slice(0, 8)
      .map(function (fd) { return { food: fd, why: picks[fd.id].reasons[0] }; });
    var entry = (m.daily || {})[key()] || {};
    return { m: m, g: g, a: a, day: day, w: w, top: top, labs: Labs.latestLabs(m), entry: entry, dayIdx: (today().getDay() + 6) % 7 };
  }

  // One dinner (or any slot) for the given people from the smart planner.
  function mealIdea(members, slot, seed) {
    var lib = Planner.library(state.customIngredients);
    var adults = members.filter(function (m) { var x = E.ageYears(m.birthdate, today()); return x === null || x >= 18; });
    var base = (adults.length ? adults : members).map(function (m) { return E.buildGuide(m, today()).targets; });
    var kcal = base.reduce(function (s, t) { return s + (t.kcal || 2000); }, 0) / base.length;
    var res = Planner.smartPlan({
      lib: lib, pantry: state.pantry, slots: [slot || 'dinner'], days: 1, seed: seed || key(), cuisine: (state.planner || {}).cuisine || 'any',
      targets: function (s) { return Foods.mealTargets(kcal, null, s); },
      eaters: members.map(function (m) {
        var pk = P.foodPicks(P.focus(m, E.ageYears(m.birthdate, today())));
        return { name: m.name, prefs: Object.assign({}, state.householdPrefs, m.foodPrefs || {}), pick: function (id) { return pk[id] ? pk[id].score : 0; }, blocked: function (fd) { return blocked(fd, m); } };
      })
    });
    var meal = res.days[0] && res.days[0].meals[0];
    if (meal) meal.foods = meal.items.map(function (it) { return Planner.byId(lib, it.foodId); });
    return meal;
  }

  function save() { if (!demo) Store.save(state); }

  function log(m, field, value) {
    m.daily = m.daily || {};
    m.daily[key()] = m.daily[key()] || {};
    m.daily[key()][field] = value;
    save();
  }

  function initials(name) { return String(name || '?').trim().charAt(0).toUpperCase(); }

  root.Dir = { state: state, demo: demo, person: person, mealIdea: mealIdea, log: log, save: save, esc: esc, initials: initials, blocked: blocked,
    E: E, Foods: Foods, P: P, DB: DB, W: W, Labs: Labs, KB: KB, Planner: Planner };
})(this);
