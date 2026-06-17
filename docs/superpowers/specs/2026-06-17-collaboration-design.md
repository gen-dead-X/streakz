# Collaboration Feature — Design Spec

**Date:** 2026-06-17  
**Status:** Approved  

---

## Overview

Add collaboration to Streakz via a **Project** primitive. A Project is a shared workspace with an invite link. Inside a project, habits come in two flavours:

- **Team habit** — one shared habit; every member must check in for the day to count. Missing a day resets the streak to zero for all members.
- **Personal habit** — each member creates their own habits inside the project. Individual streaks are independent. The project surfaces a "project success day" when every member has completed all of their personal habits.

A new **mode switcher** in the header lets users jump between All Streaks (default) and individual project views.

---

## Data Model

### New: `Project` (Mongoose model)

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | string (max 50) | |
| `icon` | string | Emoji |
| `ownerId` | string | userId of creator |
| `inviteToken` | string | Random 32-char hex, unique index |
| `members` | `[{ userId, role, joinedAt }]` | `role: 'owner' \| 'member'` |
| `archivedAt` | Date \| null | Soft delete |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### Modified: `Habit` model — two new optional fields

| Field | Type | Default | Notes |
|---|---|---|---|
| `projectId` | string \| null | `null` | Links habit to a project |
| `scope` | `'team' \| 'personal'` | `'personal'` | Only meaningful when `projectId` is set |

**Team habit:** one `Habit` document, `scope: 'team'`. Multiple `CheckIn` records are created per day (one per member), using the existing `CheckIn` model unchanged. A day counts only when every current project member has a check-in.

**Personal habit in project:** each member owns their own `Habit` document with `scope: 'personal'` and `projectId` set. Individual streaks are computed as normal. The project surface derives "project success" from all members' completion state.

### Existing models unchanged
`CheckIn`, `Achievement`, `PushSubscription` — no schema changes.

---

## Streak Reset Rules

| Habit type | Miss by one member | Result |
|---|---|---|
| Team habit | Yes | Shared streak resets to 0 for all members |
| Personal habit in project | Yes | Only that member's individual streak is affected |

Team streak is recalculated server-side on every check-in:

```
calculateTeamStreak(
  checkInsByMember: Map<userId, string[]>,
  memberIds: string[],
  frequency: Frequency,
  today: string
): number
```

A day counts in the team streak only if **every** `memberId` has a check-in date in the set for that day.

---

## Navigation & UI

### `ProjectSwitcher` component (new)

- Rendered in both `PageHeader` (mobile) and `SideNav` (desktop)
- Client component, reads from `projects.store`
- Dropdown options:
  - **All Streaks** (default) — stays on `/today`
  - One entry per project the user belongs to — navigates to `/projects/[id]`
  - **+ New Project** — navigates to `/projects/new`
- On mobile: replaces the static "Your Streaks" text in `PageHeader` left area
- On desktop: sits below the logo in `SideNav`, above the date context

### Project page (`/projects/[id]`)

```
[Icon]  Project Name
Members: 👤 👤 👤  · 2/3 done today

─── Team Habits ───────────────────────────
[ 🔥 Daily standup ]  ✅ You  ⬜ Ana  ⬜ Tom   [Check in]

─── Your Habits ───────────────────────────
[ 💪 Push-ups ]  ●●●●●●○   streak 6   [Check in]
[ 📖 Read      ]  ●●●○○●●   streak 2   [Check in]

─── Team Status ───────────────────────────
  👤 Ana   ✅ 2/2 done
  👤 Tom   ⬜ 0/2 done
```

- Team Habits section hidden if project has none.
- Your Habits shows only the current user's personal project habits using the existing `HabitCard`.
- Team Status shows each member's personal habit completion count for today. Collapsed on mobile, always visible on desktop.
- Add Habit button pre-fills `projectId`; a type picker (Team / Personal) appears as the first step.

### Invite landing page (`/invite/[token]`)

Public route. Server component resolves token → project name + member count.

