# Collaboration Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Projects as a collaboration primitive — shareable workspaces where members track team habits (all-or-nothing streak) and personal habits (individual streaks, project-wide accountability).

**Architecture:** A new `Project` Mongoose model holds members + an invite token. `Habit` gains `projectId` + `scope` fields. A `ProjectSwitcher` in both nav surfaces (mobile header + desktop sidebar) lets users switch between All Mode and a specific project view. Team habit streaks are calculated by intersecting all members' check-in sets.

**Tech Stack:** Next.js 16 App Router, Mongoose, Zustand, Framer Motion, Ant Design 6, Tailwind CSS 4, Bun, TypeScript 5, Zod 4, `crypto` (Node built-in)

**Spec:** `docs/superpowers/specs/2026-06-17-collaboration-design.md`

---

## File Map

### New files
```
models/Project.ts
types/models/project.types.ts
types/api/projects.types.ts
lib/streak/teamCalculator.ts
services/projects/projects.service.ts
store/projects/projects.store.ts
app/api/projects/route.ts
app/api/projects/[id]/route.ts
app/api/projects/[id]/habits/route.ts
app/api/projects/[id]/status/route.ts
app/api/projects/join/route.ts
app/api/invite/[token]/route.ts
components/ui/ProjectSwitcher/ProjectSwitcher.tsx
components/ui/ProjectSwitcher/index.ts
components/features/projects/ProjectHeader/ProjectHeader.tsx
components/features/projects/ProjectHeader/index.ts
components/features/projects/TeamHabitRow/TeamHabitRow.tsx
components/features/projects/TeamHabitRow/index.ts
components/features/projects/TeamStatusPanel/TeamStatusPanel.tsx
components/features/projects/TeamStatusPanel/index.ts
components/features/projects/MemberList/MemberList.tsx
components/features/projects/MemberList/index.ts
components/features/projects/ProjectForm/ProjectForm.tsx
components/features/projects/ProjectForm/index.ts
components/features/projects/ProjectPage/ProjectPage.tsx
components/features/projects/ProjectPage/index.ts
app/(app)/projects/new/page.tsx
app/(app)/projects/[id]/page.tsx
app/(app)/projects/[id]/settings/page.tsx
app/(auth)/invite/[token]/page.tsx
```

### Modified files
```
models/Habit.ts                                     — add projectId, scope fields
types/models/habit.types.ts                         — add HabitScope, projectId, scope, teamCompletedToday, memberStatus to interfaces
types/api/habits.types.ts                           — add projectId?, scope? to CreateHabitInput
services/habits/habits.service.ts                   — toPlain() includes new fields; getHabitsForUser() includes team habits; checkIn() handles team recalc
app/api/habits/route.ts                             — POST accepts projectId + scope
components/ui/PageHeader/PageHeader.tsx             — add ProjectSwitcher to left area
components/ui/SideNav/SideNav.tsx                   — add ProjectSwitcher below logo
components/features/habits/HabitForm/HabitForm.tsx  — add scope picker when projectId context present
```

---

## Task 1: TypeScript types — project model + API shapes

**Files:**
- Create: `types/models/project.types.ts`
- Create: `types/api/projects.types.ts`
- Modify: `types/models/habit.types.ts`
- Modify: `types/api/habits.types.ts`

- [ ] **Create `types/models/project.types.ts`**

```typescript
export type ProjectRole = 'owner' | 'member';

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  icon: string;
  ownerId: string;
  inviteToken: string;
  members: ProjectMember[];
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Create `types/api/projects.types.ts`**

```typescript
import type { Project } from '@/types/models/project.types';

export interface CreateProjectInput {
  name: string;
  icon: string;
}

export interface UpdateProjectInput {
  name?: string;
  icon?: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface ProjectStatusMember {
  userId: string;
  name: string;
  image: string | null;
  personalDone: number;
  personalTotal: number;
  teamHabitsDone: string[];
}

export interface ProjectStatusResponse {
  members: ProjectStatusMember[];
  totalMembers: number;
  allDone: boolean;
}

export interface JoinProjectResponse {
  projectId: string;
}

export interface InvitePreviewResponse {
  projectId: string;
  projectName: string;
  projectIcon: string;
  memberCount: number;
}
```

- [ ] **Modify `types/models/habit.types.ts` — add scope type + extend interfaces**

Replace the file content with:

```typescript
import type { JSONContent } from '@tiptap/core';

export type FrequencyType = 'daily' | 'weekly' | 'specific';

export interface Frequency {
  type: FrequencyType;
  days: number[]; // 0=Sun … 6=Sat — empty for 'daily'/'weekly'
}

export type CardStyle = 'wavy' | 'geometric' | 'blob' | 'aurora' | 'ember' | 'midnight' | 'rose';

export type HabitScope = 'team' | 'personal';

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  description?: JSONContent;
  tags: string[];
  cardStyle: CardStyle;
  notifications: boolean;
  frequency: Frequency;
  projectId: string | null;
  scope: HabitScope;
  createdAt: string;
  archivedAt: string | null;
}

export interface HabitWithStreak extends Habit {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  recentDots: boolean[]; // 7 booleans — index 0 = 6 days ago, index 6 = today
  // Populated only for team habits (scope === 'team')
  teamCompletedToday?: boolean;
  memberStatus?: { userId: string; isCompletedToday: boolean }[];
}
```

- [ ] **Modify `types/api/habits.types.ts` — add optional project fields to `CreateHabitInput`**

```typescript
import type { JSONContent } from '@tiptap/core';
import type { CardStyle, Frequency, HabitScope, HabitWithStreak } from '@/types/models/habit.types';

export interface CreateHabitInput {
  name: string;
  icon: string;
  description?: JSONContent;
  tags?: string[];
  cardStyle?: CardStyle;
  notifications?: boolean;
  frequency: Frequency;
  projectId?: string | null;
  scope?: HabitScope;
}

export interface UpdateHabitInput {
  name?: string;
  icon?: string;
  description?: JSONContent;
  tags?: string[];
  cardStyle?: CardStyle;
  notifications?: boolean;
  frequency?: Frequency;
}

export interface HabitsResponse {
  habits: HabitWithStreak[];
}

export interface DaySummary {
  date: string;
  total: number;
  completed: number;
}
```

- [ ] **Verify: `bun run build` — expect zero TS errors on types alone (compilation may fail on missing files; that's expected until all tasks are done)**

---

## Task 2: Mongoose models — Project + Habit modifications

**Files:**
- Create: `models/Project.ts`
- Modify: `models/Habit.ts`

- [ ] **Create `models/Project.ts`**

```typescript
import mongoose, { Schema, model, models } from 'mongoose';
import crypto from 'crypto';

