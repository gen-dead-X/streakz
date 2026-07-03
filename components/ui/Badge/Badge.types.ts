import type { ReactNode } from 'react';

export type BadgeTone = 'brand' | 'violet' | 'success' | 'warning' | 'error' | 'neutral';

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}
