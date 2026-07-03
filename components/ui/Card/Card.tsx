'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { KeyboardEvent } from 'react';

import { SPRINGS } from '@/constants/motion/motion.constants';

import type { CardPadding, CardProps, CardVariant } from './Card.types';

const variantClasses: Record<CardVariant, string> = {
  surface: 'bg-surface border border-border-subtle edge-highlight',
  elevated: 'bg-elevated border border-border-subtle edge-highlight shadow-soft',
  interactive: 'bg-elevated border border-border-subtle edge-highlight shadow-soft',
};

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ variant = 'surface', padding = 'md', className, children, onClick }: CardProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses = [
    'rounded-card',
    variantClasses[variant],
    paddingClasses[padding],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (!onClick) {
    return <div className={baseClasses}>{children}</div>;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      transition={SPRINGS.snappy}
      className={`${baseClasses} cursor-pointer`}
    >
      {children}
    </motion.div>
  );
}