const ProjectMemberSchema = new Schema(
  {
    userId:   { type: String, required: true },
    role:     { type: String, enum: ['owner', 'member'], required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    name:        { type: String, required: true, maxlength: 50, trim: true },
    icon:        { type: String, required: true },
    ownerId:     { type: String, required: true },
    inviteToken: {
      type:     String,
      required: true,
      unique:   true,
      default:  () => crypto.randomBytes(16).toString('hex'),
    },
    members:    { type: [ProjectMemberSchema], default: [] },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ProjectSchema.index({ 'members.userId': 1 });

export const ProjectModel = models.Project ?? model('Project', ProjectSchema);
```

- [ ] **Modify `models/Habit.ts` — add `projectId` and `scope` fields**

Replace the full file:

```typescript
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
    userId:      { type: String, required: true, index: true },
    name:        { type: String, required: true, maxlength: 50, trim: true },
    icon:        { type: String, required: true },
    description: { type: Schema.Types.Mixed, default: null },
    tags:        { type: [String], default: [] },
    cardStyle:   {
      type:    String,
      enum:    ['wavy', 'geometric', 'blob', 'aurora', 'ember', 'midnight', 'rose'],
      default: 'wavy',
    },
    notifications: { type: Boolean, default: true },
    frequency:     { type: FrequencySchema, required: true },
    projectId:     { type: String, default: null, index: true },
    scope:         { type: String, enum: ['team', 'personal'], default: 'personal' },
    archivedAt:    { type: Date, default: null },
  },
  { timestamps: true },
);

export const HabitModel = models.Habit ?? model('Habit', HabitSchema);
```

- [ ] **Commit**

```bash
git add models/Project.ts models/Habit.ts types/models/project.types.ts types/models/habit.types.ts types/api/projects.types.ts types/api/habits.types.ts
git commit -m "feat: add Project model + scope/projectId fields to Habit"
```

---

## Task 3: Team streak calculator

**Files:**
- Create: `lib/streak/teamCalculator.ts`

- [ ] **Create `lib/streak/teamCalculator.ts`**

This function intersects all members' check-in sets to produce a synthetic "team check-in" list, then delegates to the existing per-habit streak calculator.

```typescript
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from '@/lib/streak/calculator';
import type { Frequency } from '@/types/models/habit.types';

/**
 * Returns the current team streak for a shared habit.
 * A day counts only when EVERY memberId has a check-in for that date.
 */
export function calculateTeamCurrentStreak(
  checkInsByMember: Map<string, string[]>,
  memberIds: string[],
  frequency: Frequency,
  today: string,
): number {
  if (memberIds.length === 0) return 0;
  const teamDates = intersectMemberDates(checkInsByMember, memberIds);
  return calculateCurrentStreak(teamDates, frequency, today);
}

/**
 * Returns the longest team streak ever achieved.
 */
export function calculateTeamLongestStreak(
  checkInsByMember: Map<string, string[]>,
  memberIds: string[],
  frequency: Frequency,
): number {
  if (memberIds.length === 0) return 0;
  const teamDates = intersectMemberDates(checkInsByMember, memberIds);
  return calculateLongestStreak(teamDates, frequency);
}

/**
 * Returns true when every member has a check-in for `date`.
 */
export function isTeamCompletedOnDate(
  checkInsByMember: Map<string, string[]>,
  memberIds: string[],
  date: string,
): boolean {
  return memberIds.every((id) => {
    const dates = checkInsByMember.get(id) ?? [];
    return dates.includes(date);
  });
}

function intersectMemberDates(
  checkInsByMember: Map<string, string[]>,
  memberIds: string[],
): string[] {
  const memberSets = memberIds.map((id) => new Set(checkInsByMember.get(id) ?? []));

  // Union of all dates across all members
  const allDates = new Set<string>();
  for (const set of memberSets) {
    for (const date of set) allDates.add(date);
  }

  // Keep only dates present in every member's set
  return [...allDates].filter((date) => memberSets.every((set) => set.has(date)));
}
```

- [ ] **Commit**

```bash
git add lib/streak/teamCalculator.ts
git commit -m "feat: add team streak calculator (intersection-based)"
```

---

## Task 4: Projects service

**Files:**
- Create: `services/projects/projects.service.ts`

- [ ] **Create `services/projects/projects.service.ts`**

```typescript
import crypto from 'crypto';
import { connectDB } from '@/lib/mongoose/connection';
import { ProjectModel } from '@/models/Project';
import { HabitModel } from '@/models/Habit';
import { CheckInModel } from '@/models/CheckIn';
import type { Project } from '@/types/models/project.types';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStatusResponse,
  InvitePreviewResponse,
} from '@/types/api/projects.types';

function toPlainProject(doc: unknown): Project {
  const obj = (doc as { toObject?: () => Record<string, unknown> }).toObject?.() ?? (doc as Record<string, unknown>);
  return {
    _id:         String(obj._id),
    name:        obj.name as string,
    icon:        obj.icon as string,
    ownerId:     obj.ownerId as string,
    inviteToken: obj.inviteToken as string,
    members:     (obj.members as { userId: string; role: 'owner' | 'member'; joinedAt: Date }[]).map(
      (m) => ({ userId: m.userId, role: m.role, joinedAt: new Date(m.joinedAt).toISOString() }),
    ),
    archivedAt:  obj.archivedAt ? new Date(obj.archivedAt as Date).toISOString() : null,
    createdAt:   new Date(obj.createdAt as Date).toISOString(),
    updatedAt:   new Date(obj.updatedAt as Date).toISOString(),
  };
}

export async function createProject(
  userId: string,
  data: CreateProjectInput,
): Promise<Project> {
  await connectDB();
  const doc = await ProjectModel.create({
    name:    data.name,
    icon:    data.icon,
    ownerId: userId,
    members: [{ userId, role: 'owner', joinedAt: new Date() }],
  });
  return toPlainProject(doc);
}

export async function getProjectsForUser(userId: string): Promise<Project[]> {
  await connectDB();
  const docs = await ProjectModel.find({ 'members.userId': userId, archivedAt: null }).lean();
  return (docs as unknown[]).map(toPlainProject);
}

export async function getProjectById(
  projectId: string,
  userId: string,
): Promise<Project | null> {
  await connectDB();
  const doc = await ProjectModel.findOne({
    _id: projectId,
    'members.userId': userId,
    archivedAt: null,
  }).lean();
  return doc ? toPlainProject(doc) : null;
}

export async function updateProject(
  projectId: string,
  ownerId: string,
  data: UpdateProjectInput,
): Promise<Project | null> {
  await connectDB();
  const doc = await ProjectModel.findOneAndUpdate(
    { _id: projectId, ownerId },
    { $set: data },
    { new: true },
  ).lean();
  return doc ? toPlainProject(doc) : null;
}

export async function archiveProject(
  projectId: string,
  ownerId: string,
): Promise<boolean> {
  await connectDB();
  const result = await ProjectModel.findOneAndUpdate(
    { _id: projectId, ownerId },
    { $set: { archivedAt: new Date() } },
  );
  return !!result;
}

export async function joinProjectByToken(
  token: string,
  userId: string,
): Promise<string | null> {
  await connectDB();
  // Idempotent: if already a member, return projectId without error
  const existing = await ProjectModel.findOne({
    inviteToken: token,
    'members.userId': userId,
    archivedAt: null,
  }).lean() as { _id: unknown } | null;
  if (existing) return String(existing._id);

  const doc = await ProjectModel.findOneAndUpdate(
    { inviteToken: token, archivedAt: null },
    { $push: { members: { userId, role: 'member', joinedAt: new Date() } } },
    { new: true },
  ).lean() as { _id: unknown } | null;
  return doc ? String(doc._id) : null;
}

export async function resolveInviteToken(
  token: string,
): Promise<InvitePreviewResponse | null> {
  await connectDB();
  const doc = await ProjectModel.findOne({ inviteToken: token, archivedAt: null }).lean() as {
    _id: unknown;
    name: string;
    icon: string;
    members: unknown[];
  } | null;
  if (!doc) return null;
  return {
    projectId:   String(doc._id),
    projectName: doc.name,
    projectIcon: doc.icon,
    memberCount: doc.members.length,
  };
}

export async function removeMember(
  projectId: string,
  ownerId: string,
  targetUserId: string,
): Promise<boolean> {
  await connectDB();
  const doc = await ProjectModel.findOneAndUpdate(
    { _id: projectId, ownerId },
    { $pull: { members: { userId: targetUserId } } },
    { new: true },
  );
  if (!doc) return false;
  // Soft-archive the removed member's personal habits in this project
  await HabitModel.updateMany(
    { projectId, userId: targetUserId, scope: 'personal', archivedAt: null },
    { $set: { archivedAt: new Date() } },
  );
  return true;
}

export async function leaveProject(
  projectId: string,
  userId: string,
): Promise<boolean> {
  await connectDB();
  const doc = await ProjectModel.findOne({ _id: projectId, archivedAt: null }).lean() as { ownerId: string } | null;
  if (!doc) return false;
  if (doc.ownerId === userId) return false; // owner must archive, not leave

  await ProjectModel.findByIdAndUpdate(projectId, {
    $pull: { members: { userId } },
  });
  await HabitModel.updateMany(
    { projectId, userId, scope: 'personal', archivedAt: null },
    { $set: { archivedAt: new Date() } },
  );
  return true;
}

export async function regenerateInviteToken(
  projectId: string,
  ownerId: string,
): Promise<string | null> {
  await connectDB();
  const newToken = crypto.randomBytes(16).toString('hex');
  const doc = await ProjectModel.findOneAndUpdate(
    { _id: projectId, ownerId },
    { $set: { inviteToken: newToken } },
    { new: true },
  ).lean() as { inviteToken: string } | null;
  return doc ? doc.inviteToken : null;
}

