import type { Frequency, HabitWithStreak } from '@/types/models/habit.types';

export interface CreateHabitInput {
  name: string;
  icon: string;
  frequency: Frequency;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  frequency?: Frequency;
}

export interface HabitsResponse {
  habits: HabitWithStreak[];
}
