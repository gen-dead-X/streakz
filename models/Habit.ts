import mongoose, { Schema, model, models } from 'mongoose';

const FrequencySchema = new Schema(
  {
    type: { type: String, enum: ['daily', 'weekly', 'specific'], required: true },
    days: { type: [Number], default: [] },
  },
  { _id: false },
);

const HabitSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, maxlength: 50, trim: true },
    icon: { type: String, required: true },
    frequency: { type: FrequencySchema, required: true },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const HabitModel = models.Habit ?? model('Habit', HabitSchema);
