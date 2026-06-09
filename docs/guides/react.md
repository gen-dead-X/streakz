# React 19 — Agent Guide

> **MANDATORY:** Before writing React code, check for relevant updates at:
> `node_modules/react/README.md`
> `node_modules/react/CHANGELOG.md` (if present)
>
> React 19 introduces new APIs and deprecates patterns common in 16-18.
> Do NOT assume v18 patterns work unchanged.

---

## New in React 19 (Breaking / Important)

### Actions — Replaces Manual Async State
React 19 introduces Actions: async functions passed to transitions.
- Use `useTransition` for async state updates — replaces manual `loading` state + try/catch in many cases.
- Server Actions (Next.js) integrate with this model.

### `use()` Hook
- `use(promise)` suspends a component while a promise resolves.
- `use(context)` replaces `useContext` — can be called conditionally (unlike `useContext`).
- Must be used inside a component or hook.

### `useOptimistic`
- For optimistic UI updates during async actions.
- `const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);`

### Ref as Prop (Ref Forwarding Simplified)
- Function components can now accept `ref` directly as a prop — no `forwardRef` wrapper needed.
- `forwardRef` still works but is no longer required for new components.
  ```tsx
  // React 19 — no forwardRef needed
  function Input({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & InputHTMLAttributes<HTMLInputElement>) {
    return <input ref={ref} {...props} />;
  }
  ```

### Context Provider Simplified
- Render `<Context>` directly instead of `<Context.Provider>`.
  ```tsx
  // React 19
  <ThemeContext value={theme}>{children}</ThemeContext>

  // React 18 (still works, but avoid for new code)
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  ```

### `useFormStatus`
- Read the status of a parent form from a child component.
- Must be inside a `<form>` component.

### Cleanup Functions in `useRef`
- `ref` callback can now return a cleanup function (called on unmount).

---

## Removed / Deprecated in React 19

| Removed | Replacement |
|---|---|
| `ReactDOM.render()` | `ReactDOM.createRoot().render()` |
| `ReactDOM.hydrate()` | `ReactDOM.hydrateRoot()` |
| `defaultProps` on function components | Default parameter values |
| Legacy string refs | Callback refs or `useRef` |
| `React.createFactory` | JSX directly |
| `act()` with async functions (changed signature) | Check `react-dom/test-utils` docs |

---

## Rules Still in Effect

### Hook Rules
- Only call hooks at the top level — never inside conditions, loops, or nested functions.
- Exception: `use()` can be called conditionally.
- Custom hooks must start with `use`.

### Component Rules
- Components must be pure functions — same props → same output.
- Do not mutate props or external state during render.
- Side effects go in `useEffect` (client) or handled by the framework (server).

### Key Prop
- Always provide a stable `key` when rendering lists. Never use array index as key when items can be reordered or removed.
- Keys must be unique among siblings — not globally unique.

---

## Patterns Used in This Project

### No Class Components
This project uses only function components. Do not introduce class components.

### Error Boundaries
React 19 still requires class components for Error Boundaries OR use a library like `react-error-boundary`. Prefer the library approach if error boundaries are needed.

### Strict Mode
Next.js App Router runs in Strict Mode by default. This means effects run twice in development. Effects that break on double-run have a bug — fix them, don't disable Strict Mode.

### `'use client'` Boundary
- Keep the boundary as deep as possible (closest to where interactivity is needed).
- Do not mark layouts or shared wrappers as `'use client'` unless required.