- **Not signed in** → shows project card + "Sign in to join" → redirects back via `?next=/invite/[token]`
- **Signed in + already a member** → immediate redirect to `/projects/[id]`
- **Signed in + new member** → "Join [name]?" confirm → `POST /api/projects/join` → redirect to project page

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/projects` | Create project, mint `inviteToken`, add creator as owner |
| `GET` | `/api/projects` | List all projects current user is a member of |
| `GET` | `/api/projects/[id]` | Get project + members + today's completion state |
| `PATCH` | `/api/projects/[id]` | Update name / icon (owner only) |
| `DELETE` | `/api/projects/[id]` | Archive project (owner only) |
| `GET` | `/api/projects/[id]/habits` | All habits for project (team + personal-mine) |
| `POST` | `/api/projects/[id]/habits` | Create habit scoped to project (`scope` in body) |
| `GET` | `/api/projects/[id]/status` | Per-member, per-habit completion for today |
| `POST` | `/api/projects/join` | `{ token }` → validates, adds user to members[]. Idempotent. |
| `GET` | `/api/invite/[token]` | Public. Resolves token → `{ projectId, projectName, memberCount }` |

Check-ins for project habits reuse the existing `/api/habits/[id]/checkins` route — no changes.

---

## Invite Token Management

- `inviteToken` = `crypto.randomBytes(16).toString('hex')` (32 hex chars)
- Shareable URL: `${NEXT_PUBLIC_APP_URL}/invite/[token]`
- Token is permanent by default. Owner can regenerate from project settings, which mints a new token and invalidates the old one.

---

## Member Removal

- Owner removes a member, or member leaves voluntarily.
- On removal: the member's **personal habits** inside the project are soft-archived (`archivedAt = now`).
- Their **check-ins on team habits** are preserved — historical streaks remain intact.
- Going forward, the team habit's day-success calculation excludes the removed member.
- Ownership transfer is out of scope for this phase.

---

## State Management

### New: `projects.store.ts`

```typescript
interface ProjectsState {
  projects: ProjectWithMeta[];
  activeProjectId: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<string>;
  joinProject: (token: string) => Promise<string>;
}
```

`activeProjectId` lives in `sessionStorage` only — not server-persisted. Navigating to `/projects/[id]` sets it; navigating to `/today` clears it.

### `HabitList` change (All Mode)

All Mode shows every habit belonging to the current user: personal habits with no project (`projectId: null`), personal habits inside projects, and team habits where the user is a member. The existing `/api/habits` route needs to include project-scoped personal habits and team habits in its response. No change to the Today page UI.

### `HabitForm` change

When creating a habit from inside a project (`projectId` in context), a scope picker appears as step 0: **Team habit** or **Personal habit**. Outside a project, scope is always `personal` and no picker is shown.

---

## New Files

### Routes
```
app/(app)/projects/new/page.tsx
app/(app)/projects/[id]/page.tsx
app/(app)/projects/[id]/settings/page.tsx
app/(auth)/invite/[token]/page.tsx
```

### API
```
app/api/projects/route.ts
app/api/projects/[id]/route.ts
app/api/projects/[id]/habits/route.ts
app/api/projects/[id]/status/route.ts
app/api/projects/join/route.ts
app/api/invite/[token]/route.ts
```

### Components
```
components/ui/ProjectSwitcher/
components/features/projects/ProjectPage/
components/features/projects/ProjectHeader/
components/features/projects/TeamHabitRow/
components/features/projects/TeamStatusPanel/
components/features/projects/MemberList/
```

### Models / Types / Services / Store
```
models/Project.ts
types/models/project.types.ts
types/api/projects.types.ts
services/projects/projects.service.ts
store/projects/projects.store.ts
lib/streak/teamCalculator.ts
```

---

## Out of Scope (This Phase)

- Ownership transfer
- Invite link expiry
- Project-level achievements
- Real-time updates (polling or websockets)
- Notifications for team habit failures
