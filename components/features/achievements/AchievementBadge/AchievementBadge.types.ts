import type { AchievementType } from '@/constants/achievements/achievement.constants';

export interface AchievementBadgeProps {
  type: AchievementType;
  unlocked: boolean;
  habitName?: string;
  unlockedAt?: string;
  className?: string;
}
