import type { Ref } from 'react';

import type { MotionSafeButtonAttributes } from '@/types/common/motion.types';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'surface' | 'ghost' | 'ember';

export interface IconButtonProps extends MotionSafeButtonAttributes {
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  ref?: Ref<HTMLButtonElement>;
}
