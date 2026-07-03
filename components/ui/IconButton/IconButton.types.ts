import type { ButtonHTMLAttributes, Ref } from 'react';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'surface' | 'ghost' | 'ember';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  ref?: Ref<HTMLButtonElement>;
}
