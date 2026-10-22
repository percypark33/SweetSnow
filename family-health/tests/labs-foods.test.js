// Run: node --test family-health/tests/*.test.js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/labs.js');
const F = require('../js/foods.js');
const Q = require('../js/questionnaire.js');

const person = (over) => ({ id: 'p', name: 'P', sex: 'female', conditions: [], intolerances: [], allergies: {}, medications: [], answers: {}, ...over });

test('lab cut-offs follow the guidelines', () => {
  assert.equal(L.interpret('a1c', 6.5).level, 'alert');
  assert.equal(L.interpret('a1c', 5.7).level, 'watch');
  assert.equal(L.interpret('a1c', 5.6).level, 'ok');
  assert.equal(L.interpret('glucose', 126).level, 'alert');
  assert.equal(L.interpret('ldl', 190).level, 'alert');
  assert.equal(L.interpret('tg', 500).level, 'alert');
  assert.equal(L.interpret('hdl', 45, 'female').level, 'watch');
  assert.equal(L.interpret('hdl', 45, 'male').level, 'ok');
  assert.equal(L.interpret('hgb', 12.5, 'male').level, 'high');
  assert.equal(L.interpret('hgb', 12.5, 'female').level, 'ok');
  assert.equal(L.interpret('ferritin', 25).level, 'high');
  assert.equal(L.interpret('potassium', 6.2).level, 'alert');
});

test('latest value per test wins across lab entries', () => {
  const m = person({ labs: [{ date: '2025-01-01', values: { a1c: 6.0, ldl: 170 } }, { date: '2026-06-01', values: { a1c: 5.4 } }] });
  const latest = L.latestLabs(m);
  assert.equal(latest.a1c.value, 5.4);
  assert.equal(latest.ldl.value, 170);
});

test('lab findings feed the health check with sources and suggestions', () => {
  const m = person({ labs: [{ date: '2026-09-01', values: { a1c: 6.0, ldl: 195, tg: 120, potassium: 6.3 } }] });
  const r = Q.analyze(m, 45);
  const ids = r.findings.map((f) => f.id);
  assert.ok(ids.includes('lab-a1c'));
  assert.ok(ids.includes('lab-ldl'));
  assert.equal(r.findings[0].id, 'lab-potassium'); // urgent sorts first
  assert.ok(r.suggestions.some((s) => s.key === 'prediabetes'));
  assert.ok(r.suggestions.some((s) => s.key === 'cholesterol'));
  for (const f of r.findings) for (const s of f.sources) assert.ok(Q.SOURCES[s], s);
});

test('diabetes from one lab is offered unticked (needs a repeat test)', () => {
  const r = Q.analyze(person({ labs: [{ date: '2026-09-01', values: { a1c: 7.1 } }] }), 50);
  const s = r.suggestions.find((x) => x.key === 'diabetes2');
  assert.equal(s.checked, false);
  assert.match(r.findings.find((f) => f.id === 'lab-a1c').todo[0], /second abnormal test/);
});

test('children get a pediatrician note instead of adult ranges', () => {
  const r = Q.analyze(person({ labs: [{ date: '2026-09-01', values: { hgb: 11 } }] }), 8);
  assert.ok(r.findings.some((f) => f.id === 'labs-kids'));
  assert.ok(!r.findings.some((f) => f.id === 'lab-hgb'));
});

test('imports an Oura-style CSV (seconds) and averages the last 30 days', () => {
  const rows = ['date,Total Sleep Duration,Average Resting Heart Rate,Average HRV,Readiness Score,Sleep Score'];
  for (let d = 1; d <= 40; d++) rows.push(`2026-08-${String(d).padStart(2, '0')},${d <= 10 ? 36000 : 23400},${d <= 10 ? 70 : 55},45,"${d <= 10 ? 90 : 72}",80`);
  const out = L.importWearableCSV(rows.join('\n'));
  assert.equal(out.importedRows, 30);
  assert.equal(out.sleepHours, 6.5); // 23400 s
  assert.equal(out.restingHr, 55);
  assert.equal(out.recovery, 72);
  assert.equal(out.sleepScore, 80);
});

test('imports a WHOOP-style CSV (minutes, percent signs)', () => {
  const csv = 'Cycle start time,Recovery score %,Resting heart rate (bpm),Heart rate variability (ms),Asleep duration (min),Sleep performance %\n' +
    '2026-09-01 22:00:00,45%,62,38,390,70%\n2026-09-02 22:00:00,55%,60,42,420,80%\n';
  const out = L.importWearableCSV(csv);
  assert.equal(out.recovery, 50);
  assert.equal(out.sleepHours, 6.8);
  assert.equal(out.hrv, 40);
});

