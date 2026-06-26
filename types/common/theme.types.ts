export type ColorScheme =
  | 'emerald'
  | 'amber'
  | 'sunset'
  | 'violet'
  | 'sage'
  | 'sky'
  | 'ocean'
  | 'teal';

/** Visual treatment — independent of color scheme */
export type AppStyle = 'classy' | 'glassy';

export type ThemeMode = 'system' | 'light' | 'dark';

export type ResolvedMode = 'light' | 'dark';

export interface ThemeMeta {
  id: ColorScheme;
  name: string;
  /** Hex color shown in the swatch picker */
  swatch: string;
}
