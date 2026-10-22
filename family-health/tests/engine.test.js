// Run: node --test family-health/tests
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../js/engine.js');
const KB = require('../js/knowledge.js');
const DEMO = require('../sample/demo-family.js');

const TODAY = new Date(2026, 9, 19); // 2026-10-19
const byId = (id) => DEMO.members.find((m) => m.id === id);
const recipe = (id) => KB.RECIPES.find((r) => r.id === id);

test('ages and age bands follow the birth date', () => {
  assert.equal(E.ageYears('2017-05-20', TODAY), 9);
  assert.equal(E.ageYears('2017-10-20', TODAY), 8); // birthday tomorrow
  assert.equal(E.ageBand(2).id, 'toddler');
  assert.equal(E.ageBand(70).id, 'senior');
});

test('severe allergy raises a danger alert and is blocked in recipes', () => {
  const g = E.buildGuide(byId('demo-mia'), TODAY);
  assert.ok(g.alerts.some((a) => a.level === 'danger' && /Peanut/.test(a.text)));
  assert.ok(g.avoid.some((a) => a.text === 'Kiwi'));
  const r = E.evaluateRecipe(recipe('pb-banana-toast'), g.rules);
  assert.equal(r.status, 'swap');
  assert.match(r.swaps.join(), /sunflower/);
  assert.equal(E.evaluateRecipe(recipe('trail-mix'), g.rules).status, 'swap');
});

test('celiac blocks gluten; wheat swaps fix it', () => {
  const rules = E.profileRules(byId('demo-sam'), TODAY);
  assert.ok(rules.block.gluten);
  const toast = E.evaluateRecipe(recipe('veggie-eggs-toast'), rules);
  assert.equal(toast.status, 'swap');
  // Pescatarian + celiac: chicken stir-fry needs both swaps.
  const stir = E.evaluateRecipe(recipe('chicken-stir-fry'), rules);
  assert.equal(stir.status, 'swap');
  assert.equal(stir.swaps.length, 2);
});

test('a swap that introduces a blocked tag is not offered', () => {
  const m = { id: 'x', name: 'X', birthdate: '1990-01-01', allergies: { soy: 'severe' }, diet: 'vegan' };
  const rules = E.profileRules(m, TODAY);
  // Tofu swap adds soy, so the vegan-with-soy-allergy person gets the lentil swap only.
  const r = E.evaluateRecipe(recipe('chicken-rice-broccoli'), rules);
  assert.equal(r.status, 'swap');
  assert.doesNotMatch(r.swaps.join(), /tofu instead/);
});

test('medications are recognised and drive food blocks', () => {
  const g = E.buildGuide(byId('demo-alex'), TODAY);
  const names = g.medications.flatMap((m) => m.rules.map((r) => r.id));
  assert.ok(names.includes('ace-arb'));
  assert.ok(names.includes('statin-cyp'));
  assert.ok(g.rules.block.grapefruit);
  assert.ok(g.avoid.some((a) => /Grapefruit/.test(a.text)));
  const june = E.buildGuide(byId('demo-june'), TODAY);
  assert.ok(june.medications.some((m) => m.rules.some((r) => r.id === 'warfarin')));
});

test('conflicting advice between conditions is flagged', () => {
  const m = { id: 'c', name: 'C', birthdate: '1960-01-01', sex: 'male', conditions: ['hypertension', 'ckd'] };
  const g = E.buildGuide(m, TODAY);
  assert.ok(g.alerts.some((a) => /Conflicting advice/.test(a.text)));
  const potassium = g.emphasize.find((e) => /Potassium/.test(e.text));
  assert.ok(potassium.conflict);
});

test('a rule does not conflict with its own advice', () => {
  const g = E.buildGuide({ id: 'n', name: 'N', birthdate: '1980-01-01', intolerances: ['lactose'], reviewedAt: '2026-10-01' }, TODAY);
  assert.ok(!g.alerts.some((a) => /Conflicting/.test(a.text)));
  assert.ok(!g.emphasize.some((e) => e.conflict));
});

