# Project Structure — Canonical Law

> **AGENT RULE:** This file is the source of truth for all file and folder placement.
> Before creating or moving ANY file, confirm it matches a pattern defined here.
> If a pattern does not exist, propose a new one in this document — do not improvise.

---

## Absolute Rules

1. **Every component lives in its own named folder.** Never place a component file loose in a directory.
2. **Every repeated piece of UI is a component.** Every repeated piece of logic is a function or hook.
3. **No file at the root of a feature area** — always at least one sub-folder for grouping.
4. **Types do not live next to implementation** except for local-only, single-file-use types. All shared types live under `types/`.
5. **No barrel re-exports chains longer than 1 hop.** `components/ui/Button/index.ts` → ok. `components/index.ts` that re-exports everything → forbidden.
6. **`app/` is for routing only.** No business logic, no large components. Page files call feature components.

---

## Full Directory Map

```
/
├── app/                              ← Next.js App Router — routing only
│   ├── (auth)/                       ← Route group (no URL segment)
│   │   └── login/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── (dashboard)/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── layout.tsx
│   │       └── error.tsx
│   ├── api/                          ← Route Handlers only
│   │   └── [resource]/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx                    ← Root layout
│   └── providers.tsx                 ← Client-side providers wrapper
│
├── components/                       ← All reusable UI
│   ├── ui/                           ← Pure, stateless primitives (no data fetching)
│   │   └── [ComponentName]/          ← e.g. Button/, Card/, Modal/
│   │       ├── index.ts              ← Re-export only: export { ComponentName } from './ComponentName'
│   │       ├── [ComponentName].tsx   ← Implementation
│   │       └── [ComponentName].types.ts  ← Local prop types (if not shared)
│   │
│   └── features/                     ← Composed, domain-aware components
│       └── [feature]/                ← e.g. streaks/, habits/, dashboard/
│           └── [ComponentName]/
│               ├── index.ts
│               ├── [ComponentName].tsx
│               └── [ComponentName].types.ts
│
├── hooks/                            ← Custom React hooks only
│   └── [domain]/                     ← e.g. streaks/, auth/, ui/
│       └── use[Name].ts              ← e.g. useStreakTimer.ts
│
├── lib/                              ← Non-React utilities, config, adapters
│   ├── antd-theme.ts                 ← Ant Design token config (existing)
│   └── [domain]/                     ← e.g. date/, format/, api/
│       └── [utility].ts
│
├── services/                         ← All external I/O (API calls, DB, storage)
│   └── [domain]/                     ← e.g. streaks/, users/
│       └── [service].ts              ← e.g. streaks.service.ts
│
├── types/                            ← All shared TypeScript types
│   ├── api/                          ← Request/response shapes
│   │   └── [resource].types.ts
│   ├── models/                       ← Domain model types
│   │   └── [model].types.ts
│   └── common/                       ← Utility types, enums, shared primitives
│       └── [name].types.ts
│
├── constants/                        ← App-wide constant values (no logic)
│   └── [domain]/
│       └── [name].constants.ts
│
├── store/                            ← Global state (add if state lib is adopted)
│   └── [slice]/
│       └── [name].store.ts
│
├── public/                           ← Static assets served at /
│   └── [category]/                   ← e.g. images/, icons/
│
├── docs/                             ← All project documentation
│   ├── STRUCTURE.md                  ← This file
│   ├── theme.md                      ← Brand/design tokens
│   └── guides/                       ← Per-library agent guides
│       ├── nextjs.md
│       ├── antd.md
│       ├── tailwind.md
│       ├── react.md
│       └── bun.md
│
├── design/                           ← Design references (read-only for agents)
│
├── AGENTS.md                         ← Agent instructions
└── CLAUDE.md                         ← Claude-specific instructions
```

---

## Component File Rules

### Naming
- Folder name: `PascalCase` — matches the component name exactly.
- Implementation file: `ComponentName.tsx`
- Index file: `index.ts` (never `index.tsx` — the implementation lives in the named file)
- Types file: `ComponentName.types.ts` — only for props/types not shared outside the component

### index.ts format
```ts
// components/ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

### Never do this
```
components/
  Button.tsx          ← WRONG: no named folder
  buttons/
    primary.tsx       ← WRONG: not PascalCase, not a named folder per component
```

---

## Types Rules

- Props used only inside one component → `ComponentName.types.ts` next to it.
- Props/types shared across 2+ files → `types/models/` or `types/common/`.
- API response shapes → `types/api/`.
- Never use `any`. Use `unknown` and narrow.
- Prefer `interface` for object shapes, `type` for unions/intersections.

---

## Hooks Rules

- Hook file must start with `use`. Example: `hooks/streaks/useStreakTimer.ts`.
- One hook per file.
- Hooks that wrap a single `useState`/`useRef` are not hooks — inline them.
- Hooks with 10+ lines of logic warrant a file. Simpler → inline.

---

## Services Rules

- Services are plain async functions — no classes.
- Never call `fetch` directly in a component or hook — always via a service.
- Service files are named `[domain].service.ts`.

---

## Import Order (enforced by ESLint)

1. React imports
2. Next.js imports
3. Third-party libraries (antd, etc.)
4. Internal absolute imports (`@/components/...`, `@/lib/...`)
5. Relative imports (`./`, `../`)
6. Type-only imports (`import type ...`)

---

## Forbidden Patterns

| Pattern | Why |
|---|---|
| Loose component files (not in named folder) | Violates component isolation rule |
| `index.tsx` as implementation | Index is for re-exports only |
| Inline complex logic in JSX | Extract to a function or hook |
| Hardcoded color values (`#1DB954`) | Use CSS variables from `docs/theme.md` |
| `any` type | Use `unknown` and narrow |
| `console.log` left in production code | Use a logger utility |
| Business logic in `app/` pages | Pages delegate to feature components |
| Importing from another component's internal files | Import from the component's `index.ts` only |
