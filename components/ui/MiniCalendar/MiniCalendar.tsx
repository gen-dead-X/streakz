'use client';
import Calendar from 'react-calendar';
import { parseISO, format, isSameDay } from 'date-fns';
import { Typography } from 'antd';

const { Text } = Typography;

interface MiniCalendarProps {
  checkInDates: string[];
  today: string;
}

export function MiniCalendar({ checkInDates, today }: MiniCalendarProps) {
  const todayDate = parseISO(today);
  const checkedDates = checkInDates.map((d) => parseISO(d));

  function getTileClassName({ date, view }: { date: Date; view: string }): string | null {
    if (view !== 'month') return null;
    if (checkedDates.some((d) => isSameDay(d, date))) return 'tile-high';
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
          background: 'var(--color-bg-surface)',
          borderRadius: 20,
          padding: '16px 12px',
          border: '1px solid rgba(255,255,255,0.05)',
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
