'use client';
import { useEffect, useState } from 'react';
import { Skeleton, Typography } from 'antd';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { HabitCard } from '@/components/ui/HabitCard';
import { useHabitsStore } from '@/store/habits/habits.store';
import { useCheckIn } from '@/hooks/checkin/useCheckIn';

const { Text } = Typography;

export function HabitList() {
  const { habits, loading, fetchHabits, uncheck } = useHabitsStore();
  const { checkIn } = useCheckIn();
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
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            active
            paragraph={{ rows: 2 }}
            style={{ background: 'var(--color-bg-surface)', borderRadius: 16, padding: 16 }}
          />
        ))}
      </motion.div>
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
        <AnimatePresence initial={false}>
          {habits.map((habit, i) => (
            <motion.div
              key={habit._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.97 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              layout
            >
              <HabitCard
                habit={habit}
                today={today}
                onCheckIn={handleCheckIn}
                onUncheck={handleUncheck}
                loading={pendingId === habit._id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