export async function getProjectStatus(
  projectId: string,
  today: string,
): Promise<ProjectStatusResponse> {
  await connectDB();
  const project = await ProjectModel.findById(projectId).lean() as {
    members: { userId: string }[];
  } | null;
  if (!project) return { members: [], totalMembers: 0, allDone: false };

  const memberIds = project.members.map((m) => m.userId);

  const [personalHabits, teamHabits] = await Promise.all([
    HabitModel.find({ projectId, scope: 'personal', archivedAt: null }).lean(),
    HabitModel.find({ projectId, scope: 'team', archivedAt: null }).lean(),
  ]);

  const allHabitIds = [...personalHabits, ...teamHabits].map((h) => (h as { _id: unknown })._id);
  const todayCheckIns = await CheckInModel.find({
    habitId: { $in: allHabitIds },
    date: today,
  }).lean() as { habitId: unknown; userId: string }[];

  const checkInKey = (habitId: unknown, userId: string) => `${String(habitId)}:${userId}`;
  const checkInSet = new Set(todayCheckIns.map((ci) => checkInKey(ci.habitId, ci.userId)));

  const members = memberIds.map((userId) => {
    const mine = (personalHabits as { _id: unknown; userId: string }[]).filter(
      (h) => h.userId === userId,
    );
    const personalDone  = mine.filter((h) => checkInSet.has(checkInKey(h._id, userId))).length;
    const teamHabitsDone = (teamHabits as { _id: unknown }[])
      .filter((h) => checkInSet.has(checkInKey(h._id, userId)))
      .map((h) => String(h._id));

    return {
      userId,
      name:           '',   // enriched by the API route from the auth DB
      image:          null,
      personalDone,
      personalTotal:  mine.length,
      teamHabitsDone,
    };
  });

  const allDone = members.every(
    (m) =>
      m.personalDone === m.personalTotal &&
      (teamHabits as { _id: unknown }[]).every((h) =>
        m.teamHabitsDone.includes(String(h._id)),
      ),
  );

  return { members, totalMembers: memberIds.length, allDone };
}
```

- [ ] **Commit**

```bash
git add services/projects/projects.service.ts
git commit -m "feat: add projects service (CRUD, invite token, member management, status)"
```

---

## Task 5: API — Projects CRUD

**Files:**
- Create: `app/api/projects/route.ts`
- Create: `app/api/projects/[id]/route.ts`

- [ ] **Create `app/api/projects/route.ts`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { createProject, getProjectsForUser } from '@/services/projects/projects.service';
import type { CreateProjectInput } from '@/types/api/projects.types';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const projects = await getProjectsForUser(session.user.id);
    return Response.json({ projects });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as CreateProjectInput;
  if (!body.name?.trim() || !body.icon) {
    return Response.json({ error: 'name and icon are required' }, { status: 400 });
  }

  try {
    const project = await createProject(session.user.id, body);
    return Response.json({ project }, { status: 201 });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Create `app/api/projects/[id]/route.ts`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import {
  getProjectById,
  updateProject,
  archiveProject,
} from '@/services/projects/projects.service';
import type { UpdateProjectInput } from '@/types/api/projects.types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json({ project });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as UpdateProjectInput;
  const project = await updateProject(id, session.user.id, body);
  if (!project) return Response.json({ error: 'Not found or forbidden' }, { status: 404 });

  return Response.json({ project });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const ok = await archiveProject(id, session.user.id);
  if (!ok) return Response.json({ error: 'Not found or forbidden' }, { status: 404 });

  return Response.json({ ok: true });
}
```

- [ ] **Commit**

```bash
git add app/api/projects/route.ts app/api/projects/[id]/route.ts
git commit -m "feat: add /api/projects CRUD routes"
```

---

## Task 6: API — Project habits, status, join, invite resolve

> **⚠️ Prerequisite:** Task 7 (habits service) must be completed before this task — `getHabitsForProject` is defined there and imported here. Implement Task 7 first if following sequentially.

**Files:**
- Create: `app/api/projects/[id]/habits/route.ts`
- Create: `app/api/projects/[id]/status/route.ts`
- Create: `app/api/projects/join/route.ts`
- Create: `app/api/invite/[token]/route.ts`

- [ ] **Create `app/api/projects/[id]/habits/route.ts`**

This route returns team habits + the current user's personal habits for a project. Creating a habit here sets `projectId` automatically.

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getProjectById } from '@/services/projects/projects.service';
import { getHabitsForProject, createHabit } from '@/services/habits/habits.service';
import type { CreateHabitInput } from '@/types/api/habits.types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

  const today = format(new Date(), 'yyyy-MM-dd');
  const habits = await getHabitsForProject(id, session.user.id, today);
  return Response.json({ habits });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json()) as Omit<CreateHabitInput, 'projectId'>;
  if (!body.name?.trim() || !body.icon || !body.frequency?.type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const habit = await createHabit(session.user.id, { ...body, projectId: id, scope: body.scope ?? 'personal' });
  return Response.json({ habit }, { status: 201 });
}
```

- [ ] **Create `app/api/projects/[id]/status/route.ts`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getProjectById, getProjectStatus } from '@/services/projects/projects.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

  const today = format(new Date(), 'yyyy-MM-dd');
  const status = await getProjectStatus(id, today);
  return Response.json(status);
}
```

- [ ] **Create `app/api/projects/join/route.ts`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { joinProjectByToken } from '@/services/projects/projects.service';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = (await request.json()) as { token: string };
  if (!token) return Response.json({ error: 'token is required' }, { status: 400 });

  const projectId = await joinProjectByToken(token, session.user.id);
  if (!projectId) return Response.json({ error: 'Invalid or expired invite' }, { status: 404 });

  return Response.json({ projectId });
}
```

- [ ] **Create `app/api/invite/[token]/route.ts`** (public — no auth)

```typescript
import { resolveInviteToken } from '@/services/projects/projects.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const preview = await resolveInviteToken(token);
  if (!preview) return Response.json({ error: 'Invalid invite' }, { status: 404 });
  return Response.json(preview);
}
```

- [ ] **Commit**

```bash
git add app/api/projects/[id]/habits/route.ts app/api/projects/[id]/status/route.ts app/api/projects/join/route.ts app/api/invite/[token]/route.ts
git commit -m "feat: add project habits, status, join, and invite API routes"
```

---

## Task 7: Habits service — add `getHabitsForProject` + update `getHabitsForUser` + `toPlain`

**Files:**
- Modify: `services/habits/habits.service.ts`

The existing `toPlain()` ignores `projectId` and `scope`. The `getHabitsForUser()` only queries by `userId` so it misses team habits created by other members. This task fixes both and adds `getHabitsForProject`.

- [ ] **Update `toPlain()` in `services/habits/habits.service.ts`** to include new fields

Find the `toPlain` function and replace it:

```typescript
function toPlain(doc: unknown): Habit {
  const obj = (doc as { toObject?: () => Record<string, unknown> }).toObject?.() ??
    (doc as Record<string, unknown>);
  return {
    _id:          String(obj._id),
    userId:       obj.userId as string,
    name:         obj.name as string,
    icon:         obj.icon as string,
    description:  (obj.description ?? undefined) as Habit['description'],
    tags:         (obj.tags ?? []) as string[],
    cardStyle:    (obj.cardStyle ?? deterministicCardStyle(String(obj._id))) as CardStyle,
    notifications: (obj.notifications ?? true) as boolean,
    frequency:    obj.frequency as Habit['frequency'],
    projectId:    (obj.projectId ?? null) as string | null,
    scope:        ((obj.scope as string) ?? 'personal') as HabitScope,
    createdAt:    obj.createdAt ? new Date(obj.createdAt as Date).toISOString() : '',
    archivedAt:   obj.archivedAt ? new Date(obj.archivedAt as Date).toISOString() : null,
  };
}
```

Also add `HabitScope` to the import from `@/types/models/habit.types`:

```typescript
import type { CardStyle, Habit, HabitScope, HabitWithStreak } from '@/types/models/habit.types';
```

- [ ] **Update `getHabitsForUser()` to also return team habits the user is a member of**

Replace the function:

```typescript
import { ProjectModel } from '@/models/Project';
import {
  calculateTeamCurrentStreak,
  calculateTeamLongestStreak,
  isTeamCompletedOnDate,
} from '@/lib/streak/teamCalculator';

