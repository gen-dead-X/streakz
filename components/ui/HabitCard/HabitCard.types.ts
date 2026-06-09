import type { HabitWithStreak } from '@/types/models/habit.types';

export interface HabitCardProps {
  habit: HabitWithStreak;
  today: string; // 'YYYY-MM-DD'
  onCheckIn: (habitId: string, date: string) => void;
  onUncheck: (habitId: string, date: string) => void;
  loading?: boolean;
}
