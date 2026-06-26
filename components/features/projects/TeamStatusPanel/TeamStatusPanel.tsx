'use client';
import { Check, Clock } from 'lucide-react';
import type { ProjectStatusMember } from '@/types/api/projects.types';

interface TeamStatusPanelProps {
  members:       ProjectStatusMember[];
  currentUserId: string;
}

export function TeamStatusPanel({ members, currentUserId }: TeamStatusPanelProps) {
  if (members.length === 0) return null;

  return (
    <div
      style={{
        background:   'var(--color-bg-surface)',
        borderRadius: 16,
        padding:      '14px 16px',
        border:       '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <p
        style={{
          fontSize:      10,
          color:         'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin:        '0 0 10px',
          fontWeight:    600,
        }}
      >
        Team Status
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map((m) => {
          const allDone = m.personalTotal > 0 && m.personalDone === m.personalTotal;
          return (
            <div
              key={m.userId}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        10,
                opacity:    m.userId === currentUserId ? 1 : 0.85,
              }}
            >
              <div
                style={{
                  width:          30,
                  height:         30,
                  borderRadius:   '50%',
                  background:     allDone ? 'var(--color-success)' : 'var(--color-bg-elevated)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  transition:     'background 0.2s ease',
                }}
              >
                {allDone
                  ? <Check size={14} style={{ color: '#fff' }} />
                  : <Clock size={13} style={{ color: 'var(--color-text-muted)' }} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin:       0,
                    fontSize:     13,
                    fontWeight:   m.userId === currentUserId ? 600 : 400,
                    color:        'var(--color-text-heading)',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                  }}
                >
                  {m.name || (m.userId === currentUserId ? 'You' : 'Member')}
                </p>
              </div>
              <span
                style={{
                  fontSize:   12,
                  color:      allDone ? 'var(--color-success)' : 'var(--color-text-muted)',
                  fontWeight: allDone ? 600 : 400,
                  flexShrink: 0,
                }}
              >
                {m.personalTotal > 0 ? `${m.personalDone}/${m.personalTotal}` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
