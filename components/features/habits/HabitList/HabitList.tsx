'use client';
import { useEffect, useState } from 'react';
import { Skeleton, Typography } from 'antd';
import { format } from 'date-fns';
import { HabitCard } from '@/components/ui/HabitCard';
import { useHabitsStore } from '@/store/habits/habits.store';

const { Text } = Typography;

export function HabitList() {
  const { habits, loading, fetchHabits, checkIn, uncheck } = useHabitsStore();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  async function handleCheckIn(habitId: string, date: string) {
    setPendingId(habitId);
    await checkIn(habitId, date);
    setPendingId(null);
  }

  async function handleUncheck(habitId: string, date: string) {
    setPendingId(habitId);
    await uncheck(habitId, date);
    setPendingId(null);
  }

  if (loading && habits.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            active
            paragraph={{ rows: 2 }}
            style={{ background: 'var(--color-bg-surface)', borderRadius: 16, padding: 16 }}
          />
        ))}
      </div>
    );
  }

  if (!loading && habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🌱</Text>
        <Text strong style={{ color: 'var(--color-text-heading)', fontSize: 18, display: 'block' }}>
          No habits yet
        </Text>
        <Text style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
          Tap + below to add your first habit
        </Text>
      </div>
    );
  }

  const remaining = habits.filter((h) => !h.isCompletedToday).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Text strong style={{ color: 'var(--color-text-heading)', fontSize: 16 }}>
          Today&apos;s habits
        </Text>
        {remaining > 0 && (
          <Text
            style={{
              fontSize: 11,
              color: 'var(--color-brand)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {remaining} TO GO
          </Text>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit._id}
            habit={habit}
            today={today}
            onCheckIn={handleCheckIn}
            onUncheck={handleUncheck}
            loading={pendingId === habit._id}
          />
        ))}
      </div>
    </div>
  );
}
