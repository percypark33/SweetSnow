/*
 * A made-up family for trying the app (Data → Load demo family).
 * None of these people are real.
 */
(function (root) {
  'use strict';

  var DEMO = {
    version: 1,
    settings: { units: 'us' },
    members: [
      {
        id: 'demo-alex', name: 'Alex', relation: 'Dad', birthdate: '1981-03-14', sex: 'male',
        heightCm: 178, weightKg: 95, activity: 'light', goal: 'lose', bloodType: 'O+',
        allergies: {}, otherAllergies: [], intolerances: [],
        conditions: ['hypertension', 'cholesterol'], otherConditions: [],
        medications: ['Lisinopril 10 mg', 'Atorvastatin 20 mg'],
        diet: 'omnivore', dietRules: [], dislikes: ['mushroom'], avoidFoods: [], limitFoods: [], favoriteFoods: ['Grilled fish', 'Spicy food'],
        doctor: 'Dr. Example, Family Medicine', emergencyContact: 'Sam — (555) 010-0000', notes: '',
        log: [{ date: '2026-08-02', weightKg: 96, bpSys: 136, bpDia: 86, ldl: 148 }],
        reviewedAt: '2026-09-01'
      },
      {
        id: 'demo-sam', name: 'Sam', relation: 'Mom', birthdate: '1985-07-02', sex: 'female',
        heightCm: 165, weightKg: 62, activity: 'moderate', goal: 'maintain', bloodType: 'A-',
        allergies: {}, otherAllergies: [], intolerances: ['lactose'],
        conditions: ['celiac', 'hypothyroid'], otherConditions: [],
        medications: ['Levothyroxine 75 mcg'],
        diet: 'pescatarian', dietRules: [], dislikes: [], avoidFoods: [], limitFoods: [], favoriteFoods: ['Salmon', 'Quinoa'],
        doctor: '', emergencyContact: 'Alex — (555) 010-0001', notes: 'Uses a separate toaster for gluten-free bread.',
        log: [], reviewedAt: '2026-09-01'
      },
      {
        id: 'demo-mia', name: 'Mia', relation: 'Daughter', birthdate: '2017-05-20', sex: 'female',
        heightCm: 132, weightKg: 28, activity: 'active', goal: 'maintain', bloodType: '',
        allergies: { peanut: 'severe', treenut: 'moderate' }, otherAllergies: [{ name: 'Kiwi', severity: 'mild' }], intolerances: [],
        conditions: [], otherConditions: [],
        medications: ['EpiPen Jr (carry always)'],
        diet: 'omnivore', dietRules: [], dislikes: ['olives'], avoidFoods: [], limitFoods: [], favoriteFoods: ['Pasta', 'Strawberries'],
        doctor: 'Dr. Example, Pediatrics', emergencyContact: 'Sam — (555) 010-0001', notes: 'School has her allergy action plan.',
        log: [], reviewedAt: '2026-09-01'
      },
      {
        id: 'demo-leo', name: 'Leo', relation: 'Son', birthdate: '2024-06-11', sex: 'male',
        heightCm: 88, weightKg: 12.5, activity: 'active', goal: 'maintain', bloodType: '',
        allergies: { milk: 'moderate' }, otherAllergies: [], intolerances: [],
        conditions: [], otherConditions: [],
        medications: [],
        diet: 'omnivore', dietRules: [], dislikes: [], avoidFoods: [], limitFoods: [], favoriteFoods: ['Bananas'],
        doctor: 'Dr. Example, Pediatrics', emergencyContact: 'Sam — (555) 010-0001', notes: '',
        log: [], reviewedAt: '2026-09-01'
      },
      {
        id: 'demo-june', name: 'June', relation: 'Grandma', birthdate: '1954-01-30', sex: 'female',
        heightCm: 160, weightKg: 70, activity: 'sedentary', goal: 'maintain', bloodType: 'B+',
        allergies: { shellfish: 'severe' }, otherAllergies: [], intolerances: [],
        conditions: ['diabetes2', 'osteoporosis', 'gerd'], otherConditions: [],
        medications: ['Metformin 500 mg twice daily', 'Warfarin 5 mg', 'Alendronate weekly'],
        diet: 'omnivore', dietRules: [], dislikes: [], avoidFoods: [], limitFoods: [], favoriteFoods: ['Oatmeal', 'Tea'],
        doctor: 'Dr. Example, Internal Medicine', emergencyContact: 'Alex — (555) 010-0000', notes: 'INR checked monthly.',
        log: [{ date: '2026-07-15', weightKg: 70, bpSys: 128, bpDia: 76, a1c: 7.1 }],
        reviewedAt: '2026-03-10'
      }
    ],
    customRecipes: [],
    plan: { overrides: {}, eaters: null }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = DEMO;
  else root.FHDemo = DEMO;
})(this);
