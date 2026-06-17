import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getProjectById } from '@/services/projects/projects.service';
import { getHabitsForProject, createHabit } from '@/services/habits/habits.service';
import type { CreateHabitInput } from '@/types/api/habits.types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

  const today = format(new Date(), 'yyyy-MM-dd');
  const habits = await getHabitsForProject(id, session.user.id, today);
  return Response.json({ habits });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json()) as Omit<CreateHabitInput, 'projectId'>;
  if (!body.name?.trim() || !body.icon || !body.frequency?.type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const habit = await createHabit(session.user.id, { ...body, projectId: id, scope: body.scope ?? 'personal' });
    return Response.json({ habit }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
