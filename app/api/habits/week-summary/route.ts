import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format, startOfWeek, addDays } from 'date-fns';
import { getWeekSummary } from '@/services/habits/habits.service';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const dates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd'),
  );

  try {
    const summaries = await getWeekSummary(session.user.id, dates);
    return Response.json(summaries);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
