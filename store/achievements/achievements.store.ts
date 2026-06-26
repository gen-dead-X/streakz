import { create } from 'zustand';
import type { Achievement } from '@/types/models/achievement.types';

const STALE_MS = 60_000;

interface AchievementsState {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  _fetchedAt: number;
  fetchAchievements: () => Promise<void>;
  addNewAchievements: (incoming: Achievement[]) => void;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  achievements: [],
  loading: false,
  error: null,
  _fetchedAt: 0,

  async fetchAchievements() {
    const { _fetchedAt, achievements } = get();
    if (achievements.length > 0 && Date.now() - _fetchedAt < STALE_MS) return;

    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/achievements');
      if (!res.ok) throw new Error('Failed to fetch achievements');
      const { achievements } = await res.json();
      set({ achievements, loading: false, _fetchedAt: Date.now() });
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
    // Force a full refresh to ensure consistency
    set({ _fetchedAt: 0 });
    get().fetchAchievements();
  },
}));
