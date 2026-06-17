import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { joinProjectByToken } from '@/services/projects/projects.service';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as { token?: string };
  if (!body.token) return Response.json({ error: 'token is required' }, { status: 400 });

  const projectId = await joinProjectByToken(body.token, session.user.id);
  if (!projectId) return Response.json({ error: 'Invalid or expired invite' }, { status: 404 });

  return Response.json({ projectId });
}
