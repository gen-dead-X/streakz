import type { JSONContent } from '@tiptap/core';
import type { CardStyle, Frequency, HabitWithStreak } from '@/types/models/habit.types';

export interface CreateHabitInput {
  name: string;
  icon: string;
  description?: JSONContent;
  tags?: string[];
  cardStyle?: CardStyle;
  notifications?: boolean;
  frequency: Frequency;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  description?: JSONContent;
  tags?: string[];
  cardStyle?: CardStyle;
  notifications?: boolean;
  frequency?: Frequency;
}

export interface HabitsResponse {
  habits: HabitWithStreak[];
}

export interface DaySummary {
  date: string;       // 'YYYY-MM-DD'
  total: number;      // active habit count for that day
  completed: number;  // habits checked in on that day
}
