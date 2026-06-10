export const ACHIEVEMENT_TYPES = [
  'streak_7',
  'streak_30',
  'streak_100',
  'checkins_10',
  'checkins_50',
  'checkins_100',
  'checkins_500',
  'first_habit',
] as const;

export type AchievementType = (typeof ACHIEVEMENT_TYPES)[number];

export const ACHIEVEMENT_META: Record<
  AchievementType,
  { label: string; icon: string; description: string }
> = {
  streak_7:     { label: '7-Day Streak',   icon: '🔥', description: 'Kept a habit going for 7 days straight' },
  streak_30:    { label: '30-Day Streak',  icon: '🌟', description: '30 consecutive days on one habit' },
  streak_100:   { label: '100-Day Streak', icon: '💎', description: '100 days of unstoppable momentum' },
  checkins_10:  { label: '10 Check-ins',   icon: '✅', description: 'Completed 10 total check-ins' },
  checkins_50:  { label: '50 Check-ins',   icon: '⚡', description: 'Hit 50 total check-ins' },
  checkins_100: { label: '100 Check-ins',  icon: '🎯', description: 'Reached 100 total check-ins' },
  checkins_500: { label: '500 Check-ins',  icon: '🏆', description: '500 check-ins — a true champion' },
  first_habit:  { label: 'First Habit',    icon: '🌱', description: 'Created your very first habit' },
};

export const STREAK_THRESHOLDS: { type: AchievementType; days: number }[] = [
  { type: 'streak_7',   days: 7 },
  { type: 'streak_30',  days: 30 },
  { type: 'streak_100', days: 100 },
];

export const CHECKIN_THRESHOLDS: { type: AchievementType; count: number }[] = [
  { type: 'checkins_10',  count: 10 },
  { type: 'checkins_50',  count: 50 },
  { type: 'checkins_100', count: 100 },
  { type: 'checkins_500', count: 500 },
];
