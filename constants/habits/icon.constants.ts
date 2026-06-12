export const HABIT_ICONS = [
  // Fitness
  'Dumbbell', 'Bike', 'Footprints', 'Zap', 'Timer',
  // Mind
  'BookOpen', 'Brain', 'Pencil', 'Target', 'Lightbulb',
  // Lifestyle
  'Droplets', 'Apple', 'Utensils', 'Moon', 'Sun',
  // Creativity & Wellness
  'Music', 'Camera', 'Headphones', 'Leaf', 'Wind',
  // Goals
  'Flame', 'Star', 'Heart', 'Trophy', 'Coffee',
] as const;

export type HabitIconName = (typeof HABIT_ICONS)[number];
export const DEFAULT_ICON: HabitIconName = 'Flame';
