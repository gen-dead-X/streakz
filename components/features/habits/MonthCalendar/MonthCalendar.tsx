'use client';
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { DaySummary } from '@/types/api/habits.types';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildGrid(year: number, month: number): (string | null)[] {
  const ref = new Date(year, month - 1, 1);
  const days = eachDayOfInterval({ start: startOfMonth(ref), end: endOfMonth(ref) }).map(
    (d) => format(d, 'yyyy-MM-dd'),
  );
  // getDay returns 0=Sun...6=Sat, convert to Mon-start (0=Mon...6=Sun)
  const firstDow = (getDay(startOfMonth(ref)) + 6) % 7;
  const grid: (string | null)[] = Array(firstDow).fill(null);
  grid.push(...days);
  // Pad to full weeks
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export function MonthCalendar() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const habits = useHabitsStore((s) => s.habits);

  useEffect(() => {
    fetch(`/api/habits/month-summary?year=${year}&month=${month}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DaySummary[] | null) => { if (data) setSummaries(data); })
      .catch(() => {});
  }, [year, month]);

  function getSummary(date: string): DaySummary {
    if (date === today) {
      const total = habits.length;
      const completed = habits.filter((h) => h.isCompletedToday).length;
      return { date, total, completed };
    }
    return summaries.find((s) => s.date === date) ?? { date, total: 0, completed: 0 };
  }

  function dotColor(s: DaySummary, date: string): string | null {
    if (s.total === 0 || date > today) return null;
    return s.completed >= s.total ? 'var(--color-success)' : 'var(--color-error)';
  }

  function prev() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSummaries([]);
  }

  function next() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSummaries([]);
  }

  const grid = buildGrid(year, month);
  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy');

  return (
    <div style={{ width: '100%' }}>
      {/* Header: month label + navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-heading)' }}>
          {monthLabel}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={prev}
            style={{
              width: 30, height: 30, borderRadius: 99,
              background: 'var(--color-bg-elevated)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Previous month"
          >
            <ChevronLeft size={14} color="var(--color-text-muted)" />
          </button>
          <button
            onClick={next}
            style={{
              width: 30, height: 30, borderRadius: 99,
              background: 'var(--color-bg-elevated)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Next month"
          >
            <ChevronRight size={14} color="var(--color-text-muted)" />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAY_HEADERS.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', padding: '0 0 6px', letterSpacing: '0.04em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
        {grid.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} />;
          }
          const isToday = date === today;
          const isFuture = date > today;
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
                gap: 3,
                padding: '4px 0',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 99,
                  background: isToday ? 'var(--color-text-heading)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday
                      ? 'var(--color-bg-page)'
                      : isFuture
                      ? 'var(--color-text-muted)'
                      : 'var(--color-text-body)',
                    lineHeight: 1,
                  }}
                >
                  {dayNum}
                </span>
              </div>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: color ?? 'transparent',
                  transition: 'background 0.3s',
                  flexShrink: 0,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
