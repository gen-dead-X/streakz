import type { Transition } from 'framer-motion';

export const SPRINGS = {
  snappy: { type: 'spring', stiffness: 420, damping: 30 } satisfies Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 26 } satisfies Transition,
  bouncy: { type: 'spring', stiffness: 500, damping: 18 } satisfies Transition,
} as const;

export const DURATIONS = { fast: 0.15, base: 0.25, slow: 0.4 } as const;

export const STAGGER_INTERVAL = 0.04;
