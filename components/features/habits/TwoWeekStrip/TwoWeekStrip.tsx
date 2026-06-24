'use client';
import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, subWeeks } from 'date-fns';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { DaySummary } from '@/types/api/habits.types';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type DayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'empty';

function getStatus(s: DaySummary, date: string, today: string): DayStatus {
  if (date > today) return 'future';
  if (s.total === 0) return 'empty';
  if (s.completed === 0) return 'missed';
  if (s.completed >= s.total) return 'complete';
  return 'partial';
}

const DOT_COLORS: Partial<Record<DayStatus, string>> = {
  complete: '#22c55e',
  partial:  'var(--color-brand)',
  missed:   '#ef4444',
};

function buildTwoWeeks(): { week1: string[]; week2: string[] } {
  const today         = new Date();
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const prevWeekStart = subWeeks(thisWeekStart, 1);
  const week1 = Array.from({ length: 7 }, (_, i) =>
    format(addDays(prevWeekStart, i), 'yyyy-MM-dd'),
  );
  const week2 = Array.from({ length: 7 }, (_, i) =>
    format(addDays(thisWeekStart, i), 'yyyy-MM-dd'),
  );
  return { week1, week2 };
}

async function fetchSummariesForDates(dates: string[]): Promise<DaySummary[]> {
  const months = [...new Set(dates.map((d) => d.slice(0, 7)))];
  const results = await Promise.all(
    months.map(async (ym) => {
      const [year, month] = ym.split('-');
      const r = await fetch(`/api/habits/month-summary?year=${year}&month=${month}`);
      if (!r.ok) return [];
      return (await r.json()) as DaySummary[];
    }),
  );
  return results.flat();
}

export function TwoWeekStrip() {
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const habits                    = useHabitsStore((s) => s.habits);
  const today                     = format(new Date(), 'yyyy-MM-dd');
  const { week1, week2 }          = buildTwoWeeks();
  const allDates                  = [...week1, ...week2];

  useEffect(() => {
    fetchSummariesForDates(allDates).then(setSummaries).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getSummary(date: string): DaySummary {
    if (date === today) {
      return { date, total: habits.length, completed: habits.filter((h) => h.isCompletedToday).length };
    }
    return summaries.find((s) => s.date === date) ?? { date, total: 0, completed: 0 };
  }

  const week1Label = `${format(new Date(week1[0] + 'T00:00:00'), 'MMM d')} – ${format(new Date(week1[6] + 'T00:00:00'), 'MMM d')}`;
  const week2Label = `${format(new Date(week2[0] + 'T00:00:00'), 'MMM d')} – ${format(new Date(week2[6] + 'T00:00:00'), 'MMM d')}`;

  function renderRow(dates: string[], rowLabel: string) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize:      9.5,
            fontWeight:    600,
            color:         'var(--color-text-muted)',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            marginBottom:  8,
          }}
        >
          {rowLabel}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {dates.map((date) => {
            const isToday  = date === today;
            const isFuture = date > today;
            const summary  = getSummary(date);
            const status   = getStatus(summary, date, today);
            const dotColor = DOT_COLORS[status];
            const dayNum   = parseInt(date.split('-')[2], 10);
            const dayIdx   = new Date(date + 'T00:00:00').getDay();
            const dayLetter = DAY_LETTERS[(dayIdx + 6) % 7];

            return (
              <div
                key={date}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
              >
                {/* Day letter */}
                <span
                  style={{
                    fontSize:      9,
                    fontWeight:    600,
                    color:         isToday ? 'var(--color-text-heading)' : 'var(--color-text-muted)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    lineHeight:    1,
                  }}
                >
                  {dayLetter}
                </span>

                {/* Circle (iOS-style) */}
                <div
                  style={{
                    width:          34,
                    height:         34,
                    borderRadius:   '50%',
                    background:     isToday ? 'var(--color-text-heading)' : 'transparent',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize:   13,
                      fontWeight: isToday ? 700 : 400,
                      color:      isToday
                        ? 'var(--color-bg-page)'
                        : isFuture
                        ? 'var(--color-text-muted)'
                        : 'var(--color-text-heading)',
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Status dot */}
                <div
                  style={{
                    width:        5,
                    height:       5,
                    borderRadius: '50%',
                    background:   (!isToday && dotColor) ? dotColor : 'transparent',
                    boxShadow:    (!isToday && dotColor) ? `0 0 4px ${dotColor}` : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-heading)', letterSpacing: '-0.2px' }}>
          Last 14 Days
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {[
            { color: '#22c55e', label: 'All done' },
            { color: 'var(--color-brand)', label: 'Partial' },
            { color: '#ef4444', label: 'Missed' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      {renderRow(week1, week1Label)}
      {renderRow(week2, week2Label)}
    </div>
  );
}
