import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { createProject, getProjectsForUser } from '@/services/projects/projects.service';
import type { CreateProjectInput } from '@/types/api/projects.types';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const projects = await getProjectsForUser(session.user.id);
    return Response.json({ projects });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as CreateProjectInput;
  if (!body.name?.trim() || !body.icon) {
    return Response.json({ error: 'name and icon are required' }, { status: 400 });
  }

  try {
    const project = await createProject(session.user.id, body);
    return Response.json({ project }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
