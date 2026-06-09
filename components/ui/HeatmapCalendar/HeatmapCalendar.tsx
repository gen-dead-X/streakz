'use client';
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { parseISO, subMonths } from 'date-fns';
import { Typography } from 'antd';
import type React from 'react';

const { Text } = Typography;

interface HeatmapCalendarProps {
  checkInDates: string[]; // 'YYYY-MM-DD'[] — same date appears once per habit check-in
}

export function HeatmapCalendar({ checkInDates }: HeatmapCalendarProps) {
  const [months, setMonths] = useState(1);

  useEffect(() => {
    function check() {
      setMonths(window.matchMedia('(min-width: 768px)').matches ? 3 : 1);
    }
    check();
    const mq = window.matchMedia('(min-width: 768px)');
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  // Count how many times each date appears (= how many habits checked in that day)
  const countByDate = new Map<string, number>();
  for (const d of checkInDates) {
    countByDate.set(d, (countByDate.get(d) ?? 0) + 1);
  }

  // Separate into intensity buckets
  const lowDays: Date[] = [];  // count === 1
  const midDays: Date[] = [];  // count 2–3
  const highDays: Date[] = []; // count 4+

  for (const [dateStr, count] of countByDate) {
    const d = parseISO(dateStr);
    if (count >= 4) highDays.push(d);
    else if (count >= 2) midDays.push(d);
    else lowDays.push(d);
  }

  const todayDate = new Date();
  const startMonth = subMonths(todayDate, months - 1);

  return (
    <div>
      <Text
        strong
        style={{ fontSize: 15, color: 'var(--color-text-heading)', display: 'block', marginBottom: 12 }}
      >
        When you show up
      </Text>
      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 16,
          padding: '8px 0',
          border: '1px solid rgba(255,255,255,0.05)',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <DayPicker
          mode="multiple"
          selected={[...lowDays, ...midDays, ...highDays]}
          onSelect={() => {}}
          numberOfMonths={months}
          startMonth={startMonth}
          endMonth={todayDate}
          showOutsideDays={false}
          modifiers={{
            low: lowDays,
            mid: midDays,
            high: highDays,
            today: [todayDate],
          }}
          modifiersStyles={{
            low: {
              background: 'rgba(29, 185, 84, 0.3)',
              color: 'var(--color-text-body)',
              borderRadius: '50%',
            },
            mid: {
              background: 'rgba(29, 185, 84, 0.6)',
              color: 'var(--color-text-heading)',
              borderRadius: '50%',
            },
            high: {
              background: 'var(--color-brand)',
              color: 'var(--color-bg-page)',
              borderRadius: '50%',
              fontWeight: 700,
            },
            today: {
              border: '2px solid var(--color-brand)',
              borderRadius: '50%',
              color: 'var(--color-text-heading)',
              fontWeight: 700,
            },
          }}
          styles={{
            root: {
              '--rdp-day-width': '36px',
              '--rdp-day-height': '36px',
              '--rdp-day_button-width': '34px',
              '--rdp-day_button-height': '34px',
              color: 'var(--color-text-body)',
              fontSize: 13,
              width: '100%',
              maxWidth: '100%',
              overflowX: 'hidden',
            } as React.CSSProperties,
            months: { gap: 24, flexWrap: 'wrap' as const },
            month_caption: { color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 600 },
            weekday: { color: 'var(--color-text-muted)', fontSize: 11 },
            nav: { color: 'var(--color-text-muted)' },
          }}
        />
      </div>
    </div>
  );
}
