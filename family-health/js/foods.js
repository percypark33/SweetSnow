/*
 * Family Health Guide — build-a-meal food list.
 *
 * Nutrition is per listed serving, rounded from USDA FoodData Central
 * (cooked weights unless noted). Tags use the same vocabulary as recipes in
 * knowledge.js, so allergies, diets and conditions are checked the same way.
 */
(function (root) {
  'use strict';

  var CATEGORIES = [
    { id: 'protein', label: 'Protein', emoji: '🍗', color: '#c0603a', blurb: 'Builds and repairs muscle; keeps you full.' },
    { id: 'carbs', label: 'Carbs', emoji: '🍚', color: '#b0842a', blurb: 'Energy. Whole grains and starchy veg bring fiber too.' },
    { id: 'fiber', label: 'Fiber', emoji: '🥦', color: '#2f7d5b', blurb: 'Vegetables, fruit and beans — aim for half the plate.' },
    { id: 'fat', label: 'Healthy fats', emoji: '🥑', color: '#3d6fb4', blurb: 'Small amounts carry flavor and vitamins A, D, E, K.' }
  ];

  // f(id, category, emoji, name, serving, kcal, protein g, carbs g, fat g, fiber g, tags)
  function f(id, cat, emoji, name, serving, kcal, p, c, fat, fib, tags) {
    return { id: id, cat: cat, emoji: emoji, name: name, serving: serving, kcal: kcal, protein: p, carbs: c, fat: fat, fiber: fib, tags: tags || [] };
  }

  var FOODS = [
    // Protein
    f('chicken', 'protein', '🍗', 'Chicken breast', '4 oz cooked', 187, 35, 0, 4, 0, ['poultry']),
    f('turkey', 'protein', '🦃', 'Turkey breast', '4 oz roasted', 153, 34, 0, 1, 0, ['poultry']),
    f('salmon', 'protein', '🐟', 'Salmon', '4 oz cooked', 233, 25, 0, 14, 0, ['fish']),
    f('cod', 'protein', '🐠', 'Cod', '4 oz cooked', 119, 26, 0, 1, 0, ['fish']),
    f('tuna', 'protein', '🥫', 'Canned light tuna', '3 oz drained', 73, 17, 0, 1, 0, ['fish']),
    f('sardines', 'protein', '🐟', 'Sardines', '1 can (3.75 oz)', 191, 23, 0, 11, 0, ['fish', 'high-purine']),
    f('shrimp', 'protein', '🍤', 'Shrimp', '4 oz cooked', 112, 27, 0, 0, 0, ['shellfish', 'high-purine']),
    f('eggs', 'protein', '🥚', 'Eggs', '2 large', 143, 13, 1, 10, 0, ['egg']),
    f('beef', 'protein', '🥩', 'Lean ground beef (93%)', '4 oz cooked', 182, 26, 0, 8, 0, ['meat', 'high-purine']),
    f('steak', 'protein', '🥩', 'Sirloin steak', '4 oz cooked', 220, 34, 0, 8, 0, ['meat', 'high-purine']),
    f('pork', 'protein', '🍖', 'Pork tenderloin', '4 oz cooked', 162, 30, 0, 4, 0, ['pork']),
    f('tofu', 'protein', '🧈', 'Firm tofu', '½ cup', 181, 22, 4, 11, 3, ['soy']),
    f('tempeh', 'protein', '🟫', 'Tempeh', '½ cup', 160, 17, 8, 9, 0, ['soy']),
    f('lentils', 'protein', '🫘', 'Lentils', '1 cup cooked', 230, 18, 40, 1, 16, ['high-fodmap', 'high-potassium']),
    f('edamame', 'protein', '🫛', 'Edamame', '1 cup shelled', 188, 18, 14, 8, 8, ['soy']),
    f('greek-yogurt', 'protein', '🥣', 'Greek yogurt, plain nonfat', '1 cup', 133, 23, 8, 1, 0, ['milk']),
    f('cottage', 'protein', '🧀', 'Cottage cheese, low-fat', '1 cup', 163, 28, 6, 2, 0, ['milk', 'high-sodium']),

    // Carbs
    f('brown-rice', 'carbs', '🍚', 'Brown rice', '1 cup cooked', 218, 5, 46, 2, 4, []),
    f('white-rice', 'carbs', '🍙', 'White rice', '1 cup cooked', 205, 4, 45, 0, 1, ['refined-carb']),
    f('quinoa', 'carbs', '🌾', 'Quinoa', '1 cup cooked', 222, 8, 39, 4, 5, []),
    f('oats', 'carbs', '🥣', 'Rolled oats', '½ cup dry', 150, 5, 27, 3, 4, ['oats']),
    f('ww-pasta', 'carbs', '🍝', 'Whole-wheat pasta', '1 cup cooked', 174, 8, 37, 1, 6, ['wheat']),
    f('pasta', 'carbs', '🍝', 'Pasta', '1 cup cooked', 220, 8, 43, 1, 3, ['wheat', 'refined-carb']),
    f('ww-bread', 'carbs', '🍞', 'Whole-grain bread', '2 slices', 140, 7, 24, 2, 4, ['wheat']),
    f('sweet-potato', 'carbs', '🍠', 'Sweet potato', '1 medium baked', 103, 2, 24, 0, 4, ['high-potassium']),
    f('potato', 'carbs', '🥔', 'Baked potato with skin', '1 medium', 161, 4, 37, 0, 4, ['high-potassium']),
    f('corn-tortilla', 'carbs', '🫓', 'Corn tortillas', '2 small', 104, 3, 22, 1, 3, []),
    f('rice-noodles', 'carbs', '🍜', 'Rice noodles', '1 cup cooked', 190, 2, 42, 0, 2, ['refined-carb']),
    f('barley', 'carbs', '🌾', 'Barley', '1 cup cooked', 193, 4, 44, 1, 6, ['gluten']),

    // Fiber: vegetables, fruit, beans
    f('broccoli', 'fiber', '🥦', 'Broccoli', '1 cup cooked', 55, 4, 11, 1, 5, []),
    f('spinach', 'fiber', '🥬', 'Spinach', '1 cup cooked', 41, 5, 7, 0, 4, ['high-potassium']),
    f('salad', 'fiber', '🥗', 'Mixed salad greens', '2 cups', 10, 1, 2, 0, 1, []),
    f('carrots', 'fiber', '🥕', 'Carrots', '1 cup raw', 52, 1, 12, 0, 4, ['choking']),
    f('peppers', 'fiber', '🫑', 'Bell peppers', '1 cup', 30, 1, 7, 0, 3, []),
    f('green-beans', 'fiber', '🫛', 'Green beans', '1 cup cooked', 44, 2, 10, 0, 4, []),
    f('brussels', 'fiber', '🥬', 'Brussels sprouts', '1 cup cooked', 56, 4, 11, 1, 4, []),
    f('cauliflower', 'fiber', '🥦', 'Cauliflower', '1 cup cooked', 29, 2, 5, 1, 3, ['high-fodmap']),
    f('zucchini', 'fiber', '🥒', 'Zucchini', '1 cup cooked', 27, 2, 5, 0, 2, []),
    f('tomatoes', 'fiber', '🍅', 'Tomatoes', '1 cup', 32, 2, 7, 0, 2, ['acidic']),
    f('mushrooms', 'fiber', '🍄', 'Mushrooms', '1 cup cooked', 44, 3, 8, 1, 3, ['high-fodmap']),
    f('black-beans', 'fiber', '🫘', 'Black beans', '1 cup cooked', 227, 15, 41, 1, 15, ['high-fodmap', 'high-potassium']),
    f('chickpeas', 'fiber', '🧆', 'Chickpeas', '1 cup cooked', 269, 15, 45, 4, 12, ['high-fodmap']),
    f('berries', 'fiber', '🫐', 'Mixed berries', '1 cup', 70, 1, 17, 0, 5, []),
    f('apple', 'fiber', '🍎', 'Apple', '1 medium', 95, 0, 25, 0, 4, ['high-fodmap']),
    f('banana', 'fiber', '🍌', 'Banana', '1 medium', 105, 1, 27, 0, 3, ['high-potassium']),
    f('orange', 'fiber', '🍊', 'Orange', '1 medium', 62, 1, 15, 0, 3, ['acidic']),
    f('kiwi', 'fiber', '🥝', 'Kiwi', '2 fruits', 84, 2, 20, 1, 4, []),
    f('grapes', 'fiber', '🍇', 'Grapes', '1 cup', 104, 1, 27, 0, 1, ['choking']),
    f('chia', 'fiber', '🌱', 'Chia seeds', '2 Tbsp', 138, 5, 12, 9, 10, []),

    // Healthy fats
    f('avocado', 'fat', '🥑', 'Avocado', '½ fruit', 160, 2, 9, 15, 7, ['high-potassium']),
    f('olive-oil', 'fat', '🫒', 'Olive oil', '1 Tbsp', 119, 0, 0, 14, 0, []),
    f('almonds', 'fat', '🌰', 'Almonds', '1 oz (23 nuts)', 164, 6, 6, 14, 4, ['treenut', 'choking']),
    f('walnuts', 'fat', '🌰', 'Walnuts', '1 oz', 185, 4, 4, 18, 2, ['treenut', 'choking']),
    f('peanut-butter', 'fat', '🥜', 'Peanut butter', '2 Tbsp', 190, 7, 8, 16, 2, ['peanut']),
    f('sunbutter', 'fat', '🌻', 'Sunflower-seed butter', '2 Tbsp', 200, 6, 7, 18, 2, []),
    f('pumpkin-seeds', 'fat', '🎃', 'Pumpkin seeds', '1 oz', 158, 9, 3, 14, 2, []),
    f('flax', 'fat', '🌾', 'Ground flaxseed', '2 Tbsp', 75, 3, 4, 6, 4, []),
    f('hummus', 'fat', '🧆', 'Hummus', '¼ cup', 102, 5, 9, 6, 3, ['sesame', 'high-fodmap']),
    f('tahini', 'fat', '🥄', 'Tahini', '1 Tbsp', 89, 3, 3, 8, 1, ['sesame']),
    f('cheddar', 'fat', '🧀', 'Cheddar cheese', '1 oz', 114, 7, 0, 9, 0, ['milk', 'aged-cheese', 'high-sodium', 'high-satfat']),
    f('butter', 'fat', '🧈', 'Butter', '1 Tbsp', 102, 0, 0, 12, 0, ['milk', 'high-satfat']),
    f('olives', 'fat', '🫒', 'Olives', '10 large', 50, 0, 3, 5, 1, ['high-sodium'])
  ];


  /*
   * Vitamins, minerals and limits per listed serving, rounded from USDA
   * FoodData Central (SR Legacy / Foundation): [vitamin A mcg RAE, vitamin C mg,
   * vitamin E mg, calcium mg, iron mg, magnesium mg, potassium mg, sodium mg,
   * saturated fat g, added sugar g, vitamin D mcg, vitamin B12 mcg, folate mcg DFE].
   * Brands vary (tofu calcium, cottage cheese and shrimp sodium especially).
   */
  var MICRO_KEYS = ['vitA', 'vitC', 'vitE', 'calcium', 'iron', 'magnesium', 'potassium', 'sodium', 'satFat', 'addedSugar', 'vitD', 'b12', 'folate'];
  var MICRO = {
    chicken: [10, 0, 0.3, 17, 1.2, 33, 290, 84, 1.1, 0, 0.1, 0.4, 5],
    turkey: [0, 0, 0.1, 10, 0.8, 33, 280, 70, 0.3, 0, 0.1, 1.0, 7],
    salmon: [60, 4, 1.5, 17, 0.4, 34, 430, 70, 3.0, 0, 15, 3.2, 30],
    cod: [16, 1, 0.9, 16, 0.6, 47, 280, 88, 0.2, 0, 1.3, 1.2, 9],
    tuna: [15, 0, 0.3, 9, 1.3, 23, 200, 210, 0.2, 0, 1.0, 2.1, 3],
    sardines: [30, 0, 1.9, 350, 2.7, 36, 365, 280, 1.4, 0, 4.4, 8.2, 9],
    shrimp: [80, 0, 1.5, 80, 0.6, 40, 190, 330, 0.1, 0, 0.1, 1.7, 21],
    eggs: [160, 0, 1.0, 56, 1.8, 12, 140, 140, 3.1, 0, 2.0, 0.9, 47],
    beef: [0, 0, 0.5, 15, 2.9, 25, 390, 85, 3.3, 0, 0.1, 2.8, 10],
    steak: [0, 0, 0.4, 25, 2.3, 32, 430, 70, 3.2, 0, 0.1, 1.9, 10],
    pork: [0, 0.5, 0.2, 7, 1.2, 33, 470, 65, 1.3, 0, 0.6, 0.6, 0],
    tofu: [10, 0.3, 0, 350, 3.4, 73, 300, 15, 1.6, 0, 0, 0, 37],
    tempeh: [0, 0, 0, 92, 2.2, 67, 340, 7, 1.8, 0, 0, 0.1, 20],
    lentils: [2, 3, 0.2, 38, 6.6, 71, 730, 4, 0.1, 0, 0, 0, 358],
    edamame: [23, 9.5, 1.1, 98, 3.5, 99, 680, 9, 0.9, 0, 0, 0, 482],
    'greek-yogurt': [2, 0, 0, 270, 0.2, 27, 340, 90, 0.3, 0, 0, 1.9, 17],
    cottage: [25, 0, 0, 140, 0.3, 18, 190, 920, 1.5, 0, 0, 1.6, 27],
    'brown-rice': [0, 0, 0.1, 6, 0.8, 79, 155, 8, 0.4, 0, 0, 0, 10],
    'white-rice': [0, 0, 0.1, 16, 1.9, 19, 55, 2, 0.1, 0, 0, 0, 92],
    quinoa: [2, 0, 1.2, 31, 2.8, 118, 320, 13, 0.5, 0, 0, 0, 78],
    oats: [0, 0, 0.2, 21, 1.7, 55, 145, 2, 0.5, 0, 0, 0, 13],
    'ww-pasta': [0, 0, 0.4, 21, 2.1, 60, 135, 6, 0.2, 0, 0, 0, 10],
    pasta: [0, 0, 0.1, 10, 1.8, 25, 60, 1, 0.3, 0, 0, 0, 100],
    'ww-bread': [0, 0, 0.2, 80, 1.6, 50, 160, 270, 0.4, 3, 0, 0, 30],
    'sweet-potato': [1100, 22, 0.8, 43, 0.8, 31, 540, 41, 0, 0, 0, 0, 7],
    potato: [2, 17, 0.1, 26, 1.9, 50, 925, 17, 0, 0, 0, 0, 48],
    'corn-tortilla': [0, 0, 0.1, 40, 0.6, 34, 90, 20, 0.1, 0, 0, 0, 5],
    'rice-noodles': [0, 0, 0, 7, 0.2, 5, 7, 33, 0, 0, 0, 0, 5],
    barley: [0, 0, 0, 17, 2.1, 35, 145, 5, 0.1, 0, 0, 0, 25],
    broccoli: [120, 100, 2.3, 62, 1.0, 33, 460, 64, 0.1, 0, 0, 0, 168],
    spinach: [940, 18, 3.7, 245, 6.4, 157, 840, 126, 0.1, 0, 0, 0, 263],
    salad: [220, 10, 0.4, 25, 0.6, 8, 150, 15, 0, 0, 0, 0, 60],
    carrots: [1070, 7.6, 0.9, 42, 0.4, 15, 410, 88, 0, 0, 0, 0, 24],
    peppers: [230, 190, 2.4, 10, 0.6, 18, 310, 6, 0, 0, 0, 0, 68],
    'green-beans': [44, 12, 0.6, 55, 0.8, 23, 180, 1, 0, 0, 0, 0, 41],
    brussels: [60, 97, 0.7, 56, 1.9, 31, 495, 32, 0.1, 0, 0, 0, 94],
    cauliflower: [1, 55, 0.1, 20, 0.4, 11, 175, 19, 0.1, 0, 0, 0, 55],
    zucchini: [100, 23, 0.2, 32, 0.6, 34, 460, 5, 0, 0, 0, 0, 50],
    tomatoes: [75, 25, 1.0, 18, 0.5, 20, 430, 9, 0, 0, 0, 0, 27],
    mushrooms: [0, 6, 0, 9, 2.7, 19, 555, 3, 0.1, 0, 0.3, 0, 28],
    'black-beans': [0, 0, 0.1, 46, 3.6, 120, 610, 2, 0.2, 0, 0, 0, 256],
    chickpeas: [2, 2, 0.6, 80, 4.7, 79, 475, 11, 0.4, 0, 0, 0, 282],
    berries: [5, 40, 1.0, 25, 0.5, 20, 160, 1, 0, 0, 0, 0, 30],
    apple: [5, 8, 0.3, 11, 0.2, 9, 195, 2, 0, 0, 0, 0, 5],
    banana: [4, 10, 0.1, 6, 0.3, 32, 420, 1, 0.1, 0, 0, 0, 24],
    orange: [15, 70, 0.2, 52, 0.1, 13, 235, 0, 0, 0, 0, 0, 40],
    kiwi: [6, 128, 2.0, 47, 0.4, 23, 430, 4, 0, 0, 0, 0, 35],
    grapes: [5, 5, 0.3, 15, 0.5, 11, 290, 3, 0.1, 0, 0, 0, 3],
    chia: [0, 0, 0.1, 150, 1.9, 80, 100, 4, 0.8, 0, 0, 0, 12],
    avocado: [7, 10, 2.1, 12, 0.6, 29, 485, 7, 2.1, 0, 0, 0, 81],
    'olive-oil': [0, 0, 1.9, 0, 0.1, 0, 0, 0, 1.9, 0, 0, 0, 0],
    almonds: [0, 0, 7.3, 76, 1.1, 77, 210, 0, 1.1, 0, 0, 0, 14],
    walnuts: [0, 0.4, 0.2, 28, 0.8, 45, 125, 1, 1.7, 0, 0, 0, 28],
    'peanut-butter': [0, 0, 2.9, 17, 0.6, 54, 180, 140, 3.3, 2, 0, 0, 24],
    sunbutter: [0, 0, 7.4, 20, 1.3, 100, 190, 100, 2.0, 2, 0, 0, 76],
    'pumpkin-seeds': [0, 0.5, 0.6, 13, 2.3, 156, 230, 5, 2.4, 0, 0, 0, 16],
    flax: [0, 0, 0.1, 36, 0.8, 55, 115, 4, 0.5, 0, 0, 0, 12],
    hummus: [1, 0, 0.5, 24, 1.5, 44, 140, 230, 0.9, 0, 0, 0, 50],
    tahini: [0, 0, 0, 64, 1.3, 14, 62, 17, 1.1, 0, 0, 0, 15],
    cheddar: [75, 0, 0.2, 200, 0.2, 8, 21, 180, 5.3, 0, 0.3, 0.3, 5],
    butter: [97, 0, 0.3, 3, 0, 0, 3, 90, 7.3, 0, 0.2, 0, 0],
    olives: [9, 0, 0.7, 39, 1.5, 2, 4, 330, 0.6, 0, 0, 0, 0]
  };
  FOODS.forEach(function (fd) {
    var row = MICRO[fd.id];
    MICRO_KEYS.forEach(function (k, i) { fd[k] = row ? row[i] : 0; });
    fd.hasMicros = !!row;
  });

  // Share of the day's needs each meal should cover.
  var MEAL_SHARE = { breakfast: 0.25, lunch: 0.30, dinner: 0.35, snack: 0.10 };

  // Family-added ingredients (meal planner) resolve here too.
  var CUSTOM = [];
  function setCustom(list) { CUSTOM = Array.isArray(list) ? list : []; }
  function byId(id) { return FOODS.filter(function (x) { return x.id === id; })[0] || CUSTOM.filter(function (x) { return x.id === id; })[0]; }

  function totals(items) {
    var t = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, byCat: { protein: 0, carbs: 0, fiber: 0, fat: 0 } };
    (items || []).forEach(function (it) {
      var food = byId(it.foodId);
      if (!food) return;
      var q = it.qty || 1;
      t.kcal += food.kcal * q; t.protein += food.protein * q; t.carbs += food.carbs * q; t.fat += food.fat * q; t.fiber += food.fiber * q;
      t.byCat[food.cat] += food.kcal * q;
    });
    ['kcal', 'protein', 'carbs', 'fat', 'fiber'].forEach(function (k) { t[k] = Math.round(t[k]); });
    return t;
  }

  /*
   * Per-meal targets from the day's calories and weight.
   * Protein 0.8 g/kg (RDA), carbs 45–65% and fat 20–35% of calories (AMDR),
   * fiber 14 g per 1,000 kcal (Dietary Guidelines).
   */
  function mealTargets(dayKcal, proteinPerDay, meal) {
    var share = MEAL_SHARE[meal] || 0.3;
    var kcal = (dayKcal || 2000) * share;
    return {
      kcal: Math.round(kcal),
      protein: Math.round((proteinPerDay || (dayKcal || 2000) * 0.15 / 4) * share),
      carbsMin: Math.round(kcal * 0.45 / 4), carbsMax: Math.round(kcal * 0.65 / 4),
      fatMin: Math.round(kcal * 0.20 / 9), fatMax: Math.round(kcal * 0.35 / 9),
      fiber: Math.round((dayKcal || 2000) / 1000 * 14 * share)
    };
  }

  // A playful 0–100 balance score with the reasons behind it.
  // Protein targets are minimums (RDA), so only very large amounts lose points.
  function score(items, target) {
    var t = totals(items);
    var cats = Object.keys(t.byCat).filter(function (k) { return t.byCat[k] > 0; });
    var parts = [], s = 0;
    if (!items || !items.length) return { score: 0, parts: [], badges: [], totals: t };
    var inRange = function (v, lo, hi) { return v >= lo * 0.85 && v <= hi * 1.15; };
    var pr = target.protein ? t.protein / target.protein : 0;
    if (pr >= 0.8 && pr <= 2.5) { s += 20; parts.push('protein covered'); }
    else if (pr >= 0.5) { s += 10; parts.push(pr < 0.8 ? 'a bit low on protein' : 'a lot of protein'); }
    else parts.push('add some protein');
    var fr = target.fiber ? t.fiber / target.fiber : 0;
    if (fr >= 0.8) { s += 20; parts.push('great fiber'); } else if (fr >= 0.4) { s += 10; parts.push('more fiber would help'); } else parts.push('needs fiber');
    var kr = target.kcal ? t.kcal / target.kcal : 0;
    if (kr >= 0.7 && kr <= 1.2) { s += 20; parts.push('energy just right'); }
    else if (kr >= 0.5 && kr <= 1.5) { s += 10; parts.push(kr < 0.7 ? 'a light meal' : 'a big meal'); }
    else parts.push(kr < 0.5 ? 'very light' : 'very large');
    if (inRange(t.fat, target.fatMin, target.fatMax)) { s += 10; } else parts.push(t.fat > target.fatMax ? 'heavy on fat' : 'could use a little healthy fat');
    if (inRange(t.carbs, target.carbsMin, target.carbsMax)) { s += 10; } else parts.push(t.carbs > target.carbsMax ? 'carb-heavy' : 'light on carbs');
    if (t.byCat.fiber > 0) { s += 10; parts.push('has veg, fruit or beans'); }
    if (cats.length >= 3) { s += 10; parts.push(cats.length + ' food groups'); }
    var badges = [];
    if (pr >= 0.8) badges.push('💪 Protein power');
    if (fr >= 0.8) badges.push('🌿 Fiber hero');
    if (cats.length === 4) badges.push('🌈 All four groups');
    if (s >= 85) badges.push('⭐ Balanced plate');
    return { score: Math.min(100, s), parts: parts, badges: badges, totals: t };
  }

  // Build a balanced plate from foods the eaters can have (for "Surprise me").
  function surprise(allowedIds, rand) {
    rand = rand || Math.random;
    var pick = function (cat) {
      var opts = FOODS.filter(function (x) { return x.cat === cat && allowedIds.indexOf(x.id) !== -1; });
      return opts.length ? opts[Math.floor(rand() * opts.length)] : null;
    };
    var items = [];
    var p = pick('protein'), c = pick('carbs'), v1 = pick('fiber'), fat = pick('fat');
    if (p) items.push({ foodId: p.id, qty: 1 });
    if (c) items.push({ foodId: c.id, qty: 1 });
    if (v1) items.push({ foodId: v1.id, qty: 2 });
    if (fat) items.push({ foodId: fat.id, qty: 1 });
    return items;
  }

  var Foods = { CATEGORIES: CATEGORIES, FOODS: FOODS, MICRO_KEYS: MICRO_KEYS, MEAL_SHARE: MEAL_SHARE, byId: byId, setCustom: setCustom, totals: totals, mealTargets: mealTargets, score: score, surprise: surprise };

  if (typeof module !== 'undefined' && module.exports) module.exports = Foods;
  else root.FHFoods = Foods;
})(this);
