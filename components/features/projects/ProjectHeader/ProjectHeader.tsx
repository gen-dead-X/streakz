'use client';
import type { Project } from '@/types/models/project.types';
import type { ProjectStatusResponse } from '@/types/api/projects.types';

interface ProjectHeaderProps {
  project:       Project;
  status:        ProjectStatusResponse;
  currentUserId: string;
}

export function ProjectHeader({ project, status, currentUserId: _currentUserId }: ProjectHeaderProps) {
  const doneCount = status.members.filter(
    (m) => m.personalDone === m.personalTotal && m.personalTotal > 0,
  ).length;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <div
          style={{
            width:          48,
            height:         48,
            borderRadius:   16,
            background:     'var(--color-bg-elevated)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       26,
            border:         '1px solid rgba(255,255,255,0.07)',
            flexShrink:     0,
          }}
        >
          {project.icon}
        </div>
        <div>
          <h1
            style={{
              margin:     0,
              fontSize:   22,
              fontWeight: 800,
              color:      'var(--color-text-heading)',
              lineHeight: 1.2,
            }}
          >
            {project.name}
          </h1>
          <p
            style={{
              margin:   '2px 0 0',
              fontSize: 13,
              color:    'var(--color-text-muted)',
            }}
          >
            {project.members.length} member{project.members.length !== 1 ? 's' : ''}
            {status.totalMembers > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  color: status.allDone ? 'var(--color-success)' : 'var(--color-text-muted)',
                }}
              >
                · {doneCount}/{status.totalMembers} done today
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
