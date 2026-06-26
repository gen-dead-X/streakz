import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import {
  getProjectById,
  updateProject,
  archiveProject,
} from '@/services/projects/projects.service';
import type { UpdateProjectInput } from '@/types/api/projects.types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json({ project });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as UpdateProjectInput;
  const project = await updateProject(id, session.user.id, body);
  if (!project) return Response.json({ error: 'Not found or forbidden' }, { status: 404 });

  return Response.json({ project });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const ok = await archiveProject(id, session.user.id);
  if (!ok) return Response.json({ error: 'Not found or forbidden' }, { status: 404 });

  return Response.json({ ok: true });
}
