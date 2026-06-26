import { connectDB } from '@/lib/mongoose/connection';
import { HabitModel } from '@/models/Habit';
import { CheckInModel } from '@/models/CheckIn';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isCompletedToday,
  getRecentDots,
} from '@/lib/streak/calculator';
import type { CardStyle, Habit, HabitScope, HabitWithStreak } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput, DaySummary } from '@/types/api/habits.types';
import { ProjectModel } from '@/models/Project';
import {
  calculateTeamCurrentStreak,
  calculateTeamLongestStreak,
  isTeamCompletedOnDate,
} from '@/lib/streak/teamCalculator';

const CARD_STYLES: CardStyle[] = ['wavy', 'geometric', 'blob', 'aurora', 'ember', 'midnight', 'rose'];

function deterministicCardStyle(id: string): CardStyle {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CARD_STYLES[hash % CARD_STYLES.length];
}

function toPlain(doc: any): Habit {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id: String(obj._id),
    userId: obj.userId,
    name: obj.name,
    icon: obj.icon,
    description: obj.description ?? undefined,
    tags: obj.tags ?? [],
    cardStyle: obj.cardStyle ?? deterministicCardStyle(String(obj._id)),
    notifications: obj.notifications ?? true,
    frequency: obj.frequency,
    projectId: obj.projectId ?? null,
    scope: obj.scope ?? 'personal',
    createdAt: obj.createdAt?.toISOString() ?? '',
    archivedAt: obj.archivedAt ? obj.archivedAt.toISOString() : null,
  };
}

export async function getHabitsForUser(
  userId: string,
  today: string,
): Promise<HabitWithStreak[]> {
  await connectDB();

  // 1. Personal habits (projectId = null) + personal habits inside projects
  const ownHabits = await HabitModel.find({ userId, archivedAt: null }).lean();

  // 2. Team habits from projects this user belongs to
  const projects = await ProjectModel.find({ 'members.userId': userId, archivedAt: null }).lean();
  const projectIds = (projects as { _id: unknown }[]).map((p) => String(p._id));

  const teamHabits =
    projectIds.length > 0
      ? await HabitModel.find({
          projectId: { $in: projectIds },
          scope: 'team' as HabitScope,
          archivedAt: null,
        }).lean()
      : [];

  const allHabits = [...ownHabits, ...teamHabits];
  const habitIds  = allHabits.map((h) => (h as { _id: unknown })._id);

  // 3. Fetch ALL check-ins for these habits (all users — needed for team streaks)
  const checkIns = await CheckInModel.find({ habitId: { $in: habitIds } }).lean() as {
    habitId: unknown;
    userId: string;
    date: string;
  }[];

  // Group by habitId → userId → dates[]
  const checkInsByHabitUser = new Map<string, Map<string, string[]>>();
  for (const ci of checkIns) {
    const hKey = String(ci.habitId);
    if (!checkInsByHabitUser.has(hKey)) checkInsByHabitUser.set(hKey, new Map());
    const userMap = checkInsByHabitUser.get(hKey)!;
    if (!userMap.has(ci.userId)) userMap.set(ci.userId, []);
    userMap.get(ci.userId)!.push(ci.date);
  }

  // Build project → memberIds map for team streak calculation
  const projectMemberMap = new Map<string, string[]>();
  for (const p of projects as { _id: unknown; members: { userId: string }[] }[]) {
    projectMemberMap.set(String(p._id), p.members.map((m) => m.userId));
  }

  return allHabits.map((h) => {
    const habit   = toPlain(h);
    const hKey    = habit._id;
    const userMap = checkInsByHabitUser.get(hKey) ?? new Map<string, string[]>();

    if (habit.scope === 'team' && habit.projectId) {
      const memberIds              = projectMemberMap.get(habit.projectId) ?? [];
      const currentStreak          = calculateTeamCurrentStreak(userMap, memberIds, habit.frequency, today);
      const longestStreak          = calculateTeamLongestStreak(userMap, memberIds, habit.frequency);
      const myDates                = userMap.get(userId) ?? [];
      const isTeamMemberDoneToday  = myDates.includes(today);
      const teamCompletedToday     = isTeamCompletedOnDate(userMap, memberIds, today);
      const memberStatus           = memberIds.map((id) => ({
        userId: id,
        isCompletedToday: (userMap.get(id) ?? []).includes(today),
      }));
      return {
        ...habit,
        currentStreak,
        longestStreak,
        isCompletedToday: isTeamMemberDoneToday,
        recentDots: getRecentDots(myDates, today, 7),
        teamCompletedToday,
        memberStatus,
      };
    }

    // Personal habit (with or without projectId)
    const myDates = userMap.get(userId) ?? [];
    return {
      ...habit,
      currentStreak:    calculateCurrentStreak(myDates, habit.frequency, today),
      longestStreak:    calculateLongestStreak(myDates, habit.frequency),
      isCompletedToday: isCompletedToday(myDates, today),
      recentDots:       getRecentDots(myDates, today, 7),
    };
  });
}

