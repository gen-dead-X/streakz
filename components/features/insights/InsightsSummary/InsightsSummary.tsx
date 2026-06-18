'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';
import { StatCard } from '@/components/ui/StatCard';
import { WeeklyBars } from '@/components/ui/WeeklyBars';
import { PageLoader } from '@/components/ui/PageLoader';
import { useInsightsStore } from '@/store/insights/insights.store';

// HeatmapCalendar makes 3 separate month-summary API calls and uses window.matchMedia.
// Lazy-load it so it doesn't block the stat cards and weekly bars from rendering first.
const HeatmapCalendar = dynamic(
  () => import('@/components/ui/HeatmapCalendar').then((m) => ({ default: m.HeatmapCalendar })),
  { ssr: false, loading: () => <PageLoader variant="section" size={80} /> },
);

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

      {/* Heatmap — loaded independently so stat cards render first */}
      <HeatmapCalendar />
    </div>
  );
}
