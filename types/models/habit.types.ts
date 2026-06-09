export type FrequencyType = 'daily' | 'weekly' | 'specific';

export interface Frequency {
  type: FrequencyType;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat — empty for 'daily'/'weekly'
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  icon: string; // single emoji
  frequency: Frequency;
  createdAt: string;
  archivedAt: string | null;
}

export interface HabitWithStreak extends Habit {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  recentDots: boolean[]; // 7 booleans — index 0 = 6 days ago, index 6 = today
}
