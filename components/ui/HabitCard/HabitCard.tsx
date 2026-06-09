'use client';
import { Typography } from 'antd';
import { Flame, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StreakDots } from '@/components/ui/StreakDots';
import { CheckInButton } from '@/components/ui/CheckInButton';
import type { HabitCardProps } from './HabitCard.types';

const { Text } = Typography;

export function HabitCard({ habit, today, onCheckIn, onUncheck, loading }: HabitCardProps) {
  const router = useRouter();

  function handleToggle() {
    if (habit.isCompletedToday) {
      onUncheck(habit._id, today);
    } else {
      onCheckIn(habit._id, today);
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-2 rounded-2xl px-4 py-3"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      layout
      animate={{
        borderColor: habit.isCompletedToday
          ? 'rgba(29, 185, 84, 0.3)'
          : 'rgba(255,255,255,0.05)',
      }}
      transition={{ duration: 0.25 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        {/* Emoji icon */}
        <div
          className="flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--color-bg-elevated)',
          }}
        >
          {habit.icon}
        </div>

        {/* Name + streak */}
        <div className="flex-1 min-w-0">
          <Text
            strong
            style={{ fontSize: 16, color: 'var(--color-text-heading)', display: 'block', lineHeight: 1.3 }}
            ellipsis
          >
            {habit.name}
          </Text>
          <div className="flex items-center gap-1 mt-0.5">
            <Flame size={13} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
            <Text style={{ fontSize: 13, color: 'var(--color-brand)', fontWeight: 600 }}>
              {habit.currentStreak}
            </Text>
            <Text style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 2 }}>
              {habit.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </div>
        </div>

        {/* Edit button */}
        <button
          onClick={() => router.push(`/habits/${habit._id}/edit`)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
          aria-label="Edit habit"
        >
          <Settings size={15} style={{ color: 'var(--color-text-muted)' }} />
        </button>

        {/* Check-in button */}
        <CheckInButton
          checked={habit.isCompletedToday}
          loading={loading}
          onClick={handleToggle}
        />
      </div>

      {/* Bottom row — dots + status */}
      <div className="flex items-center justify-between pl-[56px]">
        <StreakDots days={habit.recentDots} />
        <Text
          style={{
            fontSize: 11,
            color: habit.isCompletedToday ? 'var(--color-brand)' : 'var(--color-text-muted)',
          }}
        >
          {habit.isCompletedToday ? 'Done today ✓' : 'Tap to check in'}
        </Text>
      </div>
    </motion.div>
  );
}