test('rejects files without recognisable columns', () => {
  assert.throws(() => L.importWearableCSV('a,b\n1,2\n'), /Couldn't recognise/);
});

test('wearable findings: short sleep replaces the self-reported one; HRV vs own baseline', () => {
  const m = person({ answers: { sleep_hours: 6 }, wearable: { device: 'oura', sleepHours: 6.2, hrv: 30, hrvBaseline: 45, restingHr: 84, spo2: 90 } });
  const ids = Q.analyze(m, 40).findings.map((f) => f.id);
  assert.ok(ids.includes('w-sleep'));
  assert.ok(!ids.includes('sleep-short'));
  assert.ok(ids.includes('w-hrv'));
  assert.ok(ids.includes('w-rhr'));
  assert.ok(ids.includes('w-spo2'));
});

test('meal totals, targets and score', () => {
  const items = [{ foodId: 'chicken', qty: 1 }, { foodId: 'brown-rice', qty: 1 }, { foodId: 'broccoli', qty: 2 }, { foodId: 'olive-oil', qty: 1 }];
  const t = F.totals(items);
  assert.equal(t.protein, 35 + 5 + 8);
  assert.equal(t.fiber, 0 + 4 + 10 + 0);
  const target = F.mealTargets(2000, 60, 'dinner');
  assert.equal(target.kcal, 700);
  assert.equal(target.protein, 21);
  const s = F.score(items, target);
  assert.ok(s.score >= 85, JSON.stringify(s));
  assert.ok(s.badges.includes('🌈 All four groups'));
});

test('surprise plate only uses allowed foods', () => {
  const allowed = ['tofu', 'quinoa', 'spinach', 'avocado'];
  const items = F.surprise(allowed, () => 0);
  assert.deepEqual(items.map((i) => i.foodId).sort(), allowed.slice().sort());
});

test('every food has complete nutrition and a known category', () => {
  const cats = F.CATEGORIES.map((c) => c.id);
  for (const food of F.FOODS) {
    assert.ok(cats.includes(food.cat), food.id);
    for (const k of ['kcal', 'protein', 'carbs', 'fat', 'fiber']) assert.equal(typeof food[k], 'number', food.id + k);
    // Energy roughly matches macros (4/4/9 kcal per g; fiber counted loosely).
    const est = food.protein * 4 + food.carbs * 4 + food.fat * 9;
    assert.ok(Math.abs(est - food.kcal) <= Math.max(30, food.kcal * 0.25), `${food.id}: ${food.kcal} vs ${est}`);
  }
});

test('a recent blood test replaces "get tested" advice', () => {
  const today = new Date().toISOString().slice(0, 10);
  const answers = { active_days: '1', family: ['diabetes'], diagnosed: ['hypertension'], sugar_checked: 'dk', lipids_checked: 'dk' };
  const base = { sex: 'male', heightCm: 175, weightKg: 100, answers };
  const before = Q.analyze(person(base), 50).findings.map((f) => f.id);
  assert.ok(before.includes('diabetes-risk') && before.includes('lipids'));
  const after = Q.analyze(person({ ...base, labs: [{ date: today, values: { a1c: 6.1, ldl: 120 } }] }), 50).findings.map((f) => f.id);
  assert.ok(!after.includes('diabetes-risk'), 'prediabetes lab finding covers it');
  assert.ok(after.includes('lab-a1c'));
  assert.ok(!after.includes('lipids'));
  const normal = Q.analyze(person({ ...base, labs: [{ date: today, values: { a1c: 5.2 } }] }), 50).findings.find((f) => f.id === 'diabetes-risk');
  assert.equal(normal.level, 'change'); // still higher risk, but tested recently
});

test('a fat-heavy plate is not called balanced', () => {
  const target = F.mealTargets(2000, 60, 'dinner');
  const fatty = [{ foodId: 'salmon', qty: 1 }, { foodId: 'quinoa', qty: 1 }, { foodId: 'broccoli', qty: 2 }, { foodId: 'olive-oil', qty: 3 }, { foodId: 'avocado', qty: 1 }];
  const s = F.score(fatty, target);
  assert.ok(!s.badges.includes('⭐ Balanced plate'), JSON.stringify(s));
  assert.ok(s.parts.includes('heavy on fat'));
});
