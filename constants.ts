
import { MealCategory, WorkoutDay, Macros, Exercise, Supplement } from './types';

export const DAILY_TARGETS: Macros = {
  kcal: 1900, 
  protein: 142.5,
  carbs: 195,
  fat: 60,
  fiber: 35,
};

export const SUPPLEMENTS: Supplement[] = [
  {
    id: 'omega3',
    name: 'Omega-3',
    brand: 'Salmega Omega-3',
    dose: '2000 mg (2 capsules)',
    instruction: 'Take after breakfast (fat improves absorption)',
    timing: 'morning',
    frequency: 'daily',
    requiresFat: true
  },
  {
    id: 'folate',
    name: 'Folate (Vitamin B9)',
    brand: 'Folyx L-Methylfolate',
    dose: '1 mg / 5 mg',
    instruction: 'Can be taken with any breakfast',
    timing: 'morning',
    frequency: 'daily'
  },
  {
    id: 'b12',
    name: 'Vitamin B12',
    brand: 'Himalayan Organics Methylcobalamin',
    dose: '1000 mcg',
    instruction: 'Take with water after breakfast',
    timing: 'morning',
    frequency: 'specific',
    days: [1, 4] // Monday and Thursday
  },
  {
    id: 'd3',
    name: 'Vitamin D3 (Special Weekly)',
    brand: 'SuperD3',
    dose: '60,000 IU',
    instruction: 'Must be taken after fat-containing breakfast. NEVER on empty stomach.',
    timing: 'morning',
    frequency: 'specific',
    days: [0], // Sunday only
    requiresFat: true
  },
  {
    id: 'magnesium',
    name: 'Magnesium Glycinate',
    brand: 'Tata 1mg Magnesium Glycinate',
    dose: '300–400 mg',
    instruction: 'Take after dinner / before sleep',
    timing: 'night',
    frequency: 'daily'
  },
  {
    id: 'ashwa',
    name: 'Ashwagandha',
    brand: 'Carbamide Forte Ashwagandha',
    dose: '500 mg (Half tablet)',
    instruction: 'Night only (for cortisol & sleep)',
    timing: 'night',
    frequency: 'daily'
  }
];

