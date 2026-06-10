import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { saveSubscription, deleteSubscription } from '@/services/push/push.service';
import type { SubscribeBody, UnsubscribeBody } from '@/types/api/push.types';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as SubscribeBody;
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ error: 'Invalid subscription object' }, { status: 400 });
  }

  try {
    await saveSubscription(session.user.id, body);
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as UnsubscribeBody;
  if (!body.endpoint) {
    return Response.json({ error: 'Missing endpoint' }, { status: 400 });
  }

  try {
    await deleteSubscription(session.user.id, body.endpoint);
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
