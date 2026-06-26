import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { removeMember } from '@/services/projects/projects.service';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, userId } = await params;
  const ok = await removeMember(id, session.user.id, userId);
  if (!ok) return Response.json({ error: 'Forbidden or not found' }, { status: 403 });

  return Response.json({ ok: true });
}
