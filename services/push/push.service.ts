import { connectDB } from '@/lib/mongoose/connection';
import { PushSubscriptionModel } from '@/models/PushSubscription';
import type { SubscribeBody } from '@/types/api/push.types';
import type { PushSubscriptionDoc } from '@/types/models/push-subscription.types';

function toPlain(doc: unknown): PushSubscriptionDoc {
  const obj = (doc as { toObject?: () => Record<string, unknown> }).toObject?.() ?? (doc as Record<string, unknown>);
  return {
    _id:      String(obj._id),
    userId:   String(obj.userId),
    endpoint: String(obj.endpoint),
    keys:     obj.keys as { p256dh: string; auth: string },
    createdAt: (obj.createdAt as Date).toISOString(),
  };
}

export async function saveSubscription(userId: string, sub: SubscribeBody): Promise<void> {
  await connectDB();
  await PushSubscriptionModel.findOneAndUpdate(
    { endpoint: sub.endpoint },
    { userId, endpoint: sub.endpoint, keys: sub.keys },
    { upsert: true, new: true },
  );
}

export async function deleteSubscription(userId: string, endpoint: string): Promise<void> {
  await connectDB();
  await PushSubscriptionModel.deleteOne({ userId, endpoint });
}

export async function deleteAllSubscriptionsForUser(userId: string): Promise<void> {
  await connectDB();
  await PushSubscriptionModel.deleteMany({ userId });
}

export async function getSubscriptionsForUser(userId: string): Promise<PushSubscriptionDoc[]> {
  await connectDB();
  const docs = await PushSubscriptionModel.find({ userId }).lean();
  return docs.map(toPlain);
}

export async function getAllUsersWithSubscriptions(): Promise<string[]> {
  await connectDB();
  return PushSubscriptionModel.distinct('userId') as Promise<string[]>;
}

export async function deleteSubscriptionByEndpoint(endpoint: string): Promise<void> {
  await connectDB();
  await PushSubscriptionModel.deleteOne({ endpoint });
}
