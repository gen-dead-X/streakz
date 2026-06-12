import type { CardStyle, Frequency, HabitWithStreak } from '@/types/models/habit.types';

export interface CreateHabitInput {
  name: string;
  icon: string;
  description?: string;
  tags?: string[];
  cardStyle?: CardStyle;
  notifications?: boolean;
  frequency: Frequency;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  description?: string;
  tags?: string[];
  cardStyle?: CardStyle;
  notifications?: boolean;
  frequency?: Frequency;
}

export interface HabitsResponse {
  habits: HabitWithStreak[];
}
