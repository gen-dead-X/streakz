'use client';
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { DaySummary } from '@/types/api/habits.types';

const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type DayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'empty';

function getStatus(s: DaySummary, date: string, today: string): DayStatus {
  if (date > today) return 'future';
  if (s.total === 0) return 'empty';
  if (s.completed === 0) return 'missed';
  if (s.completed >= s.total) return 'complete';
  return 'partial';
}

const CELL: Record<DayStatus, { bg: string; border: string; text: string; glow: string }> = {
  complete: {
    bg: 'rgba(34,197,94,0.16)',
    border: '1px solid rgba(34,197,94,0.35)',
    text: '#86efac',
    glow: '0 0 10px rgba(34,197,94,0.25)',
  },
  partial: {
    bg: 'rgba(234,179,8,0.14)',
    border: '1px solid rgba(234,179,8,0.35)',
    text: '#fde047',
    glow: '0 0 10px rgba(234,179,8,0.2)',
  },
  missed: {
    bg: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.28)',
    text: '#fca5a5',
    glow: '0 0 10px rgba(239,68,68,0.18)',
  },
  future: { bg: 'transparent', border: '1px solid transparent', text: 'var(--color-text-muted)', glow: 'none' },
  empty:  { bg: 'transparent', border: '1px solid transparent', text: 'var(--color-text-body)',  glow: 'none' },
};

function buildGrid(year: number, month: number): (string | null)[] {
  const ref = new Date(year, month - 1, 1);
  const days = eachDayOfInterval({ start: startOfMonth(ref), end: endOfMonth(ref) }).map(
    (d) => format(d, 'yyyy-MM-dd'),
  );
  const firstDow = (getDay(startOfMonth(ref)) + 6) % 7;
  const grid: (string | null)[] = Array(firstDow).fill(null);
  grid.push(...days);
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
      return { date, total: habits.length, completed: habits.filter((h) => h.isCompletedToday).length };
    }
    return summaries.find((s) => s.date === date) ?? { date, total: 0, completed: 0 };
  }

  function prev() {
    setSummaries([]);
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }

  function next() {
    setSummaries([]);
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const grid = buildGrid(year, month);
  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy');

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-heading)', letterSpacing: '-0.2px' }}>
          {monthLabel}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ fn: prev, icon: <ChevronLeft size={14} />, label: 'Previous month' },
            { fn: next, icon: <ChevronRight size={14} />, label: 'Next month' }].map(({ fn, icon, label }) => (
            <button
              key={label}
              onClick={fn}
              aria-label={label}
              style={{
                width: 30, height: 30, borderRadius: 99,
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-muted)',
                transition: 'background 0.15s ease',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DAY_HEADERS.map((d) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            color: 'var(--color-text-muted)', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '0 0 6px',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {grid.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;

          const isToday = date === today;
          const summary = getSummary(date);
          const status = getStatus(summary, date, today);
          const c = CELL[status];
          const dayNum = parseInt(date.split('-')[2], 10);

          return (
            <div
              key={date}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
                borderRadius: 10,
                background: isToday
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.82) 100%)'
                  : c.bg,
                border: isToday ? '1px solid rgba(255,255,255,0.3)' : c.border,
                boxShadow: isToday
                  ? '0 2px 16px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.5)'
                  : c.glow !== 'none' ? c.glow : 'none',
                backdropFilter: status !== 'future' && status !== 'empty' ? 'blur(4px)' : 'none',
                transition: 'background 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <span style={{
                fontSize: 12,
                fontWeight: isToday ? 800 : status === 'future' ? 400 : 500,
                color: isToday ? '#111' : c.text,
                lineHeight: 1,
              }}>
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
