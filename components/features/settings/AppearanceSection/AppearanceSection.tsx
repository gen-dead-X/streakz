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
  const { colorScheme, mode, glassOpacity, setColorScheme, setMode, setGlassOpacity } = useThemeStore();

  /* Map glassOpacity (0.03–0.30) to slider integer (3–30) */
  const sliderValue = Math.round(glassOpacity * 100);
  const sliderProgress = Math.round(((sliderValue - 3) / 27) * 100);

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
            const isGlassy = t.id === 'glassy';

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
                    position: 'relative',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'box-shadow 0.15s ease',
                    /* Glassy swatch gets a frosted-glass visual treatment */
                    ...(isGlassy ? {
                      background: 'linear-gradient(135deg, rgba(29,185,84,0.65) 0%, rgba(160,240,200,0.40) 50%, rgba(255,255,255,0.25) 100%)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.42)',
                      boxShadow: active
                        ? `0 0 0 2px var(--color-bg-page), 0 0 0 4px rgba(157,223,187,0.75), inset 0 1px 0 rgba(255,255,255,0.55)`
                        : '0 2px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.48)',
                    } : {
                      background: t.swatch,
                      boxShadow: active
                        ? `0 0 0 2px var(--color-bg-page), 0 0 0 4px ${t.swatch}`
                        : '0 2px 8px rgba(0,0,0,0.25)',
                    }),
                  }}
                >
                  {active && (
                    <Check
                      size={18}
                      style={{
                        color: t.id === 'classy' || t.id === 'glassy' ? '#fff' : '#000',
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

      {/* GLASS OPACITY — only shown when Glassy is active */}
      {colorScheme === 'glassy' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: 'var(--color-text-heading)', fontSize: 18, fontWeight: 700 }}>
              Glass Opacity
            </h3>
            <span style={{
              fontSize: 11,
              color: 'var(--color-brand)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.02em',
            }}>
              {sliderValue}%
            </span>
          </div>

          <div style={{ padding: '0 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Clear
              </span>

              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={sliderValue}
                onChange={(e) => setGlassOpacity(Number(e.target.value) / 100)}
                className="glass-opacity-slider"
                style={{
                  flex: 1,
                  background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${sliderProgress}%, rgba(255,255,255,0.12) ${sliderProgress}%, rgba(255,255,255,0.12) 100%)`,
                }}
              />

              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Frosted
              </span>
            </div>
          </div>

          {/* Live glass preview */}
          <div
            style={{
              marginTop: 20,
              padding: '16px 18px',
              borderRadius: 16,
              background: `rgba(255,255,255,${glassOpacity})`,
              backdropFilter: 'blur(22px) saturate(180%)',
              WebkitBackdropFilter: 'blur(22px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--color-brand)',
              boxShadow: '0 0 8px var(--color-brand)',
              flexShrink: 0,
            }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--color-text-heading)' }}>
                Glass preview
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
                Cards and surfaces will appear like this panel
              </p>
            </div>
          </div>
        </div>
      )}

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
