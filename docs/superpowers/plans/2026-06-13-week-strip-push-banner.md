# Week Strip + Push Permission Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Your Streaks" page header with a custom week-strip calendar showing per-day completion dots (green=all done, red=missed), move the title/date into the navbar, and add an on-load bottom-sheet push-permission prompt.

**Architecture:** The `WeekStrip` is a self-contained client component that fetches `/api/habits/week-summary` for past days and subscribes to the Zustand habits store to keep today's dot live. `PushPermissionBanner` is mounted in the app layout and gates on `Notification.permission === 'default'` plus a localStorage dismissed flag. Logout push-cleanup is already wired in `ProfileForm`—no changes needed there.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, date-fns, framer-motion, Zustand (`useHabitsStore`), MongoDB/Mongoose, existing `usePushNotifications` hook.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `types/api/habits.types.ts` | Add `DaySummary` interface |
| Modify | `services/habits/habits.service.ts` | Add `getWeekSummary()` |
| Create | `app/api/habits/week-summary/route.ts` | GET – returns 7-day completion data |
| Create | `components/ui/WeekStrip/WeekStrip.tsx` | Custom week-strip calendar |
| Create | `components/ui/WeekStrip/index.ts` | Barrel export |
| Create | `components/ui/PushPermissionBanner/PushPermissionBanner.tsx` | On-load permission bottom sheet |
| Create | `components/ui/PushPermissionBanner/index.ts` | Barrel export |
| Modify | `app/(app)/today/page.tsx` | Remove old header, add `<WeekStrip />` |
| Modify | `components/ui/PageHeader/PageHeader.tsx` | Add date + "Your Streaks" left side |
| Modify | `components/ui/SideNav/SideNav.tsx` | Add date context on Today route |
| Modify | `app/(app)/layout.tsx` | Mount `<PushPermissionBanner />` |

---

## Task 1: Add `DaySummary` type + `getWeekSummary` service

**Files:**
- Modify: `types/api/habits.types.ts`
- Modify: `services/habits/habits.service.ts`

- [ ] **Step 1: Add `DaySummary` to the API types file**

Open `types/api/habits.types.ts` and append after the last export:

```ts
export interface DaySummary {
  date: string;       // 'YYYY-MM-DD'
  total: number;      // active habit count for that day
  completed: number;  // habits checked in on that day
}
```

- [ ] **Step 2: Add `getWeekSummary` to the habits service**

Open `services/habits/habits.service.ts`. Add this import at the top alongside the existing ones:

```ts
import type { DaySummary } from '@/types/api/habits.types';
```

Then append this function at the bottom of the file:

```ts
export async function getWeekSummary(
  userId: string,
  dates: string[],
): Promise<DaySummary[]> {
  await connectDB();

  // Count of currently active habits (non-archived)
  const total = await HabitModel.countDocuments({ userId, archivedAt: null });

  // All check-ins for this user on the requested dates
  const checkIns = await CheckInModel.find({
    userId,
    date: { $in: dates },
  }).lean() as { habitId: unknown; date: string }[];

  // Count distinct habits checked in per date
  const byDate = new Map<string, Set<string>>();
  for (const ci of checkIns) {
    if (!byDate.has(ci.date)) byDate.set(ci.date, new Set());
    byDate.get(ci.date)!.add(String(ci.habitId));
  }

  return dates.map((date) => ({
    date,
    total,
    completed: byDate.get(date)?.size ?? 0,
  }));
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "(error|Error)" | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add types/api/habits.types.ts services/habits/habits.service.ts
git commit -m "feat: add DaySummary type and getWeekSummary service"
```

---

## Task 2: Week-summary API route

**Files:**
- Create: `app/api/habits/week-summary/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format, startOfWeek, addDays } from 'date-fns';
import { getWeekSummary } from '@/services/habits/habits.service';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const dates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd'),
  );

  const summaries = await getWeekSummary(session.user.id, dates);
  return Response.json(summaries);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "(error|Error)" | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/habits/week-summary/route.ts
git commit -m "feat: GET /api/habits/week-summary route"
```

