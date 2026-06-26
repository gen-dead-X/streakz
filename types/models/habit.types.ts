import type { JSONContent } from '@tiptap/core';

export type FrequencyType = 'daily' | 'weekly' | 'specific';

export interface Frequency {
  type: FrequencyType;
  days: number[]; // 0=Sun … 6=Sat — empty for 'daily'/'weekly'
}

export type CardStyle = 'wavy' | 'geometric' | 'blob' | 'aurora' | 'ember' | 'midnight' | 'rose';

export type HabitScope = 'team' | 'personal';

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  description?: JSONContent;
  tags: string[];
  cardStyle: CardStyle;
  notifications: boolean;
  frequency: Frequency;
  projectId: string | null;
  scope: HabitScope;
  createdAt: string;
  archivedAt: string | null;
}

export interface HabitWithStreak extends Habit {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  recentDots: boolean[]; // 7 booleans — index 0 = 6 days ago, index 6 = today
  // Populated only for team habits (scope === 'team')
  teamCompletedToday?: boolean;
  memberStatus?: { userId: string; isCompletedToday: boolean }[];
}
