# TipTap Rich Description + react-hook-form + Zod Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all AntD Form instances with react-hook-form + Zod, and add a TipTap rich-text editor for habit descriptions that opens in a modal and renders formatted content on the HabitCard.

**Architecture:** Zod schemas live in `lib/validation/`. Two new `ui/` components handle editor and preview (`RichTextEditor`, `RichTextPreview`). The four forms (`HabitForm`, `ProfileForm`, `LoginPage`, `RegisterPage`) drop AntD Form/Form.useForm in favour of `useForm` + `zodResolver`, keeping AntD Input components wrapped in `Controller`. `HabitForm` gains a click-to-open modal holding `RichTextEditor`; `HabitCard` renders `RichTextPreview`.

**Tech Stack:** TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`), `react-hook-form`, `@hookform/resolvers`, `zod`, AntD 6, Bun, bun:test

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| create | `lib/validation/habit.schema.ts` | Zod schema for HabitForm |
| create | `lib/validation/auth.schema.ts` | Zod schemas for Login + Register |
| create | `lib/validation/profile.schema.ts` | Zod schema for ProfileForm |
| create | `lib/validation/__tests__/schemas.test.ts` | Unit tests for all schemas |
| create | `components/ui/RichTextPreview/RichTextPreview.tsx` | Renders JSONContent or string as HTML |
| create | `components/ui/RichTextPreview/RichTextPreview.css` | Scoped `.rich-preview` typography |
| create | `components/ui/RichTextPreview/index.ts` | Re-export |
| create | `components/ui/RichTextEditor/RichTextEditor.tsx` | TipTap editor + toolbar |
| create | `components/ui/RichTextEditor/RichTextEditor.types.ts` | Props type |
| create | `components/ui/RichTextEditor/RichTextEditor.css` | Editor chrome styles |
| create | `components/ui/RichTextEditor/index.ts` | Re-export + RENDER_EXTENSIONS |
| modify | `models/Habit.ts` | description → Schema.Types.Mixed |
| modify | `types/models/habit.types.ts` | description → JSONContent \| string |
| modify | `types/api/habits.types.ts` | description → JSONContent \| string |
| modify | `components/ui/HabitCard/HabitCard.tsx` | Use RichTextPreview for description |
| modify | `components/features/habits/HabitForm/HabitForm.tsx` | RHF + Zod + TipTap modal |
| modify | `app/(auth)/login/page.tsx` | RHF + Zod |
| modify | `app/(auth)/register/page.tsx` | RHF + Zod |
| modify | `components/features/profile/ProfileForm/ProfileForm.tsx` | RHF + Zod |

---

## Task 1: Install packages

**Files:** `package.json` (bun will update it)

- [ ] **Step 1: Install all new dependencies**

```bash
cd "/Volumes/Macky/Extras and Softs/Dev/streak-counter"
bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-placeholder react-hook-form @hookform/resolvers zod
```

Expected: packages resolve without peer dependency errors. `package.json` lists all 8 new packages under `dependencies`.

- [ ] **Step 2: Verify build still passes**

```bash
bun run build
```

Expected: build succeeds (no new code changed yet, just deps).

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: install tiptap, react-hook-form, zod"
```

---

## Task 2: Data layer — Mongoose model + TypeScript types

**Files:**
- Modify: `models/Habit.ts`
- Modify: `types/models/habit.types.ts`
- Modify: `types/api/habits.types.ts`

- [ ] **Step 1: Update Mongoose model**

In `models/Habit.ts`, change line 16 from:
```ts
description: { type: String, default: '' },
```
to:
```ts
description: { type: Schema.Types.Mixed, default: null },
```

- [ ] **Step 2: Update habit model type**

In `types/models/habit.types.ts`, add the import and change the description field:

Add at top of file (after existing imports, or as first import):
```ts
import type { JSONContent } from '@tiptap/core';
```

Change:
```ts
description?: string;
```
to:
```ts
description?: JSONContent | string;
```

(applies to the `Habit` interface)

