// Run: node --test family-health/tests/*.test.js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Q = require('../js/questionnaire.js');

const person = (over) => ({ id: 'p', name: 'P', sex: 'male', heightCm: 178, weightKg: 95, conditions: [], intolerances: [], allergies: {}, medications: [], ...over });
const ids = (r) => r.findings.map((f) => f.id);

test('ADA risk test scores like the published form', () => {
  // 52-year-old man, BMI 30, inactive, family history, high BP: 2 + 1 + 2 + 1 + 1 + 1 = 8
  const c = Q.context(person(), { active_days: '1', family: ['diabetes'], diagnosed: ['hypertension'] }, 52);
  const r = Q.adaRisk(c, 30);
  assert.equal(r.score, 8);
  assert.equal(r.high, true);
  // 30-year-old active woman, BMI 22: 0
  const w = Q.adaRisk(Q.context(person({ sex: 'female' }), { active_days: '5' }, 30), 22);
  assert.equal(w.score, 0);
  // Asian descent: BMI 24 counts as +1
  const asian = Q.adaRisk(Q.context(person({ sex: 'female' }), { active_days: '5', asian: 'yes' }, 30), 24);
  assert.equal(asian.score, 1);
});

test('STOP-Bang counts the 8 items', () => {
  const c = Q.context(person(), { snore: 'yes', daytime_tired: 'yes', apnea_seen: 'no', neck: 'yes', diagnosed: [] }, 55);
  const r = Q.stopBang(c, 31);
  // snoring, tired, age>50, neck, male = 5
  assert.equal(r.score, 5);
  assert.equal(r.level, 'high');
});

test('AUDIT-C uses 3+ for women and 4+ for men', () => {
  const a = { audit1: '2', audit2: '1', audit3: '0' }; // 3
  assert.equal(Q.auditC(Q.context(person({ sex: 'female' }), a, 40)).positive, true);
  assert.equal(Q.auditC(Q.context(person({ sex: 'male' }), a, 40)).positive, false);
});

test('PHQ-2 of 3+ flags mood with the 988 line', () => {
  const r = Q.analyze(person({ answers: { phq1: '2', phq2: '1', gad1: '0', gad2: '0' } }), 30);
  const mood = r.findings.find((f) => f.id === 'mood');
  assert.ok(mood);
  assert.match(mood.todo.join(' '), /988/);
  assert.ok(!ids(r).includes('anxiety'));
});

test('serious food reaction is urgent and suggests a severe allergy', () => {
  const r = Q.analyze(person({ answers: { reactions: { peanut: 'severe', milk: 'ok' } } }), 9);
  assert.equal(r.findings[0].id, 'food-severe');
  assert.equal(r.findings[0].level, 'urgent');
  const s = r.suggestions.find((x) => x.key === 'peanut');
  assert.equal(s.severity, 'severe');
  assert.equal(s.checked, true);
});

test('hives suggest allergist testing and warn against IgG tests', () => {
  const r = Q.analyze(person({ answers: { reactions: { egg: 'mild' } } }), 30);
  const f = r.findings.find((x) => x.id === 'food-hives');
  assert.match(f.todo.join(' '), /IgG/);
});

test('celiac: keep eating gluten until tested', () => {
  const r = Q.analyze(person({ answers: { chronic_diarrhea: 'yes' } }), 30);
  const f = r.findings.find((x) => x.id === 'celiac');
  assert.match(f.todo[0], /Keep eating gluten/);
});

test('kid with thirst and frequent urination is urgent', () => {
  const r = Q.analyze(person({ answers: { thirst: 'yes' } }), 8);
  assert.equal(r.findings.find((f) => f.id === 'hyperglycemia').level, 'urgent');
  const adult = Q.analyze(person({ answers: { thirst: 'yes' } }), 40);
  assert.equal(adult.findings.find((f) => f.id === 'hyperglycemia').level, 'doctor');
});

test('unconfirmed suspicions are offered unticked; diagnoses ticked', () => {
  const r = Q.analyze(person({ answers: { heartburn: 'w2', diagnosed: ['hypertension'] } }), 45);
  assert.equal(r.suggestions.find((s) => s.key === 'gerd').checked, false);
  assert.equal(r.suggestions.find((s) => s.key === 'hypertension').checked, true);
});

test('lung screening needs 20 pack-years and age 50–80', () => {
  const yes = Q.analyze(person({ answers: { tobacco: 'quit', cig_years: '25', cig_ppd: '1.5', quit_years: '5' } }), 60);
  assert.ok(ids(yes).includes('lung'));
  const quitLongAgo = Q.analyze(person({ answers: { tobacco: 'quit', cig_years: '25', cig_ppd: '1.5', quit_years: '20' } }), 60);
  assert.ok(!ids(quitLongAgo).includes('lung'));
});

test('preventive screenings follow age and sex', () => {
  const woman = Q.analyze(person({ sex: 'female', answers: {} }), 50).screenings.map((s) => s.source);
  assert.ok(woman.includes('uspstfColon'));
  assert.ok(woman.includes('uspstfBreast'));
  assert.ok(woman.includes('uspstfCervical'));
  const kid = Q.analyze(person({ answers: {} }), 10).screenings.map((s) => s.source);
  assert.deepEqual(kid, ['brightFutures', 'nhlbiKids']);
});

test('every finding cites known sources', () => {
  const answers = {
    reactions: { peanut: 'severe', egg: 'mild', soy: 'gi' }, dairy_gi: 'usually', thirst: 'yes', heartburn: 'w2', ibs_pain: 'yes',
    chronic_diarrhea: 'yes', red_flags: ['blood'], pica: 'yes', tingling: 'yes', acid_reducers: 'yes', joint_attack: 'yes', fracture: 'yes',
    snore: 'yes', daytime_tired: 'yes', apnea_seen: 'yes', neck: 'yes', phq1: '3', phq2: '3', gad1: '3', gad2: '3',
    tobacco: 'cig', audit1: '4', audit2: '4', audit3: '4', sugary_drinks: 'day2', fruitveg: '0', processed_meat: '5', fish: '0',
    whole_grains: 'rarely', salty: 'yes', caffeine: '5', active_days: '0', strength_days: '0', sleep_hours: '5', constipation: 'yes',
    bp_checked: 'dk', lipids_checked: 'dk', sugar_checked: 'dk', family: ['diabetes'], diet: 'vegan'
  };
  const r = Q.analyze(person({ answers }), 55);
  assert.ok(r.findings.length > 20);
  for (const f of r.findings) {
    assert.ok(f.sources.length, f.id);
    for (const s of f.sources) assert.ok(Q.SOURCES[s], `${f.id} -> ${s}`);
    assert.ok(f.strength, f.id);
  }
  assert.equal(r.findings[0].level, 'urgent');
});

test('syncProfile writes direct answers only', () => {
  const m = person({ answers: { active_days: '5', diet: 'pescatarian', meds: 'Metformin\nLisinopril', pregnancy: 'pregnant', heartburn: 'w2' } });
  Q.syncProfile(m);
  assert.equal(m.activity, 'moderate');
  assert.equal(m.diet, 'pescatarian');
  assert.deepEqual(m.medications, ['Metformin', 'Lisinopril']);
  assert.ok(m.conditions.includes('pregnancy'));
  assert.ok(!m.conditions.includes('gerd'));
});
