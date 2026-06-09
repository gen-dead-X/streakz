'use client';
import { Typography } from 'antd';
import type { WeeklyBarsProps } from './WeeklyBars.types';

const { Text } = Typography;

export function WeeklyBars({ data }: WeeklyBarsProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1" style={{ height: 100 }}>
      {data.map((point, i) => {
        const isNow = point.label === 'now';
        const heightPct = max > 0 ? (point.count / max) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end gap-1"
          >
            {point.count > 0 && (
              <Text style={{ fontSize: 10, color: isNow ? 'var(--color-brand)' : 'var(--color-text-muted)' }}>
                {point.count}
              </Text>
            )}
            <div
              style={{
                width: '100%',
                height: `${Math.max(heightPct, 8)}%`,
                borderRadius: '4px 4px 0 0',
                background: isNow ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
                minHeight: 8,
                transition: 'height 0.3s ease',
              }}
            />
            <Text style={{ fontSize: 9, color: isNow ? 'var(--color-brand)' : 'var(--color-text-muted)' }}>
              {point.label}
            </Text>
          </div>
        );
      })}
    </div>
  );
}
