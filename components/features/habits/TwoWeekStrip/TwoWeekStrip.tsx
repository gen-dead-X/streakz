'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { format, startOfWeek, addDays, subWeeks } from 'date-fns';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { DaySummary } from '@/types/api/habits.types';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CELL_W = 60;

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

function buildTwoWeeks(): string[] {
  const today         = new Date();
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const prevWeekStart = subWeeks(thisWeekStart, 1);
  return Array.from({ length: 14 }, (_, i) => format(addDays(prevWeekStart, i), 'yyyy-MM-dd'));
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
  const dates                     = useMemo(buildTwoWeeks, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSummariesForDates(dates).then(setSummaries).catch(() => {});
  }, [dates]);

  // Land with today centered in the viewport by default, not the row's start.
  useEffect(() => {
    const container = scrollRef.current;
    const todayEl    = todayRef.current;
    if (!container || !todayEl) return;
    container.scrollLeft = todayEl.offsetLeft - container.clientWidth / 2 + todayEl.clientWidth / 2;
  }, []);

  function getSummary(date: string): DaySummary {
    if (date === today) {
      return { date, total: habits.length, completed: habits.filter((h) => h.isCompletedToday).length };
    }
    return summaries.find((s) => s.date === date) ?? { date, total: 0, completed: 0 };
  }

  const rangeLabel = `${format(new Date(dates[0] + 'T00:00:00'), 'MMM d')} – ${format(new Date(dates[13] + 'T00:00:00'), 'MMM d')}`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-heading)', letterSpacing: '-0.2px' }}>
            Last 14 Days
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>
            {rangeLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {[
            { color: '#22c55e', label: 'All done' },
            { color: 'var(--color-brand)', label: 'Partial' },
            { color: '#ef4444', label: 'Missed' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}
      >
        {dates.map((date, i) => {
          const isToday    = date === today;
          const isFuture   = date > today;
          const summary    = getSummary(date);
          const status     = getStatus(summary, date, today);
          const dotColor   = DOT_COLORS[status];
          const dayNum     = parseInt(date.split('-')[2], 10);
          const dayIdx     = new Date(date + 'T00:00:00').getDay();
          const dayLetter  = DAY_LETTERS[(dayIdx + 6) % 7];
          const weekBreak  = i === 7;

          return (
            <div
              key={date}
              ref={isToday ? todayRef : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                width: CELL_W, flexShrink: 0,
                marginLeft:  weekBreak ? 8 : 0,
                paddingLeft: weekBreak ? 8 : 0,
                borderLeft:  weekBreak ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              {/* Day letter */}
              <span
                style={{
                  fontSize:      12,
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
                  width:          44,
                  height:         44,
                  borderRadius:   '50%',
                  background:     isToday ? 'var(--color-text-heading)' : 'transparent',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  boxShadow:      (!isToday && dotColor === 'var(--color-brand)') ? 'inset 0 0 0 1.5px var(--color-brand)' : undefined,
                }}
              >
                <span
                  style={{
                    fontSize:   16,
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
                  width:        6,
                  height:       6,
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
