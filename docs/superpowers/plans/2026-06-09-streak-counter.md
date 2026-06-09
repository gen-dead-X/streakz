# Streak Counter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack mobile-first streak habit tracker with Next.js 16, MongoDB, better-auth, and Ant Design v6.

**Architecture:** Next.js App Router with `(auth)` and `(app)` route groups. Server Components fetch data and protect routes via layout-level session checks. Client Components use Zustand stores with optimistic updates. better-auth manages sessions via MongoDB; Mongoose handles domain models (Habit, CheckIn).

**Tech Stack:** Next.js 16 · React 19 · Ant Design v6 · Tailwind v4 · better-auth · MongoDB + Mongoose · Zustand · react-day-picker v9 · lucide-react · date-fns · Bun

---

> **Before every task:** Read `docs/guides/` for any library you touch. AntD docs: `docs/guides/antd.md`. Next.js docs: `docs/guides/nextjs.md`. Colors: use CSS variables from `docs/theme.md` — never hardcode hex values. Structure: `docs/STRUCTURE.md`.

---

## Task 1: Install packages and create env template

**Files:**
- Modify: `package.json` (via bun add)
- Create: `.env.local.example`

- [ ] **Step 1: Install all runtime dependencies**

```bash
bun add better-auth mongodb mongoose zustand react-day-picker date-fns lucide-react
```

Expected output: packages added to `bun.lock` (not package-lock.json).

- [ ] **Step 2: Create env template**

Create `.env.local.example`:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/streak-counter
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy to `.env.local` and fill in real values before running. MONGODB_URI must point to a running MongoDB instance.

- [ ] **Step 3: Verify `bun.lock` updated (not package-lock.json)**

```bash
ls bun.lock && echo "OK" || echo "WRONG LOCK FILE"
ls package-lock.json 2>/dev/null && echo "DELETE THIS" || echo "OK - no npm lock"
```

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock .env.local.example
git commit -m "feat: install packages (better-auth, mongoose, zustand, react-day-picker, lucide-react, date-fns)"
```

---

## Task 2: TypeScript types

**Files:**
- Create: `types/models/habit.types.ts`
- Create: `types/models/checkin.types.ts`
- Create: `types/models/user.types.ts`
- Create: `types/api/habits.types.ts`
- Create: `types/api/insights.types.ts`

- [ ] **Step 1: Create `types/models/habit.types.ts`**

```ts
export type FrequencyType = 'daily' | 'weekly' | 'specific';

export interface Frequency {
  type: FrequencyType;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat — empty for 'daily'/'weekly'
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  icon: string; // single emoji
  frequency: Frequency;
  createdAt: string;
  archivedAt: string | null;
}

export interface HabitWithStreak extends Habit {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  recentDots: boolean[]; // 7 booleans — index 0 = 6 days ago, index 6 = today
}
```

- [ ] **Step 2: Create `types/models/checkin.types.ts`**

```ts
export interface CheckIn {
  _id: string;
  habitId: string;
  userId: string;
  date: string; // 'YYYY-MM-DD' in user's local date
  createdAt: string;
}
```

- [ ] **Step 3: Create `types/models/user.types.ts`**

```ts
export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}
```

- [ ] **Step 4: Create `types/api/habits.types.ts`**

```ts
import type { Frequency, HabitWithStreak } from '@/types/models/habit.types';

export interface CreateHabitInput {
  name: string;
  icon: string;
  frequency: Frequency;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  frequency?: Frequency;
}

export interface HabitsResponse {
  habits: HabitWithStreak[];
}
```

- [ ] **Step 5: Create `types/api/insights.types.ts`**

```ts
export interface WeeklyDataPoint {
  label: string;  // '-8', '-7', ..., '-1', 'now'
  count: number;
}

export interface InsightsResponse {
  longestStreak: number;
  totalCheckIns: number;
  activeStreaks: number;
  avgConsistency: number; // 0-100, percentage over last 60 days
  weeklyData: WeeklyDataPoint[]; // 9 entries, oldest first
  checkInDates: string[]; // all 'YYYY-MM-DD' strings for heatmap
}
```

- [ ] **Step 6: Commit**

```bash
git add types/
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: Constants

**Files:**
- Create: `constants/habits/emoji.constants.ts`
- Create: `constants/habits/frequency.constants.ts`

- [ ] **Step 1: Create `constants/habits/emoji.constants.ts`**

```ts
export const HABIT_EMOJIS = [
  // Health & Fitness
  '🏃', '💪', '🧘', '🚴', '🏋️', '🏊', '⚽', '🧗',
  // Mind & Learning
  '📚', '📖', '✍️', '🎓', '🧠', '💡', '🎯', '📝',
  // Lifestyle
  '💧', '🥗', '😴', '🌅', '🚿', '🧹', '🌿', '🫁',
  // Creativity
  '🎨', '🎵', '🎸', '✏️', '📸', '🎬', '🖊️', '🎭',
  // Goals
  '🔥', '⭐', '✅', '🏆', '💎', '🎖️', '🌟', '🎪',
] as const;

export type HabitEmoji = (typeof HABIT_EMOJIS)[number];
export const DEFAULT_EMOJI = '🔥';
```

- [ ] **Step 2: Create `constants/habits/frequency.constants.ts`**

```ts
export const FREQUENCY_OPTIONS = [
  { value: 'daily' as const,    label: 'Every Day',      description: 'Check in daily' },
  { value: 'weekly' as const,   label: 'Once a Week',    description: 'At least once per week' },
  { value: 'specific' as const, label: 'Specific Days',  description: 'Choose days of the week' },
];

export const DAY_OPTIONS = [
  { value: 0, label: 'Sun', short: 'S' },
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
];
```

- [ ] **Step 3: Commit**

```bash
git add constants/
git commit -m "feat: add habit emoji and frequency constants"
```

---

## Task 4: Streak calculator (TDD)

**Files:**
- Create: `lib/streak/calculator.ts`
- Create: `lib/streak/__tests__/calculator.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/streak/__tests__/calculator.test.ts`:

```ts
import { describe, test, expect } from 'bun:test';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isCompletedToday,
  getRecentDots,
  calculateConsistency,
  getScheduledDates,
} from '../calculator';
import type { Frequency } from '@/types/models/habit.types';

const daily: Frequency = { type: 'daily', days: [] };
const weekly: Frequency = { type: 'weekly', days: [] };
const mwf: Frequency = { type: 'specific', days: [1, 3, 5] }; // Mon, Wed, Fri

describe('isCompletedToday', () => {
  test('returns true when today is in checkIns', () => {
    expect(isCompletedToday(['2026-06-09', '2026-06-08'], '2026-06-09')).toBe(true);
  });
  test('returns false when today is not in checkIns', () => {
    expect(isCompletedToday(['2026-06-08'], '2026-06-09')).toBe(false);
  });
});

describe('getRecentDots', () => {
  test('returns 7 booleans', () => {
    const dots = getRecentDots([], '2026-06-09', 7);
    expect(dots).toHaveLength(7);
  });
  test('last element is true when checked in today', () => {
    const dots = getRecentDots(['2026-06-09'], '2026-06-09', 7);
    expect(dots[6]).toBe(true);
  });
  test('first element is true when checked in 6 days ago', () => {
    const dots = getRecentDots(['2026-06-03'], '2026-06-09', 7);
    expect(dots[0]).toBe(true);
    expect(dots[1]).toBe(false);
  });
});

describe('calculateCurrentStreak — daily', () => {
  test('0 for empty check-ins', () => {
    expect(calculateCurrentStreak([], daily, '2026-06-09')).toBe(0);
  });
  test('1 for just today', () => {
    expect(calculateCurrentStreak(['2026-06-09'], daily, '2026-06-09')).toBe(1);
  });
  test('counts consecutive days', () => {
    expect(calculateCurrentStreak(['2026-06-07', '2026-06-08', '2026-06-09'], daily, '2026-06-09')).toBe(3);
  });
  test('grace: still active if only checked in yesterday', () => {
    expect(calculateCurrentStreak(['2026-06-08'], daily, '2026-06-09')).toBe(1);
  });
  test('0 when last check-in was 2+ days ago', () => {
    expect(calculateCurrentStreak(['2026-06-07'], daily, '2026-06-09')).toBe(0);
  });
  test('gap breaks streak', () => {
    expect(calculateCurrentStreak(['2026-06-06', '2026-06-09'], daily, '2026-06-09')).toBe(1);
  });
});

describe('calculateCurrentStreak — weekly', () => {
  test('1 when checked in this week', () => {
    expect(calculateCurrentStreak(['2026-06-08'], weekly, '2026-06-09')).toBe(1);
  });
  test('counts consecutive weeks', () => {
    const checkIns = ['2026-06-01', '2026-06-08']; // two different weeks
    expect(calculateCurrentStreak(checkIns, weekly, '2026-06-09')).toBe(2);
  });
});

describe('calculateCurrentStreak — specific days', () => {
  test('counts consecutive scheduled days', () => {
    // Mon Jun 2, Wed Jun 4, Fri Jun 6, Mon Jun 9 (all MWF)
    const checkIns = ['2026-06-02', '2026-06-04', '2026-06-06', '2026-06-09'];
    expect(calculateCurrentStreak(checkIns, mwf, '2026-06-09')).toBe(4);
  });
  test('0 when a scheduled day was missed', () => {
    // Mon Jun 2, missed Wed Jun 4, Fri Jun 6
    const checkIns = ['2026-06-02', '2026-06-06'];
    expect(calculateCurrentStreak(checkIns, mwf, '2026-06-09')).toBe(1);
  });
});

describe('calculateLongestStreak — daily', () => {
  test('finds longest run', () => {
    const checkIns = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-07', '2026-06-08'];
    expect(calculateLongestStreak(checkIns, daily)).toBe(3);
  });
  test('0 for empty', () => {
    expect(calculateLongestStreak([], daily)).toBe(0);
  });
});

describe('calculateConsistency', () => {
  test('100% when all scheduled days completed', () => {
    // 7 days of daily habit, all checked in
    const checkIns = ['2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09'];
    expect(calculateConsistency(checkIns, daily, '2026-06-09', 7)).toBe(100);
  });
  test('0% when nothing completed', () => {
    expect(calculateConsistency([], daily, '2026-06-09', 7)).toBe(0);
  });
});

describe('getScheduledDates', () => {
  test('daily: returns every day in range', () => {
    const dates = getScheduledDates(daily, '2026-06-07', '2026-06-09');
    expect(dates).toEqual(['2026-06-07', '2026-06-08', '2026-06-09']);
  });
  test('specific: returns only scheduled days', () => {
    // MWF between Mon Jun 9 and Fri Jun 13
    const dates = getScheduledDates(mwf, '2026-06-09', '2026-06-13');
    expect(dates).toEqual(['2026-06-09', '2026-06-11', '2026-06-13']);
  });
});
```

