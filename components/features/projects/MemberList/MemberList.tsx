'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from 'antd';
import { Trash2, LogOut, ShieldCheck } from 'lucide-react';
import { notify } from '@/lib/snackbar';
import type { Project } from '@/types/models/project.types';
import type { EnrichedProjectMember } from '@/types/models/project.types';

interface MemberListProps {
  project:       Project;
  members:       EnrichedProjectMember[];
  currentUserId: string;
}

export function MemberList({ project, members, currentUserId }: MemberListProps) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {members.map((member) => {
        const isMe    = member.userId === currentUserId;
        const isAdmin = member.role === 'owner';

        return (
          <div
            key={member.userId}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '12px 14px',
              borderRadius: 14,
              background:   'var(--color-bg-surface)',
              border:       isAdmin
                ? '1px solid rgb(var(--brand-rgb) / 0.18)'
                : '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {/* Avatar */}
            <Avatar
              src={member.image ?? undefined}
              size={38}
              style={{
                background:  'var(--color-brand)',
                color:       'var(--color-bg-page)',
                fontWeight:  700,
                flexShrink:  0,
                fontSize:    14,
              }}
            >
              {!member.image && member.name.slice(0, 2).toUpperCase()}
            </Avatar>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{
                  margin:     0,
                  fontSize:   14,
                  fontWeight: 600,
                  color:      'var(--color-text-heading)',
                  overflow:   'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {isMe ? `${member.name} (You)` : member.name}
                </p>
                {isAdmin && (
                  <span style={{
                    display:      'inline-flex',
                    alignItems:   'center',
                    gap:          3,
                    padding:      '1px 7px',
                    borderRadius: 99,
                    background:   'rgb(var(--brand-rgb) / 0.15)',
                    color:        'var(--color-brand)',
                    fontSize:     10,
                    fontWeight:   700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    flexShrink:   0,
                  }}>
                    <ShieldCheck size={10} />
                    Admin
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Owner can remove non-owner members */}
            {isOwner && !isMe && (
              <button
                onClick={() => removeMember(member.userId)}
                disabled={busy === member.userId}
                title="Remove member"
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     busy === member.userId ? 'not-allowed' : 'pointer',
                  padding:    6,
                  borderRadius: 8,
                  color:      'var(--color-error)',
                  opacity:    busy === member.userId ? 0.4 : 0.7,
                  lineHeight: 0,
                  transition: 'opacity 0.15s',
                }}
                aria-label="Remove member"
              >
                <Trash2 size={15} />
              </button>
            )}

            {/* Non-owner members can only leave */}
            {isMe && !isOwner && (
              <button
                onClick={leaveProject}
                disabled={busy === 'leave'}
                title="Leave project"
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  padding:    6,
                  borderRadius: 8,
                  color:      'var(--color-text-muted)',
                  lineHeight: 0,
                  opacity:    busy === 'leave' ? 0.4 : 0.7,
                  transition: 'opacity 0.15s',
                }}
                aria-label="Leave project"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
