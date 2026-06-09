import mongoose, { Schema, model, models } from 'mongoose';

const CheckInSchema = new Schema(
  {
    habitId: { type: Schema.Types.ObjectId, required: true, ref: 'Habit' },
    userId: { type: String, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
  },
  { timestamps: true },
);

// Prevent double check-ins for same habit on same day
CheckInSchema.index({ habitId: 1, date: 1 }, { unique: true });
// Efficient "all check-ins for user on date" queries
CheckInSchema.index({ userId: 1, date: 1 });

export const CheckInModel = models.CheckIn ?? model('CheckIn', CheckInSchema);
