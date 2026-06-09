import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { updateHabit, archiveHabit } from '@/services/habits/habits.service';
import type { UpdateHabitInput } from '@/types/api/habits.types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as UpdateHabitInput;

  try {
    const habit = await updateHabit(id, session.user.id, body);
    if (!habit) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ habit });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const ok = await archiveHabit(id, session.user.id);
    if (!ok) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
