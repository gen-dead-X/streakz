# TipTap Rich Description + react-hook-form + Zod — Design Spec

**Date:** 2026-06-13
**Branch:** feature/card-interactions
**Status:** Approved (expanded scope)

---

## Overview

Three interrelated changes delivered together:

1. **TipTap rich-text description** — Replace the plain-text `description` field on habits with a TipTap editor. Clicking the field opens an AntD `Modal`. Stored as `JSONContent` in MongoDB. Rendered on `HabitCard` and in the form preview.
2. **react-hook-form** — Replace AntD `Form`/`Form.useForm()` in all four forms with `useForm` from react-hook-form. AntD input components stay; they are wrapped in `Controller`.
3. **Zod validation** — All form schemas defined as Zod objects in `lib/validation/`. Resolvers wired via `@hookform/resolvers/zod`.

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
- `react-hook-form` — form state management
- `@hookform/resolvers` — Zod adapter for react-hook-form
- `zod` — schema validation

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

## 3. Zod Schemas (`lib/validation/`)

One file per form domain. All schemas export the inferred TypeScript type alongside the schema.

### `lib/validation/habit.schema.ts`
```ts
export const habitSchema = z.object({
  name: z.string().min(1, 'Give your streak a name').max(50, 'Max 50 characters'),
  tags: z.string().optional(),                   // raw "#fitness #health" string, split on submit
  days: z.array(z.number()).optional(),
  // description managed outside RHF (TipTap JSON state)
});
export type HabitFormValues = z.infer<typeof habitSchema>;
```

### `lib/validation/auth.schema.ts`
```ts
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirm: z.string().min(1, 'Confirm your password'),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});
```

### `lib/validation/profile.schema.ts`
```ts
export const profileSchema = z.object({
  name: z.string().min(1, 'Enter a display name').trim(),
});
```

---

## 4. react-hook-form Integration Pattern

All four forms follow the same pattern. AntD `Form` component is **removed**. AntD input components stay, wrapped in `Controller`. AntD `Form.Item` is kept solely for label + error display (it accepts `validateStatus` and `help` props independently of AntD Form).

```tsx
// Example pattern (login form)
const { control, handleSubmit, formState: { errors } } = useForm<LoginValues>({
  resolver: zodResolver(loginSchema),
});

<form onSubmit={handleSubmit(onSubmit)}>
  <Form.Item validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
    <Controller
      name="email"
      control={control}
      render={({ field }) => <Input {...field} size="large" placeholder="you@example.com" />}
    />
  </Form.Item>
</form>
```

Note: `<form>` (native HTML) replaces `<Form>` (AntD). AntD `Form.Item` is used only as a layout/error wrapper.

---

## 5. HabitForm Changes (`components/features/habits/HabitForm/HabitForm.tsx`)

- Replace AntD `Form`/`Form.useForm()` with `useForm<HabitFormValues>({ resolver: zodResolver(habitSchema) })`
- Remove `Form.Item name="description"` with its `<Input maxLength={200} />`
- `name` and `tags` fields become `Controller`-wrapped AntD `Input` components
- `days` field becomes a `Controller`-wrapped AntD `Checkbox.Group`
- `cardStyle`, `freqType`, `notifications`, `icon` remain local `useState` (they use custom button UIs, not standard inputs — simpler than Controller)
- Add state:
  ```ts
  const [descriptionJson, setDescriptionJson] = useState<JSONContent | undefined>(
    typeof initial?.description === 'object' ? initial.description : undefined
  );
  const [editorOpen, setEditorOpen] = useState(false);
  ```
- Replace description input with a **clickable preview div**:
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
- In submit handler: `description: descriptionJson ?? undefined`

---

## 6. Auth + Profile Form Changes

### `app/(auth)/login/page.tsx`
- Replace AntD `Form` with native `<form onSubmit={handleSubmit(onSubmit)}>`
- Wire `loginSchema` via `zodResolver`
- `email` and `password` fields → `Controller` + AntD `Input`/`Input.Password`
- Inline `error` state (from BetterAuth response) stays — it's server error, not validation

### `app/(auth)/register/page.tsx`
- Same pattern with `registerSchema`
- `password !== confirm` check moves into the Zod `.refine()` — remove the manual `if` check

### `components/features/profile/ProfileForm/ProfileForm.tsx`
- Replace AntD `Form` with `useForm` + `profileSchema`
- Single `name` field → `Controller` + AntD `Input`
- `useEffect` that calls `form.setFieldsValue` is removed; replaced with `reset({ name: user?.name })` when session loads

---

## 7. HabitCard Changes (`components/ui/HabitCard/HabitCard.tsx`)

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

## 8. Backward Compatibility

| Stored value | RichTextPreview output |
|---|---|
| `""` (empty string, old habits) | nothing (falsy check) |
| `"Some text"` (string, edge case) | `<p>Some text</p>` |
| `JSONContent` object (new habits) | `generateHTML(content, extensions)` |

No server-side migration. The Mongoose `Mixed` type preserves all existing values as-is.

---

## 9. File Checklist

**New files:**
- `lib/validation/habit.schema.ts`
- `lib/validation/auth.schema.ts`
- `lib/validation/profile.schema.ts`
- `components/ui/RichTextEditor/RichTextEditor.tsx`
- `components/ui/RichTextEditor/RichTextEditor.types.ts`
- `components/ui/RichTextEditor/index.ts`
- `components/ui/RichTextPreview/RichTextPreview.tsx`
- `components/ui/RichTextPreview/index.ts`

**Modified files:**
- `models/Habit.ts` — description field type → Mixed
- `types/models/habit.types.ts` — description type → JSONContent | string
- `types/api/habits.types.ts` — description type → JSONContent | string
- `components/features/habits/HabitForm/HabitForm.tsx` — RHF + Zod + TipTap modal
- `components/ui/HabitCard/HabitCard.tsx` — RichTextPreview on card
- `app/(auth)/login/page.tsx` — RHF + Zod
- `app/(auth)/register/page.tsx` — RHF + Zod
- `components/features/profile/ProfileForm/ProfileForm.tsx` — RHF + Zod

**No changes needed:**
- API routes — JSONContent passes through as opaque object; no route logic touches description content
- Services — same
