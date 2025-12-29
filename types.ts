
export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  grams?: number;
}

export interface UserProfile {
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: number; // 1.2 to 1.9 multiplier
}

export interface MealOption extends Macros {
  id: string;
  name: string;
  quantity: string;
}

export interface MealCategory {
  id: 'breakfast' | 'midSnack' | 'lunch' | 'eveningSnack' | 'dinner';
  label: string;
  options: MealOption[];
}

export interface MealEntry {
  id: string;
  qty: number;
}

export interface CustomMealEntry {
  name: string;
  macros: Macros;
  qty: number;
}

export interface Exercise {
  id: string;
  name: string;
  equipment: string;
  sets: number;
  reps: string;
  kcalPerUnit: number;
  unit: 'set' | 'minute' | 'second';
  videoUrl?: string;
  formTips?: string[];
}

export interface WorkoutDay {
  day: string;
  type: string;
  exercises: Exercise[];
  walkingTarget: number;
}

export interface DailyLog {
  date: string;
  weight?: number;
  meals: {
    breakfast?: MealEntry;
    midSnack?: MealEntry;
    lunch?: MealEntry;
    eveningSnack?: MealEntry;
    dinner?: MealEntry;
    custom?: CustomMealEntry[];
  };
  completedExercises: string[];
  walkingMinutes: number;
  waterIntakeMl: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'reminder' | 'warning' | 'critical' | 'success';
  timestamp: number;
  read: boolean;
}
