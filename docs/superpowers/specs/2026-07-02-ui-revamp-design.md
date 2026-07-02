# Streakz 2.0 — "Ink & Ember" UI/UX Revamp — Design Spec

**Date:** 2026-07-02
**Status:** Approved
**Branch:** `feature/ui-revamp`

## Goal

Complete visual and interaction redesign of the Streakz app. All existing functionality
(auth, habits, check-ins, streak logic, insights, projects/collaboration, achievements,
push notifications, settings) is preserved. The visual layer — tokens, components,
screens, motion — is rebuilt from scratch.

**Quality bar:** premium, polished, addictive. Reference points: Apple HIG, Linear,
Notion Calendar, Arc, Raycast. Must look exceptional in both dark and light mode,
mobile-first.

## Key decisions (user-approved)

1. **New premium palette** — "Ink & Ember". The old Spotify-green theme and the warm
   cream `design/` mockups are both superseded. `docs/theme.md` is rewritten as the new
   brand law.
2. **Ant Design fully removed** — replaced by a custom UI kit built with Tailwind 4 +
   Framer Motion + Lucide. `antd` and `@ant-design/nextjs-registry` are uninstalled at
   the end.
3. **Foundation-first execution** — tokens → UI kit → shell → screens → cleanup, on one
   feature branch.

## 1. Design language — "Ink & Ember"

### Color

All values live as CSS variables in `app/globals.css` (`:root` = dark default,
`.light` overrides) and are exposed through the Tailwind 4 `@theme` block. No hardcoded
hex/hsl in components — semantic tokens only.

**Dark mode (default):**

| Token | Value | Use |
|---|---|---|
| `--bg-page` | `hsl(240 10% 5%)` | App background |
| `--bg-surface` | `hsl(240 8% 7%)` | Cards |
| `--bg-elevated` | `hsl(240 7% 10%)` | Raised cards, popovers |
| `--bg-overlay-glass` | `hsla(240 8% 8% / .72)` + blur | Floating chrome only |
| `--border-subtle` | `hsla(0 0% 100% / .06)` | Hairlines |
| `--border-default` | `hsla(0 0% 100% / .10)` | Inputs, dividers |
| `--text-heading` | `hsl(40 30% 96%)` | Warm-tinted white |
| `--text-body` | `hsl(240 6% 70%)` | Body |
| `--text-muted` | `hsl(240 5% 48%)` | Captions |

**Light mode:** warm paper page `hsl(40 25% 97%)`, white surfaces, ink text
`hsl(240 12% 9%)`, borders `hsla(240 12% 9% / .08)`, soft layered shadows.

**Brand — Ember:** gradient `#FF6B3D → #FFB02E` (135deg). Solid anchor
`--brand-default: hsl(18 100% 62%)` with a full 50–950 shade ramp. Used for: primary
buttons, streak flames, progress fills, active nav, FAB, selection.

**Secondary accent — Violet:** `hsl(258 90% 66%)` — XP, levels, achievements only.

**Semantic:** success `hsl(152 60% 45%)`, warning `hsl(40 95% 55%)`, error
`hsl(0 80% 60%)`, each with a `-light` tint and a translucent `-subtle` background tint.

### Typography

Loaded via `next/font/google`, exposed as CSS variables:

- **Display: Bricolage Grotesque** (`--font-display`) — greetings, hero numbers, page
  titles, streak counts. Weights 500–800.
- **UI/body: Geist** (`--font-sans`) — everything else. `font-variant-numeric:
  tabular-nums` utility for counters/dates.

Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 44. Line heights tight (1.1) for display,
1.5 for body.

### Shape, depth, glass

- Radius: controls 14px, cards 24px, sheets/modals 32px top, pills full.
- Shadows: layered soft ambient (`0 1px 2px`, `0 8px 24px`, `0 24px 48px` at low
  alpha) + inner top-edge highlight `inset 0 1px 0 hsla(0 0% 100% / .04)` on dark
  surfaces.
- Glass (backdrop-blur + translucent bg) **only** on floating chrome: bottom nav,
  Dynamic Island header, sheets, dialogs. Never on content cards.

### Motion

`constants/motion/motion.constants.ts`: spring presets (`snappy`, `gentle`,
`bouncy`), durations (fast 150ms, base 250ms, slow 400ms), stagger interval 40ms.
All animation respects `prefers-reduced-motion` via a shared `useReducedMotion`
usage pattern. Framer Motion (already installed) is the only animation lib.

## 2. Custom UI kit — `components/ui/`

Each in its own PascalCase folder per `docs/STRUCTURE.md`, with `.types.ts` where
props are non-trivial. All interactive components: keyboard operable, visible
`--ring` focus style, correct ARIA roles, 44px minimum touch targets.

