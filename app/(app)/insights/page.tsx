import { InsightsSummary } from '@/components/features/insights/InsightsSummary';
import { AchievementGrid } from '@/components/features/achievements/AchievementGrid';

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: 0,
          }}
        >
          Your Momentum
        </p>
        <h2
          style={{
            margin: 0,
            color: 'var(--color-text-heading)',
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Insights
        </h2>
      </div>
      <InsightsSummary />
      <div>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 4px',
          }}
        >
          Milestones
        </p>
        <h3
          style={{
            margin: '0 0 16px',
            color: 'var(--color-text-heading)',
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Achievements
        </h3>
        <AchievementGrid />
      </div>
    </div>
  );
}
