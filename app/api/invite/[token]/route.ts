import { resolveInviteToken } from '@/services/projects/projects.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const preview = await resolveInviteToken(token);
  if (!preview) return Response.json({ error: 'Invalid invite' }, { status: 404 });
  return Response.json(preview);
}