**New primitives:** `Button` (primary ember / secondary surface / ghost / destructive;
sizes sm/md/lg; loading state), `IconButton`, `Input`, `TextArea`, `Select` (custom
listbox), `Toggle`, `Checkbox`, `SegmentedControl` (animated layout indicator),
`Card` (surface/elevated/interactive variants), `Dialog` (centered, spring-in,
focus-trapped), `Tooltip`, `Toast` (replaces notistack visual layer via custom
snackbar renderer), `ProgressRing` (SVG, animated stroke), `ProgressBar`, `Skeleton`
(shimmer), `Badge`, `Avatar` (+ `AvatarStack`), `EmptyState` (icon/illustration +
title + action).

**Kept & retuned:** `BottomSheet` (iOS zoom-out preserved), `HabitIcon`,
`EmojiPicker`/`IconPicker` (rebuilt without antd Popover), `HeatmapCalendar`,
`StreakDots`, `WeeklyBars`, `MiniCalendar` (all re-tokened).

**Forms:** `react-hook-form` + `zod` resolvers (already installed) replace antd
`Form` everywhere (HabitForm, ProfileForm, ProjectForm, auth pages).

**Removed at the end:** `antd`, `@ant-design/nextjs-registry` imports and packages;
`lib/antd-theme.ts`; antd reset CSS.

## 3. App shell

- **Mobile:** floating frosted bottom nav pill (Today, Insights, Projects, Profile)
  with center ember FAB opening the habit sheet; active tab = ember icon + layout-
  animated pill. Dynamic Island header retained as signature element, re-skinned
  (ink glass, ember progress arc, display-font date).
- **Desktop:** sidebar (240px): logo, nav with active glow + layout-animated
  indicator, project list, user card at bottom. Content max-width 900px preserved.

## 4. Screens

Every screen keeps its current route, data flow, services, and stores. Server/client
component boundaries unchanged unless a screen's redesign requires client
interactivity that is currently server-rendered (then a thin client child is added).

- **Today:** display greeting + date; hero row with `ProgressRing` count-up
  ("4 of 7"); redesigned `HabitCard` (icon tile, name, flame + streak count,
  check-in button with spring press, particle burst on completion, milestone
  confetti via canvas-confetti); glass week strip; all-done celebration state.
  The card-deck pager on mobile is kept but re-skinned.
- **Insights:** animated stat tiles (count-up numbers, display font); heatmap with
  hover/tap tooltips and month nav; weekly bars with staggered entrance; consistency
  ring; personal records row (longest streak, best week).
- **Projects:** project cards with `AvatarStack` + team completion ring; member
  rows with per-member status dots; invite/settings flows re-skinned in kit
  components.
- **Achievements & XP:** badge grid — locked = embossed monochrome silhouette,
  unlocked = full color + one-time shine sweep; unlock toast + confetti. **XP/level
  is derived client-side** from existing data (checkins/streak lengths → XP curve,
  level thresholds in `constants/`); displayed as violet level ring + XP bar on
  Profile. No schema/API changes.
- **Profile / Settings:** grouped setting cards with section headers; theme
  switcher with live preview swatches (light/dark/system); notification settings
  re-skinned.
- **Auth (login/register):** split layout — left animated ember gradient panel with
  logotype (stacked on mobile), right minimal form; inline zod validation.
- **States:** every route's `loading.tsx` gets layout-matched skeletons; empty
  states use `EmptyState` with a small inline SVG illustration; error states
  friendly with retry.

## 5. Accessibility

WCAG AA contrast in both modes (ember-on-ink checked ≥ 4.5:1 for text, 3:1 for large/
UI), keyboard nav everywhere antd used to provide it (Select, Dialog, Toggle focus
management), `aria-live` for toast + check-in feedback, reduced-motion fallbacks
(fade/no-transform), focus-visible rings on all interactive elements.

## 6. Execution phases

1. **Foundations:** rewrite `app/globals.css` tokens + `@theme`, fonts via
   `next/font`, motion constants, rewrite `docs/theme.md`.
2. **UI kit:** primitives above, each verified in both themes.
3. **Shell:** BottomNav, SideNav, PageHeader/island, layout.
4. **Today** screen + HabitCard + check-in interactions + HabitFormSheet.
5. **Insights** + calendar/heatmap + stat tiles.
6. **Projects, Achievements/XP, Profile, Settings, Auth.**
7. **Cleanup:** remove antd + registry + `lib/antd-theme.ts`, uninstall packages,
   a11y + reduced-motion pass, skeleton/empty/error audit.

Per-phase verification: `bun run build` passes; visual check in dev server (both
themes, mobile + desktop widths). Mandatory doc reads per `AGENTS.md` before each
phase's edits.

## Out of scope

- No changes to models, API routes, services, streak calculators, auth logic.
- No new persisted data (XP is derived).
- No new pages/routes.
- Existing tests (`lib/streak`, `lib/validation`) must keep passing.
