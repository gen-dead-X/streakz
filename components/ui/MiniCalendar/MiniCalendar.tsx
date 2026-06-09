'use client';
import { DayPicker } from 'react-day-picker';
import { parseISO } from 'date-fns';
import { Typography } from 'antd';
import type React from 'react';

const { Text } = Typography;

interface MiniCalendarProps {
  checkInDates: string[]; // 'YYYY-MM-DD'[] for current month
  today: string; // 'YYYY-MM-DD'
}

export function MiniCalendar({ checkInDates, today }: MiniCalendarProps) {
  const todayDate = parseISO(today);
  const checkedDays = checkInDates.map((d) => parseISO(d));

  return (
    <div>
      <Text
        strong
        style={{ fontSize: 14, color: 'var(--color-text-heading)', display: 'block', marginBottom: 10 }}
      >
        This Month
      </Text>
      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 16,
          padding: '12px 8px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <DayPicker
          mode="multiple"
          selected={checkedDays}
          onSelect={() => {}}
          numberOfMonths={1}
          defaultMonth={todayDate}
          showOutsideDays={false}
          hideNavigation
          modifiers={{
            today: [todayDate],
          }}
          modifiersStyles={{
            selected: {
              background: 'var(--color-brand)',
              color: 'var(--color-bg-page)',
              borderRadius: '50%',
              fontWeight: 600,
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
              '--rdp-day-width': '34px',
              '--rdp-day-height': '34px',
              '--rdp-day_button-width': '32px',
              '--rdp-day_button-height': '32px',
              color: 'var(--color-text-body)',
              fontSize: 13,
              width: '100%',
              maxWidth: '100%',
            } as React.CSSProperties,
            month_caption: { color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 4 },
            weekday: { color: 'var(--color-text-muted)', fontSize: 11 },
          }}
        />
      </div>
    </div>
  );
}
