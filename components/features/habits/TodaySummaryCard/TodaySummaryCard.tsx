'use client';
import { Card, Progress, Typography } from 'antd';
import { Flame, Trophy } from 'lucide-react';

const { Text } = Typography;

interface TodaySummaryCardProps {
  total: number;
  completed: number;
  pct: number;
  longestActive: number;
}

export function TodaySummaryCard({ total, completed, pct, longestActive }: TodaySummaryCardProps) {
  if (total === 0) return null;

  return (
    <Card
      bordered={false}
      style={{ background: 'var(--color-bg-surface)', borderRadius: 20 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={20} style={{ color: 'var(--color-brand)' }} />
            <Text strong style={{ fontSize: 17, color: 'var(--color-text-heading)' }}>
              {total - completed > 0
                ? `${total - completed} ${total - completed === 1 ? 'habit' : 'habits'} left today`
                : 'All done today! 🎉'}
            </Text>
          </div>
          {longestActive > 0 && (
            <div className="flex items-center gap-1">
              <Trophy size={13} style={{ color: 'var(--color-warning)' }} />
              <Text style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Longest run going: {longestActive} days
              </Text>
            </div>
          )}
        </div>
        <Text style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>
          {completed}/{total}
        </Text>
      </div>
      <Progress
        percent={pct}
        strokeColor="var(--color-brand)"
        railColor="var(--color-bg-elevated)"
        showInfo={false}
        strokeWidth={8}
        style={{ borderRadius: 99 }}
      />
    </Card>
  );
}