export async function getHabitsForUser(
  userId: string,
  today: string,
): Promise<HabitWithStreak[]> {
  await connectDB();

  // 1. Personal habits (projectId = null) + personal habits inside projects
  const ownHabits = await HabitModel.find({ userId, archivedAt: null }).lean();

  // 2. Team habits from projects this user belongs to
  const projects = await ProjectModel.find({ 'members.userId': userId, archivedAt: null }).lean();
  const projectIds = (projects as { _id: unknown }[]).map((p) => String(p._id));

  const teamHabits =
    projectIds.length > 0
      ? await HabitModel.find({
          projectId: { $in: projectIds },
          scope: 'team',
          archivedAt: null,
        }).lean()
      : [];

  // Deduplicate: own habits already include personal-in-project; team habits are extra
  const allHabits = [...ownHabits, ...teamHabits];
  const habitIds  = allHabits.map((h) => (h as { _id: unknown })._id);

  // 3. Fetch ALL check-ins for these habits (all users — needed for team streaks)
  const checkIns = await CheckInModel.find({ habitId: { $in: habitIds } }).lean() as {
    habitId: unknown;
    userId: string;
    date: string;
  }[];

  // Group by habitId → userId → dates[]
  const checkInsByHabitUser = new Map<string, Map<string, string[]>>();
  for (const ci of checkIns) {
    const hKey = String(ci.habitId);
    if (!checkInsByHabitUser.has(hKey)) checkInsByHabitUser.set(hKey, new Map());
    const userMap = checkInsByHabitUser.get(hKey)!;
    if (!userMap.has(ci.userId)) userMap.set(ci.userId, []);
    userMap.get(ci.userId)!.push(ci.date);
  }

  // Build project → memberIds map for team streak calculation
  const projectMemberMap = new Map<string, string[]>();
  for (const p of projects as { _id: unknown; members: { userId: string }[] }[]) {
    projectMemberMap.set(String(p._id), p.members.map((m) => m.userId));
  }

  return allHabits.map((h) => {
    const habit   = toPlain(h);
    const hKey    = habit._id;
    const userMap = checkInsByHabitUser.get(hKey) ?? new Map<string, string[]>();

    if (habit.scope === 'team' && habit.projectId) {
      const memberIds          = projectMemberMap.get(habit.projectId) ?? [];
      const currentStreak      = calculateTeamCurrentStreak(userMap, memberIds, habit.frequency, today);
      const longestStreak      = calculateTeamLongestStreak(userMap, memberIds, habit.frequency);
      const myDates            = userMap.get(userId) ?? [];
      const isCompletedToday   = myDates.includes(today);
      const teamCompletedToday = isTeamCompletedOnDate(userMap, memberIds, today);
      const memberStatus       = memberIds.map((id) => ({
        userId: id,
        isCompletedToday: (userMap.get(id) ?? []).includes(today),
      }));
      return {
        ...habit,
        currentStreak,
        longestStreak,
        isCompletedToday,
        recentDots: getRecentDots(myDates, today, 7),
        teamCompletedToday,
        memberStatus,
      };
    }

    // Personal habit (with or without projectId)
    const myDates = userMap.get(userId) ?? [];
    return {
      ...habit,
      currentStreak:   calculateCurrentStreak(myDates, habit.frequency, today),
      longestStreak:   calculateLongestStreak(myDates, habit.frequency),
      isCompletedToday: isCompletedToday(myDates, today),
      recentDots:      getRecentDots(myDates, today, 7),
    };
  });
}
```

- [ ] **Add `getHabitsForProject()` to `services/habits/habits.service.ts`**

Add this function after `getHabitsForUser`:

```typescript
/**
 * Returns team habits for a project + the requesting user's personal habits in that project.
 * Used by /api/projects/[id]/habits.
 */
export async function getHabitsForProject(
  projectId: string,
  userId: string,
  today: string,
): Promise<HabitWithStreak[]> {
  await connectDB();

  const project = await ProjectModel.findById(projectId).lean() as {
    members: { userId: string }[];
  } | null;
  if (!project) return [];

  const memberIds = project.members.map((m) => m.userId);

  const [teamHabits, myPersonalHabits] = await Promise.all([
    HabitModel.find({ projectId, scope: 'team', archivedAt: null }).lean(),
    HabitModel.find({ projectId, scope: 'personal', userId, archivedAt: null }).lean(),
  ]);

  const allHabits = [...teamHabits, ...myPersonalHabits];
  const habitIds  = allHabits.map((h) => (h as { _id: unknown })._id);

  const checkIns = await CheckInModel.find({ habitId: { $in: habitIds } }).lean() as {
    habitId: unknown;
    userId: string;
    date: string;
  }[];

  const checkInsByHabitUser = new Map<string, Map<string, string[]>>();
  for (const ci of checkIns) {
    const hKey = String(ci.habitId);
    if (!checkInsByHabitUser.has(hKey)) checkInsByHabitUser.set(hKey, new Map());
    const userMap = checkInsByHabitUser.get(hKey)!;
    if (!userMap.has(ci.userId)) userMap.set(ci.userId, []);
    userMap.get(ci.userId)!.push(ci.date);
  }

  return allHabits.map((h) => {
    const habit   = toPlain(h);
    const hKey    = habit._id;
    const userMap = checkInsByHabitUser.get(hKey) ?? new Map<string, string[]>();

    if (habit.scope === 'team') {
      const currentStreak      = calculateTeamCurrentStreak(userMap, memberIds, habit.frequency, today);
      const longestStreak      = calculateTeamLongestStreak(userMap, memberIds, habit.frequency);
      const myDates            = userMap.get(userId) ?? [];
      const teamCompletedToday = isTeamCompletedOnDate(userMap, memberIds, today);
      const memberStatus       = memberIds.map((id) => ({
        userId:          id,
        isCompletedToday: (userMap.get(id) ?? []).includes(today),
      }));
      return {
        ...habit,
        currentStreak,
        longestStreak,
        isCompletedToday: myDates.includes(today),
        recentDots:       getRecentDots(myDates, today, 7),
        teamCompletedToday,
        memberStatus,
      };
    }

    const myDates = userMap.get(userId) ?? [];
    return {
      ...habit,
      currentStreak:    calculateCurrentStreak(myDates, habit.frequency, today),
      longestStreak:    calculateLongestStreak(myDates, habit.frequency),
      isCompletedToday: isCompletedToday(myDates, today),
      recentDots:       getRecentDots(myDates, today, 7),
    };
  });
}
```

- [ ] **Add missing imports at the top of `services/habits/habits.service.ts`**

```typescript
import { ProjectModel } from '@/models/Project';
import {
  calculateTeamCurrentStreak,
  calculateTeamLongestStreak,
  isTeamCompletedOnDate,
} from '@/lib/streak/teamCalculator';
import type { CardStyle, Habit, HabitScope, HabitWithStreak } from '@/types/models/habit.types';
```

- [ ] **Run `bun run build` and fix any TypeScript errors**

- [ ] **Commit**

```bash
git add services/habits/habits.service.ts
git commit -m "feat: extend habits service — team habits in All Mode + getHabitsForProject"
```

---

## Task 8: Projects Zustand store

**Files:**
- Create: `store/projects/projects.store.ts`

- [ ] **Create `store/projects/projects.store.ts`**

```typescript
import { create } from 'zustand';
import type { Project } from '@/types/models/project.types';
import type { CreateProjectInput } from '@/types/api/projects.types';
import { notify } from '@/lib/snackbar';

interface ProjectsState {
  projects: Project[];
  activeProjectId: string | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  setActiveProject: (id: string | null) => void;
  createProject: (data: CreateProjectInput) => Promise<string | null>;
  joinProject: (token: string) => Promise<string | null>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects:        [],
  activeProjectId: null,
  loading:         false,

