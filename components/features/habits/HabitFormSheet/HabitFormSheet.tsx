'use client';
import { useEffect } from 'react';
import { Skeleton } from 'antd';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HabitForm } from '@/components/features/habits/HabitForm';
import { useHabitsStore } from '@/store/habits/habits.store';
import { useHabitSheetStore } from '@/store/habitSheet/habitSheet.store';
import { notify } from '@/lib/snackbar';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';

export function HabitFormSheet() {
  const { isOpen, mode, habitId, projectId, scope, close } = useHabitSheetStore();
  const { habits, fetchHabits, createHabit, updateHabit, archiveHabit } = useHabitsStore();

  useEffect(() => {
    if (isOpen && mode === 'edit' && habits.length === 0) {
      fetchHabits();
    }
  }, [isOpen, mode, habits.length, fetchHabits]);

  const habit = mode === 'edit' && habitId
    ? habits.find((h) => h._id === habitId)
    : undefined;

  async function handleSave(data: CreateHabitInput | UpdateHabitInput) {
    try {
      if (mode === 'edit' && habitId) {
        await updateHabit(habitId, data as UpdateHabitInput);
      } else {
        await createHabit(data as CreateHabitInput);
      }
      close();
    } catch {
      notify('Failed to save. Please try again.', 'error');
      throw new Error('save failed');
    }
  }

  async function handleDelete() {
    if (!habitId) return;
    await archiveHabit(habitId);
    close();
  }

  const title = mode === 'edit' ? 'Edit Streak' : 'New Streak';

  return (
    <BottomSheet open={isOpen} onClose={close} title={title}>
      {mode === 'edit' && habitId && !habit ? (
        <div style={{ padding: '24px 20px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : (
        <div style={{ padding: '0 20px 8px' }}>
          <HabitForm
            key={habitId ?? 'new'}
            initial={habit}
            isEdit={mode === 'edit'}
            onSave={handleSave}
            onCancel={close}
            onDelete={mode === 'edit' ? handleDelete : undefined}
            projectId={projectId}
            defaultScope={scope}
          />
        </div>
      )}
    </BottomSheet>
  );
}