test('emphasised foods that hit an allergy are marked not-for-you', () => {
  const m = { id: 'f', name: 'F', birthdate: '1970-01-01', conditions: ['cholesterol'], allergies: { fish: 'moderate' } };
  const g = E.buildGuide(m, TODAY);
  const fish = g.emphasize.find((e) => /fish/i.test(e.text));
  assert.match(fish.conflict, /^Not for F/);
});

test('calorie targets: adult formula, kid table, toddler none', () => {
  const alex = E.buildGuide(byId('demo-alex'), TODAY).targets;
  // 10*96 + 6.25*178 - 5*45 + 5 = 1852.5; ×1.375 − 500 = 2047 → 2050
  assert.equal(alex.kcal, 2050);
  assert.equal(alex.sodium, 'under 1,500 mg');
  const mia = E.buildGuide(byId('demo-mia'), TODAY).targets;
  assert.equal(mia.kcal, 1800);
  const leo = E.buildGuide(byId('demo-leo'), TODAY).targets;
  assert.equal(leo.kcal, 1000);
});

test('lab readings produce alerts', () => {
  const m = { id: 'l', name: 'L', birthdate: '1980-01-01', log: [{ date: '2026-10-01', bpSys: 185, bpDia: 100, a1c: 6.8 }] };
  const g = E.buildGuide(m, TODAY);
  assert.ok(g.alerts.some((a) => a.level === 'danger' && /crisis/.test(a.text)));
  assert.ok(g.alerts.some((a) => /diabetes range/.test(a.text)));
});

test('custom must-avoid foods exclude matching recipes', () => {
  const m = { id: 'k', name: 'K', birthdate: '1980-01-01', avoidFoods: ['avocado'] };
  const rules = E.profileRules(m, TODAY);
  assert.equal(E.evaluateRecipe(recipe('turkey-wrap'), rules).status, 'no');
  assert.equal(E.evaluateRecipe(recipe('baked-cod'), rules).status, 'ok');
});

test('weekly plan never serves a dish someone cannot eat', () => {
  const plan = E.buildPlan(DEMO.members, { today: TODAY });
  assert.equal(plan.weekStart, '2026-10-19');
  for (const day of plan.days) {
    for (const meal of E.MEALS) {
      const fit = day.meals[meal];
      assert.ok(fit, `${day.name} ${meal} filled`);
      assert.equal(fit.noCount, 0, `${day.name} ${meal}: ${fit.recipe.name}`);
    }
  }
  // Same inputs → same plan.
  const again = E.buildPlan(DEMO.members, { today: TODAY });
  assert.deepEqual(again.days.map((d) => d.meals.dinner.recipe.id), plan.days.map((d) => d.meals.dinner.recipe.id));
  assert.ok(E.groceryList(plan).length > 5);
});

test('an override that becomes unsafe is replaced with a notice', () => {
  const members = DEMO.members.map((m) => (m.id === 'demo-june' ? { ...m, avoidFoods: ['shrimp'] } : m));
  const plan = E.buildPlan(members, { today: TODAY, overrides: { '0-dinner': 'shrimp-tacos' } });
  assert.notEqual(plan.days[0].meals.dinner.recipe.id, 'shrimp-tacos');
  assert.match(plan.notices[0], /June/);
});

test('severe-allergy swaps apply to the whole dish', () => {
  const rules = E.profileRules(byId('demo-june'), TODAY);
  const r = E.evaluateRecipe(recipe('shrimp-tacos'), rules);
  assert.equal(r.status, 'swap');
  assert.match(r.swaps[0], /^Whole dish/);
});

test('allergy matrix lists only allergens someone has', () => {
  const rows = E.allergyMatrix(DEMO.members);
  const labels = rows.map((r) => r.label);
  assert.ok(labels.includes('Peanut'));
  assert.ok(labels.includes('Kiwi'));
  assert.ok(!labels.includes('Sesame'));
});
