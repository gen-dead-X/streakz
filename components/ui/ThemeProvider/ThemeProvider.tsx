'use client';
import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useThemeStore } from '@/store/theme/theme.store';
import { antdTheme } from '@/lib/antd-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    function apply() {
      const resolved = mode === 'system' ? (mq.matches ? 'dark' : 'light') : mode;
      document.documentElement.dataset.mode = resolved;
    }

    apply();

    function handler() {
      if (mode === 'system') apply();
    }

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
}
