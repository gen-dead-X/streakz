# HabitForm Inline Editor Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the description modal with an inline RichTextEditor, redesign HabitForm as a document-style layout with labeled metadata rows, convert the card-style gradient buttons to an AntD Dropdown, and add 4 new card themes.

**Architecture:** Three sequential file edits — first expand the `CardStyle` type, then update the `GRADIENTS` map in `HabitCard` so all 7 themes render correctly on cards, then rewrite `HabitForm` to remove the modal, inline the editor, and use the new dropdown.

**Tech Stack:** Next.js 16, React 19, Ant Design 6, react-hook-form, Zod, TipTap, framer-motion, Lucide icons, Bun

---

### Task 1: Expand CardStyle type

**Files:**
- Modify: `types/models/habit.types.ts`

- [ ] **Step 1: Open the file and replace the CardStyle type**

  In `types/models/habit.types.ts`, find line:
  ```ts
  export type CardStyle = 'wavy' | 'geometric' | 'blob';
  ```
  Replace with:
  ```ts
  export type CardStyle = 'wavy' | 'geometric' | 'blob' | 'aurora' | 'ember' | 'midnight' | 'rose';
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  bun run build 2>&1 | head -30
  ```
  Expected: build succeeds (no errors referencing `CardStyle`). If it reports errors about `GRADIENTS` missing keys, that is expected — it will be fixed in Task 2.

- [ ] **Step 3: Commit**

  ```bash
  git add types/models/habit.types.ts
  git commit -m "feat: expand CardStyle with aurora, ember, midnight, rose themes"
  ```

---

### Task 2: Add new gradients to HabitCard

**Files:**
- Modify: `components/ui/HabitCard/HabitCard.tsx`

- [ ] **Step 1: Extend the GRADIENTS map**

  In `components/ui/HabitCard/HabitCard.tsx`, find:
  ```ts
  const GRADIENTS: Record<CardStyle, string> = {
    wavy: "linear-gradient(135deg, #00c6ff 0%, #0061ff 55%, #0033dd 100%)",
    geometric:
      "linear-gradient(135deg, #e8b950 0%, #f0516b 38%, #8b2ff8 78%, #5a20dd 100%)",
    blob: "linear-gradient(125deg, #10b981 0%, #047857 50%, #065f46 100%)",
  };
  ```
  Replace with:
  ```ts
  const GRADIENTS: Record<CardStyle, string> = {
    wavy:     "linear-gradient(135deg, #00c6ff 0%, #0061ff 55%, #0033dd 100%)",
    geometric:"linear-gradient(135deg, #e8b950 0%, #f0516b 38%, #8b2ff8 78%, #5a20dd 100%)",
    blob:     "linear-gradient(125deg, #10b981 0%, #047857 50%, #065f46 100%)",
    aurora:   "linear-gradient(135deg, #00b09b 0%, #57d06e 60%, #96c93d 100%)",
    ember:    "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
    midnight: "linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)",
    rose:     "linear-gradient(135deg, #f093fb 0%, #f5576c 60%, #fd746c 100%)",
  };
  ```

- [ ] **Step 2: Verify build passes**

  ```bash
  bun run build 2>&1 | head -30
  ```
  Expected: build succeeds with no errors about `GRADIENTS` or `CardStyle`.

- [ ] **Step 3: Commit**

  ```bash
  git add components/ui/HabitCard/HabitCard.tsx
  git commit -m "feat: add aurora, ember, midnight, rose gradients to HabitCard"
  ```

---

### Task 3: Redesign HabitForm — inline editor, metadata rows, theme dropdown

**Files:**
- Modify: `components/features/habits/HabitForm/HabitForm.tsx`

What changes:
- Remove: `editorOpen` state, `<Modal>`, clickable description `div`, the "Done" button inside the modal, `RichTextPreview` import
- Add: `Dropdown` + `MenuProps` from antd, `ChevronDown` from lucide-react
- CARD_STYLES expanded to all 7 themes
- `cardStyle` default changed from random to `'wavy'`
- Layout: header → icon+title → metadata card (tags/theme/frequency/days) → inline editor → CTA → delete

