'use client';
import './MiniCalendar.css';
import { useState } from 'react';
import Calendar from 'react-calendar';
import { format, isBefore, parseISO } from 'date-fns';
import { Typography, Popover } from 'antd';
import BorderBeam from 'antd/es/border-beam';
import type { CalendarDots, HabitsByDate } from '@/types/api/insights.types';

const { Text } = Typography;

interface MiniCalendarProps {
  calendarDots: CalendarDots;
  habitsByDate: HabitsByDate;
  today: string;
}

function DotRow({ completed, missed }: { completed: number; missed: number }) {
  const total = Math.min(completed + missed, 3);
  if (total === 0) return <div className="calendar-dot-row" />;
  const greenCount = Math.min(completed, total);
  const redCount = total - greenCount;
  const dots: boolean[] = [
    ...Array(greenCount).fill(true),
    ...Array(redCount).fill(false),
  ];
  return (
    <div className="calendar-dot-row">
      {dots.map((done, i) => (
        <span
          key={i}
          className={`calendar-dot ${done ? 'calendar-dot--completed' : 'calendar-dot--missed'}`}
        />
      ))}
    </div>
  );
}

function PopoverContent({ habits }: { habits: Array<{ name: string; completed: boolean }> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140, maxWidth: 220 }}>
      {habits.map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              flexShrink: 0,
              background: h.completed ? 'hsl(142, 62%, 46%)' : 'hsl(0, 72%, 58%)',
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: h.completed ? 'hsl(142, 62%, 46%)' : 'hsl(0, 72%, 58%)',
              fontWeight: 500,
            }}
          >
            {h.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MiniCalendar({ calendarDots, habitsByDate, today }: MiniCalendarProps) {
  const todayDate = parseISO(today);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function tileContent({ date, view }: { date: Date; view: string }) {
    if (view !== 'month') return null;
    const key = format(date, 'yyyy-MM-dd');
    const dots = calendarDots[key];
    const habits = habitsByDate[key];

    const dotRow = (
      <DotRow completed={dots?.completed ?? 0} missed={dots?.missed ?? 0} />
    );

    if (!habits || habits.length === 0) return dotRow;

    return (
      <Popover
        open={selectedDate === key}
        onOpenChange={(open) => { if (!open) setSelectedDate(null); }}
        content={<PopoverContent habits={habits} />}
        title={
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {key}
          </span>
        }
        trigger="click"
        placement="top"
        overlayStyle={{ zIndex: 1100 }}
      >
        {dotRow}
      </Popover>
    );
  }

  return (
    <div>
      <Text
        strong
        style={{
          fontSize: 14,
          color: 'var(--color-text-heading)',
          display: 'block',
          marginBottom: 12,
        }}
      >
        This Month
      </Text>
      <BorderBeam
        color={[
          { color: 'var(--color-brand)', percent: 0 },
          { color: 'var(--color-brand-light)', percent: 50 },
          { color: 'var(--color-brand)', percent: 100 },
        ]}
        outset={1}
      >
        <div
          style={{
            background: 'rgb(var(--brand-rgb) / 0.07)',
            borderRadius: 20,
            padding: '16px 12px',
            border: '1px solid rgb(var(--brand-rgb) / 0.15)',
          }}
        >
          <Calendar
            className="mini-calendar"
            tileContent={tileContent}
            showNeighboringMonth={false}
            maxDate={todayDate}
            view="month"
            formatDay={(_locale, date) => format(date, 'd')}
            formatShortWeekday={(_locale, date) => format(date, 'EEEEE')}
            onClickDay={(date) => {
              if (isBefore(todayDate, date)) return;
              const key = format(date, 'yyyy-MM-dd');
              setSelectedDate((prev) => (prev === key ? null : key));
            }}
          />
        </div>
      </BorderBeam>
    </div>
  );
}
