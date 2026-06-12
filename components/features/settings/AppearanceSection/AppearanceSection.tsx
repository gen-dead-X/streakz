'use client';
import { Monitor, Sun, Moon, Check } from 'lucide-react';
import { useThemeStore } from '@/store/theme/theme.store';
import { THEMES } from '@/constants/themes/themes.constants';
import type { ThemeMode, ColorScheme } from '@/types/common/theme.types';

const MODES: { id: ThemeMode; label: string; Icon: typeof Monitor }[] = [
  { id: 'system', label: 'System', Icon: Monitor },
  { id: 'light',  label: 'Light',  Icon: Sun },
  { id: 'dark',   label: 'Dark',   Icon: Moon },
];

export function AppearanceSection() {
  const { colorScheme, mode, setColorScheme, setMode } = useThemeStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* COLOR SCHEME */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          Appearance
        </p>
        <h3 style={{ margin: '0 0 20px', color: 'var(--color-text-heading)', fontSize: 18, fontWeight: 700 }}>
          Color Theme
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: 12,
          }}
        >
          {THEMES.map((t) => {
            const active = colorScheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setColorScheme(t.id as ColorScheme)}
                aria-label={t.name}
                aria-pressed={active}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  background: active ? 'var(--color-bg-elevated)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px 8px',
                  borderRadius: 14,
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Swatch */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: t.swatch,
                    position: 'relative',
                    boxShadow: active
                      ? `0 0 0 2px var(--color-bg-page), 0 0 0 4px ${t.swatch}`
                      : '0 2px 8px rgba(0,0,0,0.25)',
                    transition: 'box-shadow 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {active && (
                    <Check
                      size={18}
                      style={{
                        color: t.id === 'classy' ? '#fff' : '#000',
                        strokeWidth: 2.5,
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--color-text-heading)' : 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE SELECTOR */}
      <div>
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-text-heading)', fontSize: 18, fontWeight: 700 }}>
          Appearance Mode
        </h3>

        <div
          style={{
            display: 'flex',
            background: 'var(--color-bg-elevated)',
            borderRadius: 14,
            padding: 4,
            gap: 4,
          }}
        >
          {MODES.map(({ id, label, Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                aria-pressed={active}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 8px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? 'var(--color-bg-surface)' : 'transparent',
                  color: active ? 'var(--color-text-heading)' : 'var(--color-text-muted)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
