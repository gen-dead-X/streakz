'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, LogOut } from 'lucide-react';
import { notify } from '@/lib/snackbar';
import type { Project } from '@/types/models/project.types';

interface MemberListProps {
  project:       Project;
  currentUserId: string;
}

export function MemberList({ project, currentUserId }: MemberListProps) {
  const router          = useRouter();
  const isOwner         = project.ownerId === currentUserId;
  const [busy, setBusy] = useState<string | null>(null);

  async function removeMember(targetUserId: string) {
    setBusy(targetUserId);
    try {
      const res = await fetch(`/api/projects/${project._id}/members/${targetUserId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      notify('Member removed', 'info');
      router.refresh();
    } catch {
      notify('Failed to remove member', 'error');
    } finally {
      setBusy(null);
    }
  }

  async function leaveProject() {
    setBusy('leave');
    try {
      const res = await fetch(`/api/projects/${project._id}/leave`, { method: 'POST' });
      if (!res.ok) throw new Error();
      notify('Left project', 'info');
      router.push('/today');
    } catch {
      notify('Failed to leave project', 'error');
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {project.members.map((member) => {
        const isMe = member.userId === currentUserId;
        return (
          <div
            key={member.userId}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '10px 12px',
              borderRadius: 12,
              background:   'var(--color-bg-surface)',
              border:       '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div
              style={{
                width:          36,
                height:         36,
                borderRadius:   '50%',
                background:     'var(--color-bg-elevated)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       14,
                fontWeight:     700,
                color:          'var(--color-text-muted)',
                flexShrink:     0,
              }}
            >
              {member.userId.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-heading)' }}>
                {isMe ? 'You' : 'Member'}{member.role === 'owner' ? ' · Owner' : ''}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>

            {isOwner && !isMe && (
              <button
                onClick={() => removeMember(member.userId)}
                disabled={busy === member.userId}
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     busy === member.userId ? 'not-allowed' : 'pointer',
                  padding:    6,
                  color:      'var(--color-error)',
                  opacity:    busy === member.userId ? 0.5 : 1,
                  lineHeight: 0,
                }}
                aria-label="Remove member"
              >
                <Trash2 size={16} />
              </button>
            )}

            {isMe && !isOwner && (
              <button
                onClick={leaveProject}
                disabled={busy === 'leave'}
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  padding:    6,
                  color:      'var(--color-text-muted)',
                  lineHeight: 0,
                }}
                aria-label="Leave project"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
