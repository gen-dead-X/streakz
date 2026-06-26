'use client';
import { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import { useThemeStore } from '@/store/theme/theme.store';
import { getAntdTheme } from '@/lib/antd-theme';
import type { ResolvedMode } from '@/types/common/theme.types';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, appStyle, mode, glassOpacity } = useThemeStore();
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
    document.documentElement.setAttribute('data-style', appStyle);
    document.documentElement.setAttribute('data-mode', next);

    const handler = () => {
      if (mode !== 'system') return;
      const updated = mq.matches ? 'dark' : 'light';
      setResolvedMode(updated);
      document.documentElement.setAttribute('data-mode', updated);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [colorScheme, appStyle, mode]);

  useEffect(() => {
    if (appStyle === 'glassy') {
      document.documentElement.style.setProperty('--glass-opacity', String(glassOpacity));
      // Set derived values directly so inline-style backdrop-filter repaints reliably
      // (browsers don't always repaint when only an upstream CSS var changes via JS)
      document.documentElement.style.setProperty('--glass-blur', `${glassOpacity * 36}px`);
      document.documentElement.style.setProperty('--glass-saturation', '185%');
    } else {
      document.documentElement.style.removeProperty('--glass-opacity');
      document.documentElement.style.removeProperty('--glass-blur');
      document.documentElement.style.removeProperty('--glass-saturation');
    }
  }, [appStyle, glassOpacity]);

  return (
    <ConfigProvider theme={getAntdTheme(colorScheme, resolvedMode, appStyle)}>
      {children}
    </ConfigProvider>
  );
}