- [ ] **Step 3: Update API types**

In `types/api/habits.types.ts`, add the same import at top:
```ts
import type { JSONContent } from '@tiptap/core';
```

Change `description?: string` to `description?: JSONContent | string` in **both** `CreateHabitInput` and `UpdateHabitInput`.

- [ ] **Step 4: Verify no TS errors**

```bash
bun run build 2>&1 | head -30
```

Expected: build passes. If there are errors about `JSONContent` import, check the import path — `@tiptap/core` exports this type.

- [ ] **Step 5: Commit**

```bash
git add models/Habit.ts types/models/habit.types.ts types/api/habits.types.ts
git commit -m "feat: change habit description field to Mixed for JSONContent storage"
```

---

## Task 3: Zod validation schemas + tests

**Files:**
- Create: `lib/validation/habit.schema.ts`
- Create: `lib/validation/auth.schema.ts`
- Create: `lib/validation/profile.schema.ts`
- Create: `lib/validation/__tests__/schemas.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `lib/validation/__tests__/schemas.test.ts`:

```ts
import { describe, test, expect } from 'bun:test';
import { habitSchema } from '../habit.schema';
import { loginSchema, registerSchema } from '../auth.schema';
import { profileSchema } from '../profile.schema';

describe('habitSchema', () => {
  test('passes with valid name', () => {
    const result = habitSchema.safeParse({ name: 'Run every day' });
    expect(result.success).toBe(true);
  });
  test('fails when name is empty', () => {
    const result = habitSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Give your streak a name');
  });
  test('fails when name exceeds 50 chars', () => {
    const result = habitSchema.safeParse({ name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Max 50 characters');
  });
  test('passes with optional fields missing', () => {
    const result = habitSchema.safeParse({ name: 'Meditate' });
    expect(result.success).toBe(true);
  });
});

describe('loginSchema', () => {
  test('passes with valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'secret' });
    expect(result.success).toBe(true);
  });
  test('fails with invalid email', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'secret' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter a valid email');
  });
  test('fails with empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter your password');
  });
});

describe('registerSchema', () => {
  const valid = { name: 'Joy', email: 'joy@test.com', password: 'password1', confirm: 'password1' };

  test('passes with all valid fields', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });
  test('fails when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...valid, confirm: 'different' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Passwords do not match');
    expect(result.error?.issues[0].path).toEqual(['confirm']);
  });
  test('fails with password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short', confirm: 'short' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('At least 8 characters');
  });
});

describe('profileSchema', () => {
  test('passes with non-empty name', () => {
    expect(profileSchema.safeParse({ name: 'Joy' }).success).toBe(true);
  });
  test('fails with empty name', () => {
    const result = profileSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter a display name');
  });
});
```

- [ ] **Step 2: Run tests — expect failures (schemas don't exist yet)**

```bash
bun test lib/validation/__tests__/schemas.test.ts
```

Expected: `Cannot find module '../habit.schema'` errors. Good.

- [ ] **Step 3: Create `lib/validation/habit.schema.ts`**

```ts
import { z } from 'zod';

export const habitSchema = z.object({
  name: z.string().min(1, 'Give your streak a name').max(50, 'Max 50 characters'),
  tags: z.string().optional(),
  days: z.array(z.number()).optional(),
});

