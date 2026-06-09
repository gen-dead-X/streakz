import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { checkIn, undoCheckIn } from '@/services/habits/habits.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { date } = (await request.json()) as { date: string };

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  }

  try {
    const ok = await checkIn(id, session.user.id, date);
    if (!ok) return Response.json({ error: 'Already checked in' }, { status: 409 });
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { date } = (await request.json()) as { date: string };

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  }

  try {
    await undoCheckIn(id, session.user.id, date);
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
