'use client';
import { useEffect } from 'react';
import { Skeleton } from 'antd';
import { StatCard } from '@/components/ui/StatCard';
import { WeeklyBars } from '@/components/ui/WeeklyBars';
import { HeatmapCalendar } from '@/components/ui/HeatmapCalendar';
import { useInsightsStore } from '@/store/insights/insights.store';

export function InsightsSummary() {
  const { stats, loading, fetchInsights } = useInsightsStore();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 3 }} style={{ background: 'var(--color-bg-surface)', borderRadius: 16, padding: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="🔥"
          value={stats.longestStreak}
          label="Longest streak"
          sublabel="all-time best"
        />
        <StatCard
          icon="✅"
          value={stats.totalCheckIns}
          label="Total check-ins"
          sublabel="across all habits"
        />
        <StatCard
          icon="⚡"
          value={stats.activeStreaks}
          label="Active streaks"
          sublabel="going right now"
        />
        <StatCard
          icon="🎯"
          value={`${stats.avgConsistency}%`}
          label="Avg consistency"
          sublabel="last 60 days"
        />
      </div>

      {/* Weekly chart */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-heading)' }}>
            Check-ins per week
          </span>
        </div>
        <WeeklyBars data={stats.weeklyData} />
      </div>

      {/* Heatmap */}
      <HeatmapCalendar />
    </div>
  );
}
