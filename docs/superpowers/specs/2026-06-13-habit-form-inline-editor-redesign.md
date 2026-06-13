---
title: HabitForm — Inline Editor Redesign + Theme Dropdown
date: 2026-06-13
branch: feature/card-interactions
---

# HabitForm Inline Editor Redesign + Theme Dropdown

## Goal

Replace the click-to-open modal containing the RichTextEditor with a seamless inline layout. Redesign the form as a document-style editor (Notion/reference-image inspired) where title, tags, theme, frequency, and rich text body all live on one scrollable surface. Convert the card-style gradient buttons to an AntD Dropdown with a gradient swatch + name in each option. Add 4 new card themes.

## What Changes

### 1. CardStyle type expansion

`types/models/habit.types.ts` — add four new union members:

```ts
export type CardStyle = 'wavy' | 'geometric' | 'blob' | 'aurora' | 'ember' | 'midnight' | 'rose';
```

### 2. New gradients in HabitCard

`components/ui/HabitCard/HabitCard.tsx` — add to GRADIENTS map:

| Key        | Label    | Gradient                                                        |
|------------|----------|-----------------------------------------------------------------|
| `aurora`   | Aurora   | `linear-gradient(135deg, #00b09b 0%, #57d06e 60%, #96c93d 100%)` |
| `ember`    | Ember    | `linear-gradient(135deg, #f12711 0%, #f5af19 100%)`             |
| `midnight` | Midnight | `linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)` |
| `rose`     | Rose     | `linear-gradient(135deg, #f093fb 0%, #f5576c 60%, #fd746c 100%)` |

### 3. HabitForm redesign

**Remove:**
- `editorOpen` state
- `<Modal>` wrapping the RichTextEditor
- The clickable `div` that triggers the modal
- The Done button inside the modal

**Add / change:**
- **Document-style layout** — metadata rows (Tags, Theme, Frequency) use a two-column label + control pattern with `var(--color-bg-elevated)` background and subtle row dividers.
- **Inline RichTextEditor** — renders directly in the form, inside a styled surface card. Full height, toolbar visible at all times.
- **Theme Dropdown (AntD)** — trigger button shows a small gradient swatch (28×18 px, border-radius 6) + theme name + chevron. Menu items show the same swatch + name. First item (Ocean/wavy) selected by default for new habits; existing habits preserve their saved value.
- **CARD_STYLES array** expanded to all 7 themes, used both for the dropdown and passed through to HabitCard GRADIENTS.

**Layout order (top → bottom):**
1. Header bar: `[✕ back]` · `New/Edit Streak` · `[🔔 bell]`
2. Icon picker + large title input (side by side)
3. Metadata surface (one card, rows separated by 1px dividers):
   - Tags row
   - Theme row (dropdown)
   - Frequency row (pill buttons inline)
   - Days row (only visible when `freqType === 'specific'`)
4. Rich text editor (inline, full width, inside its own surface card)
5. Error message (if any)
6. Create/Save CTA button
7. Delete button (edit only, Popconfirm)

## Constraints

- No hardcoded hex colors outside of gradient definitions (CardStyle gradients are visual data, not theme tokens).
- All spacing/radius via CSS variables or literal values already established in the codebase.
- AntD Dropdown from `antd` — no custom dropdown library.
- The RichTextEditor component itself is unchanged; only its wrapper context changes (no modal, rendered inline).
- The Mongoose schema for `cardStyle` accepts string — no DB migration needed, existing records stay valid and keep their old style; new types are additive.

## Non-goals

- No live card preview inside the form.
- No drag-to-reorder metadata rows.
- No changes to RichTextEditor toolbar or RichTextPreview rendering.
- No changes to the pages (`/habits/new`, `/habits/[id]/edit`) — only HabitForm component and HabitCard GRADIENTS + CardStyle type.
