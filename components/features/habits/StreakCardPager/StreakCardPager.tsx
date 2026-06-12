'use client';
import { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { HabitCard } from '@/components/ui/HabitCard';
import type { HabitWithStreak } from '@/types/models/habit.types';

// Visual transforms for each stack position
const STACK = [
  { rotate: 0,    scale: 1,    y: 0,  zIndex: 10 }, // front
  { rotate: 3,    scale: 0.95, y: 10, zIndex: 5  }, // middle
  { rotate: -2.5, scale: 0.90, y: 18, zIndex: 1  }, // back
] as const;

interface Props {
  habits: HabitWithStreak[];
  today: string;
  pendingId: string | null;
  onCheckIn: (id: string, date: string) => void;
  onUncheck: (id: string, date: string) => void;
}

export function StreakCardPager({ habits, today, pendingId, onCheckIn, onUncheck }: Props) {
  const n = habits.length;

  // Index of the front card in habits[]
  const [frontIdx, setFrontIdx] = useState(0);

  // Motion value driving the front card's drag offset
  const x = useMotionValue(0);
  // Front card tilts as it's dragged
  const frontRotate = useTransform(x, [-260, 0, 260], [-14, 0, 14]);

  if (n === 0) return null;

  const stackCount = Math.min(3, n);
  // Which habit index lives at each stack position: [front, middle, back]
  const slotIndices = Array.from({ length: stackCount }, (_, pos) => (frontIdx + pos) % n);

  function advanceDeck() {
    // Instantly reset x (no spring) so the next front card starts centered
    x.set(0);
    setFrontIdx((prev) => (prev + 1) % n);
  }

  async function handleDragEnd(
    _e: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 450) {
      // Let the drag momentum carry it briefly, then wrap to back
      const dir = info.offset.x > 0 ? 1 : -1;
      await animate(x, dir * 420, { duration: 0.22, ease: [0.4, 0, 1, 1] });
      advanceDeck();
    } else {
      // Snap back to center
      void animate(x, 0, { type: 'spring', stiffness: 500, damping: 34 });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>

      {/* Card stack — all cards absolutely positioned */}
      <div style={{ flex: 1, position: 'relative' }}>
        {slotIndices.map((habitIdx, stackPos) => {
          const habit = habits[habitIdx];
          const isActive = stackPos === 0;
          const { rotate: deg, scale, y, zIndex } = STACK[stackPos];

          if (isActive) {
            return (
              <motion.div
                key={habit._id}           // ← stable key: never unmounts
                style={{
                  position: 'absolute', inset: 0, zIndex,
                  x, rotate: frontRotate, // motion values — tilt follows drag
                }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                whileDrag={{ cursor: 'grabbing' }}
              >
                <HabitCard
                  habit={habit}
                  today={today}
                  onCheckIn={onCheckIn}
                  onUncheck={onUncheck}
                  loading={pendingId === habit._id}
                />
              </motion.div>
            );
          }

          return (
            <motion.div
              key={habit._id}             // ← stable key: never unmounts
              style={{ position: 'absolute', inset: 0, zIndex, pointerEvents: 'none' }}
              animate={{ rotate: deg, scale, y }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <HabitCard
                habit={habit}
                today={today}
                onCheckIn={onCheckIn}
                onUncheck={onUncheck}
                loading={pendingId === habit._id}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Dot indicators */}
      {n > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexShrink: 0 }}>
          {habits.map((_, i) => (
            <button
              key={i}
              onClick={() => { x.set(0); setFrontIdx(i); }}
              style={{
                width: i === frontIdx ? 20 : 7, height: 7, borderRadius: 99,
                border: 'none', cursor: 'pointer', padding: 0,
                background: i === frontIdx ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
                transition: 'width 0.2s, background 0.2s',
              }}
              aria-label={`Streak ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