export async function getHabitsForProject(
  projectId: string,
  userId: string,
  today: string,
): Promise<HabitWithStreak[]> {
  await connectDB();

  const project = await ProjectModel.findById(projectId).lean() as {
    members: { userId: string }[];
  } | null;
  if (!project) return [];

  const memberIds = project.members.map((m) => m.userId);

  const [teamHabits, myPersonalHabits] = await Promise.all([
    HabitModel.find({ projectId, scope: 'team' as HabitScope, archivedAt: null }).lean(),
    HabitModel.find({ projectId, scope: 'personal' as HabitScope, userId, archivedAt: null }).lean(),
  ]);

  const allHabits = [...teamHabits, ...myPersonalHabits];
  const habitIds  = allHabits.map((h) => (h as { _id: unknown })._id);

  const checkIns = await CheckInModel.find({ habitId: { $in: habitIds } }).lean() as {
    habitId: unknown;
    userId: string;
    date: string;
  }[];

  const checkInsByHabitUser = new Map<string, Map<string, string[]>>();
  for (const ci of checkIns) {
    const hKey = String(ci.habitId);
    if (!checkInsByHabitUser.has(hKey)) checkInsByHabitUser.set(hKey, new Map());
    const userMap = checkInsByHabitUser.get(hKey)!;
    if (!userMap.has(ci.userId)) userMap.set(ci.userId, []);
    userMap.get(ci.userId)!.push(ci.date);
  }

  return allHabits.map((h) => {
    const habit   = toPlain(h);
    const hKey    = habit._id;
    const userMap = checkInsByHabitUser.get(hKey) ?? new Map<string, string[]>();

    if (habit.scope === 'team') {
      const currentStreak      = calculateTeamCurrentStreak(userMap, memberIds, habit.frequency, today);
      const longestStreak      = calculateTeamLongestStreak(userMap, memberIds, habit.frequency);
      const myDates            = userMap.get(userId) ?? [];
      const teamCompletedToday = isTeamCompletedOnDate(userMap, memberIds, today);
      const memberStatus       = memberIds.map((id) => ({
        userId:           id,
        isCompletedToday: (userMap.get(id) ?? []).includes(today),
      }));
      return {
        ...habit,
        currentStreak,
        longestStreak,
        isCompletedToday: myDates.includes(today),
        recentDots:       getRecentDots(myDates, today, 7),
        teamCompletedToday,
        memberStatus,
      };
    }

    const myDates = userMap.get(userId) ?? [];
    return {
      ...habit,
      currentStreak:    calculateCurrentStreak(myDates, habit.frequency, today),
      longestStreak:    calculateLongestStreak(myDates, habit.frequency),
      isCompletedToday: isCompletedToday(myDates, today),
      recentDots:       getRecentDots(myDates, today, 7),
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
  const doc = await HabitModel.findOne({ _id: id, userId });
  if (!doc) return null;

  // Use doc.set() per-path so Mongoose casts + saves every field reliably
  if (data.name        !== undefined) doc.set('name',         data.name);
  if (data.icon        !== undefined) doc.set('icon',         data.icon);
  if (data.description !== undefined) doc.set('description',  data.description);
  if (data.tags        !== undefined) doc.set('tags',         data.tags);
  if (data.cardStyle   !== undefined) doc.set('cardStyle',    data.cardStyle);
  if (data.notifications !== undefined) doc.set('notifications', data.notifications);
  if (data.frequency   !== undefined) doc.set('frequency',    data.frequency);

  await doc.save();
  return toPlain(doc);
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

export async function getWeekSummary(
  userId: string,
  dates: string[],
): Promise<DaySummary[]> {
  await connectDB();

  // Count of currently active habits (non-archived)
  const total = await HabitModel.countDocuments({ userId, archivedAt: null });

  // All check-ins for this user on the requested dates
  const checkIns = await CheckInModel.find({
    userId,
    date: { $in: dates },
  }).lean() as { habitId: unknown; date: string }[];

  // Count distinct habits checked in per date
  const byDate = new Map<string, Set<string>>();
  for (const ci of checkIns) {
    if (!byDate.has(ci.date)) byDate.set(ci.date, new Set());
    byDate.get(ci.date)!.add(String(ci.habitId));
  }

  return dates.map((date) => ({
    date,
    total,
    completed: byDate.get(date)?.size ?? 0,
  }));
}
