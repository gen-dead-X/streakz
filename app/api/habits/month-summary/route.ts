import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { getWeekSummary } from '@/services/habits/habits.service';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10);
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return Response.json({ error: 'Invalid year or month' }, { status: 400 });
  }

  try {
    const ref = new Date(year, month - 1, 1);
    const dates = eachDayOfInterval({ start: startOfMonth(ref), end: endOfMonth(ref) }).map(
      (d) => format(d, 'yyyy-MM-dd'),
    );
    const summaries = await getWeekSummary(session.user.id, dates);
    return Response.json(summaries);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
