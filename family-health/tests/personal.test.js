// Run: node --test family-health/tests/*.test.js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../js/personal.js');
const E = require('../js/engine.js');
const L = require('../js/labs.js');

const person = (over) => ({ id: 'p', name: 'P', sex: 'male', birthdate: '1975-01-01', heightCm: 178, weightKg: 85, activity: 'light', goal: 'maintain',
  conditions: [], intolerances: [], allergies: {}, medications: [], answers: {}, labs: [], log: [], ...over });
const today = new Date('2026-10-22T12:00:00');
const ids = (rules) => rules.map((r) => r.id);

test('blood test results become diet focus rules', () => {
  const m = person({ labs: [{ date: '2026-09-14', values: { a1c: 6.1, ldl: 162, tg: 210, ferritin: 20, vitd: 15, uric: 7.4 } }] });
  const f = P.focus(m, 51);
  for (const id of ['sugar', 'ldl', 'tg', 'iron', 'vitd', 'uric']) assert.ok(ids(f).includes(id), id);
  assert.match(f.find((r) => r.id === 'ldl').because, /LDL cholesterol 162 mg\/dL \(2026-09-14\)/);
  assert.ok(f.every((r) => r.lab));
});

test('normal results add no rules; kids\' labs are left to the pediatrician', () => {
  assert.deepEqual(P.focus(person({ labs: [{ date: '2026-09-14', values: { a1c: 5.2, ldl: 95, tg: 90, ferritin: 120 } }] }), 51), []);
  assert.deepEqual(P.focus(person({ birthdate: '2016-01-01', labs: [{ date: '2026-09-14', values: { ldl: 170 } }] }), 10), []);
});

test('two people with different results get different food picks', () => {
  const dad = person({ labs: [{ date: '2026-09-14', values: { ldl: 175 } }] });
  const mom = person({ sex: 'female', labs: [{ date: '2026-09-14', values: { ferritin: 12, hgb: 10.9 } }] });
  const pd = P.foodPicks(P.focus(dad, 51)), pm = P.foodPicks(P.focus(mom, 51));
  assert.ok(pd.oats.score > 0 && pd.butter.score < 0);
  assert.ok(pm.steak.score > 0 && pm.lentils.score > 0);
  assert.equal(pd.steak.score, 0);
  assert.equal(pm.butter.score, 0);
  assert.match(pd.oats.reasons[0], /soluble fiber → lower LDL/);
});

test('lab rules flow into the guide: cautions, food lists and targets', () => {
  const m = person({ labs: [{ date: '2026-09-14', values: { ldl: 175, tg: 220 } }] });
  const rules = E.profileRules(m, today);
  assert.ok(rules.caution['high-satfat'].some((r) => /blood test/.test(r)));
  assert.ok(rules.caution['added-sugar']);
  const g = E.buildGuide(m, today);
  assert.ok(g.emphasize.some((e) => /soluble fiber/.test(e.text)));
  assert.ok(g.limit.some((e) => /Butter, cheese/.test(e.text)));
  const kcal = g.targets.kcal;
  assert.equal(g.targets.satFat, 'under ' + Math.round(kcal * 0.06 / 9) + ' g');
  assert.equal(g.targets.addedSugar, 'under ' + Math.round(kcal * 0.06 / 4) + ' g');
});

test('water goals differ by person', () => {
  const man = P.daily(person({}), 51), woman = P.daily(person({ sex: 'female' }), 51);
  assert.equal(man.water.cups, 13);
  assert.equal(woman.water.cups, 9);
  assert.equal(P.daily(person({ sex: 'female', conditions: ['pregnancy'] }), 30).water.cups, 10);
  assert.equal(P.daily(person({ activity: 'active' }), 51).water.cups, 15);
  assert.equal(P.daily(person({ conditions: ['gout'] }), 51).water.cups, 15);
  assert.equal(P.daily(person({ conditions: ['heart'] }), 51).water.cups, null);
  assert.equal(P.daily(person({ birthdate: '2020-01-01' }), 6).water.cups, 5);
});

test('step goals build from the person\'s own baseline', () => {
  const tracked = P.daily(person({ wearable: { device: 'oura', steps: 4200 } }), 51);
  assert.equal(tracked.steps.goal, 5000); // +1,000, rounded to 500
  const fit = P.daily(person({ wearable: { device: 'oura', steps: 11800 } }), 51);
  assert.equal(fit.steps.goal, 12000);
  const older = P.daily(person({ wearable: { device: 'oura', steps: 6600 } }), 70);
  assert.equal(older.steps.goal, 7000); // plateau 7,000 for 60+
  const prediabetic = P.daily(person({ wearable: { device: 'oura', steps: 9000 }, labs: [{ date: '2026-09-14', values: { a1c: 6.0 } }] }), 51);
  assert.equal(prediabetic.steps.goal, 10000);
  assert.ok(prediabetic.steps.why.some((w) => /after meals/.test(w)));
  const tired = P.daily(person({ wearable: { device: 'whoop', steps: 5000, recovery: 30 } }), 51);
  assert.equal(tired.steps.goal, 5000);
  const kid = P.daily(person({ sex: 'female', birthdate: '2016-01-01' }), 10);
  assert.equal(kid.steps.goal, 11000);
  const logged = person({ daily: { '2026-10-19': { steps: 3000 }, '2026-10-20': { steps: 4000 }, '2026-10-21': { steps: 5000 } } });
  assert.equal(P.daily(logged, 51).steps.goal, 5000);
});

test('reads a pasted Quest-style report', () => {
  const r = L.parseReport(`Collected: 09/14/2026 07:42 AM
HEMOGLOBIN A1c   6.1 H   <5.7 % of total Hgb
eAG (mg/dL)   128   (calc)
GLUCOSE   108 H   65-99 mg/dL
CHOLESTEROL, TOTAL   242 H   <200 mg/dL
HDL CHOLESTEROL   38 L   > OR = 40 mg/dL
TRIGLYCERIDES   210 H   <150 mg/dL
LDL-CHOLESTEROL   162 H   mg/dL (calc)
CHOL/HDLC RATIO   6.4 H   <5.0 (calc)
HEMOGLOBIN   13.9   13.2-17.1 g/dL
MCHC   33.4   32.0-36.0 g/dL
VITAMIN D,25-OH,TOTAL,IA   17 L   30-100 ng/mL
VITAMIN B12   410   200-1100 pg/mL`);
  assert.deepEqual(r.values, { a1c: 6.1, glucose: 108, tc: 242, ldl: 162, hdl: 38, tg: 210, hgb: 13.9, vitd: 17, b12: 410 });
  assert.equal(r.date, '2026-09-14');
});

test('reads portal text with values on the next line and SI units', () => {
  const r = L.parseReport(`Collected on Sep 3, 2026 8:10 AM
LDL Cholesterol Calc
4.2
<2.6 mmol/L
Glucose, Fasting
5.9 mmol/L
Vitamin D 25-Hydroxy
45 nmol/L
Hemoglobin A1C 42 mmol/mol`);
  assert.deepEqual(r.values, { a1c: 6, glucose: 106, ldl: 162, vitd: 18 });
  assert.equal(r.date, '2026-09-03');
});

test('ignores text without results', () => {
  assert.equal(L.parseReport('Your appointment is on 10/12/2026. Please fast for 8 hours.').found.length, 0);
});
