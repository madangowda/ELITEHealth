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
  { id: 'up1', name: 'Push-ups', equipment: 'Bodyweight', sets: 3, reps: '10–15', kcalPerUnit: 5, unit: 'set', videoUrl: '/attach/push_ups.mp4', formTips: ['Core tight like a plank', 'Elbows at 45 degrees', 'Full range of motion'] },
  { id: 'up2', name: 'Dumbbell bench press', equipment: '7–10 kg DBs', sets: 3, reps: '10', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/db_bench_press.mp4', formTips: ['Press up over mid-chest', 'Stable feet on floor', 'Control the descent'] },
  { id: 'up3', name: 'One-arm DB row', equipment: '10–12 kg', sets: 3, reps: '12', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/one_arm_db_row.mp4', formTips: ['Pull to the hip, not chest', 'Keep back flat', 'Do not rotate torso'] },
  { id: 'up4', name: 'Shoulder press', equipment: '7–10 kg', sets: 3, reps: '10', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/shoulder_press.mp4', formTips: ['Full extension at top', 'Do not arch lower back', 'Core braced'] },
  { id: 'up5', name: 'Bicep curls', equipment: '7–10 kg', sets: 3, reps: '12', kcalPerUnit: 3, unit: 'set', videoUrl: '/attach/bicep_curls.mp4', formTips: ['Keep elbows glued to sides', 'No body swinging', 'Slow lower phase'] },
  { id: 'up6', name: 'Tricep overhead extension', equipment: '7–10 kg', sets: 3, reps: '12', kcalPerUnit: 3, unit: 'set', videoUrl: '/attach/tricep_extension.mp4', formTips: ['Keep elbows pointing forward', 'Deep stretch at bottom', 'Full lock out'] },
];

const LOWER_BODY_EXERCISES: Exercise[] = [
  ...WARM_UP,
  { id: 'lo1', name: 'Squats', equipment: 'Barbell (20kg)', sets: 3, reps: '15', kcalPerUnit: 8, unit: 'set', videoUrl: '/attach/barbell_squats.mp4', formTips: ['Brace core before descent', 'Weight on heels', 'Hips below parallel'] },
  { id: 'lo2', name: 'Goblet squats', equipment: '10–12 kg DB', sets: 3, reps: '12', kcalPerUnit: 7, unit: 'set', videoUrl: 'https://www.youtube.com/embed/_yvv49yQT8I?si=IYdxVDj8dmyoWGRd', formTips: ['Keep DB close to chest', 'Drive through heels', 'Elbows inside knees'] },
  { id: 'lo3', name: 'Lunges', equipment: 'Bodyweight / DBs', sets: 3, reps: '10 per leg', kcalPerUnit: 6, unit: 'set', videoUrl: 'https://www.youtube.com/embed/GiHqAZIqgLg?si=8OvXipZncfOf7Mib', formTips: ['Vertical torso', 'Knee just above floor', 'Big step forward'] },
  { id: 'lo4', name: 'Romanian deadlift', equipment: '20 kg barbell', sets: 3, reps: '12', kcalPerUnit: 8, unit: 'set', videoUrl: 'https://www.youtube.com/embed/6y1RD7_476Q?si=nlPaOkVT_KpsKOOV', formTips: ['Hinge at hips', 'Keep bar close to legs', 'Back flat at all times'] },
  { id: 'lo5', name: 'Calf raises', equipment: 'Bodyweight', sets: 3, reps: '20', kcalPerUnit: 3, unit: 'set', videoUrl: 'https://www.youtube.com/embed/K8WjaRt3pqo?si=I6Zjv2bfdi4mVCDh', formTips: ['High on toes', 'Slow controlled descent', 'Pause at the top'] },
];

const FULL_BODY_EXERCISES: Exercise[] = [
  ...WARM_UP,
  { id: 'fb1', name: 'Push-ups', equipment: 'Bodyweight', sets: 3, reps: '12', kcalPerUnit: 5, unit: 'set', videoUrl: '/attach/push_ups.mp4', formTips: ['Maintain straight line', 'Focus on chest squeeze', 'Controlled pace'] },
  { id: 'fb2', name: 'Barbell row', equipment: '20 kg', sets: 3, reps: '10', kcalPerUnit: 8, unit: 'set', videoUrl: 'https://www.youtube.com/embed/f2D51Xx5oKc?si=8y3dhD2zenx7KDK1', formTips: ['Pull to lower ribs', 'Squeeze shoulder blades', 'Neutral neck position'] },
  { id: 'fb3', name: 'DB shoulder press', equipment: '7–10 kg', sets: 3, reps: '10', kcalPerUnit: 4, unit: 'set', videoUrl: '/attach/shoulder_press.mp4', formTips: ['Avoid locking elbows', 'Brace abdominal wall', 'Full range'] },
  { id: 'fb4', name: 'DB squats', equipment: '10–12 kg', sets: 3, reps: '12', kcalPerUnit: 7, unit: 'set', videoUrl: 'https://www.youtube.com/embed/_yvv49yQT8I?si=IYdxVDj8dmyoWGRd', formTips: ['Upper back tight', 'Deep breath in at top', 'Explode upwards'] },
  { id: 'fb5', name: 'Plank', equipment: 'Bodyweight', sets: 3, reps: '30–40 sec', kcalPerUnit: 0.15, unit: 'second', videoUrl: 'https://www.youtube.com/embed/9FmDlncad8E?si=j2yPnOvwnNqo2dhH5', formTips: ['Elbows under shoulders', 'Squeeze glutes and core', 'Don\'t let hips sag'] },
];

const SATURDAY_EXERCISES: Exercise[] = [
  ...WARM_UP,
  { id: 'sa1', name: 'Incline push-ups', equipment: 'Bench', sets: 3, reps: '15', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/1YCLMwI1LK4?si=pLmDXkyItfirpjHk', formTips: ['Keep body straight', 'Lower chest to bench', 'Full elbow extension'] },
  { id: 'sa2', name: 'Dumbbell chest fly', equipment: '7 kg DBs', sets: 3, reps: '12', kcalPerUnit: 4, unit: 'set', videoUrl: 'https://www.youtube.com/embed/YBXx6V-x3NQ?si=YjkMwWd9mQUA96i4', formTips: ['Slight bend in elbows', 'Hug a tree motion', 'Stretch but don\'t overextend'] },
  { id: 'sa3', name: 'DB Romanian deadlift', equipment: '10–12 kg DBs', sets: 3, reps: '12', kcalPerUnit: 7, unit: 'set', videoUrl: 'https://www.youtube.com/embed/6y1RD7_476Q?si=nlPaOkVT_KpsKOOV', formTips: ['Feel stretch in hamstrings', 'Keep DBs on your legs', 'Back perfectly flat'] },
  { id: 'sa4', name: 'Russian twists', equipment: '5 kg DB', sets: 3, reps: '20', kcalPerUnit: 4, unit: 'set', videoUrl: 'https://www.youtube.com/embed/6oCkvdOEL6M?si=K6qWm0zwLp4j8C4p', formTips: ['Lean back slightly', 'Rotate from the torso', 'Keep feet off floor if possible'] },
  { id: 'sa5', name: 'Leg raises', equipment: 'Bodyweight', sets: 3, reps: '12', kcalPerUnit: 4, unit: 'set', videoUrl: 'https://www.youtube.com/embed/bivGg28Ej5A?si=RNpwXBwYmQQXH6Lo', formTips: ['Lower back pressed to floor', 'Lower legs slowly', 'Do not use momentum'] },
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

// HOME GYM PROTOCOL
const HG_UPPER: Exercise[] = [
  ...WARM_UP,
  { id: 'hup1', name: 'Chest press', equipment: 'Multi-gym', machine: 'Chest press arm', sets: 3, reps: '10–12', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/Z57CtFmRMdA', formTips: ['Control the tempo', 'Squeeze at extension', 'Slow descent'] },
  { id: 'hup2', name: 'Lat pulldown', equipment: 'Multi-gym', machine: 'Pulley', sets: 3, reps: '10–12', kcalPerUnit: 6, unit: 'set', videoUrl: 'https://www.youtube.com/embed/lueEJGjTuPQ', formTips: ['Pull to upper chest', 'Drive with elbows', 'Squeeze blades'] },
  { id: 'hup3', name: 'Seated row', equipment: 'Multi-gym', machine: 'Low pulley', sets: 3, reps: '12', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/GZbfZ033f74', formTips: ['Keep back straight', 'Shoulder blade retraction', 'Do not sway'] },
  { id: 'hup4', name: 'Shoulder press', equipment: 'Multi-gym', machine: 'Press arm', sets: 3, reps: '10', kcalPerUnit: 4, unit: 'set', videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog', formTips: ['Avoid arching back', 'Stable core', 'Controlled lock out'] },
  { id: 'hup5', name: 'Triceps pushdown', equipment: 'Multi-gym', machine: 'High pulley', sets: 3, reps: '12', kcalPerUnit: 3, unit: 'set', videoUrl: 'https://www.youtube.com/embed/2-LAMcpzODU', formTips: ['Elbows glued to ribs', 'Full extension', 'Minimize shoulder movement'] },
  { id: 'hup6', name: 'Biceps curl', equipment: 'Multi-gym', machine: 'Low pulley', sets: 3, reps: '12', kcalPerUnit: 3, unit: 'set', videoUrl: 'https://www.youtube.com/embed/AsAVbj7puKo', formTips: ['Full range', 'No body swing', 'Squeeze at top'] },
];

const HG_LOWER: Exercise[] = [
  ...WARM_UP,
  { id: 'hlo1', name: 'Leg press', equipment: 'Multi-gym', machine: 'Multi-gym press', sets: 3, reps: '12–15', kcalPerUnit: 8, unit: 'set', videoUrl: 'https://www.youtube.com/embed/yZmx_7_z6q8', formTips: ['Feet shoulder width', 'Don’t lock knees', 'Push through heels'] },
  { id: 'hlo2', name: 'Leg extension', equipment: 'Multi-gym', machine: 'Extension arm', sets: 3, reps: '12', kcalPerUnit: 6, unit: 'set', videoUrl: 'https://www.youtube.com/embed/YyvSfVLYd80', formTips: ['Squeeze quads at top', 'Slow descent', 'Full range'] },
  { id: 'hlo3', name: 'Leg curl', equipment: 'Multi-gym', machine: 'Curl arm', sets: 3, reps: '12', kcalPerUnit: 6, unit: 'set', videoUrl: 'https://www.youtube.com/embed/1Tq3QdYUuHs', formTips: ['Stable hips', 'Squeeze hamstrings', 'Control descent'] },
  { id: 'hlo4', name: 'Cable glute kickback', equipment: 'Multi-gym', machine: 'Low pulley', sets: 3, reps: '12/leg', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/XW8nN8P-9_k', formTips: ['Lean forward slightly', 'Squeeze glute at top', 'Neutral neck'] },
  { id: 'hlo5', name: 'Standing calf raise', equipment: 'Bodyweight', sets: 3, reps: '20', kcalPerUnit: 3, unit: 'set', videoUrl: 'https://www.youtube.com/embed/K8WjaRt3pqo', formTips: ['Full stretch at bottom', 'Hold peak contraction', 'Slow tempo'] },
];

const HG_FULL: Exercise[] = [
  ...WARM_UP,
  { id: 'hfb1', name: 'Chest press', equipment: 'Multi-gym', machine: 'Machine', sets: 3, reps: '10', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/Z57CtFmRMdA', formTips: ['Standard press', 'Stable base', 'Breath out on push'] },
  { id: 'hfb2', name: 'Lat pulldown', equipment: 'Multi-gym', machine: 'Pulley', sets: 3, reps: '10', kcalPerUnit: 6, unit: 'set', videoUrl: 'https://www.youtube.com/embed/lueEJGjTuPQ', formTips: ['Controlled pull', 'Focus on lats', 'Slow release'] },
  { id: 'hfb3', name: 'Leg press', equipment: 'Multi-gym', machine: 'Machine', sets: 3, reps: '12', kcalPerUnit: 8, unit: 'set', videoUrl: 'https://www.youtube.com/embed/yZmx_7_z6q8', formTips: ['Consistent depth', 'Heel drive', 'Steady rhythm'] },
  { id: 'hfb4', name: 'Seated row', equipment: 'Multi-gym', machine: 'Pulley', sets: 3, reps: '12', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/GZbfZ033f74', formTips: ['Tight core', 'Shoulders down', 'Full retraction'] },
  { id: 'hfb5', name: 'Plank', equipment: 'Bodyweight', sets: 3, reps: '30–40 sec', kcalPerUnit: 0.15, unit: 'second', videoUrl: 'https://www.youtube.com/embed/9FmDlncad8E?si=j2yPnOvwnNqo2dhH5', formTips: ['No hip sagging', 'Brace abs', 'Steady breath'] },
];

const HG_SAT: Exercise[] = [
  ...WARM_UP,
  { id: 'hsa1', name: 'Incline chest press', equipment: 'Multi-gym', machine: 'Machine', sets: 3, reps: '12', kcalPerUnit: 5, unit: 'set', videoUrl: 'https://www.youtube.com/embed/Z57CtFmRMdA', formTips: ['Upper chest focus', 'Arc motion', 'Shoulders down'] },
  { id: 'hsa2', name: 'Lat pulldown', equipment: 'Multi-gym', machine: 'Pulley', sets: 3, reps: '12', kcalPerUnit: 6, unit: 'set', videoUrl: 'https://www.youtube.com/embed/lueEJGjTuPQ', formTips: ['Volume focus', 'Perfect form', 'Mind-muscle connection'] },
  { id: 'hsa3', name: 'Leg curl', equipment: 'Multi-gym', machine: 'Machine', sets: 3, reps: '12', kcalPerUnit: 6, unit: 'set', videoUrl: 'https://www.youtube.com/embed/1Tq3QdYUuHs', formTips: ['Hamstring isolation', 'Stable torso', 'Slow return'] },
  { id: 'hsa4', name: 'Cable crunch', equipment: 'Multi-gym', machine: 'High pulley', sets: 3, reps: '15', kcalPerUnit: 4, unit: 'set', videoUrl: 'https://www.youtube.com/embed/2f0B8Y4L91A', formTips: ['Kneeling position', 'Crunch with abs not arms', 'Deep contraction'] },
  { id: 'hsa5', name: 'Hanging knee raise', equipment: 'Bodyweight', sets: 3, reps: '12', kcalPerUnit: 4, unit: 'set', videoUrl: 'https://www.youtube.com/embed/hd_S-Vl6Kj8', formTips: ['Don’t swing', 'Lower abs focus', 'Controlled lower'] },
];

export const HOME_GYM_WORKOUT_PLAN: WorkoutDay[] = [
  { day: 'Monday', type: 'Upper Body (Multi Gym)', walkingTarget: 30, exercises: HG_UPPER },
  { day: 'Tuesday', type: 'Lower Body (Multi Gym)', walkingTarget: 30, exercises: HG_LOWER },
  { day: 'Wednesday', type: 'Full Body (Multi Gym)', walkingTarget: 30, exercises: HG_FULL },
  { day: 'Thursday', type: 'Upper Body (Multi Gym)', walkingTarget: 30, exercises: HG_UPPER },
  { day: 'Friday', type: 'Lower Body (Multi Gym)', walkingTarget: 30, exercises: HG_LOWER },
  { day: 'Saturday', type: 'Full Body + Core (Multi Gym)', walkingTarget: 30, exercises: HG_SAT },
  { day: 'Sunday', type: 'Walking Recovery', walkingTarget: 40, exercises: [] },
];