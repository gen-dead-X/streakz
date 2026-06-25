import type { ReactNode } from 'react';
import type { MotionValue } from 'framer-motion';

export interface BottomSheetContextValue {
  sheetY: MotionValue<number>;
  heightMV: MotionValue<number>;
}

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  defaultSnap?: 'full' | 'half';
  title?: string;
}
