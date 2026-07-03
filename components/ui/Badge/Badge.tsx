import type { BadgeProps, BadgeTone } from './Badge.types';

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-soft text-brand',
  violet: 'bg-violet-soft text-violet',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  error: 'bg-error-subtle text-error',
  neutral: 'bg-elevated text-muted',
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
