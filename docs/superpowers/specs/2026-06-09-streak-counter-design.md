# Streak Counter — Design Spec

**Date:** 2026-06-09  
**Status:** Approved  

---

## 1. Overview

A mobile-first web app for tracking daily habits via streaks. Users create habits, check in each day, and view insights on their consistency. Designed primarily for smartphone use; desktop shows a centered mobile-width container.

### Constraints
- AntD components used throughout (no other UI library for components)
- Existing color tokens from `docs/theme.md` / `app/globals.css` — no hardcoded colors
- Mobile-first responsive (max-width ~430px container, centered on wider screens)

---

## 2. Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 App Router | Already in project |
| UI | Ant Design v6 + Tailwind v4 | Already configured |
| Calendar | `react-day-picker` v9 | Custom day rendering for heatmap, TS-first |
| Icons | `lucide-react` + `@ant-design/icons` | Lucide for custom UI icons; AntD icons inside AntD components |
| State | `zustand` | Specified; lightweight, no boilerplate |
| ODM | `mongoose` | Gold standard for MongoDB, mature TS support |
| Auth | `better-auth` | Next.js App Router native, MongoDB adapter, email+password + Google OAuth |
| Runtime | Bun | Project standard — never npm/yarn/pnpm |

---

## 3. Data Models

### User (managed by better-auth — standard schema)
```
id           String   (better-auth managed)
name         String
email        String   (unique)
emailVerified Boolean
image        String?
createdAt    Date
```

### Habit
```
_id          ObjectId
userId       ObjectId  (ref: User)
name         String    (max 50 chars)
icon         String    (single emoji character)
frequency    {
  type       'daily' | 'weekly' | 'specific'
  days       number[]  // 0=Sun…6=Sat; empty for 'daily'/'weekly'
}
createdAt    Date
archivedAt   Date?     // soft delete; null = active
```

### CheckIn
```
_id          ObjectId
habitId      ObjectId  (ref: Habit)
userId       ObjectId  (ref: User — denormalized for query efficiency)
date         String    // 'YYYY-MM-DD' in user's local date
createdAt    Date
```
**Index:** `{ habitId, date }` unique — prevents double check-ins.  
**Index:** `{ userId, date }` — for loading all of today's check-ins efficiently.

---

## 4. Streak Calculation Logic (`lib/streak/calculator.ts`)

Streaks are **calculated at query time** from CheckIn records — never stored.

### Rules
- **daily**: Streak = consecutive days with a check-in ending on today or yesterday. A streak is still "active" until midnight of the current day — if you haven't checked in today but checked in yesterday, the streak count is shown as intact until day-end.
- **weekly**: Streak = consecutive calendar weeks (Mon–Sun) with at least one check-in.
- **specific**: Streak = consecutive occurrences of scheduled days that have check-ins. A scheduled day without a check-in breaks the streak.

### Functions exported
```ts
calculateStreak(checkIns: string[], frequency: Frequency, today: string): number
calculateLongestStreak(checkIns: string[], frequency: Frequency): number
getScheduledDaysInRange(frequency: Frequency, from: string, to: string): string[]
isCompletedToday(checkIns: string[], today: string): boolean
getRecentDots(checkIns: string[], frequency: Frequency, today: string, count: 7): boolean[]
```

---

## 5. API Routes

All routes require an authenticated session. Unauthenticated requests return 401.

```
POST   /api/auth/[...all]              ← better-auth handler

GET    /api/habits                     → { habits: Habit[] } with currentStreak injected
POST   /api/habits                     ← { name, icon, frequency }
PATCH  /api/habits/[id]               ← { name?, icon?, frequency? }
DELETE /api/habits/[id]               → soft-deletes (sets archivedAt)

POST   /api/habits/[id]/checkins      ← { date: 'YYYY-MM-DD' }
DELETE /api/habits/[id]/checkins      ← { date: 'YYYY-MM-DD' }

GET    /api/insights                   → {
                                           longestStreak: number,
                                           totalCheckIns: number,
                                           activeStreaks: number,
                                           avgConsistency: number,       // % last 60 days
                                           weeklyData: { week: string, count: number }[],  // last 9 weeks
                                           checkInDates: string[]         // all dates (for heatmap)
                                         }
```

---

## 6. Frontend Screens

### Layout Shell
- **Header**: fixed top, 56px — date + greeting left, avatar right
- **Content**: scrollable area between header and bottom nav, padding 16px
- **Bottom Nav**: fixed, 3 tabs — Today | + (FAB-style center) | Insights
- **Container**: `max-w-[430px] mx-auto w-full`

### Today Screen (`app/(app)/today/page.tsx`)
1. **Summary Card** (AntD `Card`):
   - "X streaks left today" + longest active streak
   - AntD `Progress` bar showing completed/total
