import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getHabitsWithCalendar, createHabit } from '@/services/habits/habits.service';
import { checkFirstHabitAchievement } from '@/services/achievements/achievements.service';
import type { CreateHabitInput } from '@/types/api/habits.types';

function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { habits, calendarDots, habitsByDate } = await getHabitsWithCalendar(
      session.user.id,
      today(),
    );
    return Response.json({ habits, calendarDots, habitsByDate });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as CreateHabitInput;

  if (!body.name?.trim() || !body.icon || !body.frequency?.type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const habit = await createHabit(session.user.id, body);
    checkFirstHabitAchievement(session.user.id).catch(() => null);
    return Response.json({ habit }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
