'use client';
import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { DaySummary } from '@/types/api/habits.types';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type DayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'empty';

function buildWeekDates(): string[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd'),
  );
}

function getStatus(s: DaySummary, date: string, today: string): DayStatus {
  if (date > today) return 'future';
  if (s.total === 0) return 'empty';
  if (s.completed === 0) return 'missed';
  if (s.completed >= s.total) return 'complete';
  return 'partial';
}

const STATUS_STYLES: Record<DayStatus, {
  dot: string; glow: string; cellBg: string; cellBorder: string; numColor: string;
}> = {
  complete: {
    dot: '#22c55e',
    glow: '0 0 8px rgba(34,197,94,0.75)',
    cellBg: 'rgba(34,197,94,0.14)',
    cellBorder: 'rgba(34,197,94,0.32)',
    numColor: '#86efac',
  },
  partial: {
    dot: '#eab308',
    glow: '0 0 8px rgba(234,179,8,0.65)',
    cellBg: 'rgba(234,179,8,0.13)',
    cellBorder: 'rgba(234,179,8,0.32)',
    numColor: '#fde047',
  },
  missed: {
    dot: '#ef4444',
    glow: '0 0 8px rgba(239,68,68,0.6)',
    cellBg: 'rgba(239,68,68,0.11)',
    cellBorder: 'rgba(239,68,68,0.25)',
    numColor: '#fca5a5',
  },
  future: {
    dot: 'rgba(255,255,255,0.08)',
    glow: 'none',
    cellBg: 'transparent',
    cellBorder: 'rgba(255,255,255,0.04)',
    numColor: 'var(--color-text-muted)',
  },
  empty: {
    dot: 'rgba(255,255,255,0.08)',
    glow: 'none',
    cellBg: 'transparent',
    cellBorder: 'rgba(255,255,255,0.04)',
    numColor: 'var(--color-text-muted)',
  },
};

export function WeekStrip() {
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const habits = useHabitsStore((s) => s.habits);
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekDates = buildWeekDates();

  useEffect(() => {
    fetch('/api/habits/week-summary')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DaySummary[] | null) => { if (data) setSummaries(data); })
      .catch(() => {});
  }, []);

  function getSummary(date: string): DaySummary {
    if (date === today) {
      const total = habits.length;
      const completed = habits.filter((h) => h.isCompletedToday).length;
      return { date: date, total, completed };
    }
    return summaries.find((s) => s.date === date) ?? { date: date, total: 0, completed: 0 };
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, padding: '4px 0' }}>
      {weekDates.map((date, i) => {
        const isToday = date === today;
        const summary = getSummary(date);
        const status = getStatus(summary, date, today);
        const s = STATUS_STYLES[status];
        const dayNum = parseInt(date.split('-')[2], 10);

        return (
          <div
            key={date}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}
          >
            {/* Day letter */}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: isToday ? 'var(--color-text-heading)' : 'var(--color-text-muted)',
              letterSpacing: '0.08em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}>
              {DAY_LETTERS[i]}
            </span>

            {/* Date cell */}
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: isToday
                ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 100%)'
                : s.cellBg,
              border: isToday ? 'none' : `1px solid ${s.cellBorder}`,
              boxShadow: isToday
                ? '0 2px 12px rgba(255,255,255,0.15)'
                : status === 'complete' || status === 'partial' || status === 'missed'
                ? `inset 0 0 0 0 transparent, 0 0 6px ${s.glow.split(' ').slice(3).join(' ')}`
                : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
              backdropFilter: status !== 'future' && status !== 'empty' ? 'blur(4px)' : 'none',
            }}>
              <span style={{
                fontSize: 13,
                fontWeight: isToday ? 800 : 500,
                color: isToday ? '#111' : s.numColor,
                lineHeight: 1,
              }}>
                {dayNum}
              </span>
            </div>

            {/* Glowing status dot */}
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: s.dot,
              boxShadow: s.glow === 'none' ? 'none' : s.glow,
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
            }} />
          </div>
        );
      })}
    </div>
  );
}
