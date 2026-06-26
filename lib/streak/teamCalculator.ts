import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from '@/lib/streak/calculator';
import type { Frequency } from '@/types/models/habit.types';

/**
 * Returns the current team streak for a shared habit.
 * A day counts only when EVERY memberId has a check-in for that date.
 */
export function calculateTeamCurrentStreak(
  checkInsByMember: Map<string, string[]>,
  memberIds: string[],
  frequency: Frequency,
  today: string,
): number {
  if (memberIds.length === 0) return 0;
  const teamDates = intersectMemberDates(checkInsByMember, memberIds);
  return calculateCurrentStreak(teamDates, frequency, today);
}

/**
 * Returns the longest team streak ever achieved.
 */
export function calculateTeamLongestStreak(
  checkInsByMember: Map<string, string[]>,
  memberIds: string[],
  frequency: Frequency,
): number {
  if (memberIds.length === 0) return 0;
  const teamDates = intersectMemberDates(checkInsByMember, memberIds);
  return calculateLongestStreak(teamDates, frequency);
}

/**
 * Returns true when every member has a check-in for `date`.
 */
export function isTeamCompletedOnDate(
  checkInsByMember: Map<string, string[]>,
  memberIds: string[],
  date: string,
): boolean {
  return memberIds.every((id) => {
    const dates = checkInsByMember.get(id) ?? [];
    return dates.includes(date);
  });
}

function intersectMemberDates(
  checkInsByMember: Map<string, string[]>,
  memberIds: string[],
): string[] {
  const memberSets = memberIds.map((id) => new Set(checkInsByMember.get(id) ?? []));

  // Union of all dates across all members
  const allDates = new Set<string>();
  for (const set of memberSets) {
    for (const date of set) allDates.add(date);
  }

  // Keep only dates present in every member's set
  return [...allDates].filter((date) => memberSets.every((set) => set.has(date)));
}
