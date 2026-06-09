# Next.js 16 — Agent Guide

> **MANDATORY:** Before writing any Next.js code, read the relevant section from:
> `node_modules/next/dist/docs/`
>
> Next.js 16 has **breaking changes** from 13/14/15. Do NOT rely on training data.
> This guide records known breaking changes — it is NOT exhaustive. Always check source docs.

---

## Before You Touch Any Next.js File

Run this to find the docs available in this install:

```bash
ls node_modules/next/dist/docs/
```

Read the relevant doc for your task before editing. Heed any `@deprecated` notices in the source.

---

## Breaking Changes vs Prior Versions (Known)

### App Router (Stable in 13, evolved through 16)
- `app/` directory is the **only** routing system used in this project. `pages/` does not exist.
- Route groups: `(groupName)/` — segments in parentheses don't appear in the URL.
- Layouts, loading, error, not-found files colocate with the route segment they govern.

### Server vs Client Components
- **Default: Server Components.** Every file in `app/` and `components/` is a Server Component unless `'use client'` is declared at the top.
- `'use client'` must be the **very first line** of the file — before imports.
- Do NOT add `'use client'` unless the component uses: browser APIs, React state (`useState`), effects (`useEffect`), event handlers, or client-only third-party libraries (e.g. Ant Design components).
- Pass Server Component data to Client Components via props — not via shared context across the server/client boundary.

### Data Fetching
- Fetch in Server Components directly — no `useEffect` + fetch for initial data.
- Use `cache()` from React for deduplication, not Next.js's old `getServerSideProps`/`getStaticProps` (those do not exist in App Router).
- Route Handlers replace API Routes — files are `app/api/[resource]/route.ts`, exporting named functions: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.

### Metadata
- Use the `metadata` export or `generateMetadata` function from `page.tsx` / `layout.tsx`.
- No `<Head>` component — that belongs to the old pages router.

### Image Component
- Always use `next/image`. Never `<img>`.
- `alt` is required. `width` and `height` are required for non-fill images.
- For dynamic-size images: use `fill` prop with a positioned parent container.

### Link Component
- `next/link` no longer requires a child `<a>` tag — the Link itself renders an `<a>`.
- `legacyBehavior` prop exists for migration only — do not use it in new code.

### Font Optimization
- Use `next/font` — never import fonts from Google via `<link>` in head.

### Environment Variables
- Server-only: `VARIABLE_NAME` (no prefix)
- Exposed to client: `NEXT_PUBLIC_VARIABLE_NAME`
- Never access server-only env vars in client components.

---

## File Placement in This Project

| File | Location |
|---|---|
| Root layout | `app/layout.tsx` |
| Client providers (AntD registry etc.) | `app/providers.tsx` |
| Global styles | `app/globals.css` |
| Page components | `app/[route]/page.tsx` |
| API handlers | `app/api/[resource]/route.ts` |
| Shared UI components | `components/ui/[Name]/` |
| Feature components | `components/features/[feature]/[Name]/` |

See `docs/STRUCTURE.md` for the full tree.

---

## Common Mistakes to Avoid

| Mistake | Correct |
|---|---|
| `useRouter` from `next/router` | Use `next/navigation` in App Router |
| `useSearchParams` without Suspense boundary | Wrap in `<Suspense>` |
| Mutating data in a Server Component with `useEffect` | Use Server Actions or Route Handlers |
| `getServerSideProps` / `getStaticProps` | Use `async` Server Components directly |
| `next/head` | Use `metadata` export in layout/page |
| Nesting `'use client'` parents inside Server Components | Allowed, but don't pass non-serializable props |

---

## Next.js Config

Config file: `next.config.ts` (TypeScript config — this project already uses it).
Do NOT use `next.config.js` unless you have a specific reason and get user approval.
