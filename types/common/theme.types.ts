export type ColorScheme =
  | 'emerald'
  | 'amber'
  | 'sunset'
  | 'violet'
  | 'sage'
  | 'sky'
  | 'ocean'
  | 'teal'
  | 'classy';

export type ThemeMode = 'system' | 'light' | 'dark';

export type ResolvedMode = 'light' | 'dark';

export interface ThemeMeta {
  id: ColorScheme;
  name: string;
  /** Hex color shown in the swatch picker */
  swatch: string;
}
