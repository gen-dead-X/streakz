import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getHabitsForUser, getCheckInDatesForMonth } from '@/services/habits/habits.service';
import { TodaySummaryCard } from '@/components/features/habits/TodaySummaryCard';
import { HabitList } from '@/components/features/habits/HabitList';
import { MiniCalendar } from '@/components/ui/MiniCalendar';

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [habits, checkInDates] = await Promise.all([
    getHabitsForUser(session.user.id, todayStr),
    getCheckInDatesForMonth(session.user.id, year, month),
  ]);

  const total = habits.length;
  const completed = habits.filter((h) => h.isCompletedToday).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const longestActive = habits.reduce(
    (max, h) => (h.currentStreak > max ? h.currentStreak : max),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <TodaySummaryCard
        total={total}
        completed={completed}
        pct={pct}
        longestActive={longestActive}
      />

      {/* Desktop: 2-col grid. Mobile: single column stack */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 md:gap-6 items-start">
        <HabitList />
        <div className="md:sticky md:top-8">
          <MiniCalendar checkInDates={checkInDates} today={todayStr} />
        </div>
      </div>
    </div>
  );
}
