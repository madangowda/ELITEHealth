
import { MealCategory, WorkoutDay, Macros, Exercise } from './types';

export const DAILY_TARGETS: Macros = {
  kcal: 1900, // Midpoint
  protein: 142.5, // Midpoint
  carbs: 195, // Midpoint
  fat: 60, // Midpoint
  fiber: 35, // Midpoint
};

export const TARGET_RANGES = {
  kcal: "1850–1950",
  protein: "135–150",
  carbs: "180–210",
  fat: "55–65",
  fiber: "30–40"
};

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
  {
    id: 'midSnack',
    label: 'Mid-Morning Snack (10:30-11:30 AM)',
    options: [
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
    ]
  },
  {
    id: 'lunch',
    label: 'Lunch (1:00-2:00 PM)',
    options: [
      { id: 'l1', name: 'Rice + dal + veg', quantity: '180g rice, 30g dal, 150g veg', kcal: 500, protein: 22, carbs: 70, fat: 10, fiber: 9 },
      { id: 'l2', name: 'Chicken curry + rice', quantity: '150g chicken, 160g rice', kcal: 520, protein: 35, carbs: 60, fat: 14, fiber: 5 },
      { id: 'l3', name: 'Fish curry + rice', quantity: '150g fish, 160g rice', kcal: 510, protein: 32, carbs: 58, fat: 15, fiber: 5 },
      { id: 'l4', name: 'Rajma + rice', quantity: '150g rajma, 150g rice', kcal: 520, protein: 22, carbs: 72, fat: 10, fiber: 13 },
      { id: 'l5', name: 'Paneer curry + 2 chapati', quantity: '120g paneer', kcal: 520, protein: 30, carbs: 45, fat: 18, fiber: 7 },
      { id: 'l6', name: 'Lemon rice + curd', quantity: '200g rice, 100g curd', kcal: 510, protein: 16, carbs: 70, fat: 12, fiber: 6 },
      { id: 'l7', name: 'Boiled chana + veg', quantity: '180g chana, 150g veg', kcal: 500, protein: 24, carbs: 55, fat: 10, fiber: 13 },
      { id: 'l8', name: 'Egg curry + rice', quantity: '3 eggs, 150g rice', kcal: 520, protein: 28, carbs: 58, fat: 14, fiber: 5 },
      { id: 'l9', name: 'Millet rice + sambar', quantity: '180g millet, 200ml sambar', kcal: 500, protein: 18, carbs: 65, fat: 10, fiber: 12 },
      { id: 'l10', name: 'Goat meat curry + rice', quantity: '150g meat, 120g rice', kcal: 550, protein: 34, carbs: 45, fat: 22, fiber: 4 },
    ]
  },
  {
    id: 'eveningSnack',
    label: 'Evening Snack (5:00-6:00 PM)',
    options: [
      { id: 'es1', name: 'Sprouts salad', quantity: '150g', kcal: 230, protein: 12, carbs: 30, fat: 6, fiber: 8 },
      { id: 'es2', name: 'Boiled chickpeas', quantity: '120g', kcal: 210, protein: 10, carbs: 35, fat: 4, fiber: 7 },
      { id: 'es3', name: 'Roasted chana', quantity: '50g', kcal: 210, protein: 10, carbs: 30, fat: 4, fiber: 8 },
      { id: 'es4', name: 'Sweet potato', quantity: '150g', kcal: 230, protein: 4, carbs: 45, fat: 2, fiber: 6 },
      { id: 'es5', name: 'Whey protein (water)', quantity: '1 scoop', kcal: 200, protein: 30, carbs: 6, fat: 2, fiber: 1 },
      { id: 'es6', name: 'Milk', quantity: '250ml', kcal: 150, protein: 8, carbs: 12, fat: 8, fiber: 0 },
      { id: 'es7', name: 'Paneer cubes', quantity: '80g', kcal: 220, protein: 14, carbs: 6, fat: 14, fiber: 1 },
      { id: 'es8', name: 'Egg whites', quantity: '4 whites', kcal: 210, protein: 26, carbs: 4, fat: 2, fiber: 0 },
      { id: 'es9', name: 'Buttermilk + seeds', quantity: '250ml + 1tbsp', kcal: 200, protein: 6, carbs: 10, fat: 10, fiber: 3 },
      { id: 'es10', name: 'Boiled corn', quantity: '120g', kcal: 230, protein: 6, carbs: 40, fat: 4, fiber: 6 },
    ]
  },
  {
    id: 'dinner',
    label: 'Dinner (7:00-8:00 PM)',
    options: [
      { id: 'd1', name: 'Grilled chicken + veg', quantity: '180g chicken, 200g veg', kcal: 450, protein: 40, carbs: 15, fat: 18, fiber: 6 },
      { id: 'd2', name: 'Fish + veg', quantity: '180g fish, 200g veg', kcal: 460, protein: 38, carbs: 12, fat: 20, fiber: 5 },
      { id: 'd3', name: 'Paneer + veg', quantity: '150g paneer, 200g veg', kcal: 480, protein: 32, carbs: 18, fat: 22, fiber: 6 },
      { id: 'd4', name: 'Egg bhurji (3 eggs) + veg', quantity: '3 eggs, 200g veg', kcal: 470, protein: 28, carbs: 10, fat: 24, fiber: 4 },
      { id: 'd5', name: 'Dal + veg', quantity: '40g raw dal, 200g veg', kcal: 450, protein: 22, carbs: 35, fat: 12, fiber: 10 },
      { id: 'd6', name: 'Omelette (3 eggs)', quantity: 'Plain', kcal: 430, protein: 26, carbs: 6, fat: 26, fiber: 2 },
      { id: 'd7', name: 'Goat meat curry + veg', quantity: '150g meat, 200g veg', kcal: 490, protein: 34, carbs: 10, fat: 28, fiber: 4 },
      { id: 'd8', name: 'Chicken soup + 1 toast', quantity: '250ml soup', kcal: 440, protein: 35, carbs: 25, fat: 10, fiber: 4 },
      { id: 'd9', name: 'Tofu + veg', quantity: '180g tofu, 200g veg', kcal: 460, protein: 30, carbs: 20, fat: 20, fiber: 7 },
      { id: 'd10', name: 'Curd bowl + seeds', quantity: '250g curd + 1tbsp', kcal: 460, protein: 28, carbs: 20, fat: 18, fiber: 6 },
    ]
  },
];

