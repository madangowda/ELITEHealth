
import { DailyLog, WeightEntry, Macros, AppNotification, UserProfile, MealEntry, Supplement } from './types';
import { MEAL_PLAN, WORKOUT_PLAN, HOME_GYM_WORKOUT_PLAN, SUPPLEMENTS } from './constants';

export const formatDate = (date: Date) => date.toISOString().split('T')[0];

// IST Helper: Ensures logic follows Indian time regardless of system clock
export const getISTDateInfo = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  return {
    day: istTime.getUTCDay(), // 0=Sun, 1=Mon, etc.
    hour: istTime.getUTCHours(),
    minutes: istTime.getUTCMinutes()
  };
};

export const getPastDays = (count: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
};

export const calculateMacros = (log: DailyLog): Macros => {
  const totals: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  
  MEAL_PLAN.forEach(cat => {
    const entry = log.meals[cat.id as keyof DailyLog['meals']] as MealEntry;
    if (entry && entry.id) {
      const option = cat.options.find(o => o.id === entry.id);
      if (option) {
        const qty = entry.qty || 1;
        totals.kcal += option.kcal * qty;
        totals.protein += option.protein * qty;
        totals.carbs += option.carbs * qty;
        totals.fat += option.fat * qty;
        totals.fiber += option.fiber * qty;
      }
    }
  });

  log.meals.custom?.forEach(entry => {
    const qty = entry.qty || 1;
    totals.kcal += entry.macros.kcal * qty;
    totals.protein += entry.macros.protein * qty;
    totals.carbs += entry.macros.carbs * qty;
    totals.fat += entry.macros.fat * qty;
    totals.fiber += entry.macros.fiber * qty;
  });

  return totals;
};

export const calculateExerciseBurn = (log: DailyLog, profile: UserProfile): number => {
  const d = new Date(log.date);
  const dayIndex = d.getDay();
  const adjustedIndex = (dayIndex + 6) % 7;
  const plan = profile.workoutMode === 'homegym' ? HOME_GYM_WORKOUT_PLAN : WORKOUT_PLAN;
  const workout = plan[adjustedIndex];
  
  let burn = 0;
  workout.exercises.forEach(ex => {
    if (log.completedExercises.includes(ex.id)) {
      if (ex.unit === 'set') {
        burn += ex.kcalPerUnit * ex.sets;
      } else if (ex.unit === 'second') {
        burn += ex.kcalPerUnit * 40 * ex.sets;
      }
    }
  });

  log.customExercises?.forEach(ex => {
    burn += ex.kcalBurn;
  });

  burn += log.walkingMinutes * 5;
  return Math.round(burn);
};

export const calculateBMR = (profile: UserProfile, weight: number): number => {
  if (!profile.height || !weight || !profile.age) return 1950;
  if (profile.gender === 'male') {
    return (10 * weight) + (6.25 * profile.height) - (5 * profile.age) + 5;
  } else {
    return (10 * weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
  }
};

export const calculateTDEE = (profile: UserProfile, currentWeight: number): number => {
  const bmr = calculateBMR(profile, currentWeight);
  return Math.round(bmr * profile.activityLevel);
};

// Fix: Add missing weight loss projection function
export const projectWeightLoss = (dailyDeficit: number, days: number): number => {
  // ~7700 kcal deficit = 1kg body fat loss
  return (dailyDeficit * days) / 7700;
};

export const getScheduledSupplements = (dateStr: string): Supplement[] => {
  const d = new Date(dateStr);
  const dayNum = d.getDay();
  return SUPPLEMENTS.filter(s => {
    if (s.frequency === 'daily') return true;
    if (s.frequency === 'specific') return s.days?.includes(dayNum);
    return false;
  });
};

export const calculateDailyScore = (log: DailyLog, macros: Macros, tdee: number, profile: UserProfile): number => {
  let score = 0;
  if (log.weight) score += 1;
  
  const macrosMet = macros.kcal >= 1850 && macros.kcal <= 1950;
  if (macrosMet) score += 4;

  const d = new Date(log.date);
  const dayIndex = d.getDay();
  const adjustedIndex = (dayIndex + 6) % 7;
  const plan = profile.workoutMode === 'homegym' ? HOME_GYM_WORKOUT_PLAN : WORKOUT_PLAN;
  const workout = plan[adjustedIndex];
  const requiredCount = workout.exercises.length;
  
  if (requiredCount > 0) {
    const completedCount = log.completedExercises.length;
    score += (completedCount / requiredCount) * 2;
  } else {
    score += 2;
  }

  const targetWalking = workout.walkingTarget;
  if (log.walkingMinutes >= targetWalking) score += 2;

  // SUPPLEMENT SCORING (INTEGRATED)
  const scheduled = getScheduledSupplements(log.date);
  const taken = log.takenSupplements || [];
  const scheduledCount = scheduled.length;

  if (scheduledCount > 0) {
    const isFullAdherence = scheduled.every(s => taken.includes(s.id));
    
    if (isFullAdherence) {
      score += 1;
    } else {
      // Specific Penalties
      const isSunday = d.getDay() === 0;
      if (isSunday && !taken.includes('d3')) {
        score -= 1;
      }

      const nightSupps = scheduled.filter(s => s.timing === 'night');
      const allNightTaken = nightSupps.every(s => taken.includes(s.id));
      if (nightSupps.length > 0 && !allNightTaken) {
        score -= 0.5;
      }
    }
  }

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
};
