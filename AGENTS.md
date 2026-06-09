<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## We USE BUN as the Package Manager and Runtime Environment do not use anything else.

---

# Agent Rules — Read Before Any Action

> These rules are mandatory. Skipping any step is a bug in your behavior.

---

## Step 0 — Read Docs Before Touching Code

**Before making any edits**, read the guide for every library you will touch:

| You are about to touch... | Read this first |
|---|---|
| Any Next.js file (`app/`, routing, API, layout) | `docs/guides/nextjs.md` |
| Any Ant Design component (`antd`, `@ant-design/icons`) | `docs/guides/antd.md` |
| Any Tailwind class or `globals.css` | `docs/guides/tailwind.md` |
| Any React hook, component, or state | `docs/guides/react.md` |
| Any package install/remove or `bun` command | `docs/guides/bun.md` |
| Creating or moving any file | `docs/STRUCTURE.md` |
| Applying any color, spacing, or visual style | `docs/theme.md` |

This is not optional. These libraries have breaking changes from your training data.
Reading takes seconds. Breaking the project takes hours to debug.

---

## Step 1 — Confirm File Placement Against Structure

Before creating any file, open `docs/STRUCTURE.md` and confirm the file belongs where you're placing it.

If no pattern matches, **stop and ask the user** — do not invent a placement.

---

## Step 2 — No Hardcoded Values

- No hardcoded hex colors (`#1DB954`, `#fff`, etc.) — use CSS variables from `docs/theme.md`.
- No hardcoded pixel values for spacing when a token exists.
- No hardcoded strings that should be constants — put them in `constants/`.

---

## Step 3 — No Repetition

Before writing any UI block, ask: "Is this already a component?"
Before writing any logic, ask: "Is this already a function or hook?"

If the answer is no and this pattern appears more than once → create the abstraction.
If it appears once → inline it.

---

## Step 4 — Types Are Explicit

- No `any`. Use `unknown` and narrow with type guards.
- Component props must have a type — either inline for simple cases, or in `ComponentName.types.ts`.
- Shared types live in `types/` with subfolders — see `docs/STRUCTURE.md`.

---

## Step 5 — Verify Before Reporting Done

After making changes:
1. Confirm TypeScript compiles: `bun run build` (or at minimum no TS errors in edited files).
2. Confirm the feature works visually if it involves UI.
3. Confirm no import paths are broken.

Do not report a task as complete if you haven't verified it runs.

---

## Project Stack (Quick Reference)

| Tool | Version | Guide |
|---|---|---|
| Next.js | 16.2.7 | `docs/guides/nextjs.md` |
| React | 19.2.4 | `docs/guides/react.md` |
| Ant Design | 6.4.3 | `docs/guides/antd.md` |
| Tailwind CSS | 4.x | `docs/guides/tailwind.md` |
| TypeScript | 5.x | — |
| Bun | latest | `docs/guides/bun.md` |

---

## Folder Quick Reference

```
app/          ← Next.js routes only (no logic)
components/
  ui/         ← Stateless primitives
  features/   ← Domain-aware composed components
hooks/        ← Custom React hooks
lib/          ← Utilities and config
services/     ← External I/O (API calls)
types/        ← Shared TypeScript types
constants/    ← App-wide constants
docs/         ← All documentation (read-only for agents unless updating docs)
```

Full structure: `docs/STRUCTURE.md`
