'use client';

import { LoaderCircle } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { SPRINGS } from '@/constants/motion/motion.constants';

import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-ember text-[var(--brand-foreground)] font-medium hover:shadow-ember',
  secondary:
    'bg-elevated border border-border-default text-heading font-medium hover:bg-[var(--bg-elevated)] hover:brightness-110',
  ghost: 'bg-transparent text-body font-medium hover:bg-[var(--brand-soft)] hover:text-heading',
  destructive:
    'bg-[var(--error-subtle)] text-[var(--error-default)] border border-transparent font-medium hover:border-[var(--error-default)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

const spinnerSize: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  const classes = [
    'inline-flex items-center justify-center rounded-control transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      ref={ref}
      type={rest.type ?? 'button'}
      whileTap={isDisabled || prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={SPRINGS.snappy}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classes}
      {...rest}
    >
      {loading ? (
        <LoaderCircle className="animate-spin" size={spinnerSize[size]} aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  );
}
