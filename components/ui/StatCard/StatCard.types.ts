import type { ReactNode } from 'react';

export interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  sublabel: string;
}
