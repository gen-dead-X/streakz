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

/* Glass-adapted antd tokens — semi-transparent so backdrop-filter shows through */
const glassyDarkBase = {
  colorBgBase:      '#0A110A',
  colorBgContainer: 'rgba(20, 32, 22, 0.55)',
  colorBgElevated:  'rgba(30, 46, 32, 0.65)',
  colorBgLayout:    'rgba(6, 12, 8, 0.40)',
  colorText:        '#D2D2D2',
  colorTextSecondary: '#8C8C8C',
} as const;

const glassyLightBase = {
  colorBgBase:      '#EDF5F1',
  colorBgContainer: 'rgba(255, 255, 255, 0.62)',
  colorBgElevated:  'rgba(255, 255, 255, 0.78)',
  colorBgLayout:    'rgba(238, 248, 242, 0.50)',
  colorText:        '#1A2A20',
  colorTextSecondary: '#5A7A68',
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

  const base = scheme === 'glassy'
    ? (isDark ? glassyDarkBase : glassyLightBase)
    : (isDark ? darkBase : lightBase);

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
