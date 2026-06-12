import webpush from 'web-push';
import { format } from 'date-fns';
import { getAllUsersWithSubscriptions, getSubscriptionsForUser, deleteSubscriptionByEndpoint } from '@/services/push/push.service';
import { getHabitsForUser } from '@/services/habits/habits.service';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.VAPID_EMAIL || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const today = format(new Date(), 'yyyy-MM-dd');
  const userIds = await getAllUsersWithSubscriptions();

  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      const habits = await getHabitsForUser(userId, today);
      const incomplete = habits.filter((h) => !h.isCompletedToday && h.notifications !== false);
      if (!incomplete.length) return;

      const count = incomplete.length;
      const payload = JSON.stringify({
        title: 'Streak Counter',
        body: `${count} habit${count > 1 ? 's' : ''} remaining today — keep your streak alive!`,
      });

      const subscriptions = await getSubscriptionsForUser(userId);
      await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: sub.keys },
              payload,
            );
          } catch (err: unknown) {
            const status = (err as { statusCode?: number }).statusCode;
            // 410 Gone or 404 = subscription is no longer valid
            if (status === 410 || status === 404) {
              await deleteSubscriptionByEndpoint(sub.endpoint);
            }
          }
        }),
      );
    }),
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  return Response.json({ ok: true, processed: userIds.length, failed });
}
