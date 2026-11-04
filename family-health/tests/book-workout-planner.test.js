// Run: node --test family-health/tests/*.test.js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const DB = require('../js/dietbook.js');
const W = require('../js/workout.js');
const PL = require('../js/planner.js');
const F = require('../js/foods.js');

test('diet book amounts follow the USDA 2,000-calorie pattern', () => {
  const a = DB.amounts({ age: 40, sex: 'female', heightCm: 165, weightKg: 62, kcal: 2000, activity: 'light' });
  assert.equal(a.patternKcal, 2000);
  assert.equal(a.vegetables.perDay, 2.5);
  assert.equal(a.fruits.perDay, 2);
  assert.equal(a.carbs.grains, 6);
  assert.equal(a.meats.proteinFoods, 5.5);
  assert.equal(a.fiber.grams, 28);
  assert.deepEqual([a.carbs.min, a.carbs.max], [225, 325]);
  assert.deepEqual([a.fat.min, a.fat.max], [44, 78]);
  assert.equal(a.protein.min, 50); // 0.8 g/kg × 62 kg, floored at 10% of calories (50 g)
  assert.equal(a.meats.fishWk, 8);
  assert.equal(a.meats.redMaxWk, 12);
});

test('protein changes with age, training and body size', () => {
  assert.deepEqual([DB.amounts({ age: 70, sex: 'male', weightKg: 80, heightCm: 178, kcal: 2200 }).protein.min, DB.amounts({ age: 70, sex: 'male', weightKg: 80, heightCm: 178, kcal: 2200 }).protein.max], [80, 96]);
  const athlete = DB.amounts({ age: 25, sex: 'male', weightKg: 80, heightCm: 180, kcal: 3200, activity: 'athlete' });
  assert.deepEqual([athlete.protein.min, athlete.protein.max], [96, 160]);
  const big = DB.amounts({ age: 45, sex: 'male', weightKg: 120, heightCm: 175, kcal: 2400 });
  assert.equal(big.protein.min, Math.max(Math.round(25 * 1.75 * 1.75 * 0.8), 60)); // reference weight at BMI 25, floor 10% of kcal
  assert.ok(big.notes.length);
});

test('children: higher fat range, smaller fish servings, juice limits', () => {
  const kid = DB.amounts({ age: 3, sex: 'male', weightKg: 14, kcal: 1200 });
  assert.deepEqual(kid.fat.pct, [30, 40]);
  assert.equal(kid.meats.fishWk, 2);
  assert.equal(kid.fruits.juiceMaxOz, 4);
  assert.equal(kid.carbs.addedSugarMax, 25);
  assert.ok(DB.amounts({ age: 1 }).tooYoung);
});

test('every chapter renders text for every reference person', () => {
  for (const row of DB.referenceTable()) for (const a of [row.female, row.male]) {
    for (const ch of DB.CHAPTERS) {
      assert.ok(ch.headline(a) && !/undefined|NaN/.test(ch.headline(a)), ch.id + ' ' + row.ages);
      for (const d of ch.detail(a)) assert.ok(!/undefined|NaN/.test(d), ch.id + ': ' + d);
      for (const f of ch.facts) assert.ok(DB.SOURCES[f[1]], f[1]);
    }
  }
});

test('workout split scales with days and experience', () => {
  const beginner = W.plan({ age: 35, conditions: [], fitness: { days: 3, experience: 'new', equipment: 'none' } });
  assert.equal(beginner.splitName, 'Full body ×3');
  assert.equal(beginner.week.filter((d) => d.type === 'strength').length, 3);
  const cardio = beginner.week.reduce((s, d) => s + (d.type === 'cardio' || d.type === 'walk' ? d.minutes : 0), 0) + 45;
  assert.ok(cardio >= 150, String(cardio));
  assert.equal(W.plan({ age: 30, conditions: [], fitness: { days: 4, experience: 'some', equipment: 'gym' } }).splitName, 'Upper / lower ×2');
  assert.equal(W.plan({ age: 30, conditions: [], fitness: { days: 6, experience: 'experienced', equipment: 'gym', focus: 'muscle' } }).splitName, 'Push / pull / legs ×2');
  // no muscle group trained on back-to-back full-body days
  const days = beginner.week.map((d) => d.type);
  for (let i = 1; i < 7; i++) assert.ok(!(days[i] === 'strength' && days[i - 1] === 'strength'));
});