- [ ] **Step 2: Run tests — expect failure (function not defined)**

```bash
bun test lib/streak/__tests__/calculator.test.ts
```

Expected: errors like `cannot find module '../calculator'`

- [ ] **Step 3: Implement `lib/streak/calculator.ts`**

```ts
import {
  parseISO,
  subDays,
  format,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  addDays,
  isWithinInterval,
  isSameDay,
} from 'date-fns';
import type { Frequency } from '@/types/models/habit.types';

function fmt(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function parse(dateStr: string): Date {
  return parseISO(dateStr);
}

export function getScheduledDates(
  frequency: Frequency,
  from: string,
  to: string,
): string[] {
  const fromDate = parse(from);
  const toDate = parse(to);
  const dates: string[] = [];
  let current = fromDate;

  if (frequency.type === 'daily') {
    while (current <= toDate) {
      dates.push(fmt(current));
      current = addDays(current, 1);
    }
  } else if (frequency.type === 'specific') {
    while (current <= toDate) {
      if (frequency.days.includes(current.getDay())) {
        dates.push(fmt(current));
      }
      current = addDays(current, 1);
    }
  } else if (frequency.type === 'weekly') {
    let weekStart = startOfWeek(fromDate, { weekStartsOn: 1 });
    while (weekStart <= toDate) {
      dates.push(fmt(weekStart));
      weekStart = addDays(weekStart, 7);
    }
  }

  return dates;
}

export function isCompletedToday(checkIns: string[], today: string): boolean {
  return checkIns.includes(today);
}

export function getRecentDots(
  checkIns: string[],
  today: string,
  count = 7,
): boolean[] {
  const set = new Set(checkIns);
  const todayDate = parse(today);
  const dots: boolean[] = [];
  for (let i = count - 1; i >= 0; i--) {
    dots.push(set.has(fmt(subDays(todayDate, i))));
  }
  return dots;
}

export function calculateCurrentStreak(
  checkIns: string[],
  frequency: Frequency,
  today: string,
): number {
  if (checkIns.length === 0) return 0;
  const set = new Set(checkIns);
  const todayDate = parse(today);

  if (frequency.type === 'daily') {
    const hasToday = set.has(today);
    const yesterday = fmt(subDays(todayDate, 1));
    if (!hasToday && !set.has(yesterday)) return 0;
    let streak = 0;
    let cur = hasToday ? todayDate : subDays(todayDate, 1);
    while (set.has(fmt(cur))) {
      streak++;
      cur = subDays(cur, 1);
    }
    return streak;
  }

  if (frequency.type === 'specific') {
    const { days } = frequency;
    let streak = 0;
    let cur = todayDate;
    for (let i = 0; i < 365; i++) {
      const dateStr = fmt(cur);
      if (days.includes(cur.getDay())) {
        if (set.has(dateStr)) {
          streak++;
        } else if (streak === 0 && isSameDay(cur, todayDate)) {
          // grace: today is scheduled but not yet checked in
        } else {
          break;
        }
      }
      cur = subDays(cur, 1);
    }
    return streak;
  }

  if (frequency.type === 'weekly') {
    let streak = 0;
    let weekStart = startOfWeek(todayDate, { weekStartsOn: 1 });
    for (let i = 0; i < 52; i++) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const hasCheckIn = checkIns.some((d) =>
        isWithinInterval(parse(d), { start: weekStart, end: weekEnd }),
      );
      if (hasCheckIn) {
        streak++;
      } else if (i === 0) {
        // grace: current week hasn't ended
      } else {
        break;
      }
      weekStart = subDays(weekStart, 7);
    }
    return streak;
  }

  return 0;
}

export function calculateLongestStreak(
  checkIns: string[],
  frequency: Frequency,
): number {
  if (checkIns.length === 0) return 0;
  const sorted = [...new Set(checkIns)].sort();

  if (frequency.type === 'daily') {
    let maxRun = 1;
    let currentRun = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInDays(parse(sorted[i]), parse(sorted[i - 1]));
      if (diff === 1) {
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else {
        currentRun = 1;
      }
    }
    return sorted.length === 0 ? 0 : maxRun;
  }

  if (frequency.type === 'specific') {
    const scheduled = getScheduledDates(
      frequency,
      sorted[0],
      sorted[sorted.length - 1],
    );
    const set = new Set(sorted);
    let maxRun = 0;
    let currentRun = 0;
    for (const date of scheduled) {
      if (set.has(date)) {
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else {
        currentRun = 0;
      }
    }
    return maxRun;
  }

  if (frequency.type === 'weekly') {
    const from = parse(sorted[0]);
    const to = parse(sorted[sorted.length - 1]);
    let maxRun = 0;
    let currentRun = 0;
    let weekStart = startOfWeek(from, { weekStartsOn: 1 });
    while (weekStart <= to) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const has = sorted.some((d) =>
        isWithinInterval(parse(d), { start: weekStart, end: weekEnd }),
      );
      if (has) {
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else {
        currentRun = 0;
      }
      weekStart = addDays(weekStart, 7);
    }
    return maxRun;
  }

  return 0;
}

export function calculateConsistency(
  checkIns: string[],
  frequency: Frequency,
  today: string,
  days = 60,
): number {
  const from = fmt(subDays(parse(today), days - 1));
  const scheduled = getScheduledDates(frequency, from, today);
  if (scheduled.length === 0) return 0;
  const set = new Set(checkIns);
  const completed = scheduled.filter((d) => set.has(d)).length;
  return Math.round((completed / scheduled.length) * 100);
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
bun test lib/streak/__tests__/calculator.test.ts
```

Expected: All tests pass. Fix any failures before continuing.

- [ ] **Step 5: Commit**

```bash
git add lib/streak/
git commit -m "feat: streak calculator with full test coverage"
```

---

## Task 5: Mongoose models

**Files:**
- Create: `lib/mongoose/connection.ts`
- Create: `models/Habit.ts`
- Create: `models/CheckIn.ts`

- [ ] **Step 1: Create `lib/mongoose/connection.ts`**

```ts
import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: typeof mongoose | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global.__mongooseConn) return global.__mongooseConn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  global.__mongooseConn = await mongoose.connect(uri);
  return global.__mongooseConn;
}
```

- [ ] **Step 2: Create `models/Habit.ts`**

