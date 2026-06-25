import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorScheme, ThemeMode } from '@/types/common/theme.types';

interface ThemeState {
  colorScheme: ColorScheme;
  mode: ThemeMode;
  glassOpacity: number;
  setColorScheme: (scheme: ColorScheme) => void;
  setMode: (mode: ThemeMode) => void;
  setGlassOpacity: (opacity: number) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: 'emerald',
      mode: 'system',
      glassOpacity: 0.10,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setMode: (mode) => set({ mode }),
      setGlassOpacity: (glassOpacity) => set({ glassOpacity }),
    }),
    { name: 'streakz-theme' },
  ),
);
