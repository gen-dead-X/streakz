import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongoose/connection';
import { AchievementModel } from '@/models/Achievement';
import { HabitModel } from '@/models/Habit';
import {
  STREAK_THRESHOLDS,
  CHECKIN_THRESHOLDS,
} from '@/constants/achievements/achievement.constants';
import type { Achievement } from '@/types/models/achievement.types';
import type { AchievementType } from '@/constants/achievements/achievement.constants';

function toPlain(doc: unknown): Achievement {
  const obj = (doc as { toObject?: () => Record<string, unknown> }).toObject?.() ?? (doc as Record<string, unknown>);
  return {
    _id:        String(obj._id),
    userId:     String(obj.userId),
    type:       obj.type as AchievementType,
    habitId:    obj.habitId ? String(obj.habitId) : undefined,
    habitName:  obj.habitName as string | undefined,
    unlockedAt: (obj.unlockedAt as Date).toISOString(),
  };
}

export async function checkAndUnlockAchievements(
  userId: string,
  habitId: string,
  habitName: string,
  newStreak: number,
  totalCheckIns: number,
): Promise<Achievement[]> {
  await connectDB();
  const unlocked: Achievement[] = [];

  // Streak milestones — keyed per habit
  for (const { type, days } of STREAK_THRESHOLDS) {
    if (newStreak >= days) {
      try {
        const doc = await AchievementModel.create({
          userId,
          type,
          habitId: new mongoose.Types.ObjectId(habitId),
          habitName,
          unlockedAt: new Date(),
        });
        unlocked.push(toPlain(doc));
      } catch {
        // Duplicate key — already unlocked, not an error
      }
    }
  }

  // Check-in count milestones — global per user
  for (const { type, count } of CHECKIN_THRESHOLDS) {
    if (totalCheckIns >= count) {
      try {
        const doc = await AchievementModel.create({
          userId,
          type,
          habitId: null,
          habitName: null,
          unlockedAt: new Date(),
        });
        unlocked.push(toPlain(doc));
      } catch {
        // Duplicate key — already unlocked
      }
    }
  }

  return unlocked;
}

export async function checkFirstHabitAchievement(userId: string): Promise<Achievement | null> {
  await connectDB();
  const count = await HabitModel.countDocuments({ userId, archivedAt: null });
  if (count !== 1) return null;

  try {
    const doc = await AchievementModel.create({
      userId,
      type: 'first_habit',
      habitId: null,
      habitName: null,
      unlockedAt: new Date(),
    });
    return toPlain(doc);
  } catch {
    return null;
  }
}

export async function getAchievementsForUser(userId: string): Promise<Achievement[]> {
  await connectDB();
  const docs = await AchievementModel.find({ userId }).sort({ unlockedAt: 1 }).lean();
  return docs.map(toPlain);
}
