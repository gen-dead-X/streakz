import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getHabitsForUser, createHabit } from '@/services/habits/habits.service';
import { checkFirstHabitAchievement } from '@/services/achievements/achievements.service';
import type { CreateHabitInput } from '@/types/api/habits.types';

function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const habits = await getHabitsForUser(session.user.id, today());
    return Response.json({ habits });
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
    // Fire-and-forget: first_habit achievement (no await — don't block the response)
    checkFirstHabitAchievement(session.user.id).catch(() => null);
    return Response.json({ habit }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