export const MEAL_PLAN: MealCategory[] = [
  {
    id: 'breakfast',
    label: 'Breakfast (7:30-8:30 AM)',
    options: [
      { id: 'b1', name: '3 eggs + 2 wheat bread slices', quantity: '150g eggs + 60g bread', kcal: 380, protein: 26, carbs: 28, fat: 18, fiber: 4 },
      { id: 'b2', name: 'Oats + 1 scoop whey', quantity: '60g oats', kcal: 390, protein: 32, carbs: 35, fat: 12, fiber: 7 },
      { id: 'b3', name: 'Sweet potato boiled + 2 eggs', quantity: '200g sweet potato', kcal: 430, protein: 22, carbs: 45, fat: 14, fiber: 8 },
      { id: 'b4', name: 'Curd + 10 almonds', quantity: '250g curd', kcal: 360, protein: 24, carbs: 14, fat: 14, fiber: 2 },
      { id: 'b5', name: 'Paneer bhurji + 1 chapati', quantity: '100g paneer', kcal: 450, protein: 28, carbs: 30, fat: 18, fiber: 5 },
      { id: 'b6', name: 'Mixed sprouts (plain)', quantity: '150g', kcal: 360, protein: 20, carbs: 42, fat: 6, fiber: 8 },
      { id: 'b7', name: 'Boiled chickpeas', quantity: '150g', kcal: 410, protein: 18, carbs: 55, fat: 8, fiber: 12 },
      { id: 'b8', name: 'Upma + milk', quantity: '200g upma + 200ml milk', kcal: 440, protein: 18, carbs: 52, fat: 14, fiber: 7 },
      { id: 'b9', name: 'Omelette (3 eggs) + 1 toast', quantity: '1 slice toast', kcal: 390, protein: 27, carbs: 20, fat: 22, fiber: 3 },
      { id: 'b10', name: 'Paneer + boiled potato', quantity: '120g each', kcal: 430, protein: 26, carbs: 38, fat: 16, fiber: 6 },
    ]
  },
  { id: 'midSnack', label: 'Mid-Morning Snack (10:30-11:30 AM)', options: [
      { id: 'ms1', name: 'Orange', quantity: '130g', kcal: 60, protein: 1, carbs: 15, fat: 0, fiber: 3 },
      { id: 'ms2', name: 'Watermelon', quantity: '300g', kcal: 90, protein: 2, carbs: 22, fat: 0, fiber: 1 },
      { id: 'ms3', name: 'Cucumber + carrot + beet salad', quantity: '250g', kcal: 120, protein: 4, carbs: 18, fat: 1, fiber: 6 },
      { id: 'ms4', name: 'Buttermilk', quantity: '250ml', kcal: 120, protein: 4, carbs: 10, fat: 3, fiber: 1 },
      { id: 'ms5', name: 'Sweet potato', quantity: '100g', kcal: 150, protein: 2, carbs: 35, fat: 1, fiber: 4 },
      { id: 'ms6', name: 'Sprouts salad', quantity: '120g', kcal: 180, protein: 10, carbs: 25, fat: 5, fiber: 7 },
      { id: 'ms7', name: 'Boiled corn', quantity: '120g', kcal: 230, protein: 6, carbs: 40, fat: 4, fiber: 6 },
      { id: 'ms8', name: 'Coconut water', quantity: '250ml', kcal: 60, protein: 1, carbs: 15, fat: 0, fiber: 1 },
      { id: 'ms9', name: 'Orange + peanuts', quantity: '130g + 10g', kcal: 120, protein: 3, carbs: 15, fat: 6, fiber: 3 },
      { id: 'ms10', name: 'Watermelon + seeds', quantity: '300g + 1tsp', kcal: 130, protein: 3, carbs: 22, fat: 4, fiber: 3 },
  ]},
  { id: 'lunch', label: 'Lunch (1:00-2:00 PM)', options: [
      { id: 'l1', name: 'Rice + dal + veg', quantity: '180g rice, 30g dal, 150g veg', kcal: 500, protein: 22, carbs: 70, fat: 10, fiber: 9 },
      { id: 'l2', name: 'Chicken curry + rice', quantity: '150g chicken, 160g rice', kcal: 520, protein: 35, carbs: 60, fat: 14, fiber: 5 },
      { id: 'l3', name: 'Fish curry + rice', quantity: '150g fish, 160g rice', kcal: 510, protein: 32, carbs: 58, fat: 15, fiber: 5 },
      { id: 'l4', name: 'Rajma + rice', quantity: '150g rajma, 150g rice', kcal: 520, protein: 22, carbs: 72, fat: 10, fiber: 13 },
      { id: 'l5', name: 'Paneer curry + 2 chapati', quantity: '120g paneer', kcal: 520, protein: 30, carbs: 45, fat: 18, fiber: 7 },
  ]},
  { id: 'eveningSnack', label: 'Evening Snack (5:00-6:00 PM)', options: [
      { id: 'es1', name: 'Sprouts salad', quantity: '150g', kcal: 230, protein: 12, carbs: 30, fat: 6, fiber: 8 },
      { id: 'es5', name: 'Whey protein (water)', quantity: '1 scoop', kcal: 200, protein: 30, carbs: 6, fat: 2, fiber: 1 },
      { id: 'es7', name: 'Paneer cubes', quantity: '80g', kcal: 220, protein: 14, carbs: 6, fat: 14, fiber: 1 },
  ]},
  { id: 'dinner', label: 'Dinner (7:00-8:00 PM)', options: [
      { id: 'd1', name: 'Grilled chicken + veg', quantity: '180g chicken, 200g veg', kcal: 450, protein: 40, carbs: 15, fat: 18, fiber: 6 },
      { id: 'd2', name: 'Fish + veg', quantity: '180g fish, 200g veg', kcal: 460, protein: 38, carbs: 12, fat: 20, fiber: 5 },
      { id: 'd3', name: 'Paneer + veg', quantity: '150g paneer, 200g veg', kcal: 480, protein: 32, carbs: 18, fat: 22, fiber: 6 },
  ]}
];

const WARM_UP: Exercise[] = [
  { id: 'wu1', name: 'Jumping jacks', equipment: 'Bodyweight', sets: 1, reps: '30 sec', kcalPerUnit: 0.25, unit: 'second' }
];

export const WORKOUT_PLAN: WorkoutDay[] = [
  { day: 'Monday', type: 'Upper Body', walkingTarget: 30, exercises: WARM_UP },
  { day: 'Tuesday', type: 'Lower Body', walkingTarget: 30, exercises: WARM_UP },
  { day: 'Wednesday', type: 'Full Body', walkingTarget: 30, exercises: WARM_UP },
  { day: 'Thursday', type: 'Upper Body', walkingTarget: 30, exercises: WARM_UP },
  { day: 'Friday', type: 'Lower Body', walkingTarget: 30, exercises: WARM_UP },
  { day: 'Saturday', type: 'Full Body + Core', walkingTarget: 30, exercises: WARM_UP },
  { day: 'Sunday', type: 'Walking Recovery', walkingTarget: 40, exercises: [] },
];

export const HOME_GYM_WORKOUT_PLAN = WORKOUT_PLAN;
