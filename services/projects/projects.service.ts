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
  const obj =
    (doc as { toObject?: () => Record<string, unknown> }).toObject?.() ??
    (doc as Record<string, unknown>);
  return {
    _id:         String(obj._id),
    name:        obj.name as string,
    icon:        obj.icon as string,
    ownerId:     obj.ownerId as string,
    inviteToken: obj.inviteToken as string,
    members:     (
      obj.members as { userId: string; role: 'owner' | 'member'; joinedAt: Date }[]
    ).map((m) => ({
      userId:   m.userId,
      role:     m.role,
      joinedAt: new Date(m.joinedAt).toISOString(),
    })),
    archivedAt: obj.archivedAt ? new Date(obj.archivedAt as Date).toISOString() : null,
    createdAt:  new Date(obj.createdAt as Date).toISOString(),
    updatedAt:  new Date(obj.updatedAt as Date).toISOString(),
  };
}

export async function createProject(
  userId: string,
  data: CreateProjectInput,
): Promise<Project> {
  await connectDB();
  const doc = await ProjectModel.create({
    ...data,
    ownerId: userId,
    members: [{ userId, role: 'owner', joinedAt: new Date() }],
  });
  return toPlainProject(doc);
}

export async function getProjectsForUser(userId: string): Promise<Project[]> {
  await connectDB();
  const docs = await ProjectModel.find({
    'members.userId': userId,
    archivedAt: null,
  }).lean();
  return (docs as unknown[]).map(toPlainProject);
}

export async function getProjectById(
  projectId: string,
  userId: string,
): Promise<Project | null> {
  await connectDB();
  const doc = await ProjectModel.findOne({
    _id:              projectId,
    'members.userId': userId,
    archivedAt:       null,
  }).lean();
  if (!doc) return null;
  return toPlainProject(doc);
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
  );
  if (!doc) return null;
  return toPlainProject(doc);
}

export async function archiveProject(
  projectId: string,
  ownerId: string,
): Promise<boolean> {
  await connectDB();
  const result = await ProjectModel.updateOne(
    { _id: projectId, ownerId },
    { $set: { archivedAt: new Date() } },
  );
  return result.modifiedCount > 0;
}

export async function joinProjectByToken(
  token: string,
  userId: string,
): Promise<string | null> {
  await connectDB();

  // Idempotent: return existing project id if already a member (only for live projects)
  const existing = await ProjectModel.findOne({
    inviteToken:      token,
    'members.userId': userId,
    archivedAt:       null,
  }).lean() as { _id: unknown } | null;
  if (existing) return String(existing._id);

  const updated = await ProjectModel.findOneAndUpdate(
    { inviteToken: token, archivedAt: null },
    { $push: { members: { userId, role: 'member', joinedAt: new Date() } } },
    { new: true },
  ).lean() as { _id: unknown } | null;

  if (!updated) return null;
  return String(updated._id);
}

export async function resolveInviteToken(
  token: string,
): Promise<InvitePreviewResponse | null> {
  await connectDB();
  const doc = await ProjectModel.findOne(
    { inviteToken: token, archivedAt: null },
  ).lean() as {
    _id:     unknown;
    name:    string;
    icon:    string;
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
  if (ownerId === targetUserId) return false;
  const result = await ProjectModel.updateOne(
    { _id: projectId, ownerId },
    { $pull: { members: { userId: targetUserId } } },
  );
  if (result.modifiedCount === 0) return false;

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

  // Owners must archive the project instead of leaving
  const project = await ProjectModel.findOne({
    _id:              projectId,
    'members.userId': userId,
    archivedAt:       null,
  }).lean() as { ownerId: string } | null;

  if (!project) return false;
  if (project.ownerId === userId) return false;

  const result = await ProjectModel.updateOne(
    { _id: projectId },
    { $pull: { members: { userId } } },
  );
  if (result.modifiedCount === 0) return false;

  // Soft-archive this user's personal habits in the project
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

  if (!doc) return null;
  return doc.inviteToken;
}

export async function getProjectStatus(
  projectId: string,
  today: string,
): Promise<ProjectStatusResponse> {
  await connectDB();

  // Load project to get the authoritative member list
  const project = await ProjectModel.findOne({
    _id:        projectId,
    archivedAt: null,
  }).lean() as { members: { userId: string }[] } | null;

  if (!project) return { members: [], totalMembers: 0, allDone: true };

  const memberUserIds = project.members.map((m) => m.userId);

  // All active habits in this project
  const habits = await HabitModel.find({
    projectId,
    archivedAt: null,
  }).lean() as { _id: unknown; userId: string; scope: string }[];

  const habitIds = habits.map((h) => h._id);

  // Today's check-ins for all habits in this project
  const checkIns = await CheckInModel.find({
    habitId: { $in: habitIds },
    date:    today,
  }).lean() as { habitId: unknown; userId: string }[];

  // Build set of checked-in habitIds per user
  const checkedInByUser = new Map<string, Set<string>>();
  for (const ci of checkIns) {
    const key = ci.userId;
    if (!checkedInByUser.has(key)) checkedInByUser.set(key, new Set());
    checkedInByUser.get(key)!.add(String(ci.habitId));
  }

  // Team habits (shared across all members)
  const teamHabits = habits.filter((h) => h.scope === 'team');
  const teamHabitIds = teamHabits.map((h) => String(h._id));

  // Personal habits grouped by userId
  const personalHabitsByUser = new Map<string, string[]>();
  for (const h of habits) {
    if (h.scope === 'personal') {
      const id = String(h._id);
      if (!personalHabitsByUser.has(h.userId)) personalHabitsByUser.set(h.userId, []);
      personalHabitsByUser.get(h.userId)!.push(id);
    }
  }

  // Build per-member status
  const members = memberUserIds.map((userId) => {
    const checkedIn      = checkedInByUser.get(userId) ?? new Set<string>();
    const personalIds    = personalHabitsByUser.get(userId) ?? [];
    const personalDone   = personalIds.filter((id) => checkedIn.has(id)).length;
    const personalTotal  = personalIds.length;
    const teamHabitsDone = teamHabitIds.filter((id) => checkedIn.has(id));

    return {
      userId,
      name:          '',
      image:         null as string | null,
      personalDone,
      personalTotal,
      teamHabitsDone,
    };
  });

  const allDone = members.every(
    (m) =>
      m.personalDone === m.personalTotal &&
      m.teamHabitsDone.length === teamHabitIds.length,
  );

  return {
    members,
    totalMembers: members.length,
    allDone,
  };
}
