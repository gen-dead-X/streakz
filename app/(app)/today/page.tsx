import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getHabitsForUser } from '@/services/habits/habits.service';
import { HabitList } from '@/components/features/habits/HabitList';

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const habits = await getHabitsForUser(session.user.id, todayStr);

  const total = habits.length;
  const completed = habits.filter((h) => h.isCompletedToday).length;
  const longestActive = habits.reduce(
    (max, h) => (h.currentStreak > max ? h.currentStreak : max),
    0,
  );
  const allDone = total > 0 && completed === total;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              {format(new Date(), 'EEEE, MMM d')}
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-heading)', margin: 0, lineHeight: 1.2 }}>
              {allDone ? 'All done! 🎉' : 'Your Streaks'}
            </h1>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col items-center rounded-[14px] px-3 py-2"
              style={{ background: 'var(--color-bg-surface)' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-brand)', lineHeight: 1 }}>
                {completed}/{total}
              </span>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>done</span>
            </div>
            {longestActive > 0 && (
              <div className="flex flex-col items-center rounded-[14px] px-3 py-2"
                style={{ background: 'var(--color-bg-surface)' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                  {longestActive}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>best</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/*
        Mobile: give the deck enough height.
        Desktop (md+): HabitList renders deck + list side by side, height is auto.
      */}
      <div className="h-[calc(100dvh-280px)] min-h-[380px] md:h-auto md:min-h-0">
        <HabitList />
      </div>
    </div>
  );
}