  async fetchProjects() {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const { projects } = await res.json();
      set({ projects, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setActiveProject(id) {
    set({ activeProjectId: id });
    if (id) {
      sessionStorage.setItem('activeProjectId', id);
    } else {
      sessionStorage.removeItem('activeProjectId');
    }
  },

  async createProject(data) {
    try {
      const res = await fetch('/api/projects', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const { project } = await res.json();
      set((s) => ({ projects: [...s.projects, project] }));
      notify('Project created!', 'success');
      return project._id as string;
    } catch {
      notify('Failed to create project.', 'error');
      return null;
    }
  },

  async joinProject(token) {
    try {
      const res = await fetch('/api/projects/join', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('Invalid invite');
      const { projectId } = await res.json();
      await get().fetchProjects();
      return projectId as string;
    } catch {
      notify('Could not join project. The invite link may be invalid.', 'error');
      return null;
    }
  },
}));
```

- [ ] **Commit**

```bash
git add store/projects/projects.store.ts
git commit -m "feat: add projects Zustand store"
```

---

## Task 9: `ProjectSwitcher` component + wire into `PageHeader` and `SideNav`

**Files:**
- Create: `components/ui/ProjectSwitcher/ProjectSwitcher.tsx`
- Create: `components/ui/ProjectSwitcher/index.ts`
- Modify: `components/ui/PageHeader/PageHeader.tsx`
- Modify: `components/ui/SideNav/SideNav.tsx`

- [ ] **Create `components/ui/ProjectSwitcher/ProjectSwitcher.tsx`**

```typescript
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, FolderKanban, Plus, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectsStore } from '@/store/projects/projects.store';

export function ProjectSwitcher() {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  const { projects, activeProjectId, fetchProjects, setActiveProject } = useProjectsStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Sync activeProjectId from URL on mount
  useEffect(() => {
    const match = pathname.match(/^\/projects\/([^/]+)/);
    if (match) {
      setActiveProject(match[1]);
    } else {
      setActiveProject(null);
    }
  }, [pathname, setActiveProject]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const activeProject = projects.find((p) => p._id === activeProjectId);
  const label = activeProject ? activeProject.name : 'All Streaks';
  const icon  = activeProject ? activeProject.icon : null;

  function select(projectId: string | null) {
    setOpen(false);
    if (projectId === null) {
      setActiveProject(null);
      router.push('/today');
    } else {
      setActiveProject(projectId);
      router.push(`/projects/${projectId}`);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            6,
          background:     'none',
          border:         'none',
          cursor:         'pointer',
          padding:        '4px 0',
          color:          'var(--color-text-heading)',
        }}
        aria-label="Switch project"
      >
        <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
          {icon ? `${icon} ${label}` : label}
        </span>
        <ChevronDown
          size={14}
          style={{
            color:      'var(--color-text-muted)',
            transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{
              position:   'absolute',
              top:        'calc(100% + 8px)',
              left:       0,
              minWidth:   200,
              background: 'var(--color-bg-elevated)',
              borderRadius: 14,
              border:     '1px solid rgba(255,255,255,0.08)',
              boxShadow:  '0 8px 28px rgba(0,0,0,0.5)',
              overflow:   'hidden',
              zIndex:     200,
            }}
          >
            {/* All Streaks */}
            <button onClick={() => select(null)} style={itemStyle(activeProjectId === null)}>
              <LayoutGrid size={15} style={{ flexShrink: 0 }} />
              <span>All Streaks</span>
              {activeProjectId === null && <span style={{ marginLeft: 'auto', color: 'var(--color-brand)', fontSize: 12 }}>✓</span>}
            </button>

            {projects.length > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            )}

            {projects.map((p) => (
              <button key={p._id} onClick={() => select(p._id)} style={itemStyle(activeProjectId === p._id)}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                {activeProjectId === p._id && (
                  <span style={{ marginLeft: 'auto', color: 'var(--color-brand)', fontSize: 12 }}>✓</span>
                )}
              </button>
            ))}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            <button
              onClick={() => { setOpen(false); router.push('/projects/new'); }}
              style={itemStyle(false)}
            >
              <Plus size={15} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-brand)' }}>New Project</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function itemStyle(active: boolean): React.CSSProperties {
  return {
    display:     'flex',
    alignItems:  'center',
    gap:         10,
    width:       '100%',
    padding:     '11px 14px',
    background:  active ? 'rgba(255,255,255,0.05)' : 'none',
    border:      'none',
    cursor:      'pointer',
    color:       active ? 'var(--color-text-heading)' : 'var(--color-text-body)',
    fontSize:    14,
    fontWeight:  active ? 600 : 400,
    textAlign:   'left',
    transition:  'background 0.1s ease',
  };
}
```

- [ ] **Create `components/ui/ProjectSwitcher/index.ts`**

```typescript
export { ProjectSwitcher } from './ProjectSwitcher';
```

- [ ] **Modify `components/ui/PageHeader/PageHeader.tsx` — replace static title with `ProjectSwitcher`**

Replace the left side content block (the `<div className="flex flex-col gap-2 py-1">` block) with:

```tsx
{/* Left: project switcher */}
<div className="flex flex-col justify-center py-1 min-w-0">
  <p
    style={{
      fontSize:        11,
      color:           'var(--color-text-muted)',
      textTransform:   'uppercase',
      letterSpacing:   '0.08em',
      margin:          '0 0 2px',
      lineHeight:      1,
    }}
  >
    {format(new Date(), 'EEE, MMM d')}
  </p>
  <ProjectSwitcher />
</div>
```

Add the import at the top of the file:
```typescript
import { ProjectSwitcher } from '@/components/ui/ProjectSwitcher';
```

- [ ] **Modify `components/ui/SideNav/SideNav.tsx` — add `ProjectSwitcher` below logo**

Add the import:
```typescript
import { ProjectSwitcher } from '@/components/ui/ProjectSwitcher';
```

Add `<ProjectSwitcher />` immediately after the logo block (the `{/* Logo */}` section), wrapped in a `px-2 mb-6` container:

```tsx
{/* Project switcher */}
<div className="px-2 mb-4">
  <p
    style={{
      fontSize:      10,
      color:         'var(--color-text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      margin:        '0 0 4px',
    }}
  >
    Viewing
  </p>
  <ProjectSwitcher />
</div>
```

Remove the existing `{isToday && <div className="px-2 mb-6">...date context</div>}` block — the date now appears in PageHeader's left area and is not needed in the sidebar.

- [ ] **Run `bun run build`** — fix any TypeScript errors

- [ ] **Commit**

```bash
git add components/ui/ProjectSwitcher/ components/ui/PageHeader/PageHeader.tsx components/ui/SideNav/SideNav.tsx
git commit -m "feat: add ProjectSwitcher, wire into PageHeader and SideNav"
```

---

## Task 10: Project feature components

**Files:**
- Create: `components/features/projects/ProjectHeader/ProjectHeader.tsx` + `index.ts`
- Create: `components/features/projects/TeamHabitRow/TeamHabitRow.tsx` + `index.ts`
- Create: `components/features/projects/TeamStatusPanel/TeamStatusPanel.tsx` + `index.ts`
- Create: `components/features/projects/MemberList/MemberList.tsx` + `index.ts`

- [ ] **Create `components/features/projects/ProjectHeader/ProjectHeader.tsx`**

```typescript
'use client';
import type { Project } from '@/types/models/project.types';
import type { ProjectStatusResponse } from '@/types/api/projects.types';
import { Avatar } from 'antd';

interface ProjectHeaderProps {
  project: Project;
  status: ProjectStatusResponse;
  currentUserId: string;
}

export function ProjectHeader({ project, status, currentUserId }: ProjectHeaderProps) {
  const doneCount = status.members.filter(
    (m) => m.personalDone === m.personalTotal && m.personalTotal > 0,
  ).length;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <div
          style={{
            width:          48,
            height:         48,
            borderRadius:   16,
            background:     'var(--color-bg-elevated)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       26,
            border:         '1px solid rgba(255,255,255,0.07)',
            flexShrink:     0,
          }}
        >
          {project.icon}
        </div>
        <div>
          <h1
            style={{
              margin:     0,
              fontSize:   22,
              fontWeight: 800,
              color:      'var(--color-text-heading)',
              lineHeight: 1.2,
            }}
          >
            {project.name}
          </h1>
          <p
            style={{
              margin:        '2px 0 0',
              fontSize:      13,
              color:         'var(--color-text-muted)',
            }}
          >
            {project.members.length} member{project.members.length !== 1 ? 's' : ''}
            {status.totalMembers > 0 && (
              <span style={{ marginLeft: 6, color: status.allDone ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                · {doneCount}/{status.totalMembers} done today
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Create `components/features/projects/ProjectHeader/index.ts`**

```typescript
export { ProjectHeader } from './ProjectHeader';
```

- [ ] **Create `components/features/projects/TeamHabitRow/TeamHabitRow.tsx`**

```typescript
'use client';
import { HabitCard } from '@/components/ui/HabitCard';
import type { HabitWithStreak } from '@/types/models/habit.types';
import type { Project } from '@/types/models/project.types';
import { format } from 'date-fns';

interface TeamHabitRowProps {
  habit:         HabitWithStreak;
  project:       Project;
  currentUserId: string;
  onCheckIn:     (habitId: string, date: string) => void;
  onUncheck:     (habitId: string, date: string) => void;
}

export function TeamHabitRow({
  habit,
  project,
  currentUserId,
  onCheckIn,
  onUncheck,
}: TeamHabitRowProps) {
  const today       = format(new Date(), 'yyyy-MM-dd');
  const memberCount = project.members.length;
  const doneCount   = (habit.memberStatus ?? []).filter((m) => m.isCompletedToday).length;

  return (
    <div>
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          marginBottom: 6,
          paddingLeft:  2,
        }}
      >
        <span
          style={{
            fontSize:   11,
            fontWeight: 600,
            color:      'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Team habit
        </span>
        <span
          style={{
            fontSize:        11,
            color:           doneCount === memberCount ? 'var(--color-success)' : 'var(--color-text-muted)',
            fontWeight:      600,
          }}
        >
          {doneCount}/{memberCount} checked in
        </span>
      </div>

      <HabitCard
        habit={habit}
        onCheckIn={() => onCheckIn(habit._id, today)}
        onUncheck={() => onUncheck(habit._id, today)}
      />
    </div>
  );
}
```

- [ ] **Create `components/features/projects/TeamHabitRow/index.ts`**

```typescript
export { TeamHabitRow } from './TeamHabitRow';
```

- [ ] **Create `components/features/projects/TeamStatusPanel/TeamStatusPanel.tsx`**

```typescript
'use client';
import type { ProjectStatusMember } from '@/types/api/projects.types';
import { Check, Clock } from 'lucide-react';

interface TeamStatusPanelProps {
  members:       ProjectStatusMember[];
  currentUserId: string;
}

export function TeamStatusPanel({ members, currentUserId }: TeamStatusPanelProps) {
  if (members.length === 0) return null;

  return (
    <div
      style={{
        background:   'var(--color-bg-surface)',
        borderRadius: 16,
        padding:      '14px 16px',
        border:       '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <p
        style={{
          fontSize:      10,
          color:         'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin:        '0 0 10px',
          fontWeight:    600,
        }}
      >
        Team Status
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map((m) => {
          const allDone = m.personalTotal > 0 && m.personalDone === m.personalTotal;
          return (
            <div
              key={m.userId}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         10,
                opacity:     m.userId === currentUserId ? 1 : 0.85,
              }}
            >
              <div
                style={{
                  width:          30,
                  height:         30,
                  borderRadius:   '50%',
                  background:     allDone ? 'var(--color-success)' : 'var(--color-bg-elevated)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  transition:     'background 0.2s ease',
                }}
              >
                {allDone
                  ? <Check size={14} style={{ color: '#fff' }} />
                  : <Clock size={13} style={{ color: 'var(--color-text-muted)' }} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin:      0,
                    fontSize:    13,
                    fontWeight:  m.userId === currentUserId ? 600 : 400,
                    color:       'var(--color-text-heading)',
                    overflow:    'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:  'nowrap',
                  }}
                >
                  {m.name || (m.userId === currentUserId ? 'You' : 'Member')}
                </p>
              </div>
              <span
                style={{
                  fontSize:   12,
                  color:      allDone ? 'var(--color-success)' : 'var(--color-text-muted)',
                  fontWeight: allDone ? 600 : 400,
                  flexShrink: 0,
                }}
              >
                {m.personalTotal > 0 ? `${m.personalDone}/${m.personalTotal}` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Create `components/features/projects/TeamStatusPanel/index.ts`**

```typescript
export { TeamStatusPanel } from './TeamStatusPanel';
```

- [ ] **Create `components/features/projects/MemberList/MemberList.tsx`**

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, LogOut } from 'lucide-react';
import { notify } from '@/lib/snackbar';
import type { Project } from '@/types/models/project.types';

interface MemberListProps {
  project:       Project;
  currentUserId: string;
}

export function MemberList({ project, currentUserId }: MemberListProps) {
  const router        = useRouter();
  const isOwner       = project.ownerId === currentUserId;
  const [busy, setBusy] = useState<string | null>(null);

  async function removeMember(targetUserId: string) {
    setBusy(targetUserId);
    try {
      const res = await fetch(`/api/projects/${project._id}/members/${targetUserId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      notify('Member removed', 'info');
      router.refresh();
    } catch {
      notify('Failed to remove member', 'error');
    } finally {
      setBusy(null);
    }
  }

  async function leaveProject() {
    setBusy('leave');
    try {
      const res = await fetch(`/api/projects/${project._id}/leave`, { method: 'POST' });
      if (!res.ok) throw new Error();
      notify('Left project', 'info');
      router.push('/today');
    } catch {
      notify('Failed to leave project', 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {project.members.map((member) => {
        const isMe = member.userId === currentUserId;
        return (
          <div
            key={member.userId}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         12,
              padding:     '10px 12px',
              borderRadius: 12,
              background:  'var(--color-bg-surface)',
              border:      '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div
              style={{
                width:          36,
                height:         36,
                borderRadius:   '50%',
                background:     'var(--color-bg-elevated)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       14,
                fontWeight:     700,
                color:          'var(--color-text-muted)',
                flexShrink:     0,
              }}
            >
              {member.userId.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-heading)' }}>
                {isMe ? 'You' : 'Member'}{member.role === 'owner' ? ' · Owner' : ''}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>

            {isOwner && !isMe && (
              <button
                onClick={() => removeMember(member.userId)}
                disabled={busy === member.userId}
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     busy === member.userId ? 'not-allowed' : 'pointer',
                  padding:    6,
                  color:      'var(--color-error)',
                  opacity:    busy === member.userId ? 0.5 : 1,
                  lineHeight: 0,
                }}
                aria-label="Remove member"
              >
                <Trash2 size={16} />
              </button>
            )}

            {isMe && !isOwner && (
              <button
                onClick={leaveProject}
                disabled={busy === 'leave'}
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  padding:    6,
                  color:      'var(--color-text-muted)',
                  lineHeight: 0,
                }}
                aria-label="Leave project"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Create `components/features/projects/MemberList/index.ts`**

```typescript
export { MemberList } from './MemberList';
```

- [ ] **Commit**

```bash
git add components/features/projects/
git commit -m "feat: add ProjectHeader, TeamHabitRow, TeamStatusPanel, MemberList components"
```

---

## Task 11: `ProjectForm` + `ProjectPage` components

**Files:**
- Create: `components/features/projects/ProjectForm/ProjectForm.tsx` + `index.ts`
- Create: `components/features/projects/ProjectPage/ProjectPage.tsx` + `index.ts`

- [ ] **Create `components/features/projects/ProjectForm/ProjectForm.tsx`**

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from 'antd';
import { useProjectsStore } from '@/store/projects/projects.store';

const ICONS = ['🚀', '💪', '📚', '🎯', '🏃', '🧘', '🎨', '💡', '🌱', '⚡', '🔥', '🎵'];

interface ProjectFormProps {
  mode?: 'create' | 'edit';
  initialName?: string;
  initialIcon?: string;
  projectId?: string;
  onSuccess?: (projectId: string) => void;
}

export function ProjectForm({
  mode = 'create',
  initialName = '',
  initialIcon = '🚀',
  projectId,
  onSuccess,
}: ProjectFormProps) {
  const router               = useRouter();
  const [name, setName]      = useState(initialName);
  const [icon, setIcon]      = useState(initialIcon);
  const [loading, setLoading] = useState(false);
  const { createProject }    = useProjectsStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (mode === 'create') {
        const id = await createProject({ name: name.trim(), icon });
        if (id) {
          onSuccess ? onSuccess(id) : router.push(`/projects/${id}`);
        }
      } else if (mode === 'edit' && projectId) {
        const res = await fetch(`/api/projects/${projectId}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name: name.trim(), icon }),
        });
        if (res.ok) {
          onSuccess ? onSuccess(projectId) : router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Icon picker */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 10px', fontWeight: 500 }}>
          Icon
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ICONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setIcon(e)}
              style={{
                width:          44,
                height:         44,
                borderRadius:   12,
                border:         icon === e ? '2px solid var(--color-brand)' : '2px solid rgba(255,255,255,0.08)',
                background:     icon === e ? 'rgba(var(--brand-rgb) / 0.12)' : 'var(--color-bg-elevated)',
                fontSize:       22,
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                transition:     'all 0.12s ease',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 8px', fontWeight: 500 }}>
          Project Name
        </p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fitness Challenge"
          maxLength={50}
          size="large"
          style={{ borderRadius: 12 }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        style={{
          padding:    '13px 0',
          borderRadius: 12,
          border:     'none',
          background: name.trim() ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
          color:      name.trim() ? 'var(--color-bg-page)' : 'var(--color-text-muted)',
          fontWeight: 700,
          fontSize:   15,
          cursor:     name.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s ease',
        }}
      >
        {loading ? 'Saving…' : mode === 'create' ? 'Create Project' : 'Save Changes'}
      </button>
    </form>
  );
}
```

- [ ] **Create `components/features/projects/ProjectForm/index.ts`**

```typescript
export { ProjectForm } from './ProjectForm';
```

- [ ] **Create `components/features/projects/ProjectPage/ProjectPage.tsx`**

```typescript
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Settings2, Plus, Copy } from 'lucide-react';
import { ProjectHeader }    from '@/components/features/projects/ProjectHeader';
import { TeamHabitRow }     from '@/components/features/projects/TeamHabitRow';
import { TeamStatusPanel }  from '@/components/features/projects/TeamStatusPanel';
import { HabitCard }        from '@/components/ui/HabitCard';
import { useHabitsStore }   from '@/store/habits/habits.store';
import { notify }           from '@/lib/snackbar';
import type { Project }                from '@/types/models/project.types';
import type { ProjectStatusResponse }  from '@/types/api/projects.types';
import type { HabitWithStreak }        from '@/types/models/habit.types';

interface ProjectPageProps {
  project:       Project;
  currentUserId: string;
}

export function ProjectPage({ project, currentUserId }: ProjectPageProps) {
  const router               = useRouter();
  const today                = format(new Date(), 'yyyy-MM-dd');
  const { checkIn, uncheck } = useHabitsStore();

  const [habits,  setHabits]  = useState<HabitWithStreak[]>([]);
  const [status,  setStatus]  = useState<ProjectStatusResponse>({ members: [], totalMembers: 0, allDone: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [habitsRes, statusRes] = await Promise.all([
        fetch(`/api/projects/${project._id}/habits`),
        fetch(`/api/projects/${project._id}/status`),
      ]);
      if (habitsRes.ok) {
        const { habits: h } = await habitsRes.json();
        setHabits(h);
      }
      if (statusRes.ok) {
        setStatus(await statusRes.json());
      }
      setLoading(false);
    }
    load();
  }, [project._id]);

  const teamHabits     = habits.filter((h) => h.scope === 'team');
  const personalHabits = habits.filter((h) => h.scope === 'personal' && h.userId === currentUserId);

  function copyInviteLink() {
    const url = `${window.location.origin}/invite/${project.inviteToken}`;
    navigator.clipboard.writeText(url).then(() => notify('Invite link copied!', 'success'));
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <ProjectHeader project={project} status={status} currentUserId={currentUserId} />
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={copyInviteLink}
            title="Copy invite link"
            style={iconBtnStyle}
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => router.push(`/projects/${project._id}/settings`)}
            title="Project settings"
            style={iconBtnStyle}
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      {/* Team habits */}
      {teamHabits.length > 0 && (
        <section>
          <p style={sectionLabel}>Team Habits</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {teamHabits.map((h) => (
              <TeamHabitRow
                key={h._id}
                habit={h}
                project={project}
                currentUserId={currentUserId}
                onCheckIn={(id, date) => checkIn(id, date)}
                onUncheck={(id, date) => uncheck(id, date)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Personal habits */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ ...sectionLabel, margin: 0 }}>Your Habits</p>
          <button
            onClick={() => router.push(`/habits/new?projectId=${project._id}&scope=personal`)}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         5,
              background:  'var(--color-bg-elevated)',
              border:      'none',
              borderRadius: 10,
              padding:     '7px 12px',
              cursor:      'pointer',
              color:       'var(--color-text-muted)',
              fontSize:    13,
              fontWeight:  500,
            }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
        {personalHabits.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            No personal habits yet. Add one to start tracking.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {personalHabits.map((h) => (
              <HabitCard
                key={h._id}
                habit={h}
                onCheckIn={() => checkIn(h._id, today)}
                onUncheck={() => uncheck(h._id, today)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Team status — desktop always visible, mobile below fold */}
      {status.members.length > 1 && (
        <TeamStatusPanel members={status.members} currentUserId={currentUserId} />
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize:      10,
  color:         'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight:    600,
  margin:        '0 0 10px',
};

const iconBtnStyle: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  width:          36,
  height:         36,
  borderRadius:   10,
  background:     'var(--color-bg-elevated)',
  border:         '1px solid rgba(255,255,255,0.06)',
  cursor:         'pointer',
  color:          'var(--color-text-muted)',
};
```

- [ ] **Create `components/features/projects/ProjectPage/index.ts`**

```typescript
export { ProjectPage } from './ProjectPage';
```

- [ ] **Run `bun run build`** — fix any TypeScript errors

- [ ] **Commit**

```bash
git add components/features/projects/ProjectForm/ components/features/projects/ProjectPage/
git commit -m "feat: add ProjectForm and ProjectPage components"
```

---

## Task 12: App pages — projects/new, projects/[id], projects/[id]/settings

**Files:**
- Create: `app/(app)/projects/new/page.tsx`
- Create: `app/(app)/projects/[id]/page.tsx`
- Create: `app/(app)/projects/[id]/settings/page.tsx`

- [ ] **Create `app/(app)/projects/new/page.tsx`**

```typescript
import { ProjectForm } from '@/components/features/projects/ProjectForm';

export default function NewProjectPage() {
  return (
    <div style={{ maxWidth: 480 }}>
      <p
        style={{
          fontSize:      11,
          color:         'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin:        '0 0 4px',
        }}
      >
        Collaboration
      </p>
      <h2
        style={{
          margin:     '0 0 28px',
          fontSize:   26,
          fontWeight: 800,
          color:      'var(--color-text-heading)',
          lineHeight: 1.2,
        }}
      >
        New Project
      </h2>
      <ProjectForm mode="create" />
    </div>
  );
}
```

- [ ] **Create `app/(app)/projects/[id]/page.tsx`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProjectById } from '@/services/projects/projects.service';
import { ProjectPage } from '@/components/features/projects/ProjectPage';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) redirect('/today');

  return (
    <ProjectPage
      project={project}
      currentUserId={session.user.id}
    />
  );
}
```

- [ ] **Create `app/(app)/projects/[id]/settings/page.tsx`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProjectById, regenerateInviteToken } from '@/services/projects/projects.service';
import { MemberList } from '@/components/features/projects/MemberList';
import { ProjectForm } from '@/components/features/projects/ProjectForm';
import { InviteLinkBox } from '@/components/features/projects/InviteLinkBox';

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) redirect('/today');

  const isOwner = project.ownerId === session.user.id;
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${project.inviteToken}`;

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          {project.name}
        </p>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--color-text-heading)' }}>
          Settings
        </h2>
      </div>

      {/* Invite link */}
      <section>
        <p style={sectionLabel}>Invite Link</p>
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            background:   'var(--color-bg-elevated)',
            borderRadius: 12,
            padding:      '12px 14px',
            border:       '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <code style={{ flex: 1, fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {inviteUrl}
          </code>
          <CopyInviteButton url={inviteUrl} />
        </div>
        {isOwner && <RegenerateTokenButton projectId={id} />}
      </section>

      {/* Edit project (owner only) */}
      {isOwner && (
        <section>
          <p style={sectionLabel}>Edit Project</p>
          <ProjectForm
            mode="edit"
            projectId={id}
            initialName={project.name}
            initialIcon={project.icon}
          />
        </section>
      )}

      {/* Members */}
      <section>
        <p style={sectionLabel}>Members</p>
        <MemberList project={project} currentUserId={session.user.id} />
      </section>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize:      10,
  color:         'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight:    600,
  margin:        '0 0 10px',
};

// Small inline client components to avoid extra files for trivial interactions
'use client';

function CopyInviteButton({ url }: { url: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(url).then(() => alert('Copied!'))}
      style={{
        background: 'var(--color-brand)',
        border:     'none',
        borderRadius: 8,
        padding:    '6px 12px',
        color:      'var(--color-bg-page)',
        fontSize:   12,
        fontWeight: 600,
        cursor:     'pointer',
        flexShrink: 0,
      }}
    >
      Copy
    </button>
  );
}

function RegenerateTokenButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        if (!confirm('Regenerate invite link? The old link will stop working.')) return;
        await fetch(`/api/projects/${projectId}/regenerate-token`, { method: 'POST' });
        router.refresh();
      }}
      style={{
        marginTop:  8,
        background: 'none',
        border:     'none',
        cursor:     'pointer',
        fontSize:   12,
        color:      'var(--color-text-muted)',
        padding:    0,
      }}
    >
      Regenerate link
    </button>
  );
}
```

> **Note:** The settings page uses two tiny inline client components (`CopyInviteButton`, `RegenerateTokenButton`) to avoid creating files for trivial interactions. Add `'use client'` to them and add `import { useRouter } from 'next/navigation'` at the top of the file.

- [ ] **Commit**

```bash
git add app/(app)/projects/
git commit -m "feat: add project pages (new, detail, settings)"
```

---

## Task 13: Member management API routes

The `MemberList` component calls routes that don't exist yet.

**Files:**
- Create: `app/api/projects/[id]/members/[userId]/route.ts`
- Create: `app/api/projects/[id]/leave/route.ts`
- Create: `app/api/projects/[id]/regenerate-token/route.ts`

- [ ] **Create `app/api/projects/[id]/members/[userId]/route.ts`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { removeMember } from '@/services/projects/projects.service';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, userId } = await params;
  const ok = await removeMember(id, session.user.id, userId);
  if (!ok) return Response.json({ error: 'Forbidden or not found' }, { status: 403 });

  return Response.json({ ok: true });
}
```

- [ ] **Create `app/api/projects/[id]/leave/route.ts`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { leaveProject } from '@/services/projects/projects.service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const ok = await leaveProject(id, session.user.id);
  if (!ok) return Response.json({ error: 'Cannot leave (owner must archive)' }, { status: 400 });

  return Response.json({ ok: true });
}
```

- [ ] **Create `app/api/projects/[id]/regenerate-token/route.ts`**

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { regenerateInviteToken } from '@/services/projects/projects.service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const token = await regenerateInviteToken(id, session.user.id);
  if (!token) return Response.json({ error: 'Forbidden or not found' }, { status: 403 });

  return Response.json({ token });
}
```

- [ ] **Commit**

```bash
git add app/api/projects/[id]/members/ app/api/projects/[id]/leave/ app/api/projects/[id]/regenerate-token/
git commit -m "feat: add member management API routes (remove, leave, regenerate token)"
```

---

## Task 14: Invite landing page

**Files:**
- Create: `app/(auth)/invite/[token]/page.tsx`

- [ ] **Create `app/(auth)/invite/[token]/page.tsx`**

This is a server component. It renders the preview from the public API. If the user is signed in and confirms, a client-side join flow fires.

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveInviteToken } from '@/services/projects/projects.service';
import { JoinProjectButton } from './JoinProjectButton';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview   = await resolveInviteToken(token);

  if (!preview) {
    return (
      <div style={centeredPage}>
        <h2 style={heading}>Invalid invite</h2>
        <p style={muted}>This link is no longer valid.</p>
      </div>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    // Check if already a member — redirect immediately
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${preview.projectId}`,
      { headers: await headers() },
    );
    if (res.ok) redirect(`/projects/${preview.projectId}`);
  }

  return (
    <div style={centeredPage}>
      <div
        style={{
          background:   'var(--color-bg-surface)',
          borderRadius: 24,
          padding:      '32px 28px',
          border:       '1px solid rgba(255,255,255,0.07)',
          maxWidth:     380,
          width:        '100%',
          textAlign:    'center',
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 12 }}>{preview.projectIcon}</div>
        <h2 style={{ ...heading, marginBottom: 6 }}>{preview.projectName}</h2>
        <p style={{ ...muted, marginBottom: 24 }}>
          {preview.memberCount} member{preview.memberCount !== 1 ? 's' : ''} · Streakz Project
        </p>

        {session ? (
          <JoinProjectButton token={token} projectId={preview.projectId} />
        ) : (
          <a
            href={`/login?next=/invite/${token}`}
            style={{
              display:      'block',
              padding:      '13px 0',
              borderRadius: 12,
              background:   'var(--color-brand)',
              color:        'var(--color-bg-page)',
              fontWeight:   700,
              fontSize:     15,
              textDecoration: 'none',
            }}
          >
            Sign in to join
          </a>
        )}
      </div>
    </div>
  );
}

const centeredPage: React.CSSProperties = {
  minHeight:      '100dvh',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  padding:        '24px 16px',
  background:     'var(--color-bg-page)',
};

const heading: React.CSSProperties = {
  margin:     0,
  fontSize:   22,
  fontWeight: 800,
  color:      'var(--color-text-heading)',
};

const muted: React.CSSProperties = {
  margin:   0,
  fontSize: 14,
  color:    'var(--color-text-muted)',
};
```

- [ ] **Create `app/(auth)/invite/[token]/JoinProjectButton.tsx`** (small client component)

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectsStore } from '@/store/projects/projects.store';

interface JoinProjectButtonProps {
  token:     string;
  projectId: string;
}

export function JoinProjectButton({ token, projectId }: JoinProjectButtonProps) {
  const router            = useRouter();
  const [busy, setBusy]   = useState(false);
  const { joinProject }   = useProjectsStore();

  async function handleJoin() {
    setBusy(true);
    const id = await joinProject(token);
    if (id) router.push(`/projects/${id}`);
    else setBusy(false);
  }

  return (
    <button
      onClick={handleJoin}
      disabled={busy}
      style={{
        width:        '100%',
        padding:      '13px 0',
        borderRadius: 12,
        border:       'none',
        background:   'var(--color-brand)',
        color:        'var(--color-bg-page)',
        fontWeight:   700,
        fontSize:     15,
        cursor:       busy ? 'not-allowed' : 'pointer',
        opacity:      busy ? 0.7 : 1,
      }}
    >
      {busy ? 'Joining…' : 'Join Project'}
    </button>
  );
}
```

- [ ] **Commit**

```bash
git add app/\(auth\)/invite/
git commit -m "feat: add invite landing page with server-rendered preview + client join button"
```

---

## Task 15: `HabitForm` — scope picker for project context

**Files:**
- Modify: `components/features/habits/HabitForm/HabitForm.tsx`

When a user navigates to `/habits/new?projectId=X&scope=personal|team`, the form should show a scope toggle as the first field and pre-fill `projectId`.

- [ ] **Add `useSearchParams` to read `projectId` and `scope` from URL in `HabitForm.tsx`**

At the top of the component (inside the function body, before the form), add:

```typescript
const searchParams = useSearchParams();
const urlProjectId = searchParams.get('projectId');
const urlScope     = (searchParams.get('scope') as 'team' | 'personal') ?? 'personal';
```

Add `import { useSearchParams } from 'next/navigation';` at the top.

- [ ] **Add scope state and picker UI to `HabitForm.tsx`**

In the component state, add:
```typescript
const [scope, setScope] = useState<'team' | 'personal'>(urlScope);
```

If `urlProjectId` is set, render a scope picker before the name field:

```tsx
{urlProjectId && (
  <div>
    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 8px', fontWeight: 500 }}>
      Habit Type
    </p>
    <div style={{ display: 'flex', gap: 8 }}>
      {(['personal', 'team'] as const).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setScope(s)}
          style={{
            flex:         1,
            padding:      '10px 0',
            borderRadius: 10,
            border:       scope === s ? '2px solid var(--color-brand)' : '2px solid rgba(255,255,255,0.08)',
            background:   scope === s ? 'rgba(var(--brand-rgb) / 0.1)' : 'var(--color-bg-elevated)',
            color:        scope === s ? 'var(--color-brand)' : 'var(--color-text-muted)',
            fontWeight:   scope === s ? 600 : 400,
            fontSize:     13,
            cursor:       'pointer',
          }}
        >
          {s === 'personal' ? '👤 Personal' : '👥 Team'}
        </button>
      ))}
    </div>
    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
      {scope === 'team'
        ? 'All members must check in — missing a day resets everyone\'s streak'
        : 'Your own habit inside the project — your streak is yours alone'}
    </p>
  </div>
)}
```

- [ ] **Include `projectId` and `scope` in the form submission payload**

In the submit handler where `createHabit` or the API call is made, include:

```typescript
projectId: urlProjectId ?? null,
scope:     urlProjectId ? scope : 'personal',
```

- [ ] **Run `bun run build`** and fix any TypeScript errors

- [ ] **Commit**

```bash
git add components/features/habits/HabitForm/HabitForm.tsx
git commit -m "feat: HabitForm scope picker for project-context habit creation"
```

---

## Task 16: Final build verification + smoke test

- [ ] **Run `bun run build`** — expect zero TypeScript errors and a successful build

- [ ] **Start dev server: `bun dev`**

- [ ] **Smoke test — All Mode (existing flows unchanged)**
  - Log in → lands on `/today`
  - ProjectSwitcher in header shows "All Streaks" (selected)
  - Existing personal habits display and check-in works as before

- [ ] **Smoke test — Create project**
  - Click ProjectSwitcher → `+ New Project`
  - Fill name + pick icon → Create
  - Redirects to `/projects/[id]` showing empty state

- [ ] **Smoke test — Invite link**
  - On project page, click Copy Invite
  - Open invite URL in an incognito tab
  - See project preview + "Sign in to join" button
  - Sign in → redirected to project page as a member

- [ ] **Smoke test — Add personal habit in project**
  - On project page → Add → navigates to `/habits/new?projectId=...&scope=personal`
  - Scope picker shows "Personal" selected
  - Create habit → redirects back, habit appears in "Your Habits" section

- [ ] **Smoke test — Add team habit in project**
  - `/habits/new?projectId=...&scope=team`
  - Switch scope to "Team"
  - Create habit → appears in "Team Habits" section

- [ ] **Smoke test — Team habit streak resets when member misses**
  - With 2 members: member A checks in on team habit, member B does not
  - Verify team streak shows 0 (or does not advance)

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: collaboration — projects, team habits, invite links, ProjectSwitcher"
```