---

## Task 3: `WeekStrip` component

**Files:**
- Create: `components/ui/WeekStrip/WeekStrip.tsx`
- Create: `components/ui/WeekStrip/index.ts`

- [ ] **Step 1: Create the component**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { DaySummary } from '@/types/api/habits.types';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function buildWeekDates(): string[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd'),
  );
}

export function WeekStrip() {
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const habits = useHabitsStore((s) => s.habits);
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekDates = buildWeekDates();

  useEffect(() => {
    fetch('/api/habits/week-summary')
      .then((r) => r.json())
      .then((data: DaySummary[]) => setSummaries(data))
      .catch(() => {});
  }, []);

  function getSummary(date: string): DaySummary {
    // Today: derive live from Zustand store so dots update on check-in
    if (date === today) {
      const total = habits.length;
      const completed = habits.filter((h) => h.isCompletedToday).length;
      return { date, total, completed };
    }
    return summaries.find((s) => s.date === date) ?? { date, total: 0, completed: 0 };
  }

  function dotColor(s: DaySummary, date: string): string | null {
    if (s.total === 0 || date > today) return null;
    return s.completed >= s.total ? '#10b981' : '#ef4444';
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '8px 4px 4px',
      }}
    >
      {weekDates.map((date, i) => {
        const isToday = date === today;
        const summary = getSummary(date);
        const color = dotColor(summary, date);
        const dayNum = parseInt(date.split('-')[2], 10);

        return (
          <div
            key={date}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              flex: 1,
            }}
          >
            {/* Day letter */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: isToday
                  ? 'var(--color-text-heading)'
                  : 'var(--color-text-muted)',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              {DAY_LETTERS[i]}
            </span>

            {/* Date number — today gets a pill highlight */}
            <div
              style={{
                width: 36,
                height: 44,
                borderRadius: 18,
                background: isToday
                  ? 'var(--color-text-heading)'
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday
                    ? 'var(--color-bg-page)'
                    : 'var(--color-text-body)',
                  lineHeight: 1,
                }}
              >
                {dayNum}
              </span>
            </div>

            {/* Completion dot */}
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: color ?? 'transparent',
                transition: 'background 0.3s',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create the barrel export**

```ts
export { WeekStrip } from './WeekStrip';
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "(error|Error)" | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/ui/WeekStrip/
git commit -m "feat: WeekStrip component — week view with green/red completion dots"
```

---

## Task 4: Update `today/page.tsx` — replace header with WeekStrip

**Files:**
- Modify: `app/(app)/today/page.tsx`

- [ ] **Step 1: Replace the file content**

The entire `today/page.tsx` becomes:

```tsx
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getHabitsForUser } from '@/services/habits/habits.service';
import { HabitList } from '@/components/features/habits/HabitList';
import { WeekStrip } from '@/components/ui/WeekStrip';

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const habits = await getHabitsForUser(session.user.id, todayStr);

  const total = habits.length;
  const completed = habits.filter((h) => h.isCompletedToday).length;
  const allDone = total > 0 && completed === total;

  return (
    <div className="flex flex-col gap-4">
      {/* Week strip calendar */}
      {total > 0 && (
        <div
          style={{
            background: 'var(--color-bg-surface)',
            borderRadius: 20,
            padding: '12px 16px 8px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {allDone && (
            <p
              style={{
                fontSize: 11,
                color: '#10b981',
                fontWeight: 600,
                margin: '0 0 4px 4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              All done today 🎉
            </p>
          )}
          <WeekStrip />
        </div>
      )}

      {/*
        Mobile: give the deck enough height.
        Desktop (md+): HabitList renders deck + list side by side, height is auto.
      */}
      <div className="h-[calc(100dvh-280px)] min-h-[380px] md:h-auto md:min-h-0">
        <HabitList />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "(error|Error)" | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/today/page.tsx
git commit -m "feat: replace today page header with WeekStrip"
```

---

## Task 5: Update `PageHeader` — add streak title + date on left

**Files:**
- Modify: `components/ui/PageHeader/PageHeader.tsx`

- [ ] **Step 1: Replace the file content**

```tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import { User, Settings2 } from 'lucide-react';
import { format } from 'date-fns';

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

const MENU_ITEM: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '13px 16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-heading)',
  fontSize: 15,
  fontWeight: 500,
  textAlign: 'left',
};

export function PageHeader({ user }: PageHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:hidden"
      style={{
        height: 64,
        background: 'linear-gradient(to bottom, var(--color-bg-page) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}
    >
      {/* Left: streak label + date */}
      <div style={{ pointerEvents: 'none' }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: 0,
            lineHeight: 1,
          }}
        >
          {format(new Date(), 'EEEE, MMM d')}
        </p>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--color-text-heading)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Your Streaks
        </h1>
      </div>

      {/* Right: avatar + dropdown */}
      <div ref={menuRef} style={{ position: 'relative', pointerEvents: 'auto' }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
          aria-label="Open profile menu"
        >
          <Avatar
            src={user.image ?? undefined}
            style={{ background: 'var(--color-brand)', color: 'var(--color-bg-page)', fontWeight: 700 }}
            size={40}
          >
            {!user.image && initials}
          </Avatar>
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 52,
              background: 'var(--color-bg-elevated)',
              borderRadius: 16,
              overflow: 'hidden',
              minWidth: 164,
              boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.08)',
              zIndex: 100,
            }}
          >
            <button
              onClick={() => { router.push('/profile'); setMenuOpen(false); }}
              style={MENU_ITEM}
            >
              <User size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              Profile
            </button>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <button
              onClick={() => { router.push('/settings'); setMenuOpen(false); }}
              style={MENU_ITEM}
            >
              <Settings2 size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "(error|Error)" | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/PageHeader/PageHeader.tsx
git commit -m "feat: PageHeader — add date + Your Streaks label on left"
```

---

## Task 6: Update `SideNav` — add date context for Today route

**Files:**
- Modify: `components/ui/SideNav/SideNav.tsx`

- [ ] **Step 1: Add date-fns import and the context block**

Add `import { format } from 'date-fns';` after the existing imports at the top.

Then inside the `<aside>`, add this block **between** the Logo div and the `<nav>` (after the `mb-8` logo div, before the `flex-1` nav):

```tsx
{/* Date context — shown only when viewing Today */}
{isToday && (
  <div className="px-2 mb-6">
    <p
      style={{
        fontSize: 11,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 2px',
        lineHeight: 1,
      }}
    >
      {format(new Date(), 'EEEE, MMM d')}
    </p>
    <p
      style={{
        fontSize: 20,
        fontWeight: 800,
        color: 'var(--color-text-heading)',
        margin: 0,
        lineHeight: 1.2,
      }}
    >
      Your Streaks
    </p>
  </div>
)}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "(error|Error)" | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/SideNav/SideNav.tsx
git commit -m "feat: SideNav — show date + Your Streaks label on Today route"
```

---

## Task 7: `PushPermissionBanner` component

**Files:**
- Create: `components/ui/PushPermissionBanner/PushPermissionBanner.tsx`
- Create: `components/ui/PushPermissionBanner/index.ts`

- [ ] **Step 1: Create the component**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/push/usePushNotifications';

const DISMISSED_KEY = 'push_prompt_dismissed';

export function PushPermissionBanner() {
  const [visible, setVisible] = useState(false);
  const { isSupported, isSubscribed, toggle } = usePushNotifications();

  useEffect(() => {
    if (!isSupported) return;
    if (isSubscribed) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return;

    // Small delay so the page settles before the banner slides in
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [isSupported, isSubscribed]);

  function handleAllow() {
    setVisible(false);
    // toggle() internally calls Notification.requestPermission() then subscribes
    toggle();
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          // Mobile: sits above BottomNav (72px tall). Desktop: bottom-right corner.
          // bottom-[84px] = BottomNav height (72) + gap (12)
          className="fixed z-50 left-4 right-4 bottom-[84px] md:left-auto md:right-6 md:bottom-6 md:w-80"
        >
          <div
            style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 20,
              padding: '14px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Bell icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgb(var(--brand-rgb) / 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bell size={18} style={{ color: 'var(--color-brand)' }} />
            </div>

            {/* Label */}
            <p
              style={{
                flex: 1,
                margin: 0,
                fontSize: 13,
                color: 'var(--color-text-body)',
                lineHeight: 1.4,
              }}
            >
              Get daily habit reminders?
            </p>

            {/* Allow */}
            <button
              onClick={handleAllow}
              style={{
                background: 'var(--color-brand)',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 8,
                color: 'var(--color-bg-page)',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              Allow
            </button>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                flexShrink: 0,
                lineHeight: 0,
              }}
            >
              <X size={16} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Create the barrel export**

```ts
export { PushPermissionBanner } from './PushPermissionBanner';
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "(error|Error)" | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/ui/PushPermissionBanner/
git commit -m "feat: PushPermissionBanner — on-load bottom sheet for push permission"
```

---

## Task 8: Wire `PushPermissionBanner` into app layout

**Files:**
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Add the import and render the banner**

Add this import to `app/(app)/layout.tsx`:

```ts
import { PushPermissionBanner } from '@/components/ui/PushPermissionBanner';
```

Then add `<PushPermissionBanner />` just before the closing `</div>` of the root element — after `<BottomNav />`:

```tsx
{/* Push permission prompt — shown once if permission not yet decided */}
<PushPermissionBanner />
```

The full JSX tree becomes:

```tsx
<div
  className="min-h-screen"
  style={{ background: 'var(--color-bg-page)' }}
>
  <SplashScreen />
  <SideNav user={user} />
  <PageHeader user={user} />

  <div className="md:ml-[240px]" style={{ minHeight: '100dvh' }}>
    <main
      className="mx-auto px-4 py-6 md:px-8 md:py-8"
      style={{ maxWidth: 900 }}
    >
      <div className="md:hidden" style={{ height: 48 }} />
      {children}
      <div className="md:hidden" style={{ height: 92 }} />
    </main>
  </div>

  <BottomNav />
  <PushPermissionBanner />
</div>
```

- [ ] **Step 2: Full build verification**

```bash
bun run build 2>&1 | tail -20
```

Expected: build succeeds with no errors. May include Next.js route size output.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/layout.tsx
git commit -m "feat: mount PushPermissionBanner in app layout"
```

---

## Task 9: Visual verification

- [ ] **Step 1: Start the dev server**

```bash
bun run dev
```

- [ ] **Step 2: Open `http://localhost:3000/today` and verify**

Checklist:
- [ ] `PageHeader` (mobile viewport) shows date + "Your Streaks" on the left and avatar on the right
- [ ] `SideNav` (≥768px) shows date + "Your Streaks" below the logo when on `/today`
- [ ] Week strip renders 7 day columns with current day highlighted (pill shape)
- [ ] Past days with completed habits show green dots; missed days show red dots
- [ ] Today's dot updates live when checking in a habit (no page refresh needed)
- [ ] After 1.5s, the push permission bottom sheet slides up (if `Notification.permission === 'default'` and not dismissed)
- [ ] "Not now" dismisses the sheet and never shows again
- [ ] "Allow" triggers browser permission dialog; if granted, the Settings toggle turns on
- [ ] On mobile the sheet floats above the BottomNav; on desktop it anchors bottom-right