export type HabitFormValues = z.infer<typeof habitSchema>;
```

- [ ] **Step 4: Create `lib/validation/auth.schema.ts`**

```ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Enter your name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
```

- [ ] **Step 5: Create `lib/validation/profile.schema.ts`**

```ts
import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Enter a display name').trim(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
```

- [ ] **Step 6: Run tests — expect all pass**

```bash
bun test lib/validation/__tests__/schemas.test.ts
```

Expected: 11 tests pass, 0 failures.

- [ ] **Step 7: Commit**

```bash
git add lib/validation/
git commit -m "feat: add Zod validation schemas for all forms"
```

---

## Task 4: RichTextPreview component

**Files:**
- Create: `components/ui/RichTextPreview/RichTextPreview.tsx`
- Create: `components/ui/RichTextPreview/RichTextPreview.css`
- Create: `components/ui/RichTextPreview/index.ts`

Note: `RichTextPreview` imports `RENDER_EXTENSIONS` from `@/components/ui/RichTextEditor`. `RichTextEditor` must export it (Task 5). For now, create the preview — build will fail until Task 5 adds the export. Both tasks should be committed together only after both pass build.

- [ ] **Step 1: Create `components/ui/RichTextPreview/RichTextPreview.css`**

```css
.rich-preview {
  margin: 0;
  line-height: 1.5;
}
.rich-preview p {
  margin: 0 0 0.5em;
}
.rich-preview p:last-child {
  margin-bottom: 0;
}
.rich-preview strong {
  font-weight: 700;
}
.rich-preview em {
  font-style: italic;
}
.rich-preview u {
  text-decoration: underline;
}
.rich-preview s {
  text-decoration: line-through;
}
.rich-preview h1 {
  font-size: 1.25em;
  font-weight: 800;
  margin: 0 0 0.5em;
  line-height: 1.2;
}
.rich-preview h2 {
  font-size: 1.1em;
  font-weight: 700;
  margin: 0 0 0.5em;
  line-height: 1.2;
}
.rich-preview h3 {
  font-size: 1em;
  font-weight: 700;
  margin: 0 0 0.4em;
}
.rich-preview ul,
.rich-preview ol {
  margin: 0 0 0.5em;
  padding-left: 1.5em;
}
.rich-preview li {
  margin: 0;
}
.rich-preview blockquote {
  border-left: 3px solid currentColor;
  opacity: 0.75;
  margin: 0 0 0.5em;
  padding-left: 1em;
}
.rich-preview code {
  font-family: monospace;
  font-size: 0.875em;
  background: rgba(128, 128, 128, 0.15);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}
.rich-preview pre {
  background: rgba(128, 128, 128, 0.15);
  padding: 0.75em 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0 0 0.5em;
}
.rich-preview pre code {
  background: none;
  padding: 0;
}
.rich-preview a {
  text-decoration: underline;
  opacity: 0.9;
}
.rich-preview hr {
  border: none;
  border-top: 1px solid currentColor;
  opacity: 0.3;
  margin: 0.75em 0;
}
```

- [ ] **Step 2: Create `components/ui/RichTextPreview/RichTextPreview.tsx`**

```tsx
import './RichTextPreview.css';
import { generateHTML } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import { RENDER_EXTENSIONS } from '@/components/ui/RichTextEditor';

interface RichTextPreviewProps {
  content: JSONContent | string | undefined | null;
  className?: string;
}

export function RichTextPreview({ content, className }: RichTextPreviewProps) {
  if (!content) return null;

  const cls = `rich-preview${className ? ` ${className}` : ''}`;

  if (typeof content === 'string') {
    return <p className={cls}>{content}</p>;
  }

  const html = generateHTML(content, RENDER_EXTENSIONS);
  return <div className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
}
```

- [ ] **Step 3: Create `components/ui/RichTextPreview/index.ts`**

```ts
export { RichTextPreview } from './RichTextPreview';
```

---

## Task 5: RichTextEditor component

**Files:**
- Create: `components/ui/RichTextEditor/RichTextEditor.types.ts`
- Create: `components/ui/RichTextEditor/RichTextEditor.css`
- Create: `components/ui/RichTextEditor/RichTextEditor.tsx`
- Create: `components/ui/RichTextEditor/index.ts`

- [ ] **Step 1: Create `components/ui/RichTextEditor/RichTextEditor.types.ts`**

```ts
import type { JSONContent } from '@tiptap/core';

export interface RichTextEditorProps {
  value?: JSONContent;
  onChange: (v: JSONContent) => void;
  placeholder?: string;
}
```

- [ ] **Step 2: Create `components/ui/RichTextEditor/RichTextEditor.css`**

```css
.rte-wrapper {
  border: 1.5px solid var(--color-bg-elevated);
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-bg-elevated);
  display: flex;
  flex-direction: column;
}

