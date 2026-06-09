import {
  parseISO,
  subDays,
  format,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  addDays,
  isWithinInterval,
  isSameDay,
} from 'date-fns';
import type { Frequency } from '@/types/models/habit.types';

function fmt(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function parse(dateStr: string): Date {
  return parseISO(dateStr);
}

export function getScheduledDates(
  frequency: Frequency,
  from: string,
  to: string,
): string[] {
  const fromDate = parse(from);
  const toDate = parse(to);
  const dates: string[] = [];
  let current = fromDate;

  if (frequency.type === 'daily') {
    while (current <= toDate) {
      dates.push(fmt(current));
      current = addDays(current, 1);
    }
  } else if (frequency.type === 'specific') {
    while (current <= toDate) {
      if (frequency.days.includes(current.getDay())) {
        dates.push(fmt(current));
      }
      current = addDays(current, 1);
    }
  } else if (frequency.type === 'weekly') {
    let weekStart = startOfWeek(fromDate, { weekStartsOn: 1 });
    while (weekStart <= toDate) {
      dates.push(fmt(weekStart));
      weekStart = addDays(weekStart, 7);
    }
  }

  return dates;
}

export function isCompletedToday(checkIns: string[], today: string): boolean {
  return checkIns.includes(today);
}

export function getRecentDots(
  checkIns: string[],
  today: string,
  count = 7,
): boolean[] {
  const set = new Set(checkIns);
  const todayDate = parse(today);
  const dots: boolean[] = [];
  for (let i = count - 1; i >= 0; i--) {
    dots.push(set.has(fmt(subDays(todayDate, i))));
  }
  return dots;
}

export function calculateCurrentStreak(
  checkIns: string[],
  frequency: Frequency,
  today: string,
): number {
  if (checkIns.length === 0) return 0;
  const set = new Set(checkIns);
  const todayDate = parse(today);

  if (frequency.type === 'daily') {
    const hasToday = set.has(today);
    const yesterday = fmt(subDays(todayDate, 1));
    if (!hasToday && !set.has(yesterday)) return 0;
    let streak = 0;
    let cur = hasToday ? todayDate : subDays(todayDate, 1);
    while (set.has(fmt(cur))) {
      streak++;
      cur = subDays(cur, 1);
    }
    return streak;
  }

  if (frequency.type === 'specific') {
    const { days } = frequency;
    let streak = 0;
    let cur = todayDate;
    for (let i = 0; i < 365; i++) {
      const dateStr = fmt(cur);
      if (days.includes(cur.getDay())) {
        if (set.has(dateStr)) {
          streak++;
        } else if (streak === 0 && isSameDay(cur, todayDate)) {
          // grace: today is scheduled but not yet checked in
        } else {
          break;
        }
      }
      cur = subDays(cur, 1);
    }
    return streak;
  }

  if (frequency.type === 'weekly') {
    let streak = 0;
    let weekStart = startOfWeek(todayDate, { weekStartsOn: 1 });
    for (let i = 0; i < 52; i++) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const hasCheckIn = checkIns.some((d) =>
        isWithinInterval(parse(d), { start: weekStart, end: weekEnd }),
      );
      if (hasCheckIn) {
        streak++;
      } else if (i === 0) {
        // grace: current week hasn't ended
      } else {
        break;
      }
      weekStart = subDays(weekStart, 7);
    }
    return streak;
  }

  return 0;
}

export function calculateLongestStreak(
  checkIns: string[],
  frequency: Frequency,
): number {
  if (checkIns.length === 0) return 0;
  const sorted = [...new Set(checkIns)].sort();

  if (frequency.type === 'daily') {
    let maxRun = 1;
    let currentRun = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInDays(parse(sorted[i]), parse(sorted[i - 1]));
      if (diff === 1) {
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else {
        currentRun = 1;
      }
    }
    return sorted.length === 0 ? 0 : maxRun;
  }

  if (frequency.type === 'specific') {
    const scheduled = getScheduledDates(
      frequency,
      sorted[0],
      sorted[sorted.length - 1],
    );
    const set = new Set(sorted);
    let maxRun = 0;
    let currentRun = 0;
    for (const date of scheduled) {
      if (set.has(date)) {
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else {
        currentRun = 0;
      }
    }
    return maxRun;
  }

  if (frequency.type === 'weekly') {
    const from = parse(sorted[0]);
    const to = parse(sorted[sorted.length - 1]);
    let maxRun = 0;
    let currentRun = 0;
    let weekStart = startOfWeek(from, { weekStartsOn: 1 });
    while (weekStart <= to) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const has = sorted.some((d) =>
        isWithinInterval(parse(d), { start: weekStart, end: weekEnd }),
      );
      if (has) {
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else {
        currentRun = 0;
      }
      weekStart = addDays(weekStart, 7);
    }
    return maxRun;
  }

  return 0;
}

export function calculateConsistency(
  checkIns: string[],
  frequency: Frequency,
  today: string,
  days = 60,
): number {
  const from = fmt(subDays(parse(today), days - 1));
  const scheduled = getScheduledDates(frequency, from, today);
  if (scheduled.length === 0) return 0;
  const set = new Set(checkIns);
  const completed = scheduled.filter((d) => set.has(d)).length;
  return Math.round((completed / scheduled.length) * 100);
}
