'use client';
import { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import { useThemeStore } from '@/store/theme/theme.store';
import { getAntdTheme } from '@/lib/antd-theme';
import type { ResolvedMode } from '@/types/common/theme.types';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, mode } = useThemeStore();
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>('dark');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    function resolve() {
      if (mode === 'system') return mq.matches ? 'dark' : 'light';
      return mode;
    }

    const next = resolve();
    setResolvedMode(next);
    document.documentElement.setAttribute('data-theme', colorScheme);
    document.documentElement.setAttribute('data-mode', next);

    const handler = () => {
      if (mode !== 'system') return;
      const updated = mq.matches ? 'dark' : 'light';
      setResolvedMode(updated);
      document.documentElement.setAttribute('data-mode', updated);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [colorScheme, mode]);

  return (
    <ConfigProvider theme={getAntdTheme(colorScheme, resolvedMode)}>
      {children}
    </ConfigProvider>
  );
}
