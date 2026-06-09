'use client';
import { Typography } from 'antd';
import type { StatCardProps } from './StatCard.types';

const { Text } = Typography;

export function StatCard({ icon, value, label, sublabel }: StatCardProps) {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-4"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid rgba(255,255,255,0.05)',
        minHeight: 110,
      }}
    >
      <span style={{ fontSize: 26 }}>{icon}</span>
      <Text
        strong
        style={{ fontSize: 32, color: 'var(--color-text-heading)', lineHeight: 1, display: 'block' }}
      >
        {value}
      </Text>
      <div>
        <Text style={{ fontSize: 14, color: 'var(--color-text-body)', display: 'block', lineHeight: 1.3 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sublabel}</Text>
      </div>
    </div>
  );
}
