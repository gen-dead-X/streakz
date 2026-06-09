import { connectDB } from '@/lib/mongoose/connection';
import { HabitModel } from '@/models/Habit';
import { CheckInModel } from '@/models/CheckIn';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateConsistency,
} from '@/lib/streak/calculator';
import type { InsightsResponse, WeeklyDataPoint } from '@/types/api/insights.types';
import { format, subWeeks, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export async function getInsights(
  userId: string,
  today: string,
): Promise<InsightsResponse> {
  await connectDB();

  const habits = await HabitModel.find({ userId, archivedAt: null }).lean();
  const habitIds = habits.map((h: any) => h._id);

  const allCheckIns = await CheckInModel.find({
    userId,
    habitId: { $in: habitIds },
  }).lean();

  const allDates = (allCheckIns as any[]).map((ci) => ci.date as string);
  const totalCheckIns = allDates.length;

  const checkInsByHabit = new Map<string, string[]>();
  for (const ci of allCheckIns as any[]) {
    const key = String(ci.habitId);
    if (!checkInsByHabit.has(key)) checkInsByHabit.set(key, []);
    checkInsByHabit.get(key)!.push(ci.date as string);
  }

  let longestStreak = 0;
  let activeStreaks = 0;
  let totalConsistency = 0;

  for (const habit of habits as any[]) {
    const dates = checkInsByHabit.get(String(habit._id)) ?? [];
    const freq = habit.frequency;
    const current = calculateCurrentStreak(dates, freq, today);
    const longest = calculateLongestStreak(dates, freq);
    const consistency = calculateConsistency(dates, freq, today, 60);

    if (longest > longestStreak) longestStreak = longest;
    if (current > 0) activeStreaks++;
    totalConsistency += consistency;
  }

  const avgConsistency =
    habits.length > 0 ? Math.round(totalConsistency / habits.length) : 0;

  // Weekly data: last 9 weeks oldest first
  const todayDate = parseISO(today);
  const weeklyData: WeeklyDataPoint[] = [];
  for (let i = 8; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(todayDate, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(todayDate, i), { weekStartsOn: 1 });
    const count = allDates.filter((d) =>
      isWithinInterval(parseISO(d), { start: weekStart, end: weekEnd }),
    ).length;
    weeklyData.push({ label: i === 0 ? 'now' : `-${i}`, count });
  }

  const uniqueDates = [...new Set(allDates)].sort();

  return {
    longestStreak,
    totalCheckIns,
    activeStreaks,
    avgConsistency,
    weeklyData,
    checkInDates: uniqueDates,
  };
}
