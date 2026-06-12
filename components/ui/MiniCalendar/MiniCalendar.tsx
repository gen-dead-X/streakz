'use client';
import Calendar from 'react-calendar';
import { parseISO, format, isBefore } from 'date-fns';
import { Typography } from 'antd';

const { Text } = Typography;

interface MiniCalendarProps {
  checkInDates: string[];
  today: string;
}

export function MiniCalendar({ checkInDates, today }: MiniCalendarProps) {
  const todayDate = parseISO(today);
  const checkInSet = new Set(checkInDates);

  function getTileClassName({ date, view }: { date: Date; view: string }): string | null {
    if (view !== 'month') return null;
    const key = format(date, 'yyyy-MM-dd');
    if (checkInSet.has(key)) return 'tile-success';
    // Past days in the current month with no check-in = missed
    if (isBefore(date, todayDate)) return 'tile-missed';
    return null;
  }

  return (
    <div>
      <Text
        strong
        style={{ fontSize: 14, color: 'var(--color-text-heading)', display: 'block', marginBottom: 12 }}
      >
        This Month
      </Text>
      <div
        style={{
          background: 'rgb(var(--brand-rgb) / 0.07)',
          borderRadius: 20,
          padding: '16px 12px',
          border: '1px solid rgb(var(--brand-rgb) / 0.12)',
        }}
      >
        <Calendar
          activeStartDate={todayDate}
          tileClassName={getTileClassName}
          showNavigation={false}
          showNeighboringMonth={false}
          maxDate={todayDate}
          view="month"
          formatDay={(_locale, date) => format(date, 'd')}
          formatShortWeekday={(_locale, date) => format(date, 'EEEEE')}
          onClickDay={() => {}}
        />
      </div>
    </div>
  );
}
