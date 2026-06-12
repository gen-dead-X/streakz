import { create } from 'zustand';
import type { Habit, HabitWithStreak } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';
import type { CheckInWithAchievementsResponse } from '@/types/api/achievements.types';
import { notify } from '@/lib/snackbar';

interface HabitsState {
  habits: HabitWithStreak[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  checkIn: (habitId: string, date: string) => Promise<CheckInWithAchievementsResponse | null>;
  uncheck: (habitId: string, date: string) => Promise<void>;
  createHabit: (data: CreateHabitInput) => Promise<void>;
  updateHabit: (id: string, data: UpdateHabitInput) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  loading: false,
  error: null,

  async fetchHabits() {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/habits');
      if (!res.ok) throw new Error('Failed to fetch habits');
      const { habits } = await res.json();
      set({ habits, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  async checkIn(habitId, date) {
    // Optimistic update
    set((s) => ({
      habits: s.habits.map((h) =>
        h._id === habitId
          ? {
              ...h,
              isCompletedToday: true,
              currentStreak: h.currentStreak + 1,
              recentDots: [...h.recentDots.slice(1), true],
            }
          : h,
      ),
    }));
    const res = await fetch(`/api/habits/${habitId}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    if (!res.ok) {
      // Rollback on failure
      await get().fetchHabits();
      if (res.status !== 409) {
        notify('Check-in failed. Try again.', 'error');
      }
      return null;
    }
    notify('✓ Checked in!', 'success');
    return res.json() as Promise<CheckInWithAchievementsResponse>;
  },

  async uncheck(habitId, date) {
    // Optimistic update
    set((s) => ({
      habits: s.habits.map((h) =>
        h._id === habitId
          ? {
              ...h,
              isCompletedToday: false,
              currentStreak: Math.max(0, h.currentStreak - 1),
              recentDots: [...h.recentDots.slice(1, -1), false, false].slice(-7),
            }
          : h,
      ),
    }));
    const res = await fetch(`/api/habits/${habitId}/checkins`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    if (!res.ok) {
      await get().fetchHabits();
    }
  },

  async createHabit(data) {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create habit');
      await get().fetchHabits();
      notify('Habit created!', 'success');
    } catch {
      notify('Failed to create habit.', 'error');
      throw new Error('Failed to create habit');
    }
  },

  async updateHabit(id, data) {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update habit');
    const { habit: updated } = (await res.json()) as { habit: Habit };
    // Immediately reflect server response in store (preserves streak data)
    set((s) => ({
      habits: s.habits.map((h) =>
        h._id === id ? ({ ...h, ...updated } as HabitWithStreak) : h,
      ),
    }));
    await get().fetchHabits();
  },

  async archiveHabit(id) {
    set((s) => ({ habits: s.habits.filter((h) => h._id !== id) }));
    notify('Habit removed', 'info');
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    if (!res.ok) await get().fetchHabits();
  },
}));
