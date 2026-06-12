import { connectDB } from '@/lib/mongoose/connection';
import { HabitModel } from '@/models/Habit';
import { CheckInModel } from '@/models/CheckIn';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isCompletedToday,
  getRecentDots,
} from '@/lib/streak/calculator';
import type { CardStyle, Habit, HabitWithStreak } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';

const CARD_STYLES: CardStyle[] = ['wavy', 'geometric', 'blob'];

function deterministicCardStyle(id: string): CardStyle {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CARD_STYLES[hash % 3];
}

function toPlain(doc: any): Habit {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id: String(obj._id),
    userId: obj.userId,
    name: obj.name,
    icon: obj.icon,
    description: obj.description ?? '',
    tags: obj.tags ?? [],
    cardStyle: obj.cardStyle ?? deterministicCardStyle(String(obj._id)),
    notifications: obj.notifications ?? true,
    frequency: obj.frequency,
    createdAt: obj.createdAt?.toISOString() ?? '',
    archivedAt: obj.archivedAt ? obj.archivedAt.toISOString() : null,
  };
}

export async function getHabitsForUser(
  userId: string,
  today: string,
): Promise<HabitWithStreak[]> {
  await connectDB();
  const habits = await HabitModel.find({ userId, archivedAt: null }).lean();

  const habitIds = habits.map((h: any) => h._id);
  const checkIns = await CheckInModel.find({ habitId: { $in: habitIds } }).lean();

  const checkInsByHabit = new Map<string, string[]>();
  for (const ci of checkIns as any[]) {
    const key = String(ci.habitId);
    if (!checkInsByHabit.has(key)) checkInsByHabit.set(key, []);
    checkInsByHabit.get(key)!.push(ci.date);
  }

  return habits.map((h: any) => {
    const id = String(h._id);
    const dates = checkInsByHabit.get(id) ?? [];
    const habit = toPlain(h);
    return {
      ...habit,
      currentStreak: calculateCurrentStreak(dates, habit.frequency, today),
      longestStreak: calculateLongestStreak(dates, habit.frequency),
      isCompletedToday: isCompletedToday(dates, today),
      recentDots: getRecentDots(dates, today, 7),
    };
  });
}

export async function createHabit(
  userId: string,
  data: CreateHabitInput,
): Promise<Habit> {
  await connectDB();
  const doc = await HabitModel.create({ userId, ...data });
  return toPlain(doc);
}

export async function updateHabit(
  id: string,
  userId: string,
  data: UpdateHabitInput,
): Promise<Habit | null> {
  await connectDB();
  const doc = await HabitModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true },
  );
  return doc ? toPlain(doc) : null;
}

export async function archiveHabit(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const result = await HabitModel.updateOne(
    { _id: id, userId },
    { $set: { archivedAt: new Date() } },
  );
  return result.modifiedCount > 0;
}

export interface CheckInResult {
  ok: true;
  newStreak: number;
  totalCheckIns: number;
  habitName: string;
}

export async function checkIn(
  habitId: string,
  userId: string,
  date: string,
): Promise<CheckInResult | null> {
  await connectDB();
  try {
    await CheckInModel.create({ habitId, userId, date });
  } catch {
    // Duplicate key — already checked in
    return null;
  }

  const habit = await HabitModel.findById(habitId).lean() as { name: string; frequency: { type: string; days: number[] } } | null;
  const allDates = await CheckInModel.find({ habitId }).lean() as { date: string }[];
  const totalCheckIns = await CheckInModel.countDocuments({ userId });

  const newStreak = habit
    ? calculateCurrentStreak(allDates.map((c) => c.date), habit.frequency as Parameters<typeof calculateCurrentStreak>[1], date)
    : 0;

  return {
    ok: true,
    newStreak,
    totalCheckIns,
    habitName: habit?.name ?? '',
  };
}

export async function undoCheckIn(
  habitId: string,
  userId: string,
  date: string,
): Promise<boolean> {
  await connectDB();
  const result = await CheckInModel.deleteOne({ habitId, userId, date });
  return result.deletedCount > 0;
}

export async function getCheckInDatesForMonth(
  userId: string,
  year: number,
  month: number, // 1-based
): Promise<string[]> {
  await connectDB();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const checkIns = await CheckInModel.find({
    userId,
    date: { $gte: start, $lte: end },
  }).lean();

  const unique = [...new Set((checkIns as unknown[]).map((ci) => (ci as { date: string }).date))];
  return unique.sort();
}
