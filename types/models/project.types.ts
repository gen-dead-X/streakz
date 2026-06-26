export type ProjectRole = 'owner' | 'member';

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface EnrichedProjectMember extends ProjectMember {
  name: string;
  image: string | null;
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