.rte-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-bg-surface);
}

.rte-toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-body);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.12s, color 0.12s;
  font-family: inherit;
}
.rte-toolbar-btn:hover {
  background: var(--color-bg-elevated);
}
.rte-toolbar-btn.is-active {
  background: var(--color-text-heading);
  color: var(--color-bg-page);
}
.rte-toolbar-sep {
  width: 1px;
  height: 24px;
  background: var(--color-border-subtle);
  margin: 4px 4px;
  align-self: center;
}

.rte-content {
  flex: 1;
  padding: 14px 16px;
  min-height: 200px;
  max-height: 60vh;
  overflow-y: auto;
  color: var(--color-text-heading);
  font-size: 15px;
  line-height: 1.6;
  outline: none;
}

.rte-content .tiptap {
  outline: none;
  min-height: 160px;
}

.rte-content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--color-text-muted);
  pointer-events: none;
  float: left;
  height: 0;
}

.rte-content .tiptap p { margin: 0 0 0.6em; }
.rte-content .tiptap p:last-child { margin-bottom: 0; }
.rte-content .tiptap h1 { font-size: 1.4em; font-weight: 800; margin: 0 0 0.5em; }
.rte-content .tiptap h2 { font-size: 1.2em; font-weight: 700; margin: 0 0 0.5em; }
.rte-content .tiptap h3 { font-size: 1.05em; font-weight: 700; margin: 0 0 0.4em; }
.rte-content .tiptap ul, .rte-content .tiptap ol { padding-left: 1.5em; margin: 0 0 0.6em; }
.rte-content .tiptap blockquote {
  border-left: 3px solid var(--color-border-strong);
  padding-left: 1em;
  color: var(--color-text-muted);
  margin: 0 0 0.6em;
}
.rte-content .tiptap code {
  font-family: monospace;
  font-size: 0.875em;
  background: var(--color-bg-surface);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}
.rte-content .tiptap pre {
  background: var(--color-bg-surface);
  padding: 0.75em 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0 0 0.6em;
}
.rte-content .tiptap pre code { background: none; padding: 0; }
.rte-content .tiptap hr { border: none; border-top: 1px solid var(--color-border-subtle); margin: 0.75em 0; }
.rte-content .tiptap a { text-decoration: underline; color: var(--color-brand); }
```

- [ ] **Step 3: Create `components/ui/RichTextEditor/RichTextEditor.tsx`**

```tsx
'use client';
import './RichTextEditor.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { JSONContent } from '@tiptap/core';
import type { RichTextEditorProps } from './RichTextEditor.types';

