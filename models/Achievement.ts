import mongoose, { Schema, model, models } from 'mongoose';

const AchievementSchema = new Schema(
  {
    userId:    { type: String,               required: true, index: true },
    type:      { type: String,               required: true },
    habitId:   { type: mongoose.Types.ObjectId, default: null },
    habitName: { type: String,               default: null },
    unlockedAt: { type: Date,                default: () => new Date() },
  },
  { timestamps: false },
);

// sparse: true so null habitId doesn't conflict across multiple global achievements
AchievementSchema.index({ userId: 1, type: 1, habitId: 1 }, { unique: true, sparse: true });

export const AchievementModel = models.Achievement ?? model('Achievement', AchievementSchema);
