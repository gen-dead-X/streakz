import { create } from 'zustand';
import type { InsightsResponse } from '@/types/api/insights.types';

interface InsightsState {
  stats: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  fetchInsights: () => Promise<void>;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  stats: null,
  loading: false,
  error: null,

  async fetchInsights() {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/insights');
      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();
      set({ stats: data, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
}));
