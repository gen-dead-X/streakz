import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { regenerateInviteToken } from '@/services/projects/projects.service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const token = await regenerateInviteToken(id, session.user.id);
  if (!token) return Response.json({ error: 'Forbidden or not found' }, { status: 403 });

  return Response.json({ token });
}
