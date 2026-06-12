'use client';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, subMonths, startOfMonth } from 'date-fns';
import { Typography } from 'antd';

const { Text } = Typography;

interface HeatmapCalendarProps {
  checkInDates: string[];
}

export function HeatmapCalendar({ checkInDates }: HeatmapCalendarProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Count check-ins per date
  const countByDate = new Map<string, number>();
  for (const d of checkInDates) {
    countByDate.set(d, (countByDate.get(d) ?? 0) + 1);
  }

  const today = new Date();
  // On desktop show last 3 months stacked; on mobile show current month
  const monthsToShow = isDesktop ? 3 : 1;
  const months = Array.from({ length: monthsToShow }, (_, i) =>
    startOfMonth(subMonths(today, monthsToShow - 1 - i)),
  );

  function getTileClassName({ date, view }: { date: Date; view: string }): string | null {
    if (view !== 'month') return null;
    const key = format(date, 'yyyy-MM-dd');
    const count = countByDate.get(key) ?? 0;
    if (count >= 4) return 'tile-high';
    if (count >= 2) return 'tile-mid';
    if (count >= 1) return 'tile-low';
    return null;
  }

  return (
    <div>
      <Text
        strong
        style={{ fontSize: 15, color: 'var(--color-text-heading)', display: 'block', marginBottom: 16 }}
      >
        When you show up
      </Text>
      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 20,
          padding: '20px 16px',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          gap: isDesktop ? 16 : 24,
          alignItems: 'flex-start',
        }}
      >
        {months.map((monthStart) => (
          <div key={format(monthStart, 'yyyy-MM')} style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              {format(monthStart, 'MMM yyyy')}
            </span>
            <Calendar
              className="calendar-heatmap"
              activeStartDate={monthStart}
              tileClassName={getTileClassName}
              showNavigation={false}
              showNeighboringMonth={false}
              maxDate={today}
              view="month"
              formatDay={(_locale, date) => format(date, 'd')}
              formatShortWeekday={(_locale, date) => format(date, 'EEEEE')}
              onClickDay={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
