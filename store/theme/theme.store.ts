import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorScheme, ThemeMode } from '@/types/common/theme.types';

interface ThemeState {
  colorScheme: ColorScheme;
  mode: ThemeMode;
  setColorScheme: (scheme: ColorScheme) => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: 'emerald',
      mode: 'system',
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setMode: (mode) => set({ mode }),
    }),
    { name: 'streakz-theme' },
  ),
);
