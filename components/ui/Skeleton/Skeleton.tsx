import type { SkeletonProps } from './Skeleton.types';

const roundedClasses: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  control: 'rounded-control',
  card: 'rounded-card',
  full: 'rounded-full',
};

export function Skeleton({ width = '100%', height = 16, rounded = 'control', className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-shimmer bg-[var(--skeleton)]',
        roundedClasses[rounded],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width, height }}
    />
  );
}
