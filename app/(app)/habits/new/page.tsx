'use client';
import { useRouter } from 'next/navigation';
import { HabitForm } from '@/components/features/habits/HabitForm';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { CreateHabitInput } from '@/types/api/habits.types';

export default function NewHabitPage() {
  const router = useRouter();
  const { createHabit } = useHabitsStore();

  async function handleSave(data: CreateHabitInput) {
    await createHabit(data);
    router.push('/today');
  }

  return (
    <div>
      <HabitForm
        onSave={(data) => handleSave(data as CreateHabitInput)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
