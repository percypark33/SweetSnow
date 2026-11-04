/*
 * Family Health Guide — preference-based meal planner.
 *
 *  - Ingredient library: the meal-builder foods plus anything the family
 *    adds. Each ingredient can be marked "in my kitchen", and loved or
 *    ruled out per person.
 *  - Smart planner (offline): builds days of balanced plates from allowed
 *    ingredients, favouring loved, in-stock and health-matched foods, with
 *    variety, sized to each meal's calorie and protein target.
 *  - Claude planner (optional): sends the same constraints to the Claude
 *    API with the user's own key and asks for recipes as JSON. Results are
 *    re-checked against allergies here, never trusted blindly.
 */
(function (root) {
  'use strict';

  var node = typeof module !== 'undefined' && module.exports;
  var Foods = node ? require('./foods.js') : root.FHFoods;
  var KB = node ? require('./knowledge.js') : root.FHKnowledge;

  var CUISINES = {
    any: { label: 'Anything', flavor: 'salt, pepper, garlic and lemon' },
    mediterranean: { label: 'Mediterranean', flavor: 'olive oil, lemon, garlic, oregano and parsley' },
    mexican: { label: 'Mexican', flavor: 'lime, cumin, chili, cilantro and salsa' },
    asian: { label: 'East Asian', flavor: 'ginger, garlic, scallion, low-sodium soy or tamari and sesame' },
    indian: { label: 'Indian', flavor: 'cumin, turmeric, garam masala, ginger and yogurt' },
    middleeast: { label: 'Middle Eastern', flavor: 'za\'atar, sumac, cumin, lemon and tahini' },
    american: { label: 'American', flavor: 'smoked paprika, garlic, onion and herbs' },
    korean: { label: 'Korean', flavor: 'gochugaru, garlic, sesame, scallion and a little gochujang' }
  };

  var FRUIT = ['berries', 'apple', 'banana', 'orange', 'kiwi', 'grapes'];

  function list(v) { return Array.isArray(v) ? v : []; }

  // All ingredients: built-in foods + custom ones from state.
  function library(custom) {
    return Foods.FOODS.concat(list(custom).map(function (c) { return Object.assign({ tags: [], custom: true, emoji: '🥫' }, c); }));
  }

  function byId(lib, id) { return lib.filter(function (x) { return x.id === id; })[0]; }

  function makeCustom(form) {
    var name = String(form.name || '').trim();
    if (!name) throw new Error('Give the ingredient a name.');
    var num = function (v) { var n = Number(v); return isNaN(n) || v === '' || v === undefined ? 0 : Math.max(0, n); };
    return {
      id: 'c-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-4),
      name: name, cat: Foods.CATEGORIES.some(function (c) { return c.id === form.cat; }) ? form.cat : 'fiber',
      emoji: form.emoji || '🥫', serving: String(form.serving || '1 serving').trim(),
      kcal: num(form.kcal), protein: num(form.protein), carbs: num(form.carbs), fat: num(form.fat), fiber: num(form.fiber),
      tags: list(form.tags), custom: true
    };
  }

  // Seeded random so "Plan again" changes the plan but the same seed repeats it.
  function rng(seed) {
    var h = 2166136261;
    String(seed).split('').forEach(function (ch) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); });
    return function () { h += 0x6D2B79F5; var t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /*
   * opts: {
   *   lib, eaters: [{ name, blocked(food) → reason|null, pick(foodId) → score, prefs: { id: 'love'|'no' } }],
   *   pantry: { id: true }, slots: ['breakfast', ...], days: 7, cuisine, maxMinutes, seed,
   *   targets(slot) → { kcal, protein }, onlyPantry: bool
   * }
   */
  function smartPlan(opts) {
    var rand = rng(opts.seed || 'plan');
    var lib = opts.lib;
    var used = {};
    var allowed = lib.filter(function (fd) {
      if (opts.onlyPantry && !opts.pantry[fd.id]) return false;
      return opts.eaters.every(function (e) { return !e.blocked(fd) && (e.prefs || {})[fd.id] !== 'no'; });
    });
    function weight(fd, slot) {
      var w = 1;
      opts.eaters.forEach(function (e) {
        if ((e.prefs || {})[fd.id] === 'love') w += 2;
        w += Math.max(0, e.pick(fd.id)) * 0.6;
      });
      if (opts.pantry[fd.id]) w += 1.5;
      var morning = /^(oats|eggs|greek-yogurt|berries|banana|ww-bread|chia|peanut-butter|sunbutter|cottage|apple|kiwi|orange|grapes)$/.test(fd.id);
      if (slot === 'breakfast' && morning) w += 2;
      // Lunch and dinner: vegetables over fruit, and no oatmeal.
      if ((slot === 'lunch' || slot === 'dinner') && (morning && fd.id !== 'eggs' || FRUIT.indexOf(fd.id) !== -1)) w *= 0.08;
      if (slot === 'snack' && fd.kcal > 250) w *= 0.3;
      w /= 1 + (used[fd.id] || 0) * 1.5; // variety
      return w;
    }
    function pick(cat, slot, not) {
      var pool = allowed.filter(function (fd) { return fd.cat === cat && (!not || not.indexOf(fd.id) === -1); });
      if (!pool.length) return null;
      var ws = pool.map(function (fd) { return weight(fd, slot); });
      var total = ws.reduce(function (s, x) { return s + x; }, 0), r = rand() * total;
      for (var i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
      return pool[pool.length - 1];
    }
    var days = [];
    for (var d = 0; d < (opts.days || 7); d++) {
      var meals = (opts.slots || ['breakfast', 'lunch', 'dinner']).map(function (slot) {
        var t = opts.targets(slot);
        var items = [];
        var cats = slot === 'snack' ? ['fiber', 'fat'] : slot === 'breakfast' ? ['protein', 'carbs', 'fiber'] : ['protein', 'carbs', 'fiber', 'fiber', 'fat'];
        cats.forEach(function (cat) {
          var fd = pick(cat, slot, items.map(function (x) { return x.foodId; }));
          if (fd) { items.push({ foodId: fd.id, qty: 1 }); used[fd.id] = (used[fd.id] || 0) + 1; }
        });
        // Size to the meal: more protein if short, halve the fat if over calories.
        var tot = totals(lib, items);
        var prot = items.filter(function (x) { return byId(lib, x.foodId).cat === 'protein'; })[0];
        if (prot && t.protein && tot.protein < t.protein * 0.8) { prot.qty = 1.5; tot = totals(lib, items); }
        var carb = items.filter(function (x) { return byId(lib, x.foodId).cat === 'carbs'; })[0];
        if (carb && tot.kcal > t.kcal * 1.25) { carb.qty = 0.5; tot = totals(lib, items); }
        var fatItem = items.filter(function (x) { return byId(lib, x.foodId).cat === 'fat'; })[0];
        if (fatItem && tot.kcal > t.kcal * 1.25) { fatItem.qty = 0.5; tot = totals(lib, items); }
        return { slot: slot, items: items, name: mealName(lib, items, slot, opts.cuisine), totals: tot, flavor: (CUISINES[opts.cuisine] || CUISINES.any).flavor };
      });
      days.push({ day: d, meals: meals });
    }
    return { days: days, allowedCount: allowed.length, shopping: shoppingList(lib, days, opts.pantry) };
  }

  function totals(lib, items) {
    var t = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    items.forEach(function (it) { var fd = byId(lib, it.foodId); if (!fd) return; ['kcal', 'protein', 'carbs', 'fat', 'fiber'].forEach(function (k) { t[k] += fd[k] * it.qty; }); });
    Object.keys(t).forEach(function (k) { t[k] = Math.round(t[k]); });
    return t;
  }

  var STYLE = { breakfast: ['bowl', 'plate', 'scramble'], lunch: ['bowl', 'wrap', 'salad'], dinner: ['plate', 'bowl', 'skillet'], snack: ['snack'] };

  function mealName(lib, items, slot, cuisine) {
    var names = items.map(function (it) { return byId(lib, it.foodId).name.split(/[,(]/)[0].replace(/^(Canned|Firm|Lean|Rolled|Mixed) /i, '').trim(); }).map(function (n, i) { return i ? n.charAt(0).toLowerCase() + n.slice(1) : n.charAt(0).toUpperCase() + n.slice(1); });
    var main = names.slice(0, 3);
    var style = STYLE[slot][items.length % STYLE[slot].length];
    var c = cuisine && cuisine !== 'any' ? CUISINES[cuisine].label + ' ' : '';
    return c + main.join(', ').replace(/, ([^,]*)$/, ' & $1') + ' ' + style;
  }

  function shoppingList(lib, days, pantry) {
    var need = {};
    days.forEach(function (d) { d.meals.forEach(function (m) { m.items.forEach(function (it) { need[it.foodId] = (need[it.foodId] || 0) + it.qty; }); }); });
    return Object.keys(need).map(function (id) { var fd = byId(lib, id); return { id: id, name: fd.name, cat: fd.cat, servings: Math.round(need[id] * 10) / 10, serving: fd.serving, have: !!(pantry || {})[id] }; })
      .sort(function (a, b) { return (a.have - b.have) || a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name); });
  }

  // ---------------------------------------------------------------- Claude

  var MODEL = 'claude-opus-5-5';
  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.1.0/+esm';

  var PLAN_SCHEMA = {
    type: 'object', additionalProperties: false, required: ['days', 'shopping', 'notes'],
    properties: {
      days: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['day', 'meals'], properties: {
        day: { type: 'string' },
        meals: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['slot', 'name', 'ingredients', 'steps', 'minutes', 'why', 'kcal', 'protein_g'], properties: {
          slot: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          name: { type: 'string' },
          ingredients: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['item', 'amount'], properties: { item: { type: 'string' }, amount: { type: 'string' } } } },
          steps: { type: 'array', items: { type: 'string' } },
          minutes: { type: 'integer' },
          kcal: { type: 'integer' },
          protein_g: { type: 'integer' },
          why: { type: 'string' }
        } } }
      } } },
      shopping: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['item', 'amount'], properties: { item: { type: 'string' }, amount: { type: 'string' } } } },
      notes: { type: 'string' }
    }
  };

  /*
   * brief: { eaters: [{ name, age, sex, kcal, protein, mustAvoid: [..], goEasy: [..], focus: [..], loves: [..], never: [..] }],
   *          ingredients: [names], pantry: [names], slots, days, cuisine, maxMinutes, budget, notes, onlyListed }
   */
  function buildPrompt(brief) {
    var lines = [];
    lines.push('Plan ' + brief.days + ' day(s) of ' + brief.slots.join(', ') + ' for this household.');
    lines.push('');
    lines.push('People:');
    brief.eaters.forEach(function (e) {
      lines.push('- ' + e.name + ' (' + [e.age !== null ? 'age ' + e.age : null, e.sex, e.kcal ? '~' + e.kcal + ' kcal/day' : null, e.protein ? e.protein + ' g protein/day' : null].filter(Boolean).join(', ') + ')');
      if (e.mustAvoid.length) lines.push('  MUST NOT EAT (allergy/medical — never include, including hidden sources): ' + e.mustAvoid.join(', '));
      if (e.goEasy.length) lines.push('  Go easy on: ' + e.goEasy.join(', '));
      if (e.focus.length) lines.push('  Health focus from blood tests/conditions: ' + e.focus.join('; '));
      if (e.loves.length) lines.push('  Loves: ' + e.loves.join(', '));
      if (e.never.length) lines.push('  Won\'t eat: ' + e.never.join(', '));
    });
    lines.push('');
    lines.push((brief.onlyListed ? 'Use ONLY these ingredients (plus water, salt, pepper, herbs and spices): ' : 'Build meals mainly from these ingredients: ') + brief.ingredients.join(', ') + '.');
    if (brief.pantry.length) lines.push('Already in the kitchen — use these first: ' + brief.pantry.join(', ') + '.');
    lines.push('Cuisine: ' + (CUISINES[brief.cuisine] || CUISINES.any).label + '. Max cooking time per meal: ' + brief.maxMinutes + ' minutes. Budget: ' + brief.budget + '.');
    if (brief.notes) lines.push('Other requests: ' + brief.notes);
    lines.push('');
    lines.push('Size each meal for one adult portion and note in "why" how it serves each person\'s health focus. Keep steps short and practical. List the shopping items not already in the kitchen.');
    return lines.join('\n');
  }

  var SYSTEM = 'You are a registered-dietitian-style meal planner for a family. Follow every MUST NOT EAT constraint absolutely, including hidden sources (sauces, broths, dressings, cross-contact). Prefer whole foods, vegetables, legumes, whole grains, fish and olive oil, in line with the Dietary Guidelines for Americans. Do not give medical advice beyond food choices.';

  function loadSdk() { return import(SDK_URL).then(function (mod) { return mod.default || mod.Anthropic; }); }

  // Calls Claude with the user's own key. Returns the parsed plan.
  function aiPlan(apiKey, brief, loader) {
    return (loader || loadSdk)().then(function (Anthropic) {
      var client = new Anthropic({ apiKey: apiKey, dangerouslyAllowBrowser: true });
      return client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        thinking: { type: 'adaptive' },
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: PLAN_SCHEMA } },
        system: SYSTEM,
        messages: [{ role: 'user', content: buildPrompt(brief) }]
      });
    }).then(function (msg) {
      if (msg.stop_reason === 'refusal') throw new Error('Claude declined this request' + (msg.stop_details && msg.stop_details.explanation ? ': ' + msg.stop_details.explanation : '.'));
      if (msg.stop_reason === 'max_tokens') throw new Error('The plan was too long to finish — try fewer days or meals.');
      var text = msg.content.filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
      try { return JSON.parse(text); } catch (e) { throw new Error('Claude\'s answer couldn\'t be read. Try again.'); }
    });
  }

  // Flags AI ingredients that may contain a person's allergens or "never" foods.
  function checkPlan(plan, eaters) {
    var flags = [];
    (plan.days || []).forEach(function (d) {
      (d.meals || []).forEach(function (m) {
        var text = (m.ingredients || []).map(function (i) { return i.item; }).join(' | ').toLowerCase() + ' | ' + (m.name || '').toLowerCase();
        m.flags = [];
        eaters.forEach(function (e) {
          e.allergenWords.forEach(function (w) {
            // Plant "milks" and nut/seed butters aren't dairy.
            var plant = w.tag === 'milk' && /^(milk|butter|cream)$/.test(w.word) ? '(?<!(peanut|almond|nut|seed|sunflower|apple|coconut|soy|oat|cashew|cocoa|rice|shea) )' : '';
            if (new RegExp(plant + '\\b' + w.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(s|es)?\\b', 'i').test(text)) {
              var f = e.name + ': may contain ' + w.label + ' ("' + w.word + '")';
              if (m.flags.indexOf(f) === -1) { m.flags.push(f); flags.push({ day: d.day, meal: m.name, text: f }); }
            }
          });
        });
      });
    });
    return flags;
  }

  // Words that reveal each blocked allergen in a free-text ingredient list.
  var ALLERGEN_WORDS = {
    peanut: ['peanut', 'groundnut', 'arachis', 'satay'], treenut: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut', 'pesto', 'marzipan', 'praline', 'nutella'],
    milk: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'whey', 'casein', 'ghee', 'parmesan', 'feta', 'mozzarella', 'ricotta', 'paneer', 'kefir'],
    egg: ['egg', 'mayonnaise', 'mayo', 'aioli', 'meringue', 'albumin'], wheat: ['wheat', 'flour', 'bread', 'pasta', 'couscous', 'bulgur', 'seitan', 'farro', 'spelt', 'soy sauce', 'panko', 'tortilla (flour)', 'noodle'],
    soy: ['soy', 'tofu', 'tempeh', 'edamame', 'miso', 'tamari', 'natto', 'shoyu'], fish: ['fish', 'salmon', 'tuna', 'cod', 'sardine', 'anchovy', 'tilapia', 'trout', 'halibut', 'mackerel', 'fish sauce', 'worcestershire'],
    shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'crawfish', 'crayfish', 'scallop', 'clam', 'mussel', 'oyster', 'squid'], sesame: ['sesame', 'tahini', 'hummus', 'za\'atar', 'halva'],
    gluten: ['wheat', 'barley', 'rye', 'malt', 'flour', 'bread', 'pasta', 'couscous', 'bulgur', 'seitan', 'farro', 'spelt', 'soy sauce'],
    pork: ['pork', 'bacon', 'ham', 'prosciutto', 'pancetta', 'chorizo', 'sausage', 'lard'], meat: ['beef', 'steak', 'lamb', 'veal'], alcohol: ['wine', 'beer', 'sake', 'mirin', 'rum', 'vodka', 'bourbon']
  };

  function allergenWords(blockTags) {
    var out = [];
    blockTags.forEach(function (t) { (ALLERGEN_WORDS[t] || []).forEach(function (w) { out.push({ word: w, label: KB.TAG_LABELS[t] || t, tag: t }); }); });
    return out;
  }

  var Planner = { CUISINES: CUISINES, MODEL: MODEL, SDK_URL: SDK_URL, PLAN_SCHEMA: PLAN_SCHEMA, library: library, byId: byId, makeCustom: makeCustom, smartPlan: smartPlan,
    totals: totals, shoppingList: shoppingList, buildPrompt: buildPrompt, aiPlan: aiPlan, checkPlan: checkPlan, allergenWords: allergenWords, ALLERGEN_WORDS: ALLERGEN_WORDS, rng: rng };

  if (node) module.exports = Planner;
  else root.FHPlanner = Planner;
})(this);
