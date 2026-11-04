/*
 * Family Health Guide — a weekly workout split for each person.
 *
 * Built from the Physical Activity Guidelines (150–300 min moderate cardio,
 * strength 2+ days, balance for older adults, 60 min/day for kids), ACSM's
 * resistance-training progression (full body for beginners, upper/lower or
 * splits as experience grows), and meta-analyses showing each muscle trained
 * twice a week and ~10+ hard sets per muscle per week grow more muscle.
 * Health conditions add the cautions their guidelines call for.
 */
(function (root) {
  'use strict';

  var SOURCES = {
    pag: { title: 'Physical Activity Guidelines for Americans, 2nd edition', org: 'US Department of Health and Human Services', year: 2018, url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines' },
    acsmRt: { title: 'Progression models in resistance training for healthy adults — position stand', org: 'American College of Sports Medicine', year: 2009, url: 'https://pubmed.ncbi.nlm.nih.gov/19204579/' },
    freq: { title: 'Effects of resistance training frequency on muscle hypertrophy: meta-analysis (Schoenfeld et al., Sports Med) — twice a week beats once', org: 'Peer-reviewed meta-analysis', year: 2016, url: 'https://pubmed.ncbi.nlm.nih.gov/27102172/' },
    volume: { title: 'Dose-response relationship between weekly resistance training volume and muscle growth (Schoenfeld et al., J Sports Sci) — 10+ sets per muscle per week', org: 'Peer-reviewed meta-analysis', year: 2017, url: 'https://pubmed.ncbi.nlm.nih.gov/27433992/' },
    isometric: { title: 'Exercise training and resting blood pressure: network meta-analysis (Edwards et al., Br J Sports Med) — isometric exercise lowered BP most', org: 'Peer-reviewed meta-analysis', year: 2023, url: 'https://bjsm.bmj.com/content/57/20/1317' },
    adaExercise: { title: 'Physical activity/exercise and diabetes: a position statement', org: 'American Diabetes Association', year: 2016, url: 'https://diabetesjournals.org/care/article/39/11/2065/37249' },
    acog: { title: 'Physical activity and exercise during pregnancy and the postpartum period (Committee Opinion 804)', org: 'American College of Obstetricians and Gynecologists', year: 2020, url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2020/04/physical-activity-and-exercise-during-pregnancy-and-the-postpartum-period' },
    falls: { title: 'Exercise for preventing falls in older people living in the community (Cochrane review)', org: 'Cochrane', year: 2019, url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD012424.pub2/full' }
  };

  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Movement patterns → an exercise for each equipment level.
  var MOVES = {
    squat:   { none: 'Bodyweight squat (to a chair)', home: 'Goblet squat', gym: 'Back squat or leg press', senior: 'Sit-to-stand from a chair' },
    hinge:   { none: 'Glute bridge', home: 'Dumbbell Romanian deadlift', gym: 'Romanian deadlift', senior: 'Glute bridge' },
    hpush:   { none: 'Push-up (on a counter or knees if needed)', home: 'Dumbbell floor or bench press', gym: 'Bench press', senior: 'Wall push-up' },
    vpush:   { none: 'Pike push-up', home: 'Dumbbell shoulder press', gym: 'Overhead press', senior: 'Seated band or light dumbbell press' },
    hpull:   { none: 'Inverted row under a sturdy table', home: 'One-arm dumbbell row', gym: 'Cable or barbell row', senior: 'Seated band row' },
    vpull:   { none: 'Towel door-frame pull (isometric)', home: 'Band lat pulldown', gym: 'Lat pulldown or pull-up', senior: 'Band pulldown' },
    lunge:   { none: 'Reverse lunge', home: 'Dumbbell split squat', gym: 'Walking lunge', senior: 'Step-up onto a low step (hold a rail)' },
    core:    { none: 'Plank or dead bug', home: 'Side plank + dead bug', gym: 'Cable crunch or Pallof press', senior: 'Seated march + bird-dog' },
    carry:   { none: 'Suitcase carry with grocery bags', home: 'Farmer carry with dumbbells', gym: 'Farmer carry', senior: 'Carry light bags, upright posture' },
    arms:    { none: 'Bench dips + towel curls', home: 'Dumbbell triceps extension + curls', gym: 'Cable pushdown + cable curls', senior: 'Band curls + triceps press' },
    calf:    { none: 'Calf raises', home: 'Single-leg calf raise', gym: 'Calf raise machine', senior: 'Calf raises holding a counter' }
  };

  var TEMPLATES = {
    full: { title: 'Full body', moves: ['squat', 'hpush', 'hpull', 'hinge', 'vpush', 'core'] },
    fullB: { title: 'Full body B', moves: ['hinge', 'lunge', 'vpull', 'hpush', 'carry', 'core'] },
    upper: { title: 'Upper body', moves: ['hpush', 'hpull', 'vpush', 'vpull', 'core'] },
    lower: { title: 'Lower body', moves: ['squat', 'hinge', 'lunge', 'calf', 'core'] },
    push: { title: 'Push (chest, shoulders, triceps)', moves: ['hpush', 'vpush', 'arms', 'core'] },
    pull: { title: 'Pull (back, biceps)', moves: ['vpull', 'hpull', 'arms', 'carry'] },
    legs: { title: 'Legs', moves: ['squat', 'hinge', 'lunge', 'calf'] }
  };

  var FOCUS = {
    general: { label: 'Overall health', reps: '8–15', rest: '60–90 s' },
    muscle: { label: 'Build muscle', reps: '6–12', rest: '1–2 min' },
    strength: { label: 'Get stronger', reps: '6–10', rest: '2–3 min' },
    fatloss: { label: 'Lose fat', reps: '8–15', rest: '45–90 s' },
    endurance: { label: 'Endurance', reps: '12–20', rest: '45–60 s' }
  };

  function has(list, k) { return (list || []).indexOf(k) !== -1; }

  // Which weekdays get strength: spread out so no muscle trains two days running when possible.
  var STRENGTH_DAYS = { 1: [2], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5] };

  /*
   * p: { age, sex, conditions, goal, fitness: { days, minutes, equipment, experience, focus }, wearable }
   */
  function plan(p) {
    var f = p.fitness || {};
    var age = p.age;
    var conds = p.conditions || [];
    var out = { cautions: [], why: [], sources: ['pag'], week: [] };

    if (age !== null && age !== undefined && age < 6) {
      out.kind = 'kids-young';
      out.summary = 'Active play throughout the day — about 3 hours, with an hour of energetic play.';
      out.ideas = ['Tag, chasing games, dancing', 'Climbing at the playground', 'Riding a balance bike or tricycle', 'Throwing, kicking and catching balls'];
      return out;
    }
    if (age !== null && age !== undefined && age < 18) {
      out.kind = 'kids';
      out.summary = '60 minutes of activity every day. On 3 days make it vigorous, on 3 days include muscle- and bone-strengthening play.';
      out.ideas = ['Vigorous: running games, soccer, swimming, bike riding, dance', 'Muscle: climbing, push-ups, sit-ups, tug-of-war, gymnastics', 'Bone: jumping rope, hopscotch, basketball, running'];
      out.week = DAYS.map(function (d, i) {
        return { day: d, type: i % 2 === 0 ? 'vigorous' : 'strength', title: i % 2 === 0 ? 'Vigorous play' : 'Strength & jumping play', minutes: 60, items: [] };
      });
      if (age >= 12) out.why.push('Teens can start supervised strength training with light weights and good form — it is safe and builds bone.');
      return out;
    }

    // Adults
    var days = Math.max(2, Math.min(6, Number(f.days) || 3));
    var minutes = Number(f.minutes) || 45;
    var equip = f.equipment || 'home';
    var exp = f.experience || 'new';
    var focus = FOCUS[f.focus] ? f.focus : (p.goal === 'lose' ? 'fatloss' : p.goal === 'gain' ? 'muscle' : 'general');
    var senior = age !== null && age >= 65;
    var pregnant = has(conds, 'pregnancy');
    var moveKey = senior && equip !== 'gym' ? 'senior' : equip;

    // Strength sessions and split.
    var strengthN = focus === 'endurance' ? Math.min(2, days) : focus === 'fatloss' ? Math.min(3, days) : Math.min(days, exp === 'new' ? 3 : exp === 'some' ? 4 : 6);
    if (senior || pregnant) strengthN = Math.min(strengthN, 3);
    strengthN = Math.max(2, strengthN);
    var split;
    if (strengthN <= 3) split = strengthN === 2 ? ['full', 'fullB'] : ['full', 'fullB', 'full'];
    else if (strengthN === 4) split = ['upper', 'lower', 'upper', 'lower'];
    else if (strengthN === 5) split = ['upper', 'lower', 'push', 'pull', 'legs'];
    else split = ['push', 'pull', 'legs', 'push', 'pull', 'legs'];
    out.splitName = strengthN <= 3 ? 'Full body ×' + strengthN : strengthN === 4 ? 'Upper / lower ×2' : strengthN === 5 ? 'Upper / lower + push / pull / legs' : 'Push / pull / legs ×2';

    var sets = exp === 'new' ? 2 : exp === 'some' ? 3 : 4;
    if (senior) sets = Math.min(sets, 2);
    var fo = FOCUS[focus];
    var reps = senior ? '10–15' : fo.reps;

    var cardioDays = days - strengthN;
    var weeklyCardioGoal = focus === 'endurance' || focus === 'fatloss' ? 225 : 150;
    var sDays = STRENGTH_DAYS[strengthN];
    // Cardio days fill the gaps first.
    var free = [0, 1, 2, 3, 4, 5, 6].filter(function (d) { return sDays.indexOf(d) === -1; });
    var cDays = free.slice(0, Math.max(0, cardioDays));
    var cardioMinutes = cDays.length ? Math.max(20, Math.min(60, Math.round((weeklyCardioGoal - strengthN * 15) / cDays.length / 5) * 5)) : 0;

    var si = 0;
    out.week = DAYS.map(function (d, i) {
      if (sDays.indexOf(i) !== -1) {
        var tpl = TEMPLATES[split[si++]];
        var items = tpl.moves.map(function (mv, j) {
          var first = j === 0 && focus === 'strength' && !senior;
          return { name: MOVES[mv][moveKey], sets: first ? sets + 1 : sets, reps: first ? '3–6' : reps, move: mv };
        });
        if (senior) items.push({ name: 'Balance: single-leg stand, heel-to-toe walk (hold a counter)', sets: 2, reps: '30 s each side', move: 'balance' });
        var finisher = (focus === 'fatloss' || cardioDays === 0) ? ' + 15 min brisk cardio' : '';
        return { day: d, type: 'strength', title: tpl.title + finisher, minutes: minutes, items: items };
      }
      if (cDays.indexOf(i) !== -1) {
        var interval = focus === 'endurance' && exp !== 'new' && i === cDays[cDays.length - 1] && !pregnant && !senior;
        return { day: d, type: 'cardio', title: interval ? 'Intervals: 5 × 3 min hard / 2 min easy' : 'Steady cardio (brisk walk, bike, swim, jog)', minutes: cardioMinutes,
          items: [{ name: interval ? 'Warm up 10 min, then 5 rounds, cool down 5 min' : 'Moderate pace — you can talk, not sing', sets: null, reps: null }] };
      }
      return { day: d, type: 'rest', title: senior ? 'Rest — gentle walk, stretching or tai chi' : 'Rest or an easy walk', minutes: 0, items: [] };
    });

    var cardioTotal = cDays.length * cardioMinutes + ((focus === 'fatloss' || cardioDays === 0) ? strengthN * 15 : 0);
    // Reach the 150-minute minimum with brisk walks on rest days, keeping one full rest day.
    var rests = out.week.filter(function (x) { return x.type === 'rest'; });
    for (var k = 0; k < rests.length - 1 && cardioTotal < weeklyCardioGoal; k++) {
      var mins = Math.min(45, Math.max(20, Math.ceil((weeklyCardioGoal - cardioTotal) / (rests.length - 1 - k) / 5) * 5));
      rests[k].type = 'walk'; rests[k].title = 'Brisk walk ' + mins + ' min (or bike, swim)'; rests[k].minutes = mins;
      cardioTotal += mins;
    }
    out.summary = days + ' days a week: ' + out.splitName + (cDays.length ? ' + ' + cDays.length + ' cardio day' + (cDays.length === 1 ? '' : 's') : '') + '. About ' + cardioTotal + ' min of cardio a week.';
    out.focus = fo.label;
    out.why.push(exp === 'new' ? 'New to lifting: full-body sessions train every muscle 2–3 times a week with few sets — the fastest way to learn the moves and build strength.' :
      'Each muscle is trained twice a week — research shows that grows more muscle than once a week.');
    out.why.push(sets + ' sets per exercise, ' + reps + ' reps, rest ' + (senior ? '60–90 s' : fo.rest) + '. Stop each set 1–3 reps before failure; add weight or reps when the last set feels easy.');
    out.why.push('Weekly target: 150–300 minutes of moderate cardio (or 75–150 vigorous) plus strength on 2+ days.' + (cardioTotal < 150 ? ' Your plan is under 150 min of cardio — add brisk walks on rest days or after meals.' : ''));
    out.sources.push('acsmRt', exp === 'new' ? 'freq' : 'volume');
    if (senior) { out.why.push('Balance work 3 days a week reduces falls by about a quarter.'); out.sources.push('falls'); }

    // Conditions and recovery.
    if (has(conds, 'heart') || has(conds, 'ckd')) out.cautions.push('Heart or kidney condition: get your care team\'s OK before starting, and ask about a safe heart-rate range.');
    if (has(conds, 'hypertension')) { out.cautions.push('High blood pressure: breathe out on effort — no breath-holding. Add 4 × 2-minute wall sits or hand-grip squeezes 3 days a week: isometric work lowered blood pressure the most in a 270-trial analysis.'); out.sources.push('isometric'); }
    if (has(conds, 'diabetes1') || has(conds, 'diabetes2') || has(conds, 'prediabetes')) { out.cautions.push('Blood sugar: don\'t go more than 2 days in a row without activity; a 10–15 minute walk after meals helps most.' + (has(conds, 'diabetes1') ? ' With insulin, check glucose before and after workouts and carry fast carbs.' : '')); out.sources.push('adaExercise'); }
    if (pregnant) { out.cautions.push('Pregnancy: 150 minutes a week at a talk-test pace. Avoid contact sports, fall-risk activities and lying flat on your back for long after the first trimester. Stop with bleeding, dizziness, chest pain or contractions.'); out.sources.push('acog'); }
    if (has(conds, 'gout') || has(conds, 'osteoporosis')) out.cautions.push(has(conds, 'osteoporosis') ? 'Osteoporosis: avoid deep forward bending and twisting under load; weight-bearing and strength work help bone.' : 'Gout: during a flare rest the joint; between flares low-impact cardio (bike, swim) is easiest on joints.');
    var w = p.wearable || {};
    if ((w.recovery !== null && w.recovery !== undefined && w.recovery !== '' && Number(w.recovery) < 50)) out.cautions.push('Your tracker shows low recovery — swap today\'s hard session for an easy walk or mobility.');
    return out;
  }

  var Workout = { SOURCES: SOURCES, FOCUS: FOCUS, MOVES: MOVES, plan: plan, DAYS: DAYS };

  if (typeof module !== 'undefined' && module.exports) module.exports = Workout;
  else root.FHWorkout = Workout;
})(this);