test('workouts adapt to age and conditions', () => {
  const senior = W.plan({ age: 72, conditions: [], fitness: { days: 5, experience: 'experienced' } });
  assert.ok(senior.week.some((d) => d.items.some((i) => i.move === 'balance')));
  assert.ok(senior.week.filter((d) => d.type === 'strength').length <= 3);
  const bp = W.plan({ age: 50, conditions: ['hypertension', 'diabetes2'], fitness: {} });
  assert.ok(bp.cautions.some((c) => /wall sits/.test(c)) && bp.cautions.some((c) => /after meals/.test(c)));
  assert.equal(W.plan({ age: 10, conditions: [] }).kind, 'kids');
  assert.equal(W.plan({ age: 4, conditions: [] }).kind, 'kids-young');
});

test('smart planner respects allergies, "never" foods, and the pantry', () => {
  const lib = PL.library([{ id: 'c-kimchi', name: 'Kimchi', cat: 'fiber', kcal: 15, protein: 1, carbs: 2, fat: 0, fiber: 2 }]);
  const blocked = (fd) => fd.tags.includes('peanut') || fd.tags.includes('treenut');
  const res = PL.smartPlan({ lib, pantry: { salmon: true }, slots: ['breakfast', 'lunch', 'dinner'], days: 7, seed: 'x', cuisine: 'korean',
    targets: (slot) => F.mealTargets(2000, 60, slot),
    eaters: [{ name: 'Mia', prefs: { broccoli: 'no', 'c-kimchi': 'love' }, pick: () => 0, blocked }] });
  const used = res.days.flatMap((d) => d.meals.flatMap((m) => m.items.map((i) => i.foodId)));
  assert.ok(!used.includes('broccoli'));
  assert.ok(!used.some((id) => blocked(PL.byId(lib, id))));
  assert.ok(used.includes('c-kimchi'));
  assert.equal(res.days.length, 7);
  assert.ok(res.shopping.find((s) => s.id === 'salmon')?.have ?? true);
  const only = PL.smartPlan({ lib, pantry: { salmon: true, quinoa: true, spinach: true }, onlyPantry: true, slots: ['dinner'], days: 2, seed: 'y', targets: (s) => F.mealTargets(2000, 60, s), eaters: [{ name: 'A', prefs: {}, pick: () => 0, blocked: () => false }] });
  assert.ok(only.days.every((d) => d.meals[0].items.every((i) => ['salmon', 'quinoa', 'spinach'].includes(i.foodId))));
});

test('custom ingredients validate and Claude results are checked for allergens', () => {
  assert.throws(() => PL.makeCustom({ name: '  ' }), /name/);
  const c = PL.makeCustom({ name: 'Oat milk', cat: 'nope', kcal: '120', protein: 'x' });
  assert.equal(c.cat, 'fiber'); assert.equal(c.kcal, 120); assert.equal(c.protein, 0);
  const plan = { days: [{ day: 'Mon', meals: [{ name: 'Toast', ingredients: [{ item: 'almond butter' }, { item: 'oat milk' }, { item: 'eggplant' }, { item: 'cheddar cheese' }] }] }] };
  const flags = PL.checkPlan(plan, [{ name: 'Mia', allergenWords: PL.allergenWords(['treenut', 'milk', 'egg']) }]);
  const text = flags.map((f) => f.text).join(' ');
  assert.match(text, /tree nuts \("almond"\)/);
  assert.match(text, /dairy \("cheese"\)/);
  assert.doesNotMatch(text, /egg/);       // eggplant isn't egg
  assert.doesNotMatch(text, /"milk"/);    // oat milk isn't dairy
});

test('the Claude prompt carries every hard constraint', () => {
  const prompt = PL.buildPrompt({ days: 3, slots: ['dinner'], cuisine: 'mexican', maxMinutes: 30, budget: 'normal', notes: 'no oven', onlyListed: true, ingredients: ['Salmon', 'Quinoa'], pantry: ['Salmon'],
    eaters: [{ name: 'Mia', age: 9, sex: 'female', kcal: 1800, protein: 34, mustAvoid: ['peanut', 'tree nuts'], goEasy: [], focus: [], loves: ['Berries'], never: ['Broccoli'] }] });
  assert.match(prompt, /MUST NOT EAT.*peanut, tree nuts/);
  assert.match(prompt, /Use ONLY these ingredients.*Salmon, Quinoa/);
  assert.match(prompt, /Won't eat: Broccoli/);
  assert.match(prompt, /no oven/);
  assert.equal(PL.MODEL, 'claude-opus-5-5');
});
