import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

/**
 * Static default AntD theme for the Ink & Ember brand.
 * Tokens reference CSS variables from `app/globals.css` so AntD surfaces
 * automatically track light/dark `data-mode` switches.
 *
 * This is intentionally minimal — AntD is removed entirely in Task 15.
 */
const sharedTokens = {
  colorPrimary: 'var(--color-brand)',
  colorSuccess: 'var(--color-success)',
  colorWarning: 'var(--color-warning)',
  colorError: 'var(--color-error)',
  colorInfo: 'var(--color-violet)',
  colorBgBase: 'var(--color-page)',
  colorBgContainer: 'var(--color-surface)',
  colorBgElevated: 'var(--color-elevated)',
  colorBgLayout: 'var(--color-sunken)',
  colorText: 'var(--color-body)',
  colorTextSecondary: 'var(--color-muted)',
  colorBorder: 'var(--color-border-default)',
  colorBorderSecondary: 'var(--color-border-subtle)',
  borderRadius: 14,
  borderRadiusSM: 8,
  borderRadiusLG: 24,
  borderRadiusXS: 4,
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  motionDurationMid: '150ms',
  motionDurationSlow: '250ms',
} as const;

export const antdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: sharedTokens,
};