```ts
import mongoose, { Schema, model, models } from 'mongoose';

const FrequencySchema = new Schema(
  {
    type: { type: String, enum: ['daily', 'weekly', 'specific'], required: true },
    days: { type: [Number], default: [] },
  },
  { _id: false },
);

const HabitSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, maxlength: 50, trim: true },
    icon: { type: String, required: true },
    frequency: { type: FrequencySchema, required: true },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const HabitModel = models.Habit ?? model('Habit', HabitSchema);
```

- [ ] **Step 3: Create `models/CheckIn.ts`**

```ts
import mongoose, { Schema, model, models } from 'mongoose';

const CheckInSchema = new Schema(
  {
    habitId: { type: Schema.Types.ObjectId, required: true, ref: 'Habit' },
    userId: { type: String, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
  },
  { timestamps: true },
);

// Prevent double check-ins for same habit on same day
CheckInSchema.index({ habitId: 1, date: 1 }, { unique: true });
// Efficient "all check-ins for user on date" queries
CheckInSchema.index({ userId: 1, date: 1 });

export const CheckInModel = models.CheckIn ?? model('CheckIn', CheckInSchema);
```

- [ ] **Step 4: Commit**

```bash
git add lib/mongoose/ models/
git commit -m "feat: mongoose connection singleton and Habit/CheckIn models"
```

---

## Task 6: better-auth setup

**Files:**
- Create: `lib/auth/auth.ts`
- Create: `lib/auth/auth-client.ts`
- Create: `app/api/auth/[...all]/route.ts`

> **Before starting:** Check the better-auth API in `node_modules/better-auth/` to confirm import paths. Specifically verify: `better-auth/adapters/mongodb` exports `mongodbAdapter`, and `better-auth/next-js` exports `toNextJsHandler`. Run: `ls node_modules/better-auth/dist/adapters/`

- [ ] **Step 1: Create `lib/auth/auth.ts`**

```ts
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

// Singleton client — better-auth uses this for its own session/user tables
let _client: MongoClient | null = null;
function getClient(): MongoClient {
  if (!_client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    _client = new MongoClient(uri);
  }
  return _client;
}

export const auth = betterAuth({
  database: mongodbAdapter(getClient()),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ],
});
```

- [ ] **Step 2: Create `lib/auth/auth-client.ts`**

```ts
'use client';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
});

export const { signIn, signOut, signUp, useSession } = authClient;
```

- [ ] **Step 3: Create `app/api/auth/[...all]/route.ts`**

```ts
import { auth } from '@/lib/auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: Verify build compiles (no TS errors)**

```bash
bun run build 2>&1 | head -40
```

Expected: Build succeeds or only errors about missing env vars (not type errors). Fix any type errors before continuing.

- [ ] **Step 5: Commit**

```bash
git add lib/auth/ app/api/auth/
git commit -m "feat: better-auth setup with email/password and Google OAuth"
```

---

## Task 7: Route protection via App layouts

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(app)/layout.tsx` (shell — no nav components yet)
- Modify: `app/page.tsx` (root redirect)

- [ ] **Step 1: Create `app/(auth)/layout.tsx`**

```tsx
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/today');
  return <>{children}</>;
}
```

- [ ] **Step 2: Create `app/(app)/layout.tsx` (minimal — full shell added in Task 15)**

```tsx
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  return (
    <div
      className="mx-auto flex flex-col bg-bg-page"
      style={{ maxWidth: 430, minHeight: '100dvh' }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Update `app/page.tsx` to redirect to `/today`**

Replace entire file content:

```tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/today');
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/ app/\(app\)/ app/page.tsx
git commit -m "feat: route groups with server-side session protection"
```

---

## Task 8: Auth pages — Login and Register

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create `app/(auth)/login/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { Button, Form, Input, Divider, Typography, Alert } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FireOutlined } from '@ant-design/icons';
import { signIn } from '@/lib/auth/auth-client';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish(values: { email: string; password: string }) {
    setLoading(true);
    setError(null);
    const { error: err } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: '/today',
    });
    if (err) {
      setError(err.message ?? 'Invalid email or password');
      setLoading(false);
    } else {
      router.push('/today');
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: 'google', callbackURL: '/today' });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div className="w-full" style={{ maxWidth: 360 }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-3"
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--color-brand)',
            }}
          >
            <FireOutlined style={{ fontSize: 28, color: 'var(--color-bg-page)' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            Streak Counter
          </Title>
          <Text style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Sign in to your account
          </Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Email</Text>}
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input
              size="large"
              placeholder="you@example.com"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Password</Text>}
            rules={[{ required: true, message: 'Enter your password' }]}
          >
            <Input.Password
              size="large"
              placeholder="••••••••"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
          or
        </Divider>

        <Button
          size="large"
          block
          loading={googleLoading}
          onClick={onGoogle}
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-body)',
            marginBottom: 24,
          }}
        >
          Continue with Google
        </Button>

        <Text style={{ color: 'var(--color-text-muted)', display: 'block', textAlign: 'center' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--color-brand)' }}>
            Sign up
          </Link>
        </Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/(auth)/register/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { Button, Form, Input, Divider, Typography, Alert } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FireOutlined } from '@ant-design/icons';
import { signUp, signIn } from '@/lib/auth/auth-client';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish(values: { name: string; email: string; password: string; confirm: string }) {
    if (values.password !== values.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: '/today',
    });
    if (err) {
      setError(err.message ?? 'Could not create account');
      setLoading(false);
    } else {
      router.push('/today');
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: 'google', callbackURL: '/today' });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div className="w-full" style={{ maxWidth: 360 }}>
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-3"
            style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-brand)' }}
          >
            <FireOutlined style={{ fontSize: 28, color: 'var(--color-bg-page)' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            Get Started
          </Title>
          <Text style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Create your account
          </Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="name"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Name</Text>}
            rules={[{ required: true, message: 'Enter your name' }]}
          >
            <Input
              size="large"
              placeholder="Your name"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Email</Text>}
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input
              size="large"
              placeholder="you@example.com"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Password</Text>}
            rules={[{ required: true, min: 8, message: 'At least 8 characters' }]}
          >
            <Input.Password
              size="large"
              placeholder="••••••••"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Confirm Password</Text>}
            rules={[{ required: true, message: 'Confirm your password' }]}
          >
            <Input.Password
              size="large"
              placeholder="••••••••"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>or</Divider>

        <Button
          size="large"
          block
          loading={googleLoading}
          onClick={onGoogle}
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-body)',
            marginBottom: 24,
          }}
        >
          Continue with Google
        </Button>

        <Text style={{ color: 'var(--color-text-muted)', display: 'block', textAlign: 'center' }}>
          Have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-brand)' }}>
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and verify auth pages render**

```bash
bun run dev
```

Navigate to `http://localhost:3000/login` — should show the login form with brand green button. Navigate to `/register` — should show registration form. Both should redirect to `/today` if you try to access them while logged in.

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: login and register pages with email/password and Google OAuth"
```

---

## Task 9: Habits service

**Files:**
- Create: `services/habits/habits.service.ts`

- [ ] **Step 1: Create `services/habits/habits.service.ts`**

```ts
import { connectDB } from '@/lib/mongoose/connection';
import { HabitModel } from '@/models/Habit';
import { CheckInModel } from '@/models/CheckIn';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isCompletedToday,
  getRecentDots,
} from '@/lib/streak/calculator';
import type { Habit, HabitWithStreak } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';
import { format } from 'date-fns';

function toPlain(doc: any): Habit {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    _id: String(obj._id),
    userId: obj.userId,
    name: obj.name,
    icon: obj.icon,
    frequency: obj.frequency,
    createdAt: obj.createdAt?.toISOString() ?? '',
    archivedAt: obj.archivedAt ? obj.archivedAt.toISOString() : null,
  };
}

export async function getHabitsForUser(
  userId: string,
  today: string,
): Promise<HabitWithStreak[]> {
  await connectDB();
  const habits = await HabitModel.find({ userId, archivedAt: null }).lean();

  const habitIds = habits.map((h: any) => h._id);
  const checkIns = await CheckInModel.find({ habitId: { $in: habitIds } }).lean();

  const checkInsByHabit = new Map<string, string[]>();
  for (const ci of checkIns as any[]) {
    const key = String(ci.habitId);
    if (!checkInsByHabit.has(key)) checkInsByHabit.set(key, []);
    checkInsByHabit.get(key)!.push(ci.date);
  }

  return habits.map((h: any) => {
    const id = String(h._id);
    const dates = checkInsByHabit.get(id) ?? [];
    const habit = toPlain(h);
    return {
      ...habit,
      currentStreak: calculateCurrentStreak(dates, habit.frequency, today),
      longestStreak: calculateLongestStreak(dates, habit.frequency),
      isCompletedToday: isCompletedToday(dates, today),
      recentDots: getRecentDots(dates, today, 7),
    };
  });
}

