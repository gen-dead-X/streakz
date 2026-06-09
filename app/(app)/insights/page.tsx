import { InsightsSummary } from '@/components/features/insights/InsightsSummary';

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-4">
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
    </div>
  );
}
