'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Settings2, Plus, Copy } from 'lucide-react';
import { useHabitSheetStore } from '@/store/habitSheet/habitSheet.store';
import { ProjectHeader }   from '@/components/features/projects/ProjectHeader';
import { TeamHabitRow }    from '@/components/features/projects/TeamHabitRow';
import { TeamStatusPanel } from '@/components/features/projects/TeamStatusPanel';
import { HabitCard }       from '@/components/ui/HabitCard';
import { notify }          from '@/lib/snackbar';
import type { Project }               from '@/types/models/project.types';
import type { ProjectStatusResponse } from '@/types/api/projects.types';
import type { HabitWithStreak }       from '@/types/models/habit.types';

interface ProjectPageProps {
  project:       Project;
  currentUserId: string;
}

export function ProjectPage({ project, currentUserId }: ProjectPageProps) {
  const router   = useRouter();
  const openAdd  = useHabitSheetStore((s) => s.openAdd);
  const today    = format(new Date(), 'yyyy-MM-dd');

  const [habits,  setHabits]  = useState<HabitWithStreak[]>([]);
  const [status,  setStatus]  = useState<ProjectStatusResponse>({
    members: [], totalMembers: 0, allDone: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [habitsRes, statusRes] = await Promise.all([
        fetch(`/api/projects/${project._id}/habits`),
        fetch(`/api/projects/${project._id}/status`),
      ]);
      if (habitsRes.ok) {
        const { habits: h } = (await habitsRes.json()) as { habits: HabitWithStreak[] };
        setHabits(h);
      }
      if (statusRes.ok) {
        setStatus((await statusRes.json()) as ProjectStatusResponse);
      }
      setLoading(false);
    }
    load();
  }, [project._id]);

  const teamHabits     = habits.filter((h) => h.scope === 'team');
  const personalHabits = habits.filter((h) => h.scope === 'personal' && h.userId === currentUserId);

  function copyInviteLink() {
    const url = `${window.location.origin}/invite/${project.inviteToken}`;
    navigator.clipboard.writeText(url).then(() => notify('Invite link copied!', 'success'));
  }

  async function refreshHabits() {
    const habitsRes = await fetch(`/api/projects/${project._id}/habits`);
    if (habitsRes.ok) {
      const { habits: h } = (await habitsRes.json()) as { habits: HabitWithStreak[] };
      setHabits(h);
    }
  }

  async function handleCheckIn(habitId: string, date: string) {
    const res = await fetch(`/api/habits/${habitId}/checkins`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ date }),
    });
    if (res.ok) {
      await refreshHabits();
    } else {
      notify('Failed to check in', 'error');
    }
  }

  async function handleUncheck(habitId: string, date: string) {
    const res = await fetch(`/api/habits/${habitId}/checkins`, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ date }),
    });
    if (res.ok) {
      await refreshHabits();
    } else {
      notify('Failed to uncheck', 'error');
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <ProjectHeader project={project} status={status} currentUserId={currentUserId} />
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={copyInviteLink} title="Copy invite link" style={iconBtnStyle}>
            <Copy size={16} />
          </button>
          <button
            onClick={() => router.push(`/projects/${project._id}/settings`)}
            title="Project settings"
            style={iconBtnStyle}
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      {teamHabits.length > 0 && (
        <section>
          <p style={sectionLabel}>Team Habits</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {teamHabits.map((h) => (
              <TeamHabitRow
                key={h._id}
                habit={h}
                project={project}
                currentUserId={currentUserId}
                onCheckIn={handleCheckIn}
                onUncheck={handleUncheck}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ ...sectionLabel, margin: 0 }}>Your Habits</p>
          <button
            onClick={() => openAdd({ projectId: project._id, scope: 'personal' })}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          5,
              background:   'var(--color-bg-elevated)',
              border:       'none',
              borderRadius: 10,
              padding:      '7px 12px',
              cursor:       'pointer',
              color:        'var(--color-text-muted)',
              fontSize:     13,
              fontWeight:   500,
            }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
        {personalHabits.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            No personal habits yet. Add one to start tracking.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {personalHabits.map((h) => (
              <HabitCard
                key={h._id}
                habit={h}
                today={today}
                onCheckIn={handleCheckIn}
                onUncheck={handleUncheck}
              />
            ))}
          </div>
        )}
      </section>

      {status.members.length > 1 && (
        <TeamStatusPanel members={status.members} currentUserId={currentUserId} />
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize:      10,
  color:         'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight:    600,
  margin:        '0 0 10px',
};

const iconBtnStyle: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  width:          36,
  height:         36,
  borderRadius:   10,
  background:     'var(--color-bg-elevated)',
  border:         '1px solid rgba(255,255,255,0.06)',
  cursor:         'pointer',
  color:          'var(--color-text-muted)',
};