- [ ] **Step 1: Replace the entire file**

  Write the following as the complete content of `components/features/habits/HabitForm/HabitForm.tsx`:

  ```tsx
  'use client';
  import { useState } from 'react';
  import { useForm, Controller } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { Form, Input, Checkbox, Popconfirm, Dropdown } from 'antd';
  import type { MenuProps } from 'antd';
  import { Bell, BellOff, X, Trash2, ChevronDown } from 'lucide-react';
  import { motion } from 'framer-motion';
  import { IconPicker } from '@/components/ui/IconPicker';
  import { RichTextEditor } from '@/components/ui/RichTextEditor';
  import { FREQUENCY_OPTIONS, DAY_OPTIONS } from '@/constants/habits/frequency.constants';
  import { DEFAULT_ICON } from '@/constants/habits/icon.constants';
  import { habitSchema, type HabitFormValues } from '@/lib/validation/habit.schema';
  import type { CardStyle, Habit, Frequency } from '@/types/models/habit.types';
  import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';
  import type { JSONContent } from '@tiptap/core';

  const CARD_STYLES: { value: CardStyle; gradient: string; label: string }[] = [
    { value: 'wavy',     gradient: 'linear-gradient(135deg, #00c6ff, #0061ff, #0033dd)', label: 'Ocean'   },
    { value: 'geometric',gradient: 'linear-gradient(135deg, #e8b950, #f0516b, #8b2ff8)', label: 'Sunset'  },
    { value: 'blob',     gradient: 'linear-gradient(125deg, #10b981, #047857, #065f46)', label: 'Forest'  },
    { value: 'aurora',   gradient: 'linear-gradient(135deg, #00b09b, #57d06e, #96c93d)', label: 'Aurora'  },
    { value: 'ember',    gradient: 'linear-gradient(135deg, #f12711, #f5af19)',           label: 'Ember'   },
    { value: 'midnight', gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', label: 'Midnight'},
    { value: 'rose',     gradient: 'linear-gradient(135deg, #f093fb, #f5576c, #fd746c)', label: 'Rose'    },
  ];

  interface HabitFormProps {
    initial?: Habit;
    onSave: (data: CreateHabitInput | UpdateHabitInput) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => Promise<void>;
    isEdit?: boolean;
  }

  const ROW_LABEL: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    minWidth: 88,
    flexShrink: 0,
  };

  const ROW_DIVIDER: React.CSSProperties = {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    margin: '0 16px',
  };

  export function HabitForm({ initial, onSave, onCancel, onDelete, isEdit = false }: HabitFormProps) {
    const [icon, setIcon] = useState(initial?.icon ?? DEFAULT_ICON);
    const [cardStyle, setCardStyle] = useState<CardStyle>(initial?.cardStyle ?? 'wavy');
    const [notifications, setNotifications] = useState(initial?.notifications ?? true);
    const [freqType, setFreqType] = useState<Frequency['type']>(initial?.frequency.type ?? 'daily');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [descriptionJson, setDescriptionJson] = useState<JSONContent | undefined>(
      initial?.description && typeof initial.description === 'object'
        ? (initial.description as JSONContent)
        : undefined,
    );

    const { control, handleSubmit, formState: { errors } } = useForm<HabitFormValues>({
      resolver: zodResolver(habitSchema),
      defaultValues: {
        name: initial?.name ?? '',
        tags: initial?.tags?.map((t) => `#${t}`).join(' ') ?? '',
        days: initial?.frequency.days ?? [],
      },
    });

    async function onSubmit(values: HabitFormValues) {
      setLoading(true);
      setError(null);
      if (freqType === 'specific' && (values.days ?? []).length === 0) {
        setError('Select at least one day');
        setLoading(false);
        return;
      }
      try {
        const tags = (values.tags ?? '')
          .split(/[\s,]+/)
          .map((t) => t.replace(/^#/, '').trim())
          .filter(Boolean);
        await onSave({
          name: values.name.trim(),
          icon,
          description: descriptionJson,
          tags,
          cardStyle,
          notifications,
          frequency: {
            type: freqType,
            days: freqType === 'specific' ? (values.days ?? []) : [],
          },
        });
      } catch {
        setError('Failed to save. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    const selectedStyle = CARD_STYLES.find((s) => s.value === cardStyle) ?? CARD_STYLES[0];

    const themeMenuItems: MenuProps['items'] = CARD_STYLES.map(({ value, gradient, label }) => ({
      key: value,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 18, borderRadius: 5, background: gradient, flexShrink: 0 }} />
          <span style={{ fontSize: 14 }}>{label}</span>
        </div>
      ),
    }));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        {/* ── Header ─────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 44, height: 44, borderRadius: 99,
              background: 'var(--color-bg-elevated)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <X size={18} color="var(--color-text-body)" />
          </motion.button>

          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--color-text-heading)', letterSpacing: '-0.5px' }}>
            {isEdit ? 'Edit Streak' : 'New Streak'}
          </h1>

          <motion.button
            type="button"
            onClick={() => setNotifications((v) => !v)}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 44, height: 44, borderRadius: 99,
              border: `2px solid ${notifications ? 'var(--color-brand)' : 'var(--color-bg-elevated)'}`,
              background: notifications ? 'rgba(16,185,129,0.12)' : 'var(--color-bg-elevated)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border 0.2s, background 0.2s',
            }}
            aria-label={notifications ? 'Disable notifications' : 'Enable notifications'}
            aria-pressed={notifications}
          >
            {notifications
              ? <Bell size={18} color="var(--color-brand)" />
              : <BellOff size={18} color="var(--color-text-muted)" />}
          </motion.button>
        </div>

        {/* ── Form ───────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <IconPicker value={icon} onChange={setIcon} />
            <Form.Item
              validateStatus={errors.name ? 'error' : ''}
              help={errors.name?.message}
              style={{ margin: 0, flex: 1 }}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Habit name"
                    maxLength={50}
                    variant="borderless"
                    style={{
                      background: 'transparent',
                      color: 'var(--color-text-heading)',
                      fontSize: 26, fontWeight: 900,
                      letterSpacing: '-0.5px',
                      height: 'auto', padding: '4px 0',
                    }}
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Metadata surface */}
          <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 18, marginBottom: 16, overflow: 'hidden' }}>
            {/* Tags */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
              <span style={ROW_LABEL}>Tags</span>
              <Form.Item
                validateStatus={errors.tags ? 'error' : ''}
                help={errors.tags?.message}
                style={{ margin: 0, flex: 1 }}
              >
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="#fitness #health"
                      variant="borderless"
                      style={{ background: 'transparent', color: 'var(--color-text-body)', fontSize: 14, height: 'auto', padding: '2px 0' }}
                    />
                  )}
                />
              </Form.Item>
            </div>

            <div style={ROW_DIVIDER} />

            {/* Theme */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
              <span style={ROW_LABEL}>Theme</span>
              <Dropdown
                menu={{
                  items: themeMenuItems,
                  onClick: ({ key }) => setCardStyle(key as CardStyle),
                  selectedKeys: [cardStyle],
                }}
                trigger={['click']}
              >
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--color-bg-surface)',
                    border: 'none', borderRadius: 10,
                    padding: '7px 14px', cursor: 'pointer',
                    color: 'var(--color-text-body)',
                  }}
                >
                  <div style={{ width: 28, height: 18, borderRadius: 5, background: selectedStyle.gradient, flexShrink: 0 }} />
                  <span style={{ fontSize: 14 }}>{selectedStyle.label}</span>
                  <ChevronDown size={14} color="var(--color-text-muted)" />
                </button>
              </Dropdown>
            </div>

            <div style={ROW_DIVIDER} />

            {/* Frequency */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
              <span style={ROW_LABEL}>Frequency</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FREQUENCY_OPTIONS.map((opt) => {
                  const isActive = freqType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFreqType(opt.value)}
                      style={{
                        padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                        background: isActive ? 'var(--color-text-heading)' : 'var(--color-bg-surface)',
                        color: isActive ? 'var(--color-bg-page)' : 'var(--color-text-muted)',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Days (conditional) */}
            {freqType === 'specific' && (
              <>
                <div style={ROW_DIVIDER} />
                <div style={{ padding: '14px 16px' }}>
                  <Form.Item
                    validateStatus={errors.days ? 'error' : ''}
                    help={errors.days?.message}
                    style={{ margin: 0 }}
                  >
                    <Controller
                      name="days"
                      control={control}
                      render={({ field }) => (
                        <Checkbox.Group value={field.value} onChange={field.onChange}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {DAY_OPTIONS.map((day) => (
                              <Checkbox key={day.value} value={day.value}>
                                <span style={{ color: 'var(--color-text-body)', fontSize: 14 }}>{day.label}</span>
                              </Checkbox>
                            ))}
                          </div>
                        </Checkbox.Group>
                      )}
                    />
                  </Form.Item>
                </div>
              </>
            )}
          </div>

          {/* Inline rich text editor */}
          <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 18, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px 0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                Description
              </span>
            </div>
            <RichTextEditor
              value={descriptionJson}
              onChange={setDescriptionJson}
              placeholder="Add a description…"
            />
          </div>

          <div style={{ flex: 1, minHeight: 12 }} />

          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', height: 58, borderRadius: 99,
              background: loading ? 'var(--color-bg-elevated)' : 'var(--color-text-heading)',
              color: 'var(--color-bg-page)',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 17, fontWeight: 800, letterSpacing: '-0.2px',
              transition: 'background 0.2s',
              marginBottom: onDelete ? 12 : 0,
            }}
          >
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Streak'}
          </motion.button>

          {onDelete && (
            <Popconfirm
              title="Delete this streak?"
              description="All check-in history will be lost."
              onConfirm={onDelete}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <button
                type="button"
                style={{
                  width: '100%', height: 48, borderRadius: 99,
                  background: 'transparent', border: '1.5px solid var(--color-error)',
                  color: 'var(--color-error)', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Trash2 size={16} />
                Delete Streak
              </button>
            </Popconfirm>
          )}
        </form>
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles and build passes**

  ```bash
  bun run build 2>&1 | tail -20
  ```
  Expected: `✓ Compiled successfully` (or equivalent). No errors referencing `HabitForm`, `CardStyle`, `Dropdown`, or `ChevronDown`.

- [ ] **Step 3: Commit**

  ```bash
  git add components/features/habits/HabitForm/HabitForm.tsx
  git commit -m "feat: redesign HabitForm with inline editor, metadata rows, theme dropdown"
  ```

---

### Task 4: Visual verification

- [ ] **Step 1: Start the dev server**

  ```bash
  bun dev
  ```

- [ ] **Step 2: Navigate to New Streak form**

  Open `http://localhost:3000/habits/new` in the browser.

  Verify:
  - Header shows `[✕] New Streak [🔔]`
  - Icon picker and large title input sit side by side
  - Single metadata card shows Tags / Theme / Frequency rows separated by hairline dividers
  - Theme row shows an AntD Dropdown trigger with a gradient swatch and "Ocean" label
  - Clicking the trigger opens a dropdown listing all 7 themes, each with gradient swatch + name
  - Selecting a theme updates the trigger button swatch immediately
  - **No modal appears** — the RichTextEditor renders inline below the metadata card
  - Frequency → "Specific" reveals the Days row inside the same metadata card
  - "Create Streak" button at the bottom

- [ ] **Step 3: Navigate to Edit Streak form**

  Click the `…` button on any HabitCard to go to its edit page (e.g. `http://localhost:3000/habits/<id>/edit`).

  Verify:
  - Existing `cardStyle` value is pre-selected in the dropdown (swatch matches)
  - Existing `description` JSON is pre-loaded in the inline editor
  - Existing tags display correctly
  - "Save Changes" and "Delete Streak" buttons appear

- [ ] **Step 4: Verify all 7 gradients render on HabitCards**

  If you have existing habits, go to `/today` and observe that `wavy`, `geometric`, and `blob` cards still render correctly. Create a new habit and pick each new theme (aurora, ember, midnight, rose) — create one, save it, and confirm the card background matches the chosen gradient.

- [ ] **Step 5: Stop dev server and do a final build check**

  ```bash
  bun run build 2>&1 | tail -10
  ```
  Expected: clean build, no errors.

- [ ] **Step 6: Final commit**

  ```bash
  git add -A
  git commit -m "chore: verify habit form redesign — build clean, all 7 themes"
  ```
  (Only commit if there were any stray changes; skip if working tree is already clean after Task 3.)