export function RichTextEditor({ value, onChange, placeholder = 'Write a description…' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as JSONContent);
    },
  });

  if (!editor) return null;

  function btn(label: string, active: boolean, onClick: () => void, title?: string) {
    return (
      <button
        key={label}
        type="button"
        className={`rte-toolbar-btn${active ? ' is-active' : ''}`}
        onClick={onClick}
        title={title ?? label}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  }

  function setLink() {
    const prev = editor!.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="rte-wrapper">
      <div className="rte-toolbar">
        {btn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold')}
        {btn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic')}
        {btn('U', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline')}
        {btn('S', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'Strikethrough')}
        <div className="rte-toolbar-sep" />
        {btn('H1', editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
        {btn('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn('H3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        <div className="rte-toolbar-sep" />
        {btn('•—', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet list')}
        {btn('1—', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Numbered list')}
        {btn('❝', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Blockquote')}
        <div className="rte-toolbar-sep" />
        {btn('`', editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Inline code')}
        {btn('🔗', editor.isActive('link'), setLink, 'Link')}
        {btn('—', false, () => editor.chain().focus().setHorizontalRule().run(), 'Horizontal rule')}
      </div>
      <div className="rte-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `components/ui/RichTextEditor/index.ts`**

```ts
export { RichTextEditor } from './RichTextEditor';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

export const RENDER_EXTENSIONS = [StarterKit, Underline, Link];
```

- [ ] **Step 5: Verify build passes (both RichTextEditor and RichTextPreview now complete)**

```bash
bun run build 2>&1 | head -40
```

Expected: build succeeds. If there's a type error from `RENDER_EXTENSIONS` in `RichTextPreview`, confirm the import path is `@/components/ui/RichTextEditor` (not `.../index`).

- [ ] **Step 6: Commit**

```bash
git add components/ui/RichTextEditor/ components/ui/RichTextPreview/
git commit -m "feat: add RichTextEditor and RichTextPreview components"
```

---

## Task 6: HabitCard — render rich description

**Files:**
- Modify: `components/ui/HabitCard/HabitCard.tsx`

- [ ] **Step 1: Add RichTextPreview import**

In `components/ui/HabitCard/HabitCard.tsx`, add to the imports at the top:
```ts
import { RichTextPreview } from '@/components/ui/RichTextPreview';
```

- [ ] **Step 2: Replace description block**

Find the current description block (lines 152–165):
```tsx
{/* Description */}
{habit.description && (
  <p style={{
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    margin: '0 0 8px',
    lineHeight: 1.4,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  }}>
    {habit.description}
  </p>
)}
```

Replace with:
```tsx
{/* Description */}
{habit.description && (
  <div style={{
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    margin: '0 0 8px',
    maxHeight: 38,
    overflow: 'hidden',
  }}>
    <RichTextPreview content={habit.description} />
  </div>
)}
```

- [ ] **Step 3: Verify build**

```bash
bun run build 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ui/HabitCard/HabitCard.tsx
git commit -m "feat: render rich text description on HabitCard"
```

---

## Task 7: HabitForm — react-hook-form + Zod + TipTap modal

**Files:**
- Modify: `components/features/habits/HabitForm/HabitForm.tsx`

This is the largest change. Fully replace the file content.

- [ ] **Step 1: Replace HabitForm.tsx**

Replace the entire content of `components/features/habits/HabitForm/HabitForm.tsx` with:

```tsx
'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Checkbox, Popconfirm, Modal } from 'antd';
import { Bell, BellOff, X, Trash2, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { IconPicker } from '@/components/ui/IconPicker';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { RichTextPreview } from '@/components/ui/RichTextPreview';
import { FREQUENCY_OPTIONS, DAY_OPTIONS } from '@/constants/habits/frequency.constants';
import { DEFAULT_ICON } from '@/constants/habits/icon.constants';
import { habitSchema, type HabitFormValues } from '@/lib/validation/habit.schema';
import type { CardStyle, Habit, Frequency } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';
import type { JSONContent } from '@tiptap/core';

const CARD_STYLES: { value: CardStyle; gradient: string; label: string }[] = [
  { value: 'wavy',      gradient: 'linear-gradient(135deg, #00c6ff, #0061ff, #0033dd)', label: 'Ocean'    },
  { value: 'geometric', gradient: 'linear-gradient(135deg, #e8b950, #f0516b, #8b2ff8)', label: 'Sunset'   },
  { value: 'blob',      gradient: 'linear-gradient(125deg, #10b981, #047857, #065f46)', label: 'Forest'   },
];

interface HabitFormProps {
  initial?: Habit;
  onSave: (data: CreateHabitInput | UpdateHabitInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isEdit?: boolean;
}

const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--color-bg-elevated)',
  borderColor: 'transparent',
  color: 'var(--color-text-heading)',
  borderRadius: 14,
  fontSize: 16,
  height: 52,
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 10,
  display: 'block',
};

export function HabitForm({ initial, onSave, onCancel, onDelete, isEdit = false }: HabitFormProps) {
  const [icon, setIcon] = useState(initial?.icon ?? DEFAULT_ICON);
  const [cardStyle, setCardStyle] = useState<CardStyle>(
    initial?.cardStyle ?? (CARD_STYLES[Math.floor(Math.random() * 3)].value),
  );
  const [notifications, setNotifications] = useState(initial?.notifications ?? true);
  const [freqType, setFreqType] = useState<Frequency['type']>(initial?.frequency.type ?? 'daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descriptionJson, setDescriptionJson] = useState<JSONContent | undefined>(
    initial?.description && typeof initial.description === 'object'
      ? (initial.description as JSONContent)
      : undefined,
  );
  const [editorOpen, setEditorOpen] = useState(false);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* ── Header ────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28,
      }}>
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

        <h1 style={{
          margin: 0,
          fontSize: 22, fontWeight: 900,
          color: 'var(--color-text-heading)',
          letterSpacing: '-0.5px',
        }}>
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
            : <BellOff size={18} color="var(--color-text-muted)" />
          }
        </motion.button>
      </div>

      {/* ── Form ──────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Icon */}
        <div style={{ marginBottom: 24 }}>
          <span style={SECTION_LABEL}>Icon</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        {/* Name */}
        <Form.Item
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
          style={{ marginBottom: 12 }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="Name"
                maxLength={50}
                style={INPUT_STYLE}
              />
            )}
          />
        </Form.Item>

        {/* Description — click to open TipTap modal */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setEditorOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setEditorOpen(true)}
          style={{
            background: 'var(--color-bg-elevated)',
            borderRadius: 14,
            minHeight: 52,
            padding: '14px 16px',
            cursor: 'pointer',
            marginBottom: 12,
            position: 'relative',
            display: 'flex',
            alignItems: descriptionJson ? 'flex-start' : 'center',
          }}
        >
          {descriptionJson ? (
            <div style={{ flex: 1, paddingRight: 24, maxHeight: 80, overflow: 'hidden' }}>
              <RichTextPreview content={descriptionJson} />
            </div>
          ) : (
            <span style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>
              Description (optional)
            </span>
          )}
          <Pencil
            size={14}
            color="var(--color-text-muted)"
            style={{ position: 'absolute', top: 10, right: 12, flexShrink: 0 }}
          />
        </div>

        {/* TipTap modal */}
        <Modal
          open={editorOpen}
          onCancel={() => setEditorOpen(false)}
          title="Edit Description"
          width={680}
          footer={null}
          destroyOnHidden
        >
          {editorOpen && (
            <RichTextEditor
              value={descriptionJson}
              onChange={setDescriptionJson}
              placeholder="Add a rich description…"
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <motion.button
              type="button"
              onClick={() => setEditorOpen(false)}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '10px 24px',
                borderRadius: 99,
                background: 'var(--color-text-heading)',
                color: 'var(--color-bg-page)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Done
            </motion.button>
          </div>
        </Modal>

        {/* Tags */}
        <Form.Item
          validateStatus={errors.tags ? 'error' : ''}
          help={errors.tags?.message}
          style={{ marginBottom: 24 }}
        >
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="#fitness #health (optional)"
                style={INPUT_STYLE}
              />
            )}
          />
        </Form.Item>

        {/* Card style */}
        <div style={{ marginBottom: 24 }}>
          <span style={SECTION_LABEL}>Card Style</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {CARD_STYLES.map(({ value, gradient, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCardStyle(value)}
                style={{
                  flex: 1, height: 52, borderRadius: 14, cursor: 'pointer',
                  background: gradient,
                  border: cardStyle === value ? '3px solid #fff' : '3px solid transparent',
                  outline: cardStyle === value ? '2px solid var(--color-brand)' : 'none',
                  transition: 'border 0.15s, outline 0.15s',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  paddingBottom: 7,
                  fontSize: 10, fontWeight: 700,
                  color: 'rgba(255,255,255,0.85)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
                aria-label={label}
                aria-pressed={cardStyle === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: freqType === 'specific' ? 12 : 24 }}>
          <span style={SECTION_LABEL}>Frequency</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FREQUENCY_OPTIONS.map((opt) => {
              const isActive = freqType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFreqType(opt.value)}
                  style={{
                    padding: '10px 18px', borderRadius: 99, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--color-text-heading)' : 'var(--color-bg-elevated)',
                    color: isActive ? 'var(--color-bg-page)' : 'var(--color-text-body)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific days picker */}
        {freqType === 'specific' && (
          <div style={{ marginBottom: 24 }}>
            <span style={SECTION_LABEL}>Days</span>
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
        )}

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 16 }} />

        {/* Error */}
        {error && (
          <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        {/* CTA */}
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

        {/* Delete (edit only) */}
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

- [ ] **Step 2: Verify build**

```bash
bun run build 2>&1 | head -30
```

Expected: no errors. If AntD `Modal` complains about `destroyOnHidden`, check the AntD v6 guide at `docs/guides/antd.md` for the correct prop name (may be `destroyOnClose`).

- [ ] **Step 3: Commit**

```bash
git add components/features/habits/HabitForm/HabitForm.tsx
git commit -m "feat: migrate HabitForm to react-hook-form + Zod, add TipTap description modal"
```

---

## Task 8: Login page — react-hook-form + Zod

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Replace login page content**

Replace the entire content of `app/(auth)/login/page.tsx` with:

```tsx
'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Divider, Typography, Alert } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FireOutlined } from '@ant-design/icons';
import { signIn } from '@/lib/auth/auth-client';
import { loginSchema, type LoginValues } from '@/lib/validation/auth.schema';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    setError(null);
    const { error: err } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: '/today',
    });
    if (err) {
      setError(err.message ?? 'Invalid email or password');
      setLoading(false);
    } else {
      router.push('/today');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div className="w-full" style={{ maxWidth: 360 }}>
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-3"
            style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-brand)' }}
          >
            <FireOutlined style={{ fontSize: 28, color: 'var(--color-bg-page)' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            Streak Counter
          </Title>
          <Text style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Sign in to your account
          </Text>
        </div>

        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Email</Text>}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Password</Text>}
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              block
              loading={loading}
              style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
            >
              Sign In
            </Button>
          </Form.Item>
        </form>

        <Divider style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
          or
        </Divider>

        <Button
          size="large"
          block
          disabled
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-muted)',
            marginBottom: 24,
            cursor: 'not-allowed',
          }}
        >
          Continue with Google
        </Button>

        <Text style={{ color: 'var(--color-text-muted)', display: 'block', textAlign: 'center' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--color-brand)' }}>
            Sign up
          </Link>
        </Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
bun run build 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/login/page.tsx"
git commit -m "feat: migrate login form to react-hook-form + Zod"
```

---

## Task 9: Register page — react-hook-form + Zod

**Files:**
- Modify: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Replace register page content**

Replace the entire content of `app/(auth)/register/page.tsx` with:

```tsx
'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Divider, Typography, Alert } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FireOutlined } from '@ant-design/icons';
import { signUp } from '@/lib/auth/auth-client';
import { registerSchema, type RegisterValues } from '@/lib/validation/auth.schema';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterValues) {
    setLoading(true);
    setError(null);
    const { error: err } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: '/today',
    });
    if (err) {
      setError(err.message ?? 'Could not create account');
      setLoading(false);
    } else {
      router.push('/today');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div className="w-full" style={{ maxWidth: 360 }}>
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-3"
            style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-brand)' }}
          >
            <FireOutlined style={{ fontSize: 28, color: 'var(--color-bg-page)' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            Get Started
          </Title>
          <Text style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Create your account
          </Text>
        </div>

        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Name</Text>}
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Your name"
                  autoComplete="name"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Email</Text>}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Password</Text>}
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Confirm Password</Text>}
            validateStatus={errors.confirm ? 'error' : ''}
            help={errors.confirm?.message}
          >
            <Controller
              name="confirm"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              block
              loading={loading}
              style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
            >
              Create Account
            </Button>
          </Form.Item>
        </form>

        <Divider style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
          or
        </Divider>

        <Button
          size="large"
          block
          disabled
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-muted)',
            marginBottom: 24,
            cursor: 'not-allowed',
          }}
        >
          Continue with Google
        </Button>

        <Text style={{ color: 'var(--color-text-muted)', display: 'block', textAlign: 'center' }}>
          Have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-brand)' }}>
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
bun run build 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/register/page.tsx"
git commit -m "feat: migrate register form to react-hook-form + Zod"
```

---

## Task 10: ProfileForm — react-hook-form + Zod

**Files:**
- Modify: `components/features/profile/ProfileForm/ProfileForm.tsx`

- [ ] **Step 1: Replace ProfileForm.tsx content**

Replace the entire content of `components/features/profile/ProfileForm/ProfileForm.tsx` with:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, Button, Form, Input, Typography, Alert, Divider } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSession, signOut, authClient } from '@/lib/auth/auth-client';
import { profileSchema, type ProfileValues } from '@/lib/validation/profile.schema';

const { Title, Text } = Typography;

export function ProfileForm() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const user = session?.user;
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (user?.name) reset({ name: user.name });
  }, [user?.name, reset]);

  async function onSubmit(values: ProfileValues) {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    const { error } = await authClient.updateUser({ name: values.name.trim() });
    setSaving(false);
    if (error) {
      setSaveError(error.message ?? 'Failed to save changes');
    } else {
      setSaveSuccess(true);
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    try {
      const reg = await navigator.serviceWorker?.getRegistration('/sw.js');
      const sub = await reg?.pushManager?.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
    } catch {
      // Push cleanup failure must never block logout
    }
    await signOut({ fetchOptions: { onSuccess: () => router.push('/login') } });
  }

  if (isPending) return null;

  return (
    <div style={{ maxWidth: 480 }}>
      <div className="flex items-center gap-4 mb-8">
        <Avatar
          src={user?.image ?? undefined}
          size={64}
          icon={!user?.image ? <UserOutlined /> : undefined}
          style={{
            background: 'var(--color-brand)',
            color: 'var(--color-bg-page)',
            fontWeight: 700,
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {!user?.image && initials}
        </Avatar>
        <div>
          <Title level={4} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            {user?.name}
          </Title>
          <Text style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{user?.email}</Text>
        </div>
      </div>

      {saveError && (
        <Alert
          title={saveError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setSaveError(null)}
        />
      )}
      {saveSuccess && (
        <Alert
          title="Name updated successfully"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setSaveSuccess(false)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Form.Item
          label={<Text style={{ color: 'var(--color-text-body)' }}>Display Name</Text>}
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="Your name"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              />
            )}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={saving}
            style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
          >
            Save Changes
          </Button>
        </Form.Item>
      </form>

      <Divider style={{ borderColor: 'var(--color-border-subtle)', marginTop: 32 }} />

      <Button
        size="large"
        danger
        icon={<LogoutOutlined />}
        loading={loggingOut}
        onClick={onLogout}
        style={{
          background: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-error)',
        }}
      >
        Log Out
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
bun run build 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/features/profile/ProfileForm/ProfileForm.tsx
git commit -m "feat: migrate ProfileForm to react-hook-form + Zod"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run all tests**

```bash
bun test
```

Expected: all tests pass including the 11 schema tests from Task 3.

- [ ] **Step 2: Full build**

```bash
bun run build
```

Expected: clean build, no TypeScript errors, no import errors.

- [ ] **Step 3: Manual smoke test checklist**

Start dev server: `bun run dev`

Test these paths:
1. `/login` — submit with empty fields → Zod errors appear inline (no page reload)
2. `/register` — submit mismatched passwords → "Passwords do not match" under confirm field
3. `/habits/new` — click description area → TipTap modal opens; type rich text, click Done → preview shows formatted content in form
4. Create the habit → go to home → HabitCard shows formatted description text
5. `/habits/[id]/edit` — open existing habit → description preview shows previously saved content; click to re-open editor → content is preserved
6. `/profile` — change name, save → success alert; form field stays populated

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete TipTap rich description, react-hook-form, and Zod migration"
```
