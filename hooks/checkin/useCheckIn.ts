'use client';
import { useHabitsStore } from '@/store/habits/habits.store';
import { useAchievementsStore } from '@/store/achievements/achievements.store';
import { notify } from '@/lib/snackbar';
import { ACHIEVEMENT_META } from '@/constants/achievements/achievement.constants';

export function useCheckIn() {
  const storeCheckIn = useHabitsStore((s) => s.checkIn);
  const addNewAchievements = useAchievementsStore((s) => s.addNewAchievements);

  async function checkIn(habitId: string, date: string) {
    const result = await storeCheckIn(habitId, date);
    if (result?.newAchievements?.length) {
      addNewAchievements(result.newAchievements);
      for (const a of result.newAchievements) {
        const meta = ACHIEVEMENT_META[a.type];
        notify(`${meta.icon} Achievement unlocked: ${meta.label}`, 'success');
      }
    }
  }

  return { checkIn };
}
