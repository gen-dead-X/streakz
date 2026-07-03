'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { SPRINGS } from '@/constants/motion/motion.constants';

import type { IconButtonProps, IconButtonSize, IconButtonVariant } from './IconButton.types';

const variantClasses: Record<IconButtonVariant, string> = {
  surface: 'bg-elevated border border-border-default text-heading hover:brightness-110',
  ghost: 'bg-transparent text-body hover:bg-[var(--brand-soft)] hover:text-heading',
  ember: 'bg-ember text-[var(--brand-foreground)] hover:shadow-ember',
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
};

export function IconButton({
  label,
  size = 'md',
  variant = 'surface',
  disabled,
  className,
  children,
  ref,
  ...rest
}: IconButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const classes = [
    'inline-flex shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      ref={ref}
      type={rest.type ?? 'button'}
      aria-label={label}
      whileTap={disabled || prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={SPRINGS.snappy}
      disabled={disabled}
      className={classes}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
