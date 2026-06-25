import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorScheme, ThemeMode, AppStyle } from '@/types/common/theme.types';

interface ThemeState {
  colorScheme: ColorScheme;
  appStyle: AppStyle;
  mode: ThemeMode;
  glassOpacity: number;
  setColorScheme: (scheme: ColorScheme) => void;
  setAppStyle: (style: AppStyle) => void;
  setMode: (mode: ThemeMode) => void;
  setGlassOpacity: (opacity: number) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: 'emerald',
      appStyle: 'classy',
      mode: 'system',
      glassOpacity: 0.65,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setAppStyle: (appStyle) => set({ appStyle }),
      setMode: (mode) => set({ mode }),
      setGlassOpacity: (glassOpacity) => set({ glassOpacity }),
    }),
    {
      name: 'streakz-theme',
      version: 1,
      migrate: (persisted, version) => {
        const s = persisted as ThemeState;
        if (version < 1 && s.glassOpacity < 0.30) {
          s.glassOpacity = 0.65;
        }
        return s;
      },
    },
  ),
);
