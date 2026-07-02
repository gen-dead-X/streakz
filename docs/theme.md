# Ink & Ember — Brand Law

> We will be using this theme overall as our brand guideline no matter whatever the design suggests.

Streakz has **one brand** — Ink & Ember — and **two modes**: light and dark, plus a `system` option that
follows the OS preference. There are no color schemes (no "emerald" / "amber" / "sunset" / etc.) and no
`glassy`/`classy` style variants. If a design calls for a different accent color or a frosted-glass
surface, it does not apply here — reconcile it to this file instead.

Raw color values (`hsl(...)`, hex) may exist **only** in `app/globals.css` and this file. Every other file
in the codebase must reference colors via the CSS variables and Tailwind utilities documented below.

---

## Token Layer (`app/globals.css`)

```css
@import "tailwindcss";

@theme {
  /* SEMANTIC COLOR TOKENS (map to CSS vars set per mode below) */
  --color-brand: var(--brand-default);
  --color-brand-strong: var(--brand-strong);
  --color-brand-soft: var(--brand-soft);
  --color-brand-foreground: var(--brand-foreground);
  --color-violet: var(--violet-default);
  --color-violet-soft: var(--violet-soft);
  --color-page: var(--bg-page);
  --color-surface: var(--bg-surface);
  --color-elevated: var(--bg-elevated);
  --color-sunken: var(--bg-sunken);
  --color-heading: var(--text-heading);
  --color-body: var(--text-body);
  --color-muted: var(--text-muted);
  --color-inverse: var(--text-inverse);
  --color-border-subtle: var(--border-subtle);
  --color-border-default: var(--border-default);
  --color-success: var(--success-default);
  --color-success-subtle: var(--success-subtle);
  --color-warning: var(--warning-default);
  --color-warning-subtle: var(--warning-subtle);
  --color-error: var(--error-default);
  --color-error-subtle: var(--error-subtle);

  /* GRADIENTS */
  --background-image-ember: var(--gradient-ember);
  --background-image-ember-soft: var(--gradient-ember-soft);
  --background-image-violet: var(--gradient-violet);

  /* SHADOWS */
  --shadow-soft: var(--shadow-soft);
  --shadow-raised: var(--shadow-raised);
  --shadow-floating: var(--shadow-floating);
  --shadow-ember: var(--shadow-ember);

  /* RADII */
  --radius-control: 14px;
  --radius-card: 24px;
  --radius-sheet: 32px;

  /* TYPOGRAPHY */
  --font-sans: var(--font-family-sans), system-ui, sans-serif;
  --font-display: var(--font-family-display), var(--font-family-sans), sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 22px;
  --text-2xl: 28px;
  --text-3xl: 36px;
  --text-4xl: 44px;
}

/* ============ DARK (default) ============ */
:root {
  --brand-default: hsl(18 100% 62%);
  --brand-strong: hsl(18 100% 55%);
  --brand-soft: hsl(18 100% 62% / 0.12);
  --brand-foreground: hsl(240 10% 5%);
  --violet-default: hsl(258 90% 66%);
  --violet-soft: hsl(258 90% 66% / 0.14);

  --bg-page: hsl(240 10% 5%);
  --bg-surface: hsl(240 8% 7%);
  --bg-elevated: hsl(240 7% 10%);
  --bg-sunken: hsl(240 10% 3.5%);
  --bg-glass: hsl(240 8% 8% / 0.72);

  --text-heading: hsl(40 30% 96%);
  --text-body: hsl(240 6% 70%);
  --text-muted: hsl(240 5% 48%);
  --text-inverse: hsl(240 12% 9%);

  --border-subtle: hsl(0 0% 100% / 0.06);
  --border-default: hsl(0 0% 100% / 0.10);

  --success-default: hsl(152 60% 45%);
  --success-subtle: hsl(152 60% 45% / 0.14);
  --warning-default: hsl(40 95% 55%);
  --warning-subtle: hsl(40 95% 55% / 0.14);
  --error-default: hsl(0 80% 60%);
  --error-subtle: hsl(0 80% 60% / 0.14);

  --gradient-ember: linear-gradient(135deg, #ff6b3d 0%, #ffb02e 100%);
  --gradient-ember-soft: linear-gradient(135deg, hsl(18 100% 62% / 0.18) 0%, hsl(38 100% 59% / 0.10) 100%);
  --gradient-violet: linear-gradient(135deg, hsl(258 90% 66%) 0%, hsl(280 85% 70%) 100%);

  --shadow-soft: 0 1px 2px hsl(0 0% 0% / 0.3), 0 8px 24px hsl(0 0% 0% / 0.25);
  --shadow-raised: 0 2px 4px hsl(0 0% 0% / 0.35), 0 16px 40px hsl(0 0% 0% / 0.35);
  --shadow-floating: 0 8px 16px hsl(0 0% 0% / 0.4), 0 24px 64px hsl(0 0% 0% / 0.5);
  --shadow-ember: 0 4px 24px hsl(18 100% 55% / 0.35);
  --edge-highlight: inset 0 1px 0 hsl(0 0% 100% / 0.04);

  --ring: hsl(18 100% 62% / 0.55);
  --overlay: hsl(240 10% 3% / 0.6);
  --skeleton: hsl(240 6% 14%);
  --selection-background: hsl(18 100% 62% / 0.35);
}

/* ============ LIGHT ============ */
[data-mode="light"] {
  --brand-default: hsl(18 95% 55%);
  --brand-strong: hsl(18 95% 48%);
  --brand-soft: hsl(18 95% 55% / 0.10);
  --brand-foreground: hsl(0 0% 100%);
  --violet-default: hsl(258 75% 56%);
  --violet-soft: hsl(258 75% 56% / 0.10);

  --bg-page: hsl(40 25% 97%);
  --bg-surface: hsl(0 0% 100%);
  --bg-elevated: hsl(0 0% 100%);
  --bg-sunken: hsl(40 20% 94%);
  --bg-glass: hsl(40 25% 98% / 0.78);

  --text-heading: hsl(240 12% 9%);
  --text-body: hsl(240 8% 32%);
  --text-muted: hsl(240 5% 52%);
  --text-inverse: hsl(40 30% 96%);

  --border-subtle: hsl(240 12% 9% / 0.06);
  --border-default: hsl(240 12% 9% / 0.10);

  --success-default: hsl(152 65% 34%);
  --success-subtle: hsl(152 65% 34% / 0.10);
  --warning-default: hsl(38 95% 44%);
  --warning-subtle: hsl(38 95% 44% / 0.10);
  --error-default: hsl(0 72% 50%);
  --error-subtle: hsl(0 72% 50% / 0.08);

  --shadow-soft: 0 1px 2px hsl(240 12% 9% / 0.05), 0 8px 24px hsl(240 12% 9% / 0.06);
  --shadow-raised: 0 2px 4px hsl(240 12% 9% / 0.06), 0 16px 40px hsl(240 12% 9% / 0.10);
  --shadow-floating: 0 8px 16px hsl(240 12% 9% / 0.10), 0 24px 64px hsl(240 12% 9% / 0.16);
  --shadow-ember: 0 4px 24px hsl(18 95% 55% / 0.30);
  --edge-highlight: none;

  --ring: hsl(18 95% 55% / 0.45);
  --overlay: hsl(240 12% 9% / 0.35);
  --skeleton: hsl(40 15% 90%);
  --selection-background: hsl(18 95% 55% / 0.25);
}
```

