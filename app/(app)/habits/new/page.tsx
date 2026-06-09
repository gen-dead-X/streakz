'use client';
import { useRouter } from 'next/navigation';
import { Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { HabitForm } from '@/components/features/habits/HabitForm';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { CreateHabitInput } from '@/types/api/habits.types';

const { Title } = Typography;

export default function NewHabitPage() {
  const router = useRouter();
  const { createHabit } = useHabitsStore();

  async function handleSave(data: CreateHabitInput) {
    await createHabit(data as CreateHabitInput);
    router.push('/today');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <ArrowLeft size={22} style={{ color: 'var(--color-text-body)' }} />
        </button>
        <Title level={3} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
          New Habit
        </Title>
      </div>
      <HabitForm
        onSave={(data) => handleSave(data as CreateHabitInput)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
