'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from 'antd';
import { HabitForm } from '@/components/features/habits/HabitForm';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { UpdateHabitInput } from '@/types/api/habits.types';

export default function EditHabitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { habits, fetchHabits, updateHabit, archiveHabit } = useHabitsStore();

  useEffect(() => {
    if (habits.length === 0) fetchHabits();
  }, [habits.length, fetchHabits]);

  const habit = habits.find((h) => h._id === id);

  async function handleSave(data: UpdateHabitInput) {
    await updateHabit(id, data);
    router.push('/today');
  }

  async function handleDelete() {
    await archiveHabit(id);
    router.push('/today');
  }

  if (!habit) {
    return (
      <div style={{ padding: '24px 20px' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div>
      <HabitForm
        initial={habit}
        isEdit
        onSave={handleSave}
        onCancel={() => router.back()}
        onDelete={handleDelete}
      />
    </div>
  );
}