`:root` holds the dark palette (dark is the default mode, and also what SSR renders before the inline
theme script runs). `[data-mode="light"]` overrides every token for light mode. Nothing else — no
`[data-theme="..."]`, no `[data-style="..."]`.

---

## Usage Table

| Token (CSS var) | Tailwind utility | Use case |
|---|---|---|
| `--color-brand` | `bg-brand`, `text-brand`, `border-brand` | Primary Ember accent — CTAs, active states, links |
| `--color-brand-strong` | `bg-brand-strong` | Hover/active shade of brand accent |
| `--color-brand-soft` | `bg-brand-soft` | Faint brand tint background (badges, selected rows) |
| `--color-brand-foreground` | `text-brand-foreground` | Text/icon color placed *on top of* a solid brand background |
| `--color-violet` | `bg-violet`, `text-violet` | Secondary accent (XP, achievements, highlights) |
| `--color-violet-soft` | `bg-violet-soft` | Faint violet tint background |
| `--color-page` | `bg-page` | App/page background (outermost canvas) |
| `--color-surface` | `bg-surface` | Cards, sheets, panels — first elevation above page |
| `--color-elevated` | `bg-elevated` | Popovers, dropdowns, modals — second elevation |
| `--color-sunken` | `bg-sunken` | Recessed wells (input backgrounds, inset containers) |
| `--color-heading` | `text-heading` | Headings (`h1`–`h4`), high-emphasis titles |
| `--color-body` | `text-body` | Default body copy |
| `--color-muted` | `text-muted` | Secondary/de-emphasized text, captions, placeholders |
| `--color-inverse` | `text-inverse` | Text placed on a solid brand/dark-on-light or light-on-dark surface |
| `--color-border-subtle` | `border-border-subtle` | Hairline dividers, faint card outlines |
| `--color-border-default` | `border-border-default` | Standard input/control borders |
| `--color-success` / `--color-success-subtle` | `bg-success`, `bg-success-subtle` | Streak-kept, positive states |
| `--color-warning` / `--color-warning-subtle` | `bg-warning`, `bg-warning-subtle` | At-risk streak, caution states |
| `--color-error` / `--color-error-subtle` | `bg-error`, `bg-error-subtle` | Missed streak, destructive actions |
| `--gradient-ember` | `bg-ember` | Hero/CTA gradient fills |
| `--gradient-ember-soft` | `bg-ember-soft` | Subtle ambient gradient backgrounds |
| `--gradient-violet` | `bg-violet` (background-image) | XP/achievement gradient accents |
| `--shadow-soft` | `shadow-soft` | Resting elevation for cards |
| `--shadow-raised` | `shadow-raised` | Hover/active elevation |
| `--shadow-floating` | `shadow-floating` | Sheets, floating action buttons |
| `--shadow-ember` | `shadow-ember` | Glow shadow under brand-colored elements (e.g. the Add button) |
| `--radius-control` (14px) | `rounded-control` | Inputs, buttons, small controls |
| `--radius-card` (24px) | `rounded-card` | Cards, panels |
| `--radius-sheet` (32px) | `rounded-sheet` | Bottom sheets, large modals |
| `--font-sans` | `font-sans` | Default UI font (Geist) |
| `--font-display` | `font-display` | Headlines, large numerals, celebratory moments (Bricolage Grotesque) |

