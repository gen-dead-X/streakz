import type { ColorScheme, ThemeMeta } from '@/types/common/theme.types';

export const THEMES: ThemeMeta[] = [
  { id: 'emerald', name: 'Emerald',  swatch: '#1DB954' },
  { id: 'amber',   name: 'Amber',    swatch: '#F5BE2A' },
  { id: 'sunset',  name: 'Sunset',   swatch: '#F07039' },
  { id: 'violet',  name: 'Violet',   swatch: '#9B73F5' },
  { id: 'sage',    name: 'Sage',     swatch: '#41A882' },
  { id: 'sky',     name: 'Sky',      swatch: '#1DAFD4' },
  { id: 'ocean',   name: 'Ocean',    swatch: '#3B8BEF' },
  { id: 'teal',    name: 'Teal',     swatch: '#1DB59E' },
  { id: 'classy',  name: 'Classy',   swatch: '#DEAD32' },
];

/** Hex primary color per scheme per mode — fed into antd colorPrimary */
export const SCHEME_PRIMARY: Record<ColorScheme, { dark: string; light: string }> = {
  emerald: { dark: '#1DB954', light: '#18943F' },
  amber:   { dark: '#F5BE2A', light: '#C48808' },
  sunset:  { dark: '#F07039', light: '#C44E10' },
  violet:  { dark: '#9B73F5', light: '#6B3FD4' },
  sage:    { dark: '#41A882', light: '#2E8A68' },
  sky:     { dark: '#1DAFD4', light: '#0D8DAE' },
  ocean:   { dark: '#3B8BEF', light: '#1A6ED8' },
  teal:    { dark: '#1DB59E', light: '#0D9484' },
  classy:  { dark: '#DEAD32', light: '#C4921C' },
};
