'use client';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/theme/theme.store';
import { MODE_OPTIONS } from '@/constants/themes/themes.constants';
import type { ThemeMode } from '@/types/common/theme.types';

const MODE_ICONS: Record<ThemeMode, typeof Monitor> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

/**
 * Minimal mode-only appearance section — single Ember brand, no color scheme
 * or glass-style pickers. Fully rebuilt in Task 13.
 */
export function AppearanceSection() {
  const { mode, setMode } = useThemeStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          Appearance
        </p>
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-heading)', fontSize: 18, fontWeight: 700 }}>
          Mode
        </h3>

        <div style={{
          display: 'flex', background: 'var(--color-elevated)',
          borderRadius: 14, padding: 4, gap: 4,
        }}>
          {MODE_OPTIONS.map(({ id, name }) => {
            const Icon = MODE_ICONS[id];
            const active = mode === id;
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                aria-pressed={active}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: active ? 'var(--color-surface)' : 'transparent',
                  color: active ? 'var(--color-heading)' : 'var(--color-muted)',
                  fontWeight: active ? 600 : 400, fontSize: 13,
                  boxShadow: active ? 'var(--shadow-soft)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
