import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getProjectById, getProjectStatus } from '@/services/projects/projects.service';

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
  const status = await getProjectStatus(id, today);
  return Response.json(status);
}
