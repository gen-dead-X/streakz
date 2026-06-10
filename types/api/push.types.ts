export interface SubscribeBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface UnsubscribeBody {
  endpoint: string;
}
