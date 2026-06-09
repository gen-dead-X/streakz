# Bun — Agent Guide

> **Bun is the ONLY allowed package manager and runtime in this project.**
> Never use `npm`, `yarn`, or `pnpm` — they will produce `package-lock.json` or `yarn.lock`
> which must not exist alongside `bun.lock`.

---

## Rules

### Package Management
```bash
# Install all dependencies
bun install

# Add a dependency
bun add [package]

# Add a dev dependency
bun add -d [package]

# Remove a dependency
bun remove [package]

# Run a script
bun run dev
bun run build
bun run lint
```

### Never Use
```bash
npm install     # FORBIDDEN
npm i           # FORBIDDEN
yarn add        # FORBIDDEN
pnpm add        # FORBIDDEN
```

### Lock File
- `bun.lock` is the lock file for this project. It must be committed.
- If you ever see `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` created, delete them immediately — they indicate npm/yarn/pnpm was used by mistake.

---

## Bun as Runtime

This project may use Bun APIs if server-side scripts or utilities are needed. Bun is compatible with Node.js APIs but has its own native APIs that are faster.

When writing server-side utilities (not Next.js — e.g., scripts, migrations):
- Use `Bun.file()` instead of `fs.readFileSync` for file reads.
- Use `Bun.serve()` for standalone HTTP servers (not needed inside Next.js).
- Check Bun compatibility for any Node.js package before adding it: `bun pm ls` shows what's installed and Bun-compatible.

---

## Running the Project

```bash
bun run dev      # Development server (uses Next.js dev server internally)
bun run build    # Production build
bun run start    # Production server
bun run lint     # ESLint
```

---

## Adding Packages — Checklist

Before adding any new package:
1. Check if the functionality already exists in the project or in Next.js/React.
2. Check Bun compatibility: most npm packages work, but some native addons don't.
3. Add only the package needed — not a suite when a single utility will do.
4. After `bun add`, verify `bun.lock` was updated (not a different lock file).