2. **Section header**: "Today's streaks" + "X TO GO" badge
3. **Habit list**: `HabitCard` for each active habit
   - Emoji icon, habit name, streak count with fire icon
   - `StreakDots` (7 dots — filled = checked in that day)
   - `CheckInButton` — AntD `Button` circular; checked = filled brand color, unchecked = outlined
   - Status text: "Done today ✓" or "Tap to check in"

### Add/Edit Habit Screen (`app/(app)/habits/new/page.tsx`)
- AntD `Form` with:
  - Text input: habit name
  - Emoji picker grid (curated ~30 emojis in categories)
  - Frequency selector: AntD `Radio.Group` → daily / weekly / specific days
  - If "specific days": AntD `Checkbox.Group` with Mon–Sun
- AntD `Button` primary: Save

### Insights Screen (`app/(app)/insights/page.tsx`)
1. **2×2 Stat Grid** (`StatCard` ×4):
   - Longest streak, Total check-ins, Active streaks, Avg consistency
2. **Weekly bar chart** (`WeeklyBars`): 9 columns, last 9 weeks, current week highlighted
   - Built with Tailwind flexbox + AntD `Typography` labels (no chart library)
3. **"When you show up" calendar** (`HeatmapCalendar`):
   - `react-day-picker` rendering last 3 months
   - Days with check-ins highlighted with `--color-brand` background

---

## 7. Component Map

```
components/
  ui/
    StreakDots/         Props: days: boolean[]
    HabitCard/          Props: habit: HabitWithStreak, onCheckIn, onUncheck
    CheckInButton/      Props: checked: boolean, loading: boolean, onClick
    StatCard/           Props: icon, value, label, sublabel
    WeeklyBars/         Props: data: { week: string, count: number }[]
    HeatmapCalendar/    Props: checkInDates: string[]
    BottomNav/          Props: active: 'today' | 'insights'
    PageHeader/         Props: userName: string, userImage?: string
    EmojiPicker/        Props: value: string, onChange: (emoji: string) => void

  features/
    habits/
      HabitList/        Props: habits: HabitWithStreak[], today: string
      HabitForm/        Props: initial?: Habit, onSave, onCancel
    insights/
      InsightsSummary/  Props: stats: InsightsResponse
```

---

## 8. Zustand Stores

### `useHabitsStore`
```ts
state:   { habits: HabitWithStreak[], loading, error }
actions: fetchHabits(), checkIn(habitId, date), uncheck(habitId, date),
         createHabit(data), updateHabit(id, data), archiveHabit(id)
```
Check-in toggle is **optimistic** — updates local state immediately, rolls back on API error.

### `useInsightsStore`
```ts
state:   { stats: InsightsResponse | null, loading, error }
actions: fetchInsights()
```

### Auth (no separate store)
`better-auth`'s client (`lib/auth/auth-client.ts`) exposes `useSession()` directly. Components use this hook — no Zustand store needed for auth state.

---

## 9. Folder Structure

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (app)/
    today/page.tsx
    insights/page.tsx
    habits/
      new/page.tsx
      [id]/edit/page.tsx
  api/
    auth/[...all]/route.ts
    habits/route.ts
    habits/[id]/route.ts
    habits/[id]/checkins/route.ts
    insights/route.ts
  globals.css
  layout.tsx
  providers.tsx

components/
  ui/  (see §7)
  features/  (see §7)

hooks/
  auth/useSession.ts
  habits/useHabitActions.ts

lib/
  mongoose/connection.ts
  auth/auth.ts
  auth/auth-client.ts
  streak/calculator.ts

models/
  Habit.ts
  CheckIn.ts

services/
  habits/habits.service.ts
  insights/insights.service.ts

types/
  models/
    habit.types.ts
    checkin.types.ts
    user.types.ts
  api/
    habits.types.ts
    insights.types.ts

constants/
  habits/
    emoji.constants.ts   ← curated emoji list for picker
    frequency.constants.ts

store/
  habits/habits.store.ts
  insights/insights.store.ts
```

---

## 10. Auth Flow

- **better-auth** handles sessions via HTTP-only cookies.
- `lib/auth/auth.ts` — server-side auth config (MongoDB adapter, Google provider, email+password)
- `lib/auth/auth-client.ts` — client-side auth helpers (signIn, signOut, useSession)
- All `(app)` routes protected by middleware (`middleware.ts` at root) — redirects unauthenticated to `/login`
- Auth pages `(auth)` are public

### Google OAuth
Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars.

### Required Env Vars
```
MONGODB_URI
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

---

## 11. Out of Scope (for this version)

- Push notifications / reminders
- Habit ordering / drag-and-drop
- Social features / sharing
- Export data
- Dark/light mode toggle (dark mode is the default, always on)
