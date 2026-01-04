import { DailyLog, WeightEntry, Macros, AppNotification, UserProfile, MealEntry, Supplement, CustomMealEntry } from './types';
import { MEAL_PLAN, WORKOUT_PLAN, HOME_GYM_WORKOUT_PLAN, SUPPLEMENTS } from './constants';

export const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const getISTDateString = (): string => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().split('T')[0];
};

export const getISTDateInfo = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return {
    day: istTime.getUTCDay(),
    hour: istTime.getUTCHours(),
    minutes: istTime.getUTCMinutes()
  };
};

export const getPastDays = (count: number): string[] => {
  const dates: string[] = [];
  const todayStr = getISTDateString();
  const todayDate = new Date(todayStr);
  
  for (let i = 0; i < count; i++) {
    const d = new Date(todayDate);
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

/**
 * Calculates macros specifically for a single meal slot,
 * aggregating standard selection and all custom entries for that slot.
 */
export const calculateMacrosForSlot = (log: DailyLog, slotId: string): Macros => {
  const totals: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  
  // Standard entry
  const entry = log.meals[slotId as keyof DailyLog['meals']] as MealEntry;
  if (entry && entry.id) {
    const category = MEAL_PLAN.find(c => c.id === slotId);
    const option = category?.options.find(o => o.id === entry.id);
    if (option) {
      const qty = entry.qty || 1;
      totals.kcal += option.kcal * qty;
      totals.protein += option.protein * qty;
      totals.carbs += option.carbs * qty;
      totals.fat += option.fat * qty;
      totals.fiber += option.fiber * qty;
    }
  }

  // Custom entries (The fix: Ensure these are included in point calculation)
  log.meals.custom?.filter(c => c.category === slotId).forEach(cEntry => {
    const qty = cEntry.qty || 1;
    totals.kcal += cEntry.macros.kcal * qty;
    totals.protein += cEntry.macros.protein * qty;
    totals.carbs += cEntry.macros.carbs * qty;
    totals.fat += cEntry.macros.fat * qty;
    totals.fiber += cEntry.macros.fiber * qty;
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

export const projectWeightLoss = (dailyDeficit: number, days: number): number => {
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
  
  // 1. Bio-Reporting Adherence (1.0 Point)
  if (log.weight) score += 1;
  
  // 2. Meal Slot Discipline (4.0 Points - 0.8 per slot)
  // Logic: Verify if each slot (Standard + Custom) was fulfilled within the metabolic window
  const SLOT_TARGETS: Record<string, { min: number, max: number }> = {
    breakfast: { min: 300, max: 600 },
    midSnack: { min: 50, max: 300 },
    lunch: { min: 400, max: 800 },
    eveningSnack: { min: 150, max: 450 },
    dinner: { min: 350, max: 800 }
  };

  Object.keys(SLOT_TARGETS).forEach(slotId => {
    const slotMacros = calculateMacrosForSlot(log, slotId);
    const range = SLOT_TARGETS[slotId];
    if (slotMacros.kcal >= range.min && slotMacros.kcal <= range.max) {
      score += 0.8;
    }
  });

  // 3. Exercise Adherence (2.0 Points)
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
    score += 2; // Resting recovery points
  }

  // 4. Walking Protocol (2.0 Points)
  const targetWalking = workout.walkingTarget;
  if (log.walkingMinutes >= targetWalking) score += 2;

  // 5. Supplement Stack (1.0 Point)
  const scheduled = getScheduledSupplements(log.date);
  const taken = log.takenSupplements || [];
  const scheduledCount = scheduled.length;

  if (scheduledCount > 0) {
    const isFullAdherence = scheduled.every(s => taken.includes(s.id));
    if (isFullAdherence) {
      score += 1;
    } else {
      // Penalty for missing critical Sunday D3
      const isSunday = d.getDay() === 0;
      if (isSunday && !taken.includes('d3')) {
        score -= 1;
      }
      // Minor penalty for missing recovery night stack
      const nightSupps = scheduled.filter(s => s.timing === 'night');
      const allNightTaken = nightSupps.every(s => taken.includes(s.id));
      if (nightSupps.length > 0 && !allNightTaken) {
        score -= 0.5;
      }
    }
  }

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
};