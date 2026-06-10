import { create } from 'zustand';
import type { Achievement } from '@/types/models/achievement.types';

interface AchievementsState {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  fetchAchievements: () => Promise<void>;
  addNewAchievements: (incoming: Achievement[]) => void;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  achievements: [],
  loading: false,
  error: null,

  async fetchAchievements() {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/achievements');
      if (!res.ok) throw new Error('Failed to fetch achievements');
      const { achievements } = await res.json();
      set({ achievements, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  addNewAchievements(incoming) {
    if (!incoming.length) return;
    set((s) => {
      const existingIds = new Set(s.achievements.map((a) => a._id));
      const fresh = incoming.filter((a) => !existingIds.has(a._id));
      return { achievements: [...s.achievements, ...fresh] };
    });
    // Refresh full list to ensure consistency
    get().fetchAchievements();
  },
}));
