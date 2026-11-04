// Run: node --test family-health/tests/*.test.js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const N = require('../js/nutrition.js');
const F = require('../js/foods.js');

const woman = N.needs({ age: 40, sex: 'female', kcal: 2000, protein: 55 });

test('needs follow the Dietary Reference Intakes', () => {
  assert.equal(woman.amounts.iron, 18);
  assert.equal(woman.amounts.calcium, 1000);
  assert.equal(woman.amounts.potassium, 2600);
  assert.equal(woman.amounts.vitC, 75);
  assert.equal(woman.amounts.fiber, 28);
  const man = N.needs({ age: 55, sex: 'male', kcal: 2400 });
  assert.equal(man.amounts.iron, 8);
  assert.equal(man.amounts.magnesium, 420);
  assert.equal(man.amounts.potassium, 3400);
  const preg = N.needs({ age: 30, sex: 'female', kcal: 2300, conditions: ['pregnancy'] });
  assert.equal(preg.amounts.iron, 27);
  assert.equal(preg.amounts.folate, 600);
  assert.ok(preg.weights.folate > 1);
  assert.equal(N.needs({ age: 75, sex: 'female', kcal: 1600 }).amounts.vitD, 20);
  assert.equal(N.needs({ age: 30, sex: 'male', kcal: 2500, smoker: true }).amounts.vitC, 125);
});

test('blood work changes weights and limits', () => {
  const iron = N.needs({ age: 40, sex: 'female', kcal: 2000, focus: ['iron'] });
  assert.ok(iron.weights.iron > 2 && iron.weights.vitC > 2);
  const ldl = N.needs({ age: 50, sex: 'male', kcal: 2200, focus: ['ldl'] });
  assert.equal(ldl.limits.satFat, Math.round(2200 * 0.06 / 9));
  assert.equal(N.needs({ age: 50, sex: 'male', kcal: 2200, conditions: ['hypertension'] }).limits.sodium, 1500);
  assert.equal(N.needs({ age: 50, sex: 'male', kcal: 2200, focus: ['potassium-high'] }).weights.potassium, 0);
});

test('a colorful plate beats a beige one', () => {
  const good = N.mealScore([{ foodId: 'salmon', qty: 1 }, { foodId: 'quinoa', qty: 1 }, { foodId: 'broccoli', qty: 1 }, { foodId: 'peppers', qty: 1 }, { foodId: 'olive-oil', qty: 1 }], woman, 0.35);
  const beige = N.mealScore([{ foodId: 'pasta', qty: 1.5 }, { foodId: 'cheddar', qty: 2 }, { foodId: 'butter', qty: 1 }], woman, 0.35);
  assert.ok(good.score >= 85, String(good.score));
  assert.ok(beige.score < 50, String(beige.score));
  assert.ok(beige.over.some((l) => l.id === 'satFat'));
  assert.ok(beige.gaps.some((g) => g.id === 'vitC'));
  assert.equal(N.mealScore([], woman, 0.35).score, 0);
});

test('the same plate scores differently for different people', () => {
  const plate = [{ foodId: 'steak', qty: 1 }, { foodId: 'spinach', qty: 1 }, { foodId: 'peppers', qty: 1 }, { foodId: 'brown-rice', qty: 1 }];
  const ironLow = N.needs({ age: 35, sex: 'female', kcal: 2000, focus: ['iron'] });
  const ldlHigh = N.needs({ age: 55, sex: 'male', kcal: 2200, focus: ['ldl'] });
  const a = N.mealScore(plate, ironLow, 0.35), b = N.mealScore(plate, ldlHigh, 0.35);
  assert.notEqual(a.score, b.score);
  const ironRow = a.rows.find((r) => r.id === 'iron');
  assert.ok(ironRow.weight > 2);
});

test('food grades rank vegetables over butter, and fillers fix gaps', () => {
  const g = (id) => N.foodGrade(F.byId(id), woman).grade;
  assert.equal(g('spinach'), 'A');
  assert.equal(g('broccoli'), 'A');
  assert.equal(g('butter'), 'E');
  assert.ok(['A', 'B'].includes(g('salmon')));
  const f = N.fillers({ id: 'vitD' }, F.FOODS, woman, 2);
  assert.equal(f[0].food.id, 'salmon');
  assert.ok(N.fillers({ id: 'fiber' }, F.FOODS, woman, 3).some((x) => ['lentils', 'black-beans'].includes(x.food.id)));
});

test('every food has complete vitamin and mineral data', () => {
  for (const fd of F.FOODS) {
    assert.ok(fd.hasMicros, fd.id);
    for (const k of F.MICRO_KEYS) assert.equal(typeof fd[k], 'number', fd.id + ' ' + k);
  }
});

test('every tracked nutrient explains what it does and what too little or too much causes', () => {
  for (const n of N.NUTRIENTS) {
    assert.ok(N.INFO[n.id] && N.INFO[n.id].does && N.INFO[n.id].low && /^https:/.test(N.INFO[n.id].url), n.id);
  }
  for (const n of N.LIMITS) assert.ok(N.INFO[n.id].high, n.id);
  for (const id of ['carbs', 'fat', 'water', 'kcal', 'vegetables', 'fruits', 'meats', 'plants', 'dairy']) assert.ok(N.INFO[id] && N.INFO[id].does, id);
});
