'use client';
import { Monitor, Sun, Moon, Check } from 'lucide-react';
import { useThemeStore } from '@/store/theme/theme.store';
import { useDarkMode } from '@/hooks/theme/useDarkMode';
import { THEMES } from '@/constants/themes/themes.constants';
import type { ThemeMode, ColorScheme, AppStyle } from '@/types/common/theme.types';

const MODES: { id: ThemeMode; label: string; Icon: typeof Monitor }[] = [
  { id: 'system', label: 'System', Icon: Monitor },
  { id: 'light',  label: 'Light',  Icon: Sun },
  { id: 'dark',   label: 'Dark',   Icon: Moon },
];

/* Inline mini-preview rendered inside each style card */
function StylePreview({ id }: { id: AppStyle }) {
  if (id === 'classy') {
    return (
      <div style={{ height: 88, background: '#111', padding: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {/* card */}
        <div style={{
          flex: 1, background: '#1C1C1C', borderRadius: 7,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-brand)' }} />
            <div style={{ height: 2, flex: 1, borderRadius: 1, background: 'rgba(255,255,255,0.14)' }} />
            <div style={{ height: 2, width: '28%', borderRadius: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>
          <div style={{ height: 2, width: '55%', borderRadius: 1, background: 'rgba(255,255,255,0.09)' }} />
        </div>
        {/* nav */}
        <div style={{
          height: 18, background: '#080808', borderRadius: 5,
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 10, height: 2, background: 'rgba(255,255,255,0.18)', borderRadius: 1 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: 88,
      background: 'radial-gradient(ellipse 130% 110% at 20% 0%, rgba(var(--color-brand, 29 185 84), 0.38) 0%, transparent 55%), radial-gradient(ellipse 80% 110% at 80% 100%, rgba(29,185,84,0.22) 0%, transparent 50%), #090E09',
      padding: 10, display: 'flex', flexDirection: 'column', gap: 7,
    }}>
      {/* glass card */}
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.09)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderRadius: 7,
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.13)',
        padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-brand)', boxShadow: '0 0 5px var(--color-brand)' }} />
          <div style={{ height: 2, flex: 1, borderRadius: 1, background: 'rgba(255,255,255,0.22)' }} />
          <div style={{ height: 2, width: '28%', borderRadius: 1, background: 'rgba(255,255,255,0.11)' }} />
        </div>
        <div style={{ height: 2, width: '55%', borderRadius: 1, background: 'rgba(255,255,255,0.16)' }} />
      </div>
      {/* glass nav */}
      <div style={{
        height: 18,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderRadius: 5,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 10, height: 2, background: 'rgba(255,255,255,0.24)', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );
}

export function AppearanceSection() {
  const {
    colorScheme, appStyle, mode, glassOpacity,
    setColorScheme, setAppStyle, setMode, setGlassOpacity,
  } = useThemeStore();
  const dark = useDarkMode();

  const sliderValue = Math.round(glassOpacity * 100);
  const sliderProgress = Math.round(((sliderValue - 30) / 65) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── STYLE PICKER ── */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          Appearance
        </p>
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-text-heading)', fontSize: 18, fontWeight: 700 }}>
          Style
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {(['classy', 'glassy'] as AppStyle[]).map((id) => {
            const active = appStyle === id;
            const label = id === 'classy' ? 'Classy' : 'Glassy';
            const desc  = id === 'classy' ? 'Clean solid surfaces' : 'Frosted glass surfaces';
            return (
              <button
                key={id}
                onClick={() => setAppStyle(id)}
                aria-pressed={active}
                style={{
                  padding: 0,
                  border: `2px solid ${active ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <StylePreview id={id} />
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--color-bg-elevated)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: active ? 700 : 500, color: 'var(--color-text-heading)' }}>
                      {label}
                    </p>
                    <p style={{ margin: '1px 0 0', fontSize: 10, color: 'var(--color-text-muted)' }}>
                      {desc}
                    </p>
                  </div>
                  {active && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--color-brand)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Check size={11} style={{ color: 'var(--color-brand-foreground)' }} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GLASS OPACITY (Glassy only) ── */}
      {appStyle === 'glassy' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: 'var(--color-text-heading)', fontSize: 18, fontWeight: 700 }}>
              Glass Opacity
            </h3>
            <span style={{
              fontSize: 11, color: 'var(--color-brand)', fontWeight: 600,
              fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em',
            }}>
              {sliderValue}%
            </span>
          </div>

          <div style={{ padding: '0 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Clear
              </span>
              <input
                type="range"
                min={30}
                max={95}
                step={1}
                value={sliderValue}
                onChange={(e) => setGlassOpacity(Number(e.target.value) / 100)}
                className="glass-opacity-slider"
                style={{
                  flex: 1,
                  background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${sliderProgress}%, rgba(255,255,255,0.12) ${sliderProgress}%, rgba(255,255,255,0.12) 100%)`,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Frosted
              </span>
            </div>
          </div>

          {/* Live preview panel */}
          <div style={{
            marginTop: 20, padding: '14px 18px', borderRadius: 14,
            background: dark
              ? `rgba(12, 14, 12, ${glassOpacity})`
              : `rgba(255, 255, 255, ${glassOpacity})`,
            backdropFilter: `blur(${glassOpacity * 36}px) saturate(185%)`,
            WebkitBackdropFilter: `blur(${glassOpacity * 36}px) saturate(185%)`,
            border: dark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: dark
              ? '0 4px 16px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.16)'
              : '0 4px 12px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.90)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--color-brand)', boxShadow: '0 0 7px var(--color-brand)', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--color-text-heading)' }}>Glass preview</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>Cards will appear like this panel</p>
            </div>
          </div>
        </div>
      )}

      {/* ── COLOR SCHEME ── */}
      <div>
        <h3 style={{ margin: '0 0 20px', color: 'var(--color-text-heading)', fontSize: 18, fontWeight: 700 }}>
          Color
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 12 }}>
          {THEMES.map((t) => {
            const active = colorScheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setColorScheme(t.id as ColorScheme)}
                aria-label={t.name}
                aria-pressed={active}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  background: active ? 'var(--color-bg-elevated)' : 'transparent',
                  border: 'none', cursor: 'pointer', padding: '12px 8px', borderRadius: 14,
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: t.swatch, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active
                    ? `0 0 0 2px var(--color-bg-page), 0 0 0 4px ${t.swatch}`
                    : '0 2px 8px rgba(0,0,0,0.25)',
                  transition: 'box-shadow 0.15s ease',
                }}>
                  {active && <Check size={18} style={{ color: '#000', strokeWidth: 2.5 }} />}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-text-heading)' : 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                }}>
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MODE SELECTOR ── */}
      <div>
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-text-heading)', fontSize: 18, fontWeight: 700 }}>
          Appearance Mode
        </h3>

        <div style={{
          display: 'flex', background: 'var(--color-bg-elevated)',
          borderRadius: 14, padding: 4, gap: 4,
        }}>
          {MODES.map(({ id, label, Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                aria-pressed={active}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: active ? 'var(--color-bg-surface)' : 'transparent',
                  color: active ? 'var(--color-text-heading)' : 'var(--color-text-muted)',
                  fontWeight: active ? 600 : 400, fontSize: 13,
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
