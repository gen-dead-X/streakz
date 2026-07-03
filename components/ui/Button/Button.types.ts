import type { ReactNode, Ref } from 'react';

import type { MotionSafeButtonAttributes } from '@/types/common/motion.types';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends MotionSafeButtonAttributes {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}
