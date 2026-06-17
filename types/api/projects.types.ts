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
