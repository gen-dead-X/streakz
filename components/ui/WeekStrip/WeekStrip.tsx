'use client';
import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { DaySummary } from '@/types/api/habits.types';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function buildWeekDates(): string[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd'),
  );
}

export function WeekStrip() {
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const habits = useHabitsStore((s) => s.habits);
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekDates = buildWeekDates();

  useEffect(() => {
    fetch('/api/habits/week-summary')
      .then((r) => r.json())
      .then((data: DaySummary[]) => setSummaries(data))
      .catch(() => {});
  }, []);

  function getSummary(date: string): DaySummary {
    // Today: derive live from Zustand store so dots update on check-in
    if (date === today) {
      const total = habits.length;
      const completed = habits.filter((h) => h.isCompletedToday).length;
      return { date, total, completed };
    }
    return summaries.find((s) => s.date === date) ?? { date, total: 0, completed: 0 };
  }

  function dotColor(s: DaySummary, date: string): string | null {
    if (s.total === 0 || date > today) return null;
    return s.completed >= s.total ? '#10b981' : '#ef4444';
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '8px 4px 4px',
      }}
    >
      {weekDates.map((date, i) => {
        const isToday = date === today;
        const summary = getSummary(date);
        const color = dotColor(summary, date);
        const dayNum = parseInt(date.split('-')[2], 10);

        return (
          <div
            key={date}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              flex: 1,
            }}
          >
            {/* Day letter */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: isToday
                  ? 'var(--color-text-heading)'
                  : 'var(--color-text-muted)',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              {DAY_LETTERS[i]}
            </span>

            {/* Date number — today gets a pill highlight */}
            <div
              style={{
                width: 36,
                height: 44,
                borderRadius: 18,
                background: isToday
                  ? 'var(--color-text-heading)'
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday
                    ? 'var(--color-bg-page)'
                    : 'var(--color-text-body)',
                  lineHeight: 1,
                }}
              >
                {dayNum}
              </span>
            </div>

            {/* Completion dot */}
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: color ?? 'transparent',
                transition: 'background 0.3s',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
