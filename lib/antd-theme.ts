import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

// Hex values derived from docs/theme.md HSL brand tokens
const tokens = {
  brandGreen: '#1DB954',    // hsl(141,73%,42%)
  success:    '#20974C',    // hsl(142,65%,36%)
  warning:    '#F29E0D',    // hsl(38,90%,50%)
  error:      '#EF4343',    // hsl(0,84%,60%)
  info:       '#3D84F5',    // hsl(217,90%,60%)
  bgPage:     '#121212',    // hsl(0,0%,7%)
  bgSurface:  '#171717',    // hsl(0,0%,9%)
  bgElevated: '#292929',    // hsl(0,0%,16%)
  bgSunken:   '#080808',    // hsl(0,0%,3%)
  textBody:   '#B3B3B3',    // hsl(0,0%,70%)
  textMuted:  '#878787',    // hsl(180,0%,53%)
} as const;

export const antdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Brand
    colorPrimary:           tokens.brandGreen,
    colorSuccess:           tokens.success,
    colorWarning:           tokens.warning,
    colorError:             tokens.error,
    colorInfo:              tokens.info,

    // Backgrounds
    colorBgBase:            tokens.bgPage,
    colorBgContainer:       tokens.bgSurface,
    colorBgElevated:        tokens.bgElevated,
    colorBgLayout:          tokens.bgSunken,

    // Text
    colorText:              tokens.textBody,
    colorTextSecondary:     tokens.textMuted,

    // Border radius from theme.md
    borderRadius:   6,   // --radius-md
    borderRadiusSM: 4,   // --radius-sm
    borderRadiusLG: 8,   // --radius-lg
    borderRadiusXS: 2,

    // Typography — matches --font-family-sans loaded via next/font
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 14,

    // Subtle motion
    motionDurationMid: '150ms',
    motionDurationSlow: '200ms',
  },
};