const WARM_UP: Exercise[] = [
  { id: 'wu0', name: 'Arm circles', equipment: 'Bodyweight', sets: 1, reps: '30 sec', kcalPerUnit: 0.1, unit: 'second', videoUrl: '/attach/arm_circles.mp4', formTips: ['Small circles first', 'Keep arms at shoulder height', 'Maintain a steady pace'] },
  { id: 'wu1', name: 'Jumping jacks', equipment: 'Bodyweight', sets: 1, reps: '30 sec', kcalPerUnit: 0.25, unit: 'second', videoUrl: '/attach/Jumping_Jacks.mp4', formTips: ['Land softly on your toes', 'Breathe rhythmically', 'Full arm extension'] },
  { id: 'wu2', name: 'Bodyweight squats', equipment: 'Bodyweight', sets: 1, reps: '15 reps', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/bodyweight_squats.mp4', formTips: ['Hips back first', 'Chest stays up', 'Weight in your heels'] },
  { id: 'wu3', name: 'Shoulder rolls', equipment: 'Bodyweight', sets: 1, reps: '30 sec', kcalPerUnit: 0.1, unit: 'second', videoUrl: '/attach/shoulder_rolls.mp4', formTips: ['Full circular range', 'Relax the neck', 'Slow, controlled motion'] },
  { id: 'wu4', name: 'Hip circles', equipment: 'Bodyweight', sets: 1, reps: '30 sec', kcalPerUnit: 0.1, unit: 'second', videoUrl: '/attach/hip_circles.mp4', formTips: ['Wide rotations', 'Keep torso stable', 'Squeeze glutes at the top'] },
];

const UPPER_BODY_EXERCISES: Exercise[] = [
  ...WARM_UP,
  { id: 'up1', name: 'Incline push-ups', equipment: 'Bench', sets: 3, reps: '15', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/1YCLMwI1LK4', formTips: ['Keep body straight', 'Lower chest to bench', 'Full elbow extension'] },
  { id: 'up2', name: 'Dumbbell bench press', equipment: '7–10 kg DBs', sets: 3, reps: '10', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/db_bench_press.mp4', formTips: ['Press up over mid-chest', 'Stable feet on floor', 'Control the descent'] },
  { id: 'up3', name: 'One-arm DB row', equipment: '10–12 kg', sets: 3, reps: '12', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/one_arm_db_row.mp4', formTips: ['Pull to the hip, not chest', 'Keep back flat', 'Do not rotate torso'] },
  { id: 'up4', name: 'Shoulder press', equipment: '7–10 kg', sets: 3, reps: '10', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/shoulder_press.mp4', formTips: ['Full extension at top', 'Do not arch lower back', 'Core braced'] },
  { id: 'up5', name: 'Bicep curls', equipment: '7–10 kg', sets: 3, reps: '12', kcalPerUnit: 3, unit: 'set', videoUrl: '/attach/bicep_curls.mp4', formTips: ['Keep elbows glued to sides', 'No body swinging', 'Slow lower phase'] },
  { id: 'up6', name: 'Tricep overhead extension', equipment: '7–10 kg', sets: 3, reps: '12', kcalPerUnit: 3, unit: 'set', videoUrl: '/attach/tricep_extension.mp4', formTips: ['Keep elbows pointing forward', 'Deep stretch at bottom', 'Full lock out'] },
];

const LOWER_BODY_EXERCISES: Exercise[] = [
  ...WARM_UP,
  { id: 'lo1', name: 'Squats', equipment: 'Barbell (20kg)', sets: 3, reps: '15', kcalPerUnit: 8, unit: 'set', videoUrl: '/attach/barbell_squats.mp4', formTips: ['Brace core before descent', 'Weight on heels', 'Hips below parallel'] },
  { id: 'lo2', name: 'Goblet squats', equipment: '10–12 kg DB', sets: 3, reps: '12', kcalPerUnit: 7, unit: 'set', videoUrl: '/attach/goblet_squats.mp4', formTips: ['Keep DB close to chest', 'Drive through heels', 'Elbows inside knees'] },
  { id: 'lo3', name: 'Lunges', equipment: 'Bodyweight / DBs', sets: 3, reps: '10 per leg', kcalPerUnit: 6, unit: 'set', videoUrl: '/attach/lunges.mp4', formTips: ['Vertical torso', 'Knee just above floor', 'Big step forward'] },
  { id: 'lo4', name: 'Romanian deadlift', equipment: '20 kg barbell', sets: 3, reps: '12', kcalPerUnit: 8, unit: 'set', videoUrl: '/attach/rdl.mp4', formTips: ['Hinge at hips', 'Keep bar close to legs', 'Back flat at all times'] },
  { id: 'lo5', name: 'Calf raises', equipment: 'Bodyweight', sets: 3, reps: '20', kcalPerUnit: 3, unit: 'set', videoUrl: '/attach/calf_raises.mp4', formTips: ['High on toes', 'Slow controlled descent', 'Pause at the top'] },
];

const FULL_BODY_EXERCISES: Exercise[] = [
  ...WARM_UP,
  { id: 'fb1', name: 'Incline push-ups', equipment: 'Bench', sets: 3, reps: '15', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/1YCLMwI1LK4', formTips: ['Keep body straight', 'Lower chest to bench', 'Full elbow extension'] },
  { id: 'fb2', name: 'Barbell row', equipment: '20 kg', sets: 3, reps: '10', kcalPerUnit: 8, unit: 'set', videoUrl: '/attach/barbell_row.mp4', formTips: ['Pull to lower ribs', 'Squeeze shoulder blades', 'Neutral neck position'] },
  { id: 'fb3', name: 'DB shoulder press', equipment: '7–10 kg', sets: 3, reps: '10', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/shoulder_press.mp4', formTips: ['Avoid locking elbows', 'Brace abdominal wall', 'Full range'] },
  { id: 'fb4', name: 'DB squats', equipment: '10–12 kg', sets: 3, reps: '12', kcalPerUnit: 7, unit: 'set', videoUrl: '/attach/goblet_squats.mp4', formTips: ['Upper back tight', 'Deep breath in at top', 'Explode upwards'] },
  { id: 'fb5', name: 'Plank', equipment: 'Bodyweight', sets: 3, reps: '30–40 sec', kcalPerUnit: 0.15, unit: 'second', videoUrl: '/attach/plank.mp4', formTips: ['Elbows under shoulders', 'Squeeze glutes and core', 'Don\'t let hips sag'] },
];

const SATURDAY_EXERCISES: Exercise[] = [
  ...WARM_UP,
  { id: 'sa1', name: 'Incline push-ups', equipment: 'Bench', sets: 3, reps: '15', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/1YCLMwI1LK4', formTips: ['Keep body straight', 'Lower chest to bench', 'Full elbow extension'] },
  { id: 'sa2', name: 'Dumbbell chest fly', equipment: '7 kg DBs', sets: 3, reps: '12', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/chest_fly.mp4', formTips: ['Slight bend in elbows', 'Hug a tree motion', 'Stretch but don\'t overextend'] },
  { id: 'sa3', name: 'DB Romanian deadlift', equipment: '10–12 kg DBs', sets: 3, reps: '12', kcalPerUnit: 7, unit: 'set', videoUrl: '/attach/rdl.mp4', formTips: ['Feel stretch in hamstrings', 'Keep DBs on your legs', 'Back perfectly flat'] },
  { id: 'sa4', name: 'Russian twists', equipment: '5 kg DB', sets: 3, reps: '20', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/russian_twists.mp4', formTips: ['Lean back slightly', 'Rotate from the torso', 'Keep feet off floor if possible'] },
  { id: 'sa5', name: 'Leg raises', equipment: 'Bodyweight', sets: 3, reps: '12', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/leg_raises.webm', formTips: ['Lower back pressed to floor', 'Lower legs slowly', 'Do not use momentum'] },
];

export const WORKOUT_PLAN: WorkoutDay[] = [
  { day: 'Monday', type: 'Upper Body', walkingTarget: 30, exercises: UPPER_BODY_EXERCISES },
  { day: 'Tuesday', type: 'Lower Body', walkingTarget: 30, exercises: LOWER_BODY_EXERCISES },
  { day: 'Wednesday', type: 'Full Body', walkingTarget: 30, exercises: FULL_BODY_EXERCISES },
  { day: 'Thursday', type: 'Upper Body', walkingTarget: 30, exercises: UPPER_BODY_EXERCISES },
  { day: 'Friday', type: 'Lower Body', walkingTarget: 30, exercises: LOWER_BODY_EXERCISES },
  { day: 'Saturday', type: 'Full Body + Core', walkingTarget: 30, exercises: SATURDAY_EXERCISES },
  { day: 'Sunday', type: 'Walking Recovery', walkingTarget: 40, exercises: [] },
];
