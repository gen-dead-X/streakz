import webpush from 'web-push';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { getSubscriptionsForUser, deleteSubscriptionByEndpoint } from '@/services/push/push.service';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.VAPID_EMAIL || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const subscriptions = await getSubscriptionsForUser(session.user.id);
  if (subscriptions.length === 0) {
    return Response.json({ error: 'No subscriptions found for this user' }, { status: 404 });
  }

  const payload = JSON.stringify({
    title: 'Streak Counter',
    body: 'Push notifications are working! 🎉',
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await deleteSubscriptionByEndpoint(sub.endpoint);
        }
        throw err;
      }
    }),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  return Response.json({ ok: true, sent, total: subscriptions.length });
}
