export interface PushSubscriptionDoc {
  _id: string;
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: string;
}
