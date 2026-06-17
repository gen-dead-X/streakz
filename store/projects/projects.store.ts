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
      const { projects } = (await res.json()) as { projects: Project[] };
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
      const { project } = (await res.json()) as { project: Project };
      set((s) => ({ projects: [...s.projects, project] }));
      notify('Project created!', 'success');
      return project._id;
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
      const { projectId } = (await res.json()) as { projectId: string };
      await get().fetchProjects();
      return projectId;
    } catch {
      notify('Could not join project. The invite link may be invalid.', 'error');
      return null;
    }
  },
}));
