import { create } from 'zustand';
import type { InsightsResponse } from '@/types/api/insights.types';

const STALE_MS = 60_000;

interface InsightsState {
  stats: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  _fetchedAt: number;
  fetchInsights: () => Promise<void>;
}

export const useInsightsStore = create<InsightsState>((set, get) => ({
  stats: null,
  loading: false,
  error: null,
  _fetchedAt: 0,

  async fetchInsights() {
    const { _fetchedAt, stats } = get();
    if (stats && Date.now() - _fetchedAt < STALE_MS) return;

    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/insights');
      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();
      set({ stats: data, loading: false, _fetchedAt: Date.now() });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
}));
