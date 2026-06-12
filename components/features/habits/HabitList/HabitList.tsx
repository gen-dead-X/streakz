'use client';
import { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { format } from 'date-fns';
import { Flame, Settings, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StreakCardPager } from '@/components/features/habits/StreakCardPager';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { useHabitsStore } from '@/store/habits/habits.store';
import { useCheckIn } from '@/hooks/checkin/useCheckIn';
import type { HabitWithStreak } from '@/types/models/habit.types';

// ── Compact row for desktop list ────────────────────────────────────────────

function DesktopHabitRow({
  habit,
  today,
  loading,
  onCheckIn,
  onUncheck,
}: {
  habit: HabitWithStreak;
  today: string;
  loading: boolean;
  onCheckIn: (id: string, date: string) => void;
  onUncheck: (id: string, date: string) => void;
}) {
  const router = useRouter();

  function handleToggle() {
    if (habit.isCompletedToday) onUncheck(habit._id, today);
    else onCheckIn(habit._id, today);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        borderRadius: 16,
        background: 'var(--color-bg-surface)',
        border: habit.isCompletedToday
          ? '1px solid rgba(16,185,129,0.25)'
          : '1px solid rgba(255,255,255,0.04)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: 'var(--color-bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <HabitIcon name={habit.icon} size={18} color="var(--color-text-muted)" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: 'var(--color-text-heading)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {habit.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Flame size={11} color="var(--color-brand)" />
          <span style={{ fontSize: 12, color: 'var(--color-brand)', fontWeight: 600 }}>
            {habit.currentStreak}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {habit.currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Edit */}
      <button
        onClick={() => router.push(`/habits/${habit._id}/edit`)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 6, borderRadius: 8, flexShrink: 0,
        }}
        aria-label="Edit"
      >
        <Settings size={14} color="var(--color-text-muted)" />
      </button>

      {/* Check-in */}
      <motion.button
        onClick={handleToggle}
        disabled={loading}
        whileTap={{ scale: 0.88 }}
        style={{
          width: 36, height: 36, borderRadius: 99, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: habit.isCompletedToday ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        aria-label={habit.isCompletedToday ? 'Uncheck' : 'Check in'}
      >
        <Check size={16} color={habit.isCompletedToday ? '#fff' : 'var(--color-text-muted)'} />
      </motion.button>
    </motion.div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2].map((i) => (
          <Skeleton key={i} active paragraph={{ rows: 2 }}
            style={{ background: 'var(--color-bg-surface)', borderRadius: 24, padding: 20 }} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile: full-height card deck ──────────────────────────── */}
      <div className="md:hidden" style={{ height: '100%' }}>
        <StreakCardPager
          habits={habits}
          today={today}
          pendingId={pendingId}
          onCheckIn={handleCheckIn}
          onUncheck={handleUncheck}
        />
      </div>

      {/* ── Desktop: card deck (left) + compact list (right) ───────── */}
      <div className="hidden md:flex md:gap-6 md:items-start">
        {/* Card deck */}
        <div style={{ width: 340, flexShrink: 0, height: 500 }}>
          <StreakCardPager
            habits={habits}
            today={today}
            pendingId={pendingId}
            onCheckIn={handleCheckIn}
            onUncheck={handleUncheck}
          />
        </div>

        {/* Compact list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {habits.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, padding: '20px 0' }}>
              No streaks yet — tap + to add your first.
            </p>
          ) : (
            habits.map((habit, i) => (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <DesktopHabitRow
                  habit={habit}
                  today={today}
                  loading={pendingId === habit._id}
                  onCheckIn={handleCheckIn}
                  onUncheck={handleUncheck}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
