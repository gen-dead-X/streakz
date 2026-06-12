# TipTap Rich Text Description — Design Spec

**Date:** 2026-06-13
**Branch:** feature/card-interactions
**Status:** Approved

---

## Overview

Replace the plain-text `description` field on habits with a TipTap rich-text editor. Clicking the description area in `HabitForm` opens an AntD `Modal` containing the full editor. Stored as TipTap `JSONContent` in MongoDB. Rendered as formatted HTML on both the form preview and the `HabitCard`.

---

## 1. Data Layer

### Mongoose model (`models/Habit.ts`)
- Change `description: { type: String, default: '' }` → `{ type: Schema.Types.Mixed, default: null }`
- No migration script required — MongoDB stores JSONContent as a nested document natively. Existing habits with `description: ""` continue to load and display as plain text (backward compat).

### TypeScript types
- `types/models/habit.types.ts`: `description?: string` → `description?: JSONContent | string`
- `types/api/habits.types.ts`: same change on `CreateHabitInput.description` and `UpdateHabitInput.description`
- `JSONContent` imported from `@tiptap/core`

### Packages
Install with `bun add`:
- `@tiptap/react` — React integration
- `@tiptap/starter-kit` — Bold, Italic, Strike, Code, CodeBlock, Blockquote, BulletList, OrderedList, Heading (H1–H3), HorizontalRule, Paragraph, Text, History
- `@tiptap/extension-underline`
- `@tiptap/extension-link`
- `@tiptap/extension-placeholder`

---

## 2. New Components

### `components/ui/RichTextEditor/`
Files: `RichTextEditor.tsx`, `RichTextEditor.types.ts`, `index.ts`

**Props:**
```ts
interface RichTextEditorProps {
  value?: JSONContent;
  onChange: (v: JSONContent) => void;
  placeholder?: string;
}
```

**Behaviour:**
- Fixed toolbar above the editor content area. Buttons: Bold, Italic, Underline, Strike, `|` H1/H2/H3, `|` BulletList, OrderedList, Blockquote, `|` Link, Code, HR
- Each toolbar button uses `editor.isActive()` to show an active/highlighted state
- Editor content area: `min-height: 200px`, `max-height: 60vh`, independently scrollable
- Exports `EDITOR_EXTENSIONS` array (the shared extension list) so `RichTextPreview` reuses it for `generateHTML`
- All colours use CSS variables — no hardcoded hex

### `components/ui/RichTextPreview/`
Files: `RichTextPreview.tsx`, `index.ts`

**Props:**
```ts
interface RichTextPreviewProps {
  content: JSONContent | string | undefined | null;
  className?: string;
}
```

**Behaviour:**
- `content` is a string → renders `<p>{content}</p>` (backward compat)
- `content` is a JSONContent object → `generateHTML(content, EDITOR_EXTENSIONS)` → `dangerouslySetInnerHTML` (safe: content is always our own editor output, never external input)
- `content` is null/undefined → renders nothing
- Wrapping `<div>` gets class `.rich-preview` for scoped typography CSS
- `.rich-preview` styles: `p`, `strong`, `em`, `u`, `s`, `ul`, `ol`, `li`, `h1`, `h2`, `h3`, `blockquote`, `code`, `a` — all inherit `color` from parent so they work on both dark gradient cards and the light form background

---

## 3. HabitForm Changes (`components/features/habits/HabitForm/HabitForm.tsx`)

- Remove `Form.Item name="description"` with its `<Input maxLength={200} />`
- Add state:
  ```ts
  const [descriptionJson, setDescriptionJson] = useState<JSONContent | undefined>(
    typeof initial?.description === 'object' ? initial.description : undefined
  );
  const [editorOpen, setEditorOpen] = useState(false);
  ```
- Replace with a **clickable preview div**:
  - Same styling as other inputs: `background: var(--color-bg-elevated)`, `border-radius: 14px`, `min-height: 52px`, `padding: 14px 16px`
  - Empty state: muted placeholder "Description (optional)" at `var(--color-text-muted)`
  - Filled state: `<RichTextPreview content={descriptionJson} />`
  - Pencil icon (Lucide `Pencil`, 14px, `var(--color-text-muted)`) in top-right corner as affordance
  - `onClick` → `setEditorOpen(true)`
- **AntD Modal**:
  - `open={editorOpen}`, `onCancel={() => setEditorOpen(false)}`
  - `width={680}`, `title="Edit Description"`, `footer={null}`
  - Body contains `<RichTextEditor value={descriptionJson} onChange={setDescriptionJson} />`
  - "Done" button below the editor (right-aligned) closes the modal
- In `onFinish`: `description: descriptionJson ?? undefined`

---

## 4. HabitCard Changes (`components/ui/HabitCard/HabitCard.tsx`)

- Replace the description `<p>` block (current lines 152–165) with:
  ```tsx
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
- `maxHeight: 38px` (≈2 lines at 13px × 1.4 line-height) with `overflow: hidden` replaces `-webkit-line-clamp`. Line-clamp only works on text nodes; TipTap generates block-level HTML (`<p>`, `<ul>`, `<h1>`) so max-height is the correct truncation approach here.
- `.rich-preview` inherits `color: rgba(255,255,255,0.72)` from the parent div — no extra overrides needed for the card context

---

## 5. Backward Compatibility

| Stored value | RichTextPreview output |
|---|---|
| `""` (empty string, old habits) | nothing (falsy check) |
| `"Some text"` (string, edge case) | `<p>Some text</p>` |
| `JSONContent` object (new habits) | `generateHTML(content, extensions)` |

No server-side migration. The Mongoose `Mixed` type preserves all existing values as-is.

---

## 6. File Checklist

**New files:**
- `components/ui/RichTextEditor/RichTextEditor.tsx`
- `components/ui/RichTextEditor/RichTextEditor.types.ts`
- `components/ui/RichTextEditor/index.ts`
- `components/ui/RichTextPreview/RichTextPreview.tsx`
- `components/ui/RichTextPreview/index.ts`

**Modified files:**
- `models/Habit.ts` — description field type
- `types/models/habit.types.ts` — description type
- `types/api/habits.types.ts` — description type
- `components/features/habits/HabitForm/HabitForm.tsx` — editor modal integration
- `components/ui/HabitCard/HabitCard.tsx` — RichTextPreview on card

**No changes needed:**
- API routes — JSONContent passes through as opaque object; no route logic touches description content
- Services — same
