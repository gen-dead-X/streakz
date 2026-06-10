import type { AchievementType } from '@/constants/achievements/achievement.constants';

export interface Achievement {
  _id: string;
  userId: string;
  type: AchievementType;
  habitId?: string;
  habitName?: string;
  unlockedAt: string;
}
