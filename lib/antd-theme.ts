import type { ThemeConfig } from 'antd';
import { theme } from 'antd';
import type { ColorScheme, ResolvedMode } from '@/types/common/theme.types';
import { SCHEME_PRIMARY } from '@/constants/themes/themes.constants';

const darkBase = {
  colorBgBase:      '#121212',
  colorBgContainer: '#171717',
  colorBgElevated:  '#292929',
  colorBgLayout:    '#080808',
  colorText:        '#B3B3B3',
  colorTextSecondary: '#878787',
} as const;

const lightBase = {
  colorBgBase:      '#F3F4F8',
  colorBgContainer: '#FFFFFF',
  colorBgElevated:  '#EAEBF0',
  colorBgLayout:    '#EAEBF0',
  colorText:        '#2A2A2A',
  colorTextSecondary: '#6A6A6A',
} as const;

const sharedTokens = {
  colorSuccess:  '#20974C',
  colorWarning:  '#F29E0D',
  colorError:    '#EF4343',
  colorInfo:     '#3D84F5',
  borderRadius:   6,
  borderRadiusSM: 4,
  borderRadiusLG: 8,
  borderRadiusXS: 2,
  fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
  fontSize: 14,
  motionDurationMid:  '150ms',
  motionDurationSlow: '200ms',
} as const;

export function getAntdTheme(scheme: ColorScheme, mode: ResolvedMode): ThemeConfig {
  const isDark = mode === 'dark';
  const colorPrimary = SCHEME_PRIMARY[scheme][mode];
  const base = isDark ? darkBase : lightBase;

  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary,
      ...sharedTokens,
      ...base,
    },
  };
}

/** Static fallback used by providers before store hydrates */
export const antdTheme = getAntdTheme('emerald', 'dark');
