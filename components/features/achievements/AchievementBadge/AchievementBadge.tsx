'use client';
import { Tooltip } from 'antd';
import { format } from 'date-fns';
import { ACHIEVEMENT_META } from '@/constants/achievements/achievement.constants';
import type { AchievementBadgeProps } from './AchievementBadge.types';

export function AchievementBadge({ type, unlocked, habitName, unlockedAt, className }: AchievementBadgeProps) {
  const meta = ACHIEVEMENT_META[type];

  const tooltipTitle = unlocked
    ? `${meta.description}${habitName ? ` (${habitName})` : ''}${unlockedAt ? ` · ${format(new Date(unlockedAt), 'MMM d, yyyy')}` : ''}`
    : meta.description;

  return (
    <Tooltip title={tooltipTitle} placement="top">
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: '16px 8px',
          borderRadius: 12,
          background: unlocked ? 'var(--color-bg-elevated)' : 'var(--color-bg-sunken)',
          border: `1px solid ${unlocked ? 'var(--color-brand)' : 'transparent'}`,
          boxShadow: unlocked ? 'var(--shadow-brand)' : 'none',
          opacity: unlocked ? 1 : 0.4,
          filter: unlocked ? 'none' : 'grayscale(1)',
          cursor: 'default',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          minWidth: 80,
        }}
      >
        <span style={{ fontSize: 28, lineHeight: 1 }}>{meta.icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: unlocked ? 'var(--color-text-heading)' : 'var(--color-text-muted)',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {meta.label}
        </span>
      </div>
    </Tooltip>
  );
}
