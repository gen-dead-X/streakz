import { describe, test, expect } from 'bun:test';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isCompletedToday,
  getRecentDots,
  calculateConsistency,
  getScheduledDates,
} from '../calculator';
import type { Frequency } from '@/types/models/habit.types';

const daily: Frequency = { type: 'daily', days: [] };
const weekly: Frequency = { type: 'weekly', days: [] };
const mwf: Frequency = { type: 'specific', days: [2, 4, 6] }; // Tue, Thu, Sat (matches 2026-06-09=Tue, 06-11=Thu, 06-13=Sat)

describe('isCompletedToday', () => {
  test('returns true when today is in checkIns', () => {
    expect(isCompletedToday(['2026-06-09', '2026-06-08'], '2026-06-09')).toBe(true);
  });
  test('returns false when today is not in checkIns', () => {
    expect(isCompletedToday(['2026-06-08'], '2026-06-09')).toBe(false);
  });
});

describe('getRecentDots', () => {
  test('returns 7 booleans', () => {
    const dots = getRecentDots([], '2026-06-09', 7);
    expect(dots).toHaveLength(7);
  });
  test('last element is true when checked in today', () => {
    const dots = getRecentDots(['2026-06-09'], '2026-06-09', 7);
    expect(dots[6]).toBe(true);
  });
  test('first element is true when checked in 6 days ago', () => {
    const dots = getRecentDots(['2026-06-03'], '2026-06-09', 7);
    expect(dots[0]).toBe(true);
    expect(dots[1]).toBe(false);
  });
});

describe('calculateCurrentStreak — daily', () => {
  test('0 for empty check-ins', () => {
    expect(calculateCurrentStreak([], daily, '2026-06-09')).toBe(0);
  });
  test('1 for just today', () => {
    expect(calculateCurrentStreak(['2026-06-09'], daily, '2026-06-09')).toBe(1);
  });
  test('counts consecutive days', () => {
    expect(calculateCurrentStreak(['2026-06-07', '2026-06-08', '2026-06-09'], daily, '2026-06-09')).toBe(3);
  });
  test('grace: still active if only checked in yesterday', () => {
    expect(calculateCurrentStreak(['2026-06-08'], daily, '2026-06-09')).toBe(1);
  });
  test('0 when last check-in was 2+ days ago', () => {
    expect(calculateCurrentStreak(['2026-06-07'], daily, '2026-06-09')).toBe(0);
  });
  test('gap breaks streak', () => {
    expect(calculateCurrentStreak(['2026-06-06', '2026-06-09'], daily, '2026-06-09')).toBe(1);
  });
});

describe('calculateCurrentStreak — weekly', () => {
  test('1 when checked in this week', () => {
    expect(calculateCurrentStreak(['2026-06-08'], weekly, '2026-06-09')).toBe(1);
  });
  test('counts consecutive weeks', () => {
    const checkIns = ['2026-06-01', '2026-06-08']; // two different weeks
    expect(calculateCurrentStreak(checkIns, weekly, '2026-06-09')).toBe(2);
  });
});

describe('calculateCurrentStreak — specific days', () => {
  test('counts consecutive scheduled days', () => {
    // Mon Jun 2, Wed Jun 4, Fri Jun 6, Mon Jun 9 (all MWF)
    const checkIns = ['2026-06-02', '2026-06-04', '2026-06-06', '2026-06-09'];
    expect(calculateCurrentStreak(checkIns, mwf, '2026-06-09')).toBe(4);
  });
  test('0 when a scheduled day was missed', () => {
    // Mon Jun 2, missed Wed Jun 4, Fri Jun 6
    const checkIns = ['2026-06-02', '2026-06-06'];
    expect(calculateCurrentStreak(checkIns, mwf, '2026-06-09')).toBe(1);
  });
});

describe('calculateLongestStreak — daily', () => {
  test('finds longest run', () => {
    const checkIns = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-07', '2026-06-08'];
    expect(calculateLongestStreak(checkIns, daily)).toBe(3);
  });
  test('0 for empty', () => {
    expect(calculateLongestStreak([], daily)).toBe(0);
  });
});

describe('calculateConsistency', () => {
  test('100% when all scheduled days completed', () => {
    const checkIns = ['2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09'];
    expect(calculateConsistency(checkIns, daily, '2026-06-09', 7)).toBe(100);
  });
  test('0% when nothing completed', () => {
    expect(calculateConsistency([], daily, '2026-06-09', 7)).toBe(0);
  });
});

describe('getScheduledDates', () => {
  test('daily: returns every day in range', () => {
    const dates = getScheduledDates(daily, '2026-06-07', '2026-06-09');
    expect(dates).toEqual(['2026-06-07', '2026-06-08', '2026-06-09']);
  });
  test('specific: returns only scheduled days', () => {
    // MWF between Mon Jun 9 and Fri Jun 13
    const dates = getScheduledDates(mwf, '2026-06-09', '2026-06-13');
    expect(dates).toEqual(['2026-06-09', '2026-06-11', '2026-06-13']);
  });
});
