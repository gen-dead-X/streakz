# Ant Design v6 — Agent Guide

> **MANDATORY:** Before using any Ant Design component, check the v6 changelog and component API at:
> `node_modules/antd/CHANGELOG.md`
>
> Ant Design v6 is a **major version** with breaking API changes from v5.
> Do NOT rely on training data. Always verify component props in:
> `node_modules/antd/lib/[component-name]/index.d.ts`

---

## Before Writing Any AntD Code

1. Check the component's type definitions:
   ```bash
   cat node_modules/antd/lib/[component]/index.d.ts
   ```
2. Check for breaking changes relevant to your component:
   ```bash
   grep -i "[ComponentName]" node_modules/antd/CHANGELOG.md | head -30
   ```

---

## Setup in This Project

### Next.js SSR Registry
This project uses `@ant-design/nextjs-registry` to avoid SSR style flash.

```tsx
// app/providers.tsx — already configured
import { AntdRegistry } from '@ant-design/nextjs-registry';
```

**Rule:** All AntD components must be rendered inside `<AntdRegistry>`. This is guaranteed by the root layout — do not bypass it.

### Theme Configuration
Theme tokens live in `lib/antd-theme.ts`. All customization goes there — never inline `theme` props on `ConfigProvider` in page/component files.

```tsx
// lib/antd-theme.ts — add tokens here, never elsewhere
import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = { ... };
```

### Colors — Critical Rule
**Never use hardcoded hex values like `#1DB954` in components.**
Map to CSS variables from `docs/theme.md` instead. Use inline `style={{ color: 'var(--color-brand)' }}` or a Tailwind token.

---

## v6 Breaking Changes (Known)

> This list is not exhaustive — always check the changelog.

### `Form`
- `Form.Item` `rules` validation triggers changed. Check `validateTrigger` prop behavior.
- `getFieldsValue` may return `undefined` for untouched fields — handle gracefully.

### `Table`
- `columns` type changed — `dataIndex` must match key types strictly.
- `rowKey` is required when `dataSource` items don't have `.key`.

### `Modal` / `Drawer`
- `visible` prop renamed to `open` in v5, fully removed in v6. Always use `open`.
- `onCancel` / `onClose` — verify which is present for the component you're using.

### `Typography`
- `Text`, `Title`, `Paragraph` must be imported from `antd` — not `antd/lib/typography`.
- Destructure from `Typography`: `const { Title, Text } = Typography;`

### `Button`
- `type="ghost"` is deprecated. Use `variant="outlined"` instead.
- Check the latest type union for `type` prop — some values changed.

### `Space` / `Flex`
- Prefer `Flex` over `Space` for layout — `Space` is for inline element gaps.
- `Flex` is now a first-class component, not `Space` with direction.

### `Icons`
- Icons are in `@ant-design/icons` — a separate package (already installed).
- Import each icon individually — never import from the root package.
  ```ts
  // Correct
  import { FireOutlined } from '@ant-design/icons';
  // Wrong — tree-shaking fails
  import AntdIcons from '@ant-design/icons';
  ```

---

## Usage Rules in This Project

### Client Components Only
All AntD components require `'use client'`. Any file that imports an AntD component must have `'use client'` as its first line.

### No AntD in Server Components
Never import AntD components in Server Components. If a page needs both server data and AntD UI, fetch data server-side and pass it as props to a Client Component.

### Component Props over Style Props
Use AntD's built-in props (`size`, `type`, `variant`, `status`) before reaching for `style={}`. Only use `style={}` for values not available as props (e.g., applying a CSS variable).

### Antd + Tailwind
AntD components accept `className` for Tailwind utility overrides. Use Tailwind for layout/spacing outside components, AntD's design system inside them. Do not fight the component's internal styles — use `style={{ cssVariable: 'value' }}` for token overrides.

---

## Component Organization

AntD component wrappers (if created) go in `components/ui/`:
```
components/ui/
  StreakCard/
    StreakCard.tsx       ← wraps antd Card with project-specific defaults
    index.ts
```

Never create wrapper components just to rename props. Only create them when adding meaningful defaults or composition.
