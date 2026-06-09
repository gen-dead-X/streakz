export const HABIT_EMOJIS = [
  // Health & Fitness
  '🏃', '💪', '🧘', '🚴', '🏋️', '🏊', '⚽', '🧗',
  // Mind & Learning
  '📚', '📖', '✍️', '🎓', '🧠', '💡', '🎯', '📝',
  // Lifestyle
  '💧', '🥗', '😴', '🌅', '🚿', '🧹', '🌿', '🫁',
  // Creativity
  '🎨', '🎵', '🎸', '✏️', '📸', '🎬', '🖊️', '🎭',
  // Goals
  '🔥', '⭐', '✅', '🏆', '💎', '🎖️', '🌟', '🎪',
] as const;

export type HabitEmoji = (typeof HABIT_EMOJIS)[number];
export const DEFAULT_EMOJI = '🔥';
