# Tailwind CSS v4 — Agent Guide

> **MANDATORY:** Before writing any Tailwind classes, read:
> `node_modules/tailwindcss/README.md`
> `node_modules/@tailwindcss/postcss/README.md`
>
> Tailwind v4 has **major breaking changes** from v3. Config, syntax, and class names changed.
> Do NOT rely on v3 knowledge. Verify any class you're unsure about.

---

## Before Writing Tailwind Code

Check if a utility class exists in v4:
```bash
grep -r "your-class-name" node_modules/tailwindcss/dist/ | head -5
```

---

## v4 Breaking Changes vs v3

### Configuration — No More `tailwind.config.js`
- v4 uses **CSS-first configuration**. Theme tokens are defined in CSS with `@theme {}`.
- `tailwind.config.js` / `tailwind.config.ts` do NOT exist in this project — do not create them.
- All customization happens in `app/globals.css` inside `@theme {}`.
- The existing `@theme {}` block in `globals.css` is the single source of truth.

### Import Syntax
```css
/* v4 — what this project uses */
@import "tailwindcss";

/* v3 — DO NOT USE */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Arbitrary Values
- Syntax is unchanged: `w-[200px]`, `text-[#fff]` still work.
- But prefer CSS variables over hardcoded arbitrary values: `text-[var(--color-brand)]`.

### Color Palette
- v4 no longer ships a default color palette by default — you must define colors in `@theme {}`.
- This project's colors are already defined in `app/globals.css`. Use them.
- Always use semantic tokens, not raw values:

| Wrong | Right |
|---|---|
| `text-green-500` | `text-brand` or `style={{ color: 'var(--color-brand)' }}` |
| `bg-[#121212]` | `bg-bg-page` |
| `border-gray-200` | `border-border` |

### Prefix Changes
- Responsive prefixes (`sm:`, `md:`, `lg:`) work the same.
- Dark mode: use the `.dark` class strategy — already configured in `globals.css`.

### PostCSS Plugin
- This project uses `@tailwindcss/postcss` (the v4 plugin), configured in `postcss.config.mjs`.
- Do NOT change the PostCSS config unless explicitly asked.

---

## How to Use Tokens in This Project

All tokens map to CSS variables. Two ways to apply them:

**1. Tailwind utilities (preferred for standard properties):**
```tsx
<div className="bg-bg-surface text-text-body border border-border rounded-lg">
```

**2. Inline style with CSS variable (for dynamic or AntD-style overrides):**
```tsx
<div style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-body)' }}>
```

**Token reference:** See `docs/theme.md` for all available tokens and their CSS variable names.

---

## Layering Rules

Use `@layer` for custom CSS additions — matches how `globals.css` is structured:

```css
@layer base {
  /* resets, global element styles */
}

@layer utilities {
  /* custom utility classes */
}
```

Never add rules outside a `@layer` block unless you have a specific reason.

---

## Tailwind + Ant Design

AntD components accept `className`. Tailwind can add spacing/layout on the outside of AntD components, but avoid overriding AntD's internal styles with Tailwind — it creates specificity conflicts.

```tsx
// OK — layout spacing outside the component
<Card className="mb-5" />

// Avoid — trying to restyle AntD internals
<Card className="text-brand p-4" />  // AntD's styles will likely win unpredictably
```

For AntD internal style overrides, use the `style` prop with CSS variables.