export async function createHabit(
  userId: string,
  data: CreateHabitInput,
): Promise<Habit> {
  await connectDB();
  const doc = await HabitModel.create({ userId, ...data });
  return toPlain(doc);
}

export async function updateHabit(
  id: string,
  userId: string,
  data: UpdateHabitInput,
): Promise<Habit | null> {
  await connectDB();
  const doc = await HabitModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true },
  );
  return doc ? toPlain(doc) : null;
}

export async function archiveHabit(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const result = await HabitModel.updateOne(
    { _id: id, userId },
    { $set: { archivedAt: new Date() } },
  );
  return result.modifiedCount > 0;
}

export async function checkIn(
  habitId: string,
  userId: string,
  date: string,
): Promise<boolean> {
  await connectDB();
  try {
    await CheckInModel.create({ habitId, userId, date });
    return true;
  } catch {
    // Duplicate key — already checked in
    return false;
  }
}

export async function undoCheckIn(
  habitId: string,
  userId: string,
  date: string,
): Promise<boolean> {
  await connectDB();
  const result = await CheckInModel.deleteOne({ habitId, userId, date });
  return result.deletedCount > 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add services/habits/
git commit -m "feat: habits service with streak enrichment"
```

---

## Task 10: Insights service

**Files:**
- Create: `services/insights/insights.service.ts`

- [ ] **Step 1: Create `services/insights/insights.service.ts`**

```ts
import { connectDB } from '@/lib/mongoose/connection';
import { HabitModel } from '@/models/Habit';
import { CheckInModel } from '@/models/CheckIn';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateConsistency,
} from '@/lib/streak/calculator';
import type { InsightsResponse, WeeklyDataPoint } from '@/types/api/insights.types';
import { format, subWeeks, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export async function getInsights(
  userId: string,
  today: string,
): Promise<InsightsResponse> {
  await connectDB();

  const habits = await HabitModel.find({ userId, archivedAt: null }).lean();
  const habitIds = habits.map((h: any) => h._id);

  const allCheckIns = await CheckInModel.find({
    userId,
    habitId: { $in: habitIds },
  }).lean();

  const allDates = (allCheckIns as any[]).map((ci) => ci.date as string);
  const totalCheckIns = allDates.length;

  const checkInsByHabit = new Map<string, string[]>();
  for (const ci of allCheckIns as any[]) {
    const key = String(ci.habitId);
    if (!checkInsByHabit.has(key)) checkInsByHabit.set(key, []);
    checkInsByHabit.get(key)!.push(ci.date as string);
  }

  let longestStreak = 0;
  let activeStreaks = 0;
  let totalConsistency = 0;

  for (const habit of habits as any[]) {
    const dates = checkInsByHabit.get(String(habit._id)) ?? [];
    const freq = habit.frequency;
    const current = calculateCurrentStreak(dates, freq, today);
    const longest = calculateLongestStreak(dates, freq);
    const consistency = calculateConsistency(dates, freq, today, 60);

    if (longest > longestStreak) longestStreak = longest;
    if (current > 0) activeStreaks++;
    totalConsistency += consistency;
  }

  const avgConsistency =
    habits.length > 0 ? Math.round(totalConsistency / habits.length) : 0;

  // Weekly data: last 9 weeks oldest first
  const todayDate = parseISO(today);
  const weeklyData: WeeklyDataPoint[] = [];
  for (let i = 8; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(todayDate, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(todayDate, i), { weekStartsOn: 1 });
    const count = allDates.filter((d) =>
      isWithinInterval(parseISO(d), { start: weekStart, end: weekEnd }),
    ).length;
    weeklyData.push({ label: i === 0 ? 'now' : `-${i}`, count });
  }

  const uniqueDates = [...new Set(allDates)].sort();

  return {
    longestStreak,
    totalCheckIns,
    activeStreaks,
    avgConsistency,
    weeklyData,
    checkInDates: uniqueDates,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add services/insights/
git commit -m "feat: insights service with streak aggregation"
```

---

## Task 11: Habits API routes

**Files:**
- Create: `app/api/habits/route.ts`
- Create: `app/api/habits/[id]/route.ts`

- [ ] **Step 1: Create `app/api/habits/route.ts`**

```ts
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getHabitsForUser, createHabit } from '@/services/habits/habits.service';
import type { CreateHabitInput } from '@/types/api/habits.types';

function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const habits = await getHabitsForUser(session.user.id, today());
    return Response.json({ habits });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as CreateHabitInput;

  if (!body.name?.trim() || !body.icon || !body.frequency?.type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const habit = await createHabit(session.user.id, body);
    return Response.json({ habit }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `app/api/habits/[id]/route.ts`**

```ts
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { updateHabit, archiveHabit } from '@/services/habits/habits.service';
import type { UpdateHabitInput } from '@/types/api/habits.types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as UpdateHabitInput;

  try {
    const habit = await updateHabit(id, session.user.id, body);
    if (!habit) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ habit });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const ok = await archiveHabit(id, session.user.id);
    if (!ok) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/habits/
git commit -m "feat: habits CRUD API routes"
```

---

## Task 12: Check-ins API route

**Files:**
- Create: `app/api/habits/[id]/checkins/route.ts`

- [ ] **Step 1: Create `app/api/habits/[id]/checkins/route.ts`**

```ts
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { checkIn, undoCheckIn } from '@/services/habits/habits.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { date } = (await request.json()) as { date: string };

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  }

  try {
    const ok = await checkIn(id, session.user.id, date);
    if (!ok) return Response.json({ error: 'Already checked in' }, { status: 409 });
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { date } = (await request.json()) as { date: string };

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  }

  try {
    await undoCheckIn(id, session.user.id, date);
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/habits/
git commit -m "feat: check-in API route (POST/DELETE)"
```

---

## Task 13: Insights API route

**Files:**
- Create: `app/api/insights/route.ts`

- [ ] **Step 1: Create `app/api/insights/route.ts`**

```ts
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getInsights } from '@/services/insights/insights.service';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const today = format(new Date(), 'yyyy-MM-dd');

  try {
    const insights = await getInsights(session.user.id, today);
    return Response.json(insights);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify all APIs compile**

```bash
bun run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No TypeScript errors. Fix any before continuing.

- [ ] **Step 3: Commit**

```bash
git add app/api/insights/
git commit -m "feat: insights API route"
```

---

## Task 14: Zustand stores

**Files:**
- Create: `store/habits/habits.store.ts`
- Create: `store/insights/insights.store.ts`

- [ ] **Step 1: Create `store/habits/habits.store.ts`**

```ts
import { create } from 'zustand';
import type { HabitWithStreak } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';

interface HabitsState {
  habits: HabitWithStreak[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  checkIn: (habitId: string, date: string) => Promise<void>;
  uncheck: (habitId: string, date: string) => Promise<void>;
  createHabit: (data: CreateHabitInput) => Promise<void>;
  updateHabit: (id: string, data: UpdateHabitInput) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  loading: false,
  error: null,

  async fetchHabits() {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/habits');
      if (!res.ok) throw new Error('Failed to fetch habits');
      const { habits } = await res.json();
      set({ habits, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  async checkIn(habitId, date) {
    // Optimistic update
    set((s) => ({
      habits: s.habits.map((h) =>
        h._id === habitId
          ? {
              ...h,
              isCompletedToday: true,
              currentStreak: h.currentStreak + 1,
              recentDots: [...h.recentDots.slice(1), true],
            }
          : h,
      ),
    }));
    const res = await fetch(`/api/habits/${habitId}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    if (!res.ok) {
      // Rollback on failure
      await get().fetchHabits();
    }
  },

  async uncheck(habitId, date) {
    // Optimistic update
    set((s) => ({
      habits: s.habits.map((h) =>
        h._id === habitId
          ? {
              ...h,
              isCompletedToday: false,
              currentStreak: Math.max(0, h.currentStreak - 1),
              recentDots: [...h.recentDots.slice(1, -1), false, false].slice(-7), // simplified
            }
          : h,
      ),
    }));
    const res = await fetch(`/api/habits/${habitId}/checkins`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    if (!res.ok) {
      await get().fetchHabits();
    }
  },

  async createHabit(data) {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create habit');
    await get().fetchHabits();
  },

  async updateHabit(id, data) {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update habit');
    await get().fetchHabits();
  },

  async archiveHabit(id) {
    set((s) => ({ habits: s.habits.filter((h) => h._id !== id) }));
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    if (!res.ok) await get().fetchHabits();
  },
}));
```

- [ ] **Step 2: Create `store/insights/insights.store.ts`**

```ts
import { create } from 'zustand';
import type { InsightsResponse } from '@/types/api/insights.types';

interface InsightsState {
  stats: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  fetchInsights: () => Promise<void>;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  stats: null,
  loading: false,
  error: null,

  async fetchInsights() {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/insights');
      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();
      set({ stats: data, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
}));
```

- [ ] **Step 3: Commit**

```bash
git add store/
git commit -m "feat: Zustand stores for habits and insights with optimistic updates"
```

---

## Task 15: App shell — PageHeader, BottomNav, and full layout

**Files:**
- Create: `components/ui/PageHeader/PageHeader.tsx`
- Create: `components/ui/PageHeader/index.ts`
- Create: `components/ui/BottomNav/BottomNav.tsx`
- Create: `components/ui/BottomNav/index.ts`
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Create `components/ui/PageHeader/PageHeader.tsx`**

```tsx
'use client';
import { Avatar, Typography } from 'antd';
import { format } from 'date-fns';

const { Text } = Typography;

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

export function PageHeader({ user }: PageHeaderProps) {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = format(now, 'EEEE, MMMM d');
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="fixed top-0 left-1/2 z-40 flex items-center justify-between px-4"
      style={{
        width: '100%',
        maxWidth: 430,
        height: 64,
        transform: 'translateX(-50%)',
        background: 'var(--color-bg-sunken)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div>
        <Text
          style={{
            display: 'block',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {dateStr}
        </Text>
        <Text
          strong
          style={{ fontSize: 20, color: 'var(--color-text-heading)', lineHeight: 1.2 }}
        >
          {greeting}
        </Text>
      </div>
      <Avatar
        src={user.image ?? undefined}
        style={{ background: 'var(--color-brand)', color: 'var(--color-bg-page)', fontWeight: 700 }}
        size={40}
      >
        {!user.image && initials}
      </Avatar>
    </header>
  );
}
```

- [ ] **Step 2: Create `components/ui/PageHeader/index.ts`**

```ts
export { PageHeader } from './PageHeader';
```

- [ ] **Step 3: Create `components/ui/BottomNav/BottomNav.tsx`**

```tsx
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Typography } from 'antd';
import { CalendarDays, BarChart3, Plus } from 'lucide-react';

const { Text } = Typography;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isToday = pathname === '/today' || pathname === '/';
  const isInsights = pathname.startsWith('/insights');

  const active = { color: 'var(--color-brand)' };
  const inactive = { color: 'var(--color-text-muted)' };

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex items-center"
      style={{
        width: '100%',
        maxWidth: 430,
        height: 64,
        transform: 'translateX(-50%)',
        background: 'var(--color-bg-sunken)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Today */}
      <button
        onClick={() => router.push('/today')}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <CalendarDays size={22} style={isToday ? active : inactive} />
        <Text style={{ fontSize: 11, ...(isToday ? active : inactive) }}>Today</Text>
      </button>

      {/* Add */}
      <div className="flex-1 flex justify-center">
        <button
          onClick={() => router.push('/habits/new')}
          className="flex items-center justify-center"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--color-brand)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <Plus size={26} style={{ color: 'var(--color-bg-page)' }} />
        </button>
      </div>

      {/* Insights */}
      <button
        onClick={() => router.push('/insights')}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <BarChart3 size={22} style={isInsights ? active : inactive} />
        <Text style={{ fontSize: 11, ...(isInsights ? active : inactive) }}>Insights</Text>
      </button>
    </nav>
  );
}
```

- [ ] **Step 4: Create `components/ui/BottomNav/index.ts`**

```ts
export { BottomNav } from './BottomNav';
```

- [ ] **Step 5: Replace `app/(app)/layout.tsx` with full shell**

```tsx
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { BottomNav } from '@/components/ui/BottomNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const user = {
    name: session.user.name ?? 'User',
    image: session.user.image ?? null,
  };

  return (
    <div
      className="mx-auto flex flex-col relative"
      style={{ maxWidth: 430, minHeight: '100dvh', background: 'var(--color-bg-page)' }}
    >
      <PageHeader user={user} />
      <main className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingTop: 80, paddingBottom: 80 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 6: Start dev server and verify shell renders**

```bash
bun run dev
```

Log in, go to `/today` — should see the header with greeting + avatar and the bottom nav with Today, + (brand green), Insights tabs. No content in the middle yet.

- [ ] **Step 7: Commit**

```bash
git add components/ui/PageHeader/ components/ui/BottomNav/ app/\(app\)/layout.tsx
git commit -m "feat: app shell with fixed header, bottom nav, and mobile container"
```

---

## Task 16: StreakDots and CheckInButton

**Files:**
- Create: `components/ui/StreakDots/StreakDots.tsx`
- Create: `components/ui/StreakDots/index.ts`
- Create: `components/ui/CheckInButton/CheckInButton.tsx`
- Create: `components/ui/CheckInButton/CheckInButton.types.ts`
- Create: `components/ui/CheckInButton/index.ts`

- [ ] **Step 1: Create `components/ui/StreakDots/StreakDots.tsx`**

```tsx
interface StreakDotsProps {
  days: boolean[]; // 7 booleans, index 0 = oldest, 6 = today
}

export function StreakDots({ days }: StreakDotsProps) {
  return (
    <div className="flex items-center gap-[4px]">
      {days.map((filled, i) => (
        <div
          key={i}
          style={{
            width: i === days.length - 1 ? 12 : 10,
            height: i === days.length - 1 ? 12 : 10,
            borderRadius: i === days.length - 1 ? 3 : '50%',
            background: filled ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
            border: !filled ? '1.5px solid var(--color-border-subtle)' : 'none',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/ui/StreakDots/index.ts`**

```ts
export { StreakDots } from './StreakDots';
```

- [ ] **Step 3: Create `components/ui/CheckInButton/CheckInButton.types.ts`**

```ts
export interface CheckInButtonProps {
  checked: boolean;
  loading?: boolean;
  onClick: () => void;
}
```

- [ ] **Step 4: Create `components/ui/CheckInButton/CheckInButton.tsx`**

```tsx
'use client';
import { Button } from 'antd';
import { CheckOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { CheckInButtonProps } from './CheckInButton.types';

export function CheckInButton({ checked, loading = false, onClick }: CheckInButtonProps) {
  return (
    <Button
      shape="circle"
      size="large"
      onClick={onClick}
      disabled={loading}
      icon={
        loading ? (
          <LoadingOutlined style={{ fontSize: 18 }} />
        ) : checked ? (
          <CheckOutlined style={{ fontSize: 18 }} />
        ) : (
          <PlusOutlined style={{ fontSize: 18 }} />
        )
      }
      style={{
        width: 44,
        height: 44,
        flexShrink: 0,
        background: checked ? 'var(--color-brand)' : 'transparent',
        borderColor: checked ? 'var(--color-brand)' : 'var(--color-border-subtle)',
        color: checked ? 'var(--color-bg-page)' : 'var(--color-text-muted)',
        transition: 'all 0.2s ease',
      }}
    />
  );
}
```

- [ ] **Step 5: Create `components/ui/CheckInButton/index.ts`**

```ts
export { CheckInButton } from './CheckInButton';
export type { CheckInButtonProps } from './CheckInButton.types';
```

- [ ] **Step 6: Commit**

```bash
git add components/ui/StreakDots/ components/ui/CheckInButton/
git commit -m "feat: StreakDots and CheckInButton UI primitives"
```

---

## Task 17: HabitCard component

**Files:**
- Create: `components/ui/HabitCard/HabitCard.types.ts`
- Create: `components/ui/HabitCard/HabitCard.tsx`
- Create: `components/ui/HabitCard/index.ts`

- [ ] **Step 1: Create `components/ui/HabitCard/HabitCard.types.ts`**

```ts
import type { HabitWithStreak } from '@/types/models/habit.types';

export interface HabitCardProps {
  habit: HabitWithStreak;
  today: string; // 'YYYY-MM-DD'
  onCheckIn: (habitId: string, date: string) => void;
  onUncheck: (habitId: string, date: string) => void;
  loading?: boolean;
}
```

- [ ] **Step 2: Create `components/ui/HabitCard/HabitCard.tsx`**

```tsx
'use client';
import { Typography } from 'antd';
import { Flame } from 'lucide-react';
import { StreakDots } from '@/components/ui/StreakDots';
import { CheckInButton } from '@/components/ui/CheckInButton';
import type { HabitCardProps } from './HabitCard.types';

const { Text } = Typography;

export function HabitCard({ habit, today, onCheckIn, onUncheck, loading }: HabitCardProps) {
  function handleToggle() {
    if (habit.isCompletedToday) {
      onUncheck(habit._id, today);
    } else {
      onCheckIn(habit._id, today);
    }
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl px-4 py-3"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        {/* Emoji icon */}
        <div
          className="flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--color-bg-elevated)',
          }}
        >
          {habit.icon}
        </div>

        {/* Name + streak */}
        <div className="flex-1 min-w-0">
          <Text
            strong
            style={{ fontSize: 16, color: 'var(--color-text-heading)', display: 'block', lineHeight: 1.3 }}
            ellipsis
          >
            {habit.name}
          </Text>
          <div className="flex items-center gap-1 mt-0.5">
            <Flame size={13} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
            <Text style={{ fontSize: 13, color: 'var(--color-brand)', fontWeight: 600 }}>
              {habit.currentStreak}
            </Text>
            <Text style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 2 }}>
              {habit.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </div>
        </div>

        {/* Check-in button */}
        <CheckInButton
          checked={habit.isCompletedToday}
          loading={loading}
          onClick={handleToggle}
        />
      </div>

      {/* Bottom row — dots + status */}
      <div className="flex items-center justify-between pl-[56px]">
        <StreakDots days={habit.recentDots} />
        <Text
          style={{
            fontSize: 11,
            color: habit.isCompletedToday ? 'var(--color-brand)' : 'var(--color-text-muted)',
          }}
        >
          {habit.isCompletedToday ? 'Done today ✓' : 'Tap to check in'}
        </Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/ui/HabitCard/index.ts`**

```ts
export { HabitCard } from './HabitCard';
export type { HabitCardProps } from './HabitCard.types';
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/HabitCard/
git commit -m "feat: HabitCard component with streak display and check-in toggle"
```

---

## Task 18: Today screen

**Files:**
- Create: `app/(app)/today/page.tsx`
- Create: `components/features/habits/HabitList/HabitList.tsx`
- Create: `components/features/habits/HabitList/index.ts`

- [ ] **Step 1: Create `components/features/habits/HabitList/HabitList.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Skeleton, Typography } from 'antd';
import { format } from 'date-fns';
import { HabitCard } from '@/components/ui/HabitCard';
import { useHabitsStore } from '@/store/habits/habits.store';

const { Text } = Typography;

export function HabitList() {
  const { habits, loading, fetchHabits, checkIn, uncheck } = useHabitsStore();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  async function handleCheckIn(habitId: string, date: string) {
    setPendingId(habitId);
    await checkIn(habitId, date);
    setPendingId(null);
  }

  async function handleUncheck(habitId: string, date: string) {
    setPendingId(habitId);
    await uncheck(habitId, date);
    setPendingId(null);
  }

  if (loading && habits.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} active paragraph={{ rows: 2 }} style={{ background: 'var(--color-bg-surface)', borderRadius: 16, padding: 16 }} />
        ))}
      </div>
    );
  }

  if (!loading && habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🌱</Text>
        <Text strong style={{ color: 'var(--color-text-heading)', fontSize: 18, display: 'block' }}>
          No habits yet
        </Text>
        <Text style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
          Tap + below to add your first habit
        </Text>
      </div>
    );
  }

  const remaining = habits.filter((h) => !h.isCompletedToday).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Text strong style={{ color: 'var(--color-text-heading)', fontSize: 16 }}>
          Today&apos;s habits
        </Text>
        {remaining > 0 && (
          <Text
            style={{
              fontSize: 11,
              color: 'var(--color-brand)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {remaining} TO GO
          </Text>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit._id}
            habit={habit}
            today={today}
            onCheckIn={handleCheckIn}
            onUncheck={handleUncheck}
            loading={pendingId === habit._id}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/features/habits/HabitList/index.ts`**

```ts
export { HabitList } from './HabitList';
```

- [ ] **Step 3: Create `app/(app)/today/page.tsx`**

```tsx
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { Card, Progress, Typography } from 'antd';
import { Flame, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { getHabitsForUser } from '@/services/habits/habits.service';
import { HabitList } from '@/components/features/habits/HabitList';

const { Text } = Typography;

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const today = format(new Date(), 'yyyy-MM-dd');
  const habits = await getHabitsForUser(session.user.id, today);

  const total = habits.length;
  const completed = habits.filter((h) => h.isCompletedToday).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const longestActive = habits.reduce(
    (max, h) => (h.currentStreak > max ? h.currentStreak : max),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Summary card */}
      {total > 0 && (
        <Card
          bordered={false}
          style={{ background: 'var(--color-bg-surface)', borderRadius: 20 }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={20} style={{ color: 'var(--color-brand)' }} />
                <Text strong style={{ fontSize: 17, color: 'var(--color-text-heading)' }}>
                  {total - completed > 0
                    ? `${total - completed} ${total - completed === 1 ? 'habit' : 'habits'} left today`
                    : 'All done today! 🎉'}
                </Text>
              </div>
              {longestActive > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy size={13} style={{ color: 'var(--color-warning)' }} />
                  <Text style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Longest run going: {longestActive} days
                  </Text>
                </div>
              )}
            </div>
            <Text style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {completed}/{total}
            </Text>
          </div>
          <Progress
            percent={pct}
            strokeColor="var(--color-brand)"
            trailColor="var(--color-bg-elevated)"
            showInfo={false}
            strokeWidth={8}
            style={{ borderRadius: 99 }}
          />
        </Card>
      )}

      {/* Habit list */}
      <HabitList />
    </div>
  );
}
```

- [ ] **Step 4: Start dev server and verify Today screen**

```bash
bun run dev
```

Log in and go to `/today`. Should see the summary card (if you have habits) and the empty state or habit list. The HabitList loads habits client-side from the store.

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/today/ components/features/habits/HabitList/
git commit -m "feat: Today screen with summary card and habit list"
```

---

## Task 19: EmojiPicker and HabitForm

**Files:**
- Create: `components/ui/EmojiPicker/EmojiPicker.tsx`
- Create: `components/ui/EmojiPicker/index.ts`
- Create: `components/features/habits/HabitForm/HabitForm.tsx`
- Create: `components/features/habits/HabitForm/index.ts`

- [ ] **Step 1: Create `components/ui/EmojiPicker/EmojiPicker.tsx`**

```tsx
'use client';
import { Typography } from 'antd';
import { HABIT_EMOJIS } from '@/constants/habits/emoji.constants';

const { Text } = Typography;

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div>
      <Text style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
        Choose an icon
      </Text>
      <div className="flex flex-wrap gap-2">
        {HABIT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            style={{
              width: 44,
              height: 44,
              fontSize: 22,
              borderRadius: 12,
              border: `2px solid ${value === emoji ? 'var(--color-brand)' : 'transparent'}`,
              background: value === emoji ? 'rgba(29,185,84,0.12)' : 'var(--color-bg-elevated)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/ui/EmojiPicker/index.ts`**

```ts
export { EmojiPicker } from './EmojiPicker';
```

- [ ] **Step 3: Create `components/features/habits/HabitForm/HabitForm.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { Form, Input, Radio, Button, Checkbox, Typography, Alert } from 'antd';
import { EmojiPicker } from '@/components/ui/EmojiPicker';
import { FREQUENCY_OPTIONS, DAY_OPTIONS } from '@/constants/habits/frequency.constants';
import { DEFAULT_EMOJI } from '@/constants/habits/emoji.constants';
import type { Habit } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';

const { Text } = Typography;

interface HabitFormProps {
  initial?: Habit;
  onSave: (data: CreateHabitInput | UpdateHabitInput) => Promise<void>;
  onCancel: () => void;
}

export function HabitForm({ initial, onSave, onCancel }: HabitFormProps) {
  const [emoji, setEmoji] = useState(initial?.icon ?? DEFAULT_EMOJI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const watchFreqType = Form.useWatch('frequencyType', form);

  async function onFinish(values: {
    name: string;
    frequencyType: 'daily' | 'weekly' | 'specific';
    days?: number[];
  }) {
    setLoading(true);
    setError(null);
    try {
      await onSave({
        name: values.name.trim(),
        icon: emoji,
        frequency: {
          type: values.frequencyType,
          days: values.frequencyType === 'specific' ? (values.days ?? []) : [],
        },
      });
    } catch (err) {
      setError('Failed to save habit. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: initial?.name ?? '',
        frequencyType: initial?.frequency.type ?? 'daily',
        days: initial?.frequency.days ?? [],
      }}
      onFinish={onFinish}
      requiredMark={false}
    >
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      {/* Emoji */}
      <Form.Item>
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Form.Item>

      {/* Name */}
      <Form.Item
        name="name"
        label={<Text style={{ color: 'var(--color-text-body)' }}>Habit name</Text>}
        rules={[
          { required: true, message: 'Give your habit a name' },
          { max: 50, message: 'Max 50 characters' },
        ]}
      >
        <Input
          size="large"
          placeholder="e.g. Read 20 pages"
          maxLength={50}
          showCount
          style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
        />
      </Form.Item>

      {/* Frequency type */}
      <Form.Item
        name="frequencyType"
        label={<Text style={{ color: 'var(--color-text-body)' }}>Frequency</Text>}
      >
        <Radio.Group>
          {FREQUENCY_OPTIONS.map((opt) => (
            <Radio
              key={opt.value}
              value={opt.value}
              style={{ color: 'var(--color-text-body)', marginBottom: 4 }}
            >
              {opt.label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>

      {/* Specific days selector */}
      {watchFreqType === 'specific' && (
        <Form.Item
          name="days"
          label={<Text style={{ color: 'var(--color-text-body)' }}>Days</Text>}
          rules={[{ required: true, type: 'array', min: 1, message: 'Select at least one day' }]}
        >
          <Checkbox.Group>
            <div className="flex gap-2 flex-wrap">
              {DAY_OPTIONS.map((day) => (
                <Checkbox key={day.value} value={day.value}>
                  <Text style={{ color: 'var(--color-text-body)' }}>{day.label}</Text>
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          size="large"
          onClick={onCancel}
          style={{
            flex: 1,
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-body)',
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          style={{
            flex: 1,
            background: 'var(--color-brand)',
            borderColor: 'var(--color-brand)',
          }}
        >
          {initial ? 'Save changes' : 'Add habit'}
        </Button>
      </div>
    </Form>
  );
}
```

- [ ] **Step 4: Create `components/features/habits/HabitForm/index.ts`**

```ts
export { HabitForm } from './HabitForm';
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/EmojiPicker/ components/features/habits/HabitForm/
git commit -m "feat: EmojiPicker and HabitForm components"
```

---

## Task 20: Add habit and Edit habit pages

**Files:**
- Create: `app/(app)/habits/new/page.tsx`
- Create: `app/(app)/habits/[id]/edit/page.tsx`

- [ ] **Step 1: Create `app/(app)/habits/new/page.tsx`**

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { HabitForm } from '@/components/features/habits/HabitForm';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { CreateHabitInput } from '@/types/api/habits.types';

const { Title } = Typography;

export default function NewHabitPage() {
  const router = useRouter();
  const { createHabit } = useHabitsStore();

  async function handleSave(data: CreateHabitInput) {
    await createHabit(data as CreateHabitInput);
    router.push('/today');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <ArrowLeft size={22} style={{ color: 'var(--color-text-body)' }} />
        </button>
        <Title level={3} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
          New Habit
        </Title>
      </div>
      <HabitForm
        onSave={(data) => handleSave(data as CreateHabitInput)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `app/(app)/habits/[id]/edit/page.tsx`**

```tsx
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Typography, Skeleton, Button, Popconfirm } from 'antd';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { HabitForm } from '@/components/features/habits/HabitForm';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { UpdateHabitInput } from '@/types/api/habits.types';

const { Title } = Typography;

export default function EditHabitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { habits, fetchHabits, updateHabit, archiveHabit } = useHabitsStore();

  useEffect(() => {
    if (habits.length === 0) fetchHabits();
  }, [habits.length, fetchHabits]);

  const habit = habits.find((h) => h._id === id);

  async function handleSave(data: UpdateHabitInput) {
    await updateHabit(id, data);
    router.push('/today');
  }

  async function handleDelete() {
    await archiveHabit(id);
    router.push('/today');
  }

  if (!habit) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <ArrowLeft size={22} style={{ color: 'var(--color-text-body)' }} />
          </button>
          <Title level={3} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            Edit Habit
          </Title>
        </div>
        <Popconfirm
          title="Delete this habit?"
          description="All check-in history will be lost."
          onConfirm={handleDelete}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button
            danger
            type="text"
            icon={<Trash2 size={18} />}
            size="small"
          />
        </Popconfirm>
      </div>
      <HabitForm
        initial={habit}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and verify Add habit flow**

```bash
bun run dev
```

Tap + in the bottom nav → should navigate to `/habits/new`. Fill in name, pick emoji, pick frequency → tap "Add habit". Should return to `/today` and show the new habit in the list.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/habits/
git commit -m "feat: add habit and edit habit pages with delete confirmation"
```

---

## Task 21: StatCard and WeeklyBars

**Files:**
- Create: `components/ui/StatCard/StatCard.tsx`
- Create: `components/ui/StatCard/StatCard.types.ts`
- Create: `components/ui/StatCard/index.ts`
- Create: `components/ui/WeeklyBars/WeeklyBars.tsx`
- Create: `components/ui/WeeklyBars/WeeklyBars.types.ts`
- Create: `components/ui/WeeklyBars/index.ts`

- [ ] **Step 1: Create `components/ui/StatCard/StatCard.types.ts`**

```ts
import type { ReactNode } from 'react';

export interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  sublabel: string;
}
```

- [ ] **Step 2: Create `components/ui/StatCard/StatCard.tsx`**

```tsx
'use client';
import { Typography } from 'antd';
import type { StatCardProps } from './StatCard.types';

const { Text } = Typography;

export function StatCard({ icon, value, label, sublabel }: StatCardProps) {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-4"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid rgba(255,255,255,0.05)',
        minHeight: 110,
      }}
    >
      <span style={{ fontSize: 26 }}>{icon}</span>
      <Text
        strong
        style={{ fontSize: 32, color: 'var(--color-text-heading)', lineHeight: 1, display: 'block' }}
      >
        {value}
      </Text>
      <div>
        <Text style={{ fontSize: 14, color: 'var(--color-text-body)', display: 'block', lineHeight: 1.3 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sublabel}</Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/ui/StatCard/index.ts`**

```ts
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard.types';
```

- [ ] **Step 4: Create `components/ui/WeeklyBars/WeeklyBars.types.ts`**

```ts
import type { WeeklyDataPoint } from '@/types/api/insights.types';

export interface WeeklyBarsProps {
  data: WeeklyDataPoint[];
}
```

- [ ] **Step 5: Create `components/ui/WeeklyBars/WeeklyBars.tsx`**

```tsx
'use client';
import { Typography } from 'antd';
import type { WeeklyBarsProps } from './WeeklyBars.types';

const { Text } = Typography;

export function WeeklyBars({ data }: WeeklyBarsProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1" style={{ height: 100 }}>
      {data.map((point, i) => {
        const isNow = point.label === 'now';
        const heightPct = max > 0 ? (point.count / max) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end gap-1"
          >
            {point.count > 0 && (
              <Text style={{ fontSize: 10, color: isNow ? 'var(--color-brand)' : 'var(--color-text-muted)' }}>
                {point.count}
              </Text>
            )}
            <div
              style={{
                width: '100%',
                height: `${Math.max(heightPct, 8)}%`,
                borderRadius: '4px 4px 0 0',
                background: isNow ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
                minHeight: 8,
                transition: 'height 0.3s ease',
              }}
            />
            <Text style={{ fontSize: 9, color: isNow ? 'var(--color-brand)' : 'var(--color-text-muted)' }}>
              {point.label}
            </Text>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Create `components/ui/WeeklyBars/index.ts`**

```ts
export { WeeklyBars } from './WeeklyBars';
export type { WeeklyBarsProps } from './WeeklyBars.types';
```

- [ ] **Step 7: Commit**

```bash
git add components/ui/StatCard/ components/ui/WeeklyBars/
git commit -m "feat: StatCard and WeeklyBars components for insights"
```

---

## Task 22: HeatmapCalendar

**Files:**
- Create: `components/ui/HeatmapCalendar/HeatmapCalendar.tsx`
- Create: `components/ui/HeatmapCalendar/index.ts`

> **Before starting:** Check react-day-picker v9 API at `node_modules/react-day-picker/`. Verify: CSS import path, `DayPicker` props (`modifiers`, `modifiersStyles`). Run: `ls node_modules/react-day-picker/dist/`

- [ ] **Step 1: Add react-day-picker styles to `app/globals.css`**

> **Verify first:** Run `ls node_modules/react-day-picker/dist/` and confirm `style.css` exists. If not, check `node_modules/react-day-picker/` root for the correct CSS file name.

Open `app/globals.css` and add at the very top (before `@import "tailwindcss"`):

```css
@import "react-day-picker/style.css";
```

Then override react-day-picker CSS variables to match dark theme — add inside `:root {}` block:

```css
  --rdp-accent-color: var(--color-brand);
  --rdp-accent-background-color: rgba(29, 185, 84, 0.15);
  --rdp-background-color: var(--color-bg-elevated);
  --rdp-day_button-border-radius: 50%;
  --rdp-font-family: var(--font-sans);
```

- [ ] **Step 2: Create `components/ui/HeatmapCalendar/HeatmapCalendar.tsx`**

```tsx
'use client';
import { DayPicker } from 'react-day-picker';
import { parseISO, subMonths } from 'date-fns';
import { Typography } from 'antd';

const { Text } = Typography;

interface HeatmapCalendarProps {
  checkInDates: string[]; // 'YYYY-MM-DD'[]
}

export function HeatmapCalendar({ checkInDates }: HeatmapCalendarProps) {
  const today = new Date();
  const fromMonth = subMonths(today, 2);

  const checkedDays = checkInDates.map((d) => parseISO(d));

  return (
    <div>
      <Text
        strong
        style={{ fontSize: 15, color: 'var(--color-text-heading)', display: 'block', marginBottom: 12 }}
      >
        When you show up
      </Text>
      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 16,
          padding: '8px 0',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <DayPicker
          mode="multiple"
          selected={checkedDays}
          onSelect={() => {}} // read-only
          numberOfMonths={3}
          startMonth={fromMonth}
          endMonth={today}
          showOutsideDays={false}
          styles={{
            root: {
              '--rdp-cell-size': '32px',
              color: 'var(--color-text-body)',
              fontSize: 13,
              width: '100%',
            } as React.CSSProperties,
            month_caption: { color: 'var(--color-text-muted)', fontSize: 12 },
            weekday: { color: 'var(--color-text-muted)', fontSize: 11 },
          }}
          modifiersStyles={{
            selected: {
              background: 'var(--color-brand)',
              color: 'var(--color-bg-page)',
              borderRadius: '50%',
            },
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/ui/HeatmapCalendar/index.ts`**

```ts
export { HeatmapCalendar } from './HeatmapCalendar';
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/HeatmapCalendar/ app/globals.css
git commit -m "feat: HeatmapCalendar using react-day-picker with dark theme"
```

---

## Task 23: Insights screen

**Files:**
- Create: `components/features/insights/InsightsSummary/InsightsSummary.tsx`
- Create: `components/features/insights/InsightsSummary/index.ts`
- Create: `app/(app)/insights/page.tsx`

- [ ] **Step 1: Create `components/features/insights/InsightsSummary/InsightsSummary.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { Skeleton } from 'antd';
import { StatCard } from '@/components/ui/StatCard';
import { WeeklyBars } from '@/components/ui/WeeklyBars';
import { HeatmapCalendar } from '@/components/ui/HeatmapCalendar';
import { useInsightsStore } from '@/store/insights/insights.store';

export function InsightsSummary() {
  const { stats, loading, fetchInsights } = useInsightsStore();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 3 }} style={{ background: 'var(--color-bg-surface)', borderRadius: 16, padding: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="🔥"
          value={stats.longestStreak}
          label="Longest streak"
          sublabel="all-time best"
        />
        <StatCard
          icon="✅"
          value={stats.totalCheckIns}
          label="Total check-ins"
          sublabel="across all habits"
        />
        <StatCard
          icon="⚡"
          value={stats.activeStreaks}
          label="Active streaks"
          sublabel="going right now"
        />
        <StatCard
          icon="🎯"
          value={`${stats.avgConsistency}%`}
          label="Avg consistency"
          sublabel="last 60 days"
        />
      </div>

      {/* Weekly chart */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-heading)' }}>
            Check-ins per week
          </span>
        </div>
        <WeeklyBars data={stats.weeklyData} />
      </div>

      {/* Heatmap */}
      <HeatmapCalendar checkInDates={stats.checkInDates} />
    </div>
  );
}
```

- [ ] **Step 2: Create `components/features/insights/InsightsSummary/index.ts`**

```ts
export { InsightsSummary } from './InsightsSummary';
```

- [ ] **Step 3: Create `app/(app)/insights/page.tsx`**

```tsx
import { Typography } from 'antd';
import { InsightsSummary } from '@/components/features/insights/InsightsSummary';

const { Title, Text } = Typography;

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Text
          style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          Your Momentum
        </Text>
        <Title level={2} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
          Insights
        </Title>
      </div>
      <InsightsSummary />
    </div>
  );
}
```

- [ ] **Step 4: Start dev server and verify Insights screen**

```bash
bun run dev
```

Navigate to `/insights`. Should see the 4 stat cards in a 2×2 grid, the weekly bar chart, and the heatmap calendar (all populated once you have check-in data).

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/insights/ components/features/insights/
git commit -m "feat: Insights screen with stats, weekly chart, and heatmap calendar"
```

---

## Task 24: Final verification and polish

**Files:**
- Modify: `app/globals.css` (ensure dark backgrounds on body)
- Verify all routes work end-to-end

- [ ] **Step 1: Ensure body background is correct in `app/globals.css`**

Confirm the `@layer base` block contains:

```css
@layer base {
  * { border-color: var(--color-border); }
  body {
    background-color: var(--color-bg-page);
    color: var(--color-text-body);
    font-family: var(--font-sans);
  }
  h1, h2, h3, h4, h5, h6 {
    color: var(--color-text-heading);
    font-weight: 700;
  }
  a { color: var(--color-text-link); }
}
```

If missing, add it.

- [ ] **Step 2: Run full build**

```bash
bun run build
```

Expected: Build succeeds. Fix any TypeScript or build errors before continuing.

- [ ] **Step 3: End-to-end smoke test on dev server**

```bash
bun run dev
```

Test this full flow:
1. `/` → redirects to `/login` (unauthenticated)
2. `/register` → create a new account with email/password
3. Redirected to `/today` — empty state with "No habits yet"
4. Tap + (bottom nav) → `/habits/new`
5. Pick emoji, name "Morning Run", frequency "Every Day" → tap "Add habit"
6. Back to `/today` — habit appears with 0-day streak
7. Tap the check-in button → button turns brand-green, "Done today ✓" appears
8. Navigate to `/insights` → see stats update
9. Tap ⚙ button on habit card → edit page → change name → save → updated
10. Sign out (test the session ends, redirect to `/login`)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete streak counter app — full-stack mobile-first with Next.js, MongoDB, better-auth"
```

---

## File Map Summary

```
app/
  (auth)/layout.tsx               redirect to /today if logged in
  (auth)/login/page.tsx           email+password + Google
  (auth)/register/page.tsx        signup form
  (app)/layout.tsx                session check + PageHeader + BottomNav shell
  (app)/today/page.tsx            server-rendered summary + client HabitList
  (app)/insights/page.tsx         InsightsSummary client component
  (app)/habits/new/page.tsx       create habit
  (app)/habits/[id]/edit/page.tsx edit/archive habit
  api/auth/[...all]/route.ts      better-auth handler
  api/habits/route.ts             GET + POST
  api/habits/[id]/route.ts        PATCH + DELETE
  api/habits/[id]/checkins/route.ts  POST + DELETE
  api/insights/route.ts           GET
  globals.css                     react-day-picker import + dark theme vars
  layout.tsx                      root layout (Inter font, Providers)
  page.tsx                        redirect to /today

lib/
  auth/auth.ts                    better-auth server config
  auth/auth-client.ts             better-auth client (signIn/signOut/useSession)
  mongoose/connection.ts          singleton DB connection
  streak/calculator.ts            pure streak functions

models/
  Habit.ts                        Mongoose schema
  CheckIn.ts                      Mongoose schema (unique index habitId+date)

services/
  habits/habits.service.ts        DB operations + streak enrichment
  insights/insights.service.ts    aggregation for insights API

store/
  habits/habits.store.ts          Zustand with optimistic check-in
  insights/insights.store.ts      Zustand for insights data

components/
  ui/
    PageHeader/                   fixed top header with greeting
    BottomNav/                    fixed bottom nav (Today | + | Insights)
    HabitCard/                    habit row with streak + dots + button
    StreakDots/                   7-dot recent-day visualization
    CheckInButton/                animated check/uncheck circle button
    EmojiPicker/                  emoji grid selector
    StatCard/                     insights metric card
    WeeklyBars/                   CSS bar chart for weekly check-ins
    HeatmapCalendar/              react-day-picker with check-in highlighting
  features/
    habits/HabitList/             client list with store + skeleton states
    habits/HabitForm/             shared create/edit form
    insights/InsightsSummary/     full insights client component

types/
  models/habit.types.ts, checkin.types.ts, user.types.ts
  api/habits.types.ts, insights.types.ts

constants/
  habits/emoji.constants.ts
  habits/frequency.constants.ts
```
