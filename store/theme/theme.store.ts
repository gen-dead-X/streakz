import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types/common/theme.types';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'streakz-theme',
      version: 2,
      migrate: (persisted) => {
        return {
          mode: (persisted as { mode?: ThemeMode })?.mode ?? 'system',
        } as ThemeState;
      },
    },
  ),
);
