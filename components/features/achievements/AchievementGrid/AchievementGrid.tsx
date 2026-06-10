'use client';
import { useEffect } from 'react';
import { Skeleton } from 'antd';
import { ACHIEVEMENT_TYPES } from '@/constants/achievements/achievement.constants';
import { useAchievementsStore } from '@/store/achievements/achievements.store';
import { AchievementBadge } from '@/components/features/achievements/AchievementBadge';

export function AchievementGrid() {
  const { achievements, loading, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  if (loading && achievements.length === 0) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 12 }}>
        {ACHIEVEMENT_TYPES.map((t) => (
          <Skeleton.Button key={t} active style={{ width: '100%', height: 96, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  // For streak types one user can unlock the same type on multiple habits.
  // We show the badge unlocked if at least one habit earned it.
  const unlockedTypes = new Set(achievements.map((a) => a.type));

  // For tooltip: find the first unlocked achievement of each type to show habit name + date
  const byType = new Map(
    achievements.map((a) => [a.type, a]),
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 12 }}>
      {ACHIEVEMENT_TYPES.map((type) => {
        const match = byType.get(type);
        return (
          <AchievementBadge
            key={type}
            type={type}
            unlocked={unlockedTypes.has(type)}
            habitName={match?.habitName}
            unlockedAt={match?.unlockedAt}
          />
        );
      })}
    </div>
  );
}
