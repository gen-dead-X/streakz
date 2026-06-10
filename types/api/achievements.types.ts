import type { Achievement } from '@/types/models/achievement.types';

export interface AchievementsResponse {
  achievements: Achievement[];
}

export interface CheckInWithAchievementsResponse {
  success: true;
  newAchievements: Achievement[];
}
