'use client';
import { format } from 'date-fns';
import { HabitCard } from '@/components/ui/HabitCard';
import type { HabitWithStreak } from '@/types/models/habit.types';
import type { Project } from '@/types/models/project.types';

interface TeamHabitRowProps {
  habit:         HabitWithStreak;
  project:       Project;
  currentUserId: string;
  onCheckIn:     (habitId: string, date: string) => void;
  onUncheck:     (habitId: string, date: string) => void;
}

export function TeamHabitRow({
  habit,
  project,
  currentUserId: _currentUserId,
  onCheckIn,
  onUncheck,
}: TeamHabitRowProps) {
  const today       = format(new Date(), 'yyyy-MM-dd');
  const memberCount = project.members.length;
  const doneCount   = (habit.memberStatus ?? []).filter((m) => m.isCompletedToday).length;

  return (
    <div>
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          marginBottom: 6,
          paddingLeft:  2,
        }}
      >
        <span
          style={{
            fontSize:      11,
            fontWeight:    600,
            color:         'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Team habit
        </span>
        <span
          style={{
            fontSize:   11,
            color:      doneCount === memberCount ? 'var(--color-success)' : 'var(--color-text-muted)',
            fontWeight: 600,
          }}
        >
          {doneCount}/{memberCount} checked in
        </span>
      </div>

      <HabitCard
        habit={habit}
        today={today}
        onCheckIn={onCheckIn}
        onUncheck={onUncheck}
      />
    </div>
  );
}
