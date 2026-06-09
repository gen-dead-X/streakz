import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getHabitsForUser } from '@/services/habits/habits.service';
import { TodaySummaryCard } from '@/components/features/habits/TodaySummaryCard';
import { HabitList } from '@/components/features/habits/HabitList';

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const today = format(new Date(), 'yyyy-MM-dd');
  const habits = await getHabitsForUser(session.user.id, today);

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
      <HabitList />
    </div>
  );
}
