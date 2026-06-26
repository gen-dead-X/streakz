import { create } from 'zustand';
import type { HabitScope } from '@/types/models/habit.types';

interface HabitSheetState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  habitId?: string;
  projectId?: string;
  scope?: HabitScope;
  openAdd: (params?: { projectId?: string; scope?: HabitScope }) => void;
  openEdit: (habitId: string) => void;
  close: () => void;
}

export const useHabitSheetStore = create<HabitSheetState>((set) => ({
  isOpen: false,
  mode: 'add',
  habitId: undefined,
  projectId: undefined,
  scope: undefined,
  openAdd: (params) =>
    set({ isOpen: true, mode: 'add', habitId: undefined, ...params }),
  openEdit: (habitId) =>
    set({ isOpen: true, mode: 'edit', habitId, projectId: undefined, scope: undefined }),
  close: () => set({ isOpen: false }),
}));
