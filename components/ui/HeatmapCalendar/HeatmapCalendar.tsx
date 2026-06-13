'use client';
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DaySummary } from '@/types/api/habits.types';

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type DayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'empty';

function getStatus(s: DaySummary, date: string, today: string): DayStatus {
  if (date > today) return 'future';
  if (s.total === 0) return 'empty';
  if (s.completed === 0) return 'missed';
  if (s.completed >= s.total) return 'complete';
  return 'partial';
}

const CELL: Record<DayStatus, { bg: string; border: string; text: string; glow: string; dotColor: string }> = {
  complete: {
    bg: 'rgba(34,197,94,0.18)',
    border: 'rgba(34,197,94,0.38)',
    text: '#86efac',
    glow: '0 0 8px rgba(34,197,94,0.35)',
    dotColor: '#22c55e',
  },
  partial: {
    bg: 'rgba(234,179,8,0.16)',
    border: 'rgba(234,179,8,0.38)',
    text: '#fde047',
    glow: '0 0 8px rgba(234,179,8,0.28)',
    dotColor: '#eab308',
  },
  missed: {
    bg: 'rgba(239,68,68,0.13)',
    border: 'rgba(239,68,68,0.28)',
    text: '#fca5a5',
    glow: '0 0 8px rgba(239,68,68,0.22)',
    dotColor: '#ef4444',
  },
  future: { bg: 'transparent', border: 'rgba(255,255,255,0.04)', text: 'var(--color-text-muted)', glow: 'none', dotColor: 'transparent' },
  empty:  { bg: 'transparent', border: 'rgba(255,255,255,0.04)', text: 'var(--color-text-body)',  glow: 'none', dotColor: 'transparent' },
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

interface MonthGridProps {
  year: number;
  month: number;
  today: string;
  cellSize: number;
}

function MonthGrid({ year, month, today, cellSize }: MonthGridProps) {
  const [summaries, setSummaries] = useState<DaySummary[]>([]);

  useEffect(() => {
    fetch(`/api/habits/month-summary?year=${year}&month=${month}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DaySummary[] | null) => { if (data) setSummaries(data); })
      .catch(() => {});
  }, [year, month]);

  function getSummary(date: string): DaySummary {
    return summaries.find((s) => s.date === date) ?? { date, total: 0, completed: 0 };
  }

  const grid = buildGrid(year, month);
  const label = format(new Date(year, month - 1, 1), 'MMMM yyyy');

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: 18,
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '16px 14px 18px',
    }}>
      {/* Month label */}
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--color-brand)',
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        marginBottom: 12,
      }}>
        {label}
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_HEADERS.map((d, i) => (
          <div key={`${d}-${i}`} style={{
            textAlign: 'center', fontSize: 9, fontWeight: 700,
            color: 'var(--color-text-muted)', letterSpacing: '0.06em',
            padding: '0 0 4px',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {grid.map((date, i) => {
          if (!date) return <div key={`e-${i}`} style={{ aspectRatio: '1' }} />;

          const isToday = date === today;
          const summary = getSummary(date);
          const status = getStatus(summary, date, today);
          const c = CELL[status];
          const dayNum = parseInt(date.split('-')[2], 10);

          return (
            <div
              key={date}
              title={date}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 6,
                background: isToday
                  ? 'rgba(255,255,255,0.90)'
                  : c.bg,
                border: `1px solid ${isToday ? 'rgba(255,255,255,0.5)' : c.border}`,
                boxShadow: isToday
                  ? '0 2px 10px rgba(255,255,255,0.15)'
                  : c.glow !== 'none' ? c.glow : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
            >
              <span style={{
                fontSize: Math.max(cellSize * 0.38, 9),
                fontWeight: isToday ? 800 : 500,
                color: isToday ? '#111' : c.text,
                lineHeight: 1,
                userSelect: 'none',
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

export function HeatmapCalendar() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileOffset, setMobileOffset] = useState(0);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const now = new Date();
  const desktopMonths = Array.from({ length: 3 }, (_, i) => {
    const d = subMonths(now, 2 - i);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const mobileMonth = subMonths(now, mobileOffset);
  const canGoBack = mobileOffset < 11;
  const canGoForward = mobileOffset > 0;

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-heading)' }}>
          When you show up
        </span>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {[
            { color: '#22c55e', label: 'All done' },
            { color: '#eab308', label: 'Partial' },
            { color: '#ef4444', label: 'Missed' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: 3 months side by side */}
      <div className="hidden md:flex md:gap-3">
        {desktopMonths.map(({ year, month }) => (
          <MonthGrid key={`${year}-${month}`} year={year} month={month} today={today} cellSize={28} />
        ))}
      </div>

      {/* Mobile: single month with navigation */}
      <div className="md:hidden">
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {format(mobileMonth, 'MMMM yyyy')}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { fn: () => setMobileOffset((o) => o + 1), disabled: !canGoBack, icon: <ChevronLeft size={13} />, label: 'Previous' },
                { fn: () => setMobileOffset((o) => o - 1), disabled: !canGoForward, icon: <ChevronRight size={13} />, label: 'Next' },
              ].map(({ fn, disabled, icon, label }) => (
                <button
                  key={label}
                  onClick={fn}
                  disabled={disabled}
                  aria-label={label}
                  style={{
                    width: 28, height: 28, borderRadius: 99,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.3 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {DAY_HEADERS.map((d, i) => (
              <div key={`${d}-${i}`} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
                {d}
              </div>
            ))}
          </div>

          <MonthGrid
            year={mobileMonth.getFullYear()}
            month={mobileMonth.getMonth() + 1}
            today={today}
            cellSize={34}
          />
        </div>
      </div>
    </div>
  );
}
