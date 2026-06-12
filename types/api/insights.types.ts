export interface WeeklyDataPoint {
  label: string;
  count: number;
}

export type CalendarDots = Record<string, { completed: number; missed: number }>;
export type HabitsByDate = Record<string, Array<{ name: string; completed: boolean }>>;

export interface InsightsResponse {
  longestStreak: number;
  totalCheckIns: number;
  activeStreaks: number;
  avgConsistency: number;
  weeklyData: WeeklyDataPoint[];
  checkInDates: string[];
  missedDates: string[];
  calendarDots: CalendarDots;
  habitsByDate: HabitsByDate;
}
