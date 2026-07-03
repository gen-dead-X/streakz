import type { ButtonHTMLAttributes } from 'react';

/**
 * Native button attributes minus the DOM event handlers whose types structurally
 * conflict with framer-motion's own drag/animation props on `motion.button`
 * (framer-motion redefines `onDrag`/`onDragStart`/`onDragEnd` with pan-gesture
 * signatures and `onAnimationStart`/`onAnimationEnd`/`onAnimationIteration` with
 * its own animation-lifecycle signatures).
 *
 * Extend this instead of `ButtonHTMLAttributes<HTMLButtonElement>` for any
 * component that spreads its rest props onto a `motion.button`.
 */
export type MotionSafeButtonAttributes = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;
