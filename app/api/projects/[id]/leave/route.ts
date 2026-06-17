import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { leaveProject } from '@/services/projects/projects.service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const ok = await leaveProject(id, session.user.id);
  if (!ok) return Response.json({ error: 'Cannot leave (owner must archive)' }, { status: 400 });

  return Response.json({ ok: true });
}
