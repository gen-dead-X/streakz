import { Schema, model, models } from 'mongoose';

const PushSubscriptionSchema = new Schema(
  {
    userId:   { type: String, required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
  },
  { timestamps: true },
);

export const PushSubscriptionModel =
  models.PushSubscription ?? model('PushSubscription', PushSubscriptionSchema);
