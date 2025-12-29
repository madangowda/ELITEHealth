import { DailyLog, WeightEntry, Macros, AppNotification, UserProfile } from './types';
import { MEAL_PLAN, WORKOUT_PLAN } from './constants';

export const formatDate = (date: Date) => date.toISOString().split('T')[0];

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
    const selectedId = log.meals[cat.id as keyof DailyLog['meals']] as string;
    if (selectedId) {
      const option = cat.options.find(o => o.id === selectedId);
      if (option) {
        totals.kcal += option.kcal;
        totals.protein += option.protein;
        totals.carbs += option.carbs;
        totals.fat += option.fat;
        totals.fiber += option.fiber;
      }
    }
  });

  log.meals.custom?.forEach(entry => {
    totals.kcal += entry.macros.kcal;
    totals.protein += entry.macros.protein;
    totals.carbs += entry.macros.carbs;
    totals.fat += entry.macros.fat;
    totals.fiber += entry.macros.fiber;
  });

  return totals;
};

export const calculateExerciseBurn = (log: DailyLog): number => {
  const d = new Date(log.date);
  const dayIndex = d.getDay();
  const adjustedIndex = (dayIndex + 6) % 7;
  const workout = WORKOUT_PLAN[adjustedIndex];
  
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

export const calculateDailyScore = (log: DailyLog, macros: Macros, tdee: number): number => {
  let score = 0;
  if (log.weight) score += 1;
  
  const mealKeys: (keyof DailyLog['meals'])[] = ['breakfast', 'midSnack', 'lunch', 'eveningSnack', 'dinner'];
  const mealsCount = mealKeys.filter(k => !!log.meals[k]).length;
  
  // Specific range: 1850–1950 kcal
  if (mealsCount === 5) {
    if (macros.kcal >= 1850 && macros.kcal <= 1950) score += 4;
    else if (macros.kcal < 1850) score += 1; // Undereating is better than overeating but not perfect
    else if (macros.kcal > 1950 && macros.kcal <= 2100) score += 1;
  }

  const d = new Date(log.date);
  const dayIndex = d.getDay();
  const adjustedIndex = (dayIndex + 6) % 7;
  const workout = WORKOUT_PLAN[adjustedIndex];
  const requiredCount = workout.exercises.length;
  
  if (requiredCount > 0) {
    const completedCount = log.completedExercises.length;
    score += (completedCount / requiredCount) * 3;
  } else {
    score += 3;
  }

  const targetWalking = workout.walkingTarget;
  if (log.walkingMinutes >= targetWalking) score += 2;
  else if (log.walkingMinutes > 0) score += 1;

  return Math.min(10, Math.round(score * 10) / 10);
};

export const generateSmartNotifications = (log: DailyLog, macros: Macros, tdee: number): AppNotification[] => {
  const notifications: AppNotification[] = [];
  const hour = new Date().getHours();
  const now = Date.now();

  if (hour >= 7 && hour < 10 && !log.weight) {
    notifications.push({
      id: 'weight-rem',
      title: 'Morning Weigh-in',
      body: 'Track your morning weight to maintain metabolic accuracy.',
      type: 'reminder',
      timestamp: now,
      read: false
    });
  }

  if (macros.kcal > 1950) {
    notifications.push({
      id: 'cal-excess',
      title: 'Goal Exceeded',
      body: `Intake is above your 1950 limit. Fat loss has slowed down.`,
      type: 'critical',
      timestamp: now,
      read: false
    });
  }

  return notifications;
};