Non-color/type tokens that don't have a Tailwind utility but are used via `var(...)` directly:
`--ring` (focus ring), `--overlay` (backdrop scrims), `--skeleton` (loading placeholders),
`--selection-background` (`::selection`), `--edge-highlight` (top inner highlight on dark glass/cards),
`--bg-glass` (used by the `.glass` utility class).

---

## Fonts

- **Display** — Bricolage Grotesque (`--font-family-display`), weights 500/600/700/800. Used for headings,
  streak numerals, and celebratory moments via `font-display`.
- **Sans** — Geist (`--font-family-sans`). Used for everything else via `font-sans` (also the default
  `body` font).

Both are loaded via `next/font/google` in `app/layout.tsx` — never via `<link>` tags.

---

## Motion (`constants/motion/motion.constants.ts`)

```ts
export const SPRINGS = {
  snappy: { type: 'spring', stiffness: 420, damping: 30 },
  gentle: { type: 'spring', stiffness: 200, damping: 26 },
  bouncy: { type: 'spring', stiffness: 500, damping: 18 },
} as const;

export const DURATIONS = { fast: 0.15, base: 0.25, slow: 0.4 } as const;

export const STAGGER_INTERVAL = 0.04;
```

- `SPRINGS.snappy` — default for most interactive transitions (button presses, toggles).
- `SPRINGS.gentle` — page/sheet transitions, larger surfaces.
- `SPRINGS.bouncy` — celebratory moments (check-ins, achievements unlocking).
- `DURATIONS` — plain-easing fallback durations (seconds) for opacity/fade transitions that don't need a spring.
- `STAGGER_INTERVAL` — delay (seconds) between staggered list-item animations.

Respect `prefers-reduced-motion` — `app/globals.css` already forces near-zero animation/transition
durations at the `@media (prefers-reduced-motion: reduce)` level; don't fight it with `!important` overrides.

---

## Theme Mode

`types/common/theme.types.ts` exports a single type:

```ts
export type ThemeMode = 'light' | 'dark' | 'system';
```

`useThemeStore` (`store/theme/theme.store.ts`) holds `{ mode: ThemeMode; setMode(mode) }`, persisted to
`localStorage` under `streakz-theme` (v2). `components/ui/ThemeProvider/ThemeProvider.tsx` resolves
`system` via `matchMedia('(prefers-color-scheme: dark)')` and writes the resolved value to
`document.documentElement.dataset.mode` — the single attribute every color token in this file reacts to.
An inline script in `app/layout.tsx` applies the same resolution before first paint to avoid a flash of
the wrong mode.

There is no color-scheme picker and no glass/classy style picker. `MODE_OPTIONS` in
`constants/themes/themes.constants.ts` is the only theme-related constant list left:

```ts
export const MODE_OPTIONS: { id: ThemeMode; name: string }[] = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'system', name: 'System' },
];
```

---

## Legacy Alias Bridge (temporary)

A small set of screens not yet migrated to the Ink & Ember token names still read pre-revamp
`--color-*` variables directly via inline `style={{ ... }}`. `app/globals.css` defines a short-lived
alias block (clearly marked `LEGACY ALIAS BRIDGE`) mapping those old names
(`--color-bg-page`, `--color-bg-surface`, `--color-bg-elevated`, `--color-bg-sunken`,
`--color-text-heading`, `--color-text-body`, `--color-text-muted`, `--color-brand-subtle`,
`--shadow-brand`) onto the new tokens above. As later tasks rebuild each screen, update its inline
styles to the new names and this bridge shrinks; it is deleted entirely in Task 15 (antd removal +
final polish).

---

## Rules

- Raw `hsl()`/hex values: **only** in `app/globals.css` and this file.
- Never hardcode a pixel radius when `rounded-control` / `rounded-card` / `rounded-sheet` (or a Tailwind
  default like `rounded-full`) covers it.
- Prefer the Tailwind utility form (`bg-page`, `text-heading`, …) in `className`. Use `style={{ background:
  'var(--color-page)' }}` only where Tailwind can't reach (AntD internals, dynamic/computed values).
- One brand. Two modes. No exceptions without updating this file first.
