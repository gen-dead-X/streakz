export interface WeeklyDataPoint {
  label: string;  // '-8', '-7', ..., '-1', 'now'
  count: number;
}

export interface InsightsResponse {
  longestStreak: number;
  totalCheckIns: number;
  activeStreaks: number;
  avgConsistency: number; // 0-100, percentage over last 60 days
  weeklyData: WeeklyDataPoint[]; // 9 entries, oldest first
  checkInDates: string[]; // all 'YYYY-MM-DD' strings for heatmap
}
