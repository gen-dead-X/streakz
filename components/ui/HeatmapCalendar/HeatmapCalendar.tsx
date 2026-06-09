'use client';
import { DayPicker } from 'react-day-picker';
import { parseISO, subMonths } from 'date-fns';
import { Typography } from 'antd';
import type React from 'react';

const { Text } = Typography;

interface HeatmapCalendarProps {
  checkInDates: string[]; // 'YYYY-MM-DD'[]
}

export function HeatmapCalendar({ checkInDates }: HeatmapCalendarProps) {
  const today = new Date();
  const fromMonth = subMonths(today, 2);

  const checkedDays = checkInDates.map((d) => parseISO(d));

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
        }}
      >
        <DayPicker
          mode="multiple"
          selected={checkedDays}
          onSelect={() => {}}
          numberOfMonths={3}
          startMonth={fromMonth}
          endMonth={today}
          showOutsideDays={false}
          styles={{
            root: {
              '--rdp-cell-size': '32px',
              '--rdp-day-width': '32px',
              '--rdp-day-height': '32px',
              '--rdp-day_button-width': '30px',
              '--rdp-day_button-height': '30px',
              color: 'var(--color-text-body)',
              fontSize: 13,
              width: '100%',
            } as React.CSSProperties,
            month_caption: { color: 'var(--color-text-muted)', fontSize: 12 },
            weekday: { color: 'var(--color-text-muted)', fontSize: 11 },
          }}
          modifiersStyles={{
            selected: {
              background: 'var(--color-brand)',
              color: 'var(--color-bg-page)',
              borderRadius: '50%',
            },
          }}
        />
      </div>
    </div>
  );
}
