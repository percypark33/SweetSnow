/*
 * Family Health Guide — storage.
 *
 * Data stays on this device (browser localStorage). Nothing is sent anywhere.
 * Export / import a JSON backup to move it between browsers or computers.
 */
(function (root) {
  'use strict';

  var KEY = 'family-health-guide-v1';
  var VERSION = 1;

  function empty() {
    return { version: VERSION, settings: { units: 'us' }, members: [], customRecipes: [], plan: { overrides: {}, eaters: null, seed: '' }, meals: {}, ratings: {}, location: null, builder: {}, savedAt: null };
  }

  function migrate(data) {
    var base = empty();
    if (!data || typeof data !== 'object') return base;
    var out = {
      version: VERSION,
      settings: Object.assign({}, base.settings, data.settings || {}),
      members: Array.isArray(data.members) ? data.members.map(normalizeMember) : [],
      customRecipes: Array.isArray(data.customRecipes) ? data.customRecipes : [],
      plan: Object.assign({}, base.plan, data.plan || {}),
      meals: (data.meals && typeof data.meals === 'object') ? data.meals : {},
      ratings: (data.ratings && typeof data.ratings === 'object') ? data.ratings : {},
      location: data.location || null,
      builder: (data.builder && typeof data.builder === 'object') ? data.builder : {},
      savedAt: data.savedAt || null
    };
    if (!out.plan.overrides || typeof out.plan.overrides !== 'object') out.plan.overrides = {};
    return out;
  }

  function normalizeMember(m) {
    var arr = function (v) { return Array.isArray(v) ? v : []; };
    return Object.assign({
      id: newId(), name: '', relation: '', birthdate: '', sex: '', heightCm: null, weightKg: null,
      activity: 'light', goal: 'maintain', bloodType: '', allergies: {}, otherAllergies: [], intolerances: [],
      conditions: [], otherConditions: [], medications: [], diet: 'omnivore', dietRules: [], dislikes: [],
      avoidFoods: [], limitFoods: [], favoriteFoods: [], calorieOverride: null, doctor: '', emergencyContact: '',
      notes: '', log: [], labs: [], wearable: {}, answers: {}, answersUpdatedAt: '', reviewedAt: '', createdAt: '', updatedAt: ''
    }, m, {
      allergies: (m && typeof m.allergies === 'object' && !Array.isArray(m.allergies)) ? m.allergies : {},
      otherAllergies: arr(m && m.otherAllergies), intolerances: arr(m && m.intolerances), conditions: arr(m && m.conditions),
      otherConditions: arr(m && m.otherConditions), medications: arr(m && m.medications), dietRules: arr(m && m.dietRules),
      dislikes: arr(m && m.dislikes), avoidFoods: arr(m && m.avoidFoods), limitFoods: arr(m && m.limitFoods),
      favoriteFoods: arr(m && m.favoriteFoods), log: arr(m && m.log), labs: arr(m && m.labs),
      answers: (m && m.answers && typeof m.answers === 'object' && !Array.isArray(m.answers)) ? m.answers : {}
    });
  }

  function newId() {
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function load() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(KEY);
      return migrate(raw ? JSON.parse(raw) : null);
    } catch (e) {
      return migrate(null);
    }
  }

  // Returns true on success so the UI can warn if the browser blocks storage.
  function save(state) {
    try {
      state.savedAt = new Date().toISOString();
      root.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function exportJSON(state) {
    return JSON.stringify(Object.assign({ app: 'family-health-guide', exportedAt: new Date().toISOString() }, state), null, 2);
  }

  function importJSON(text) {
    var data = JSON.parse(text);
    if (!data || !Array.isArray(data.members)) throw new Error('This file is not a Family Health Guide backup.');
    return migrate(data);
  }

  var Store = { KEY: KEY, load: load, save: save, empty: empty, migrate: migrate, normalizeMember: normalizeMember, newId: newId, exportJSON: exportJSON, importJSON: importJSON };

  if (typeof module !== 'undefined' && module.exports) module.exports = Store;
  else root.FHStore = Store;
})(this);
