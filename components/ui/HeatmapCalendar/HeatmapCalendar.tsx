'use client';
import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DaySummary } from '@/types/api/habits.types';

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type DayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'empty';

function getStatus(s: DaySummary, date: string, today: string): DayStatus {
  if (date > today) return 'future';
  if (s.total === 0) return 'empty';
  if (s.completed === 0) return 'missed';
  if (s.completed >= s.total) return 'complete';
  return 'partial';
}

function buildGrid(year: number, month: number): (string | null)[] {
  const ref  = new Date(year, month - 1, 1);
  const days = eachDayOfInterval({ start: startOfMonth(ref), end: endOfMonth(ref) }).map(
    (d) => format(d, 'yyyy-MM-dd'),
  );
  const firstDow = getDay(startOfMonth(ref)); // Sunday = 0
  const grid: (string | null)[] = Array(firstDow).fill(null);
  grid.push(...days);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

const DOT_COLORS: Partial<Record<DayStatus, string>> = {
  complete: '#22c55e',
  partial:  'var(--color-brand)',
  missed:   '#ef4444',
};

interface CalendarGridProps {
  year:      number;
  month:     number;
  today:     string;
  summaries: DaySummary[];
}

function CalendarGrid({ year, month, today, summaries }: CalendarGridProps) {
  function getSummary(date: string): DaySummary {
    return summaries.find((s) => s.date === date) ?? { date, total: 0, completed: 0 };
  }

  const grid = buildGrid(year, month);

  return (
    <>
      {/* Day-of-week headers */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          marginBottom:        4,
        }}
      >
        {DOW_LABELS.map((d) => (
          <div
            key={d}
            style={{
              textAlign:  'center',
              fontSize:   11,
              fontWeight: 500,
              color:      'var(--color-text-muted)',
              padding:    '0 0 6px',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid — minmax(0,1fr) prevents overflow into adjacent months */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          rowGap:              4,
          overflow:            'hidden',
        }}
      >
        {grid.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;

          const isToday  = date === today;
          const summary  = getSummary(date);
          const status   = getStatus(summary, date, today);
          const dayNum   = parseInt(date.split('-')[2], 10);
          const dotColor = DOT_COLORS[status];

          return (
            <div
              key={date}
              style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                gap:            2,
                overflow:       'hidden',
              }}
            >
              {/* Circle — sized relative to the cell, not fixed px */}
              <div
                style={{
                  width:          '76%',
                  aspectRatio:    '1',
                  maxWidth:       36,
                  borderRadius:   '50%',
                  background:     isToday ? 'var(--color-text-heading)' : 'transparent',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                }}
              >
                <span
                  style={{
                    fontSize:   'clamp(9px, 2.2vw, 14px)',
                    fontWeight: isToday ? 700 : 400,
                    color:      isToday
                      ? 'var(--color-bg-page)'
                      : status === 'future'
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
                  width:        4,
                  height:       4,
                  borderRadius: '50%',
                  background:   (!isToday && dotColor) ? dotColor : 'transparent',
                  flexShrink:   0,
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

export function HeatmapCalendar() {
  const today                     = format(new Date(), 'yyyy-MM-dd');
  const now                       = new Date();
  const [year, setYear]           = useState(now.getFullYear());
  const [month, setMonth]         = useState(now.getMonth() + 1);
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const months = isDesktop
      ? [-2, -1, 0].map((offset) => {
          const d = new Date(year, month - 1 + offset, 1);
          return { year: d.getFullYear(), month: d.getMonth() + 1 };
        })
      : [{ year, month }];

    Promise.all(
      months.map(({ year: y, month: m }) =>
        fetch(`/api/habits/month-summary?year=${y}&month=${m}`)
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
      ),
    ).then((results) => setSummaries((results as DaySummary[][]).flat()));
  }, [year, month, isDesktop]);

  function goBack() {
    const d = subMonths(new Date(year, month - 1, 1), 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setSummaries([]);
  }

  function goForward() {
    const d = addMonths(new Date(year, month - 1, 1), 1);
    if (d > now) return;
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setSummaries([]);
  }

  const canGoForward =
    new Date(year, month - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1);

  const desktopMonths = [-2, -1, 0].map((offset) => {
    const d = new Date(year, month - 1 + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const navBtn: React.CSSProperties = {
    width:          32,
    height:         32,
    borderRadius:   '50%',
    border:         '1px solid var(--color-border-subtle)',
    background:     'transparent',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          'var(--color-text-muted)',
  };

  return (
    <div>
      <div
        style={{
          background:   'var(--color-bg-surface)',
          border:       '1px solid var(--color-border-subtle)',
          borderRadius: 20,
          padding:      '20px 20px 16px',
        }}
      >
        {/* Navigation header */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   20,
          }}
        >
          <button onClick={goBack} style={navBtn} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>

          <span
            style={{
              fontSize:      17,
              fontWeight:    600,
              color:         'var(--color-text-heading)',
              letterSpacing: '-0.3px',
            }}
          >
            {format(new Date(year, month - 1, 1), 'MMMM yyyy')}
          </span>

          <button
            onClick={goForward}
            disabled={!canGoForward}
            style={{
              ...navBtn,
              opacity: canGoForward ? 1 : 0.25,
              cursor:  canGoForward ? 'pointer' : 'default',
            }}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Desktop: 3-month side-by-side, each in isolated grid */}
        {isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 28 }}>
            {desktopMonths.map(({ year: y, month: m }) => (
              <div key={`${y}-${m}`} style={{ minWidth: 0, overflow: 'hidden' }}>
                <p
                  style={{
                    fontSize:      10,
                    fontWeight:    600,
                    color:         'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    margin:        '0 0 10px 2px',
                  }}
                >
                  {format(new Date(y, m - 1, 1), 'MMM yyyy')}
                </p>
                <CalendarGrid year={y} month={m} today={today} summaries={summaries} />
              </div>
            ))}
          </div>
        ) : (
          <CalendarGrid year={year} month={month} today={today} summaries={summaries} />
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, paddingLeft: 4 }}>
        {[
          { color: '#22c55e', label: 'All done' },
          { color: 'var(--color-brand)', label: 'Partial' },
          { color: '#ef4444', label: 'Missed' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
