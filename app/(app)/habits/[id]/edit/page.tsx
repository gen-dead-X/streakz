'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Typography, Skeleton, Button, Popconfirm } from 'antd';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { HabitForm } from '@/components/features/habits/HabitForm';
import { useHabitsStore } from '@/store/habits/habits.store';
import type { UpdateHabitInput } from '@/types/api/habits.types';

const { Title } = Typography;

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
      <div className="flex flex-col gap-4">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <ArrowLeft size={22} style={{ color: 'var(--color-text-body)' }} />
          </button>
          <Title level={3} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            Edit Habit
          </Title>
        </div>
        <Popconfirm
          title="Delete this habit?"
          description="All check-in history will be lost."
          onConfirm={handleDelete}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button
            danger
            type="text"
            icon={<Trash2 size={18} />}
            size="small"
          />
        </Popconfirm>
      </div>
      <HabitForm
        initial={habit}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}
