'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from 'antd';
import { useProjectsStore } from '@/store/projects/projects.store';

const ICONS = ['🚀', '💪', '📚', '🎯', '🏃', '🧘', '🎨', '💡', '🌱', '⚡', '🔥', '🎵'];

interface ProjectFormProps {
  mode?:         'create' | 'edit';
  initialName?:  string;
  initialIcon?:  string;
  projectId?:    string;
  onSuccess?:    (projectId: string) => void;
}

export function ProjectForm({
  mode = 'create',
  initialName = '',
  initialIcon = '🚀',
  projectId,
  onSuccess,
}: ProjectFormProps) {
  const router                = useRouter();
  const [name, setName]       = useState(initialName);
  const [icon, setIcon]       = useState(initialIcon);
  const [loading, setLoading] = useState(false);
  const { createProject }     = useProjectsStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (mode === 'create') {
        const id = await createProject({ name: name.trim(), icon });
        if (id) {
          onSuccess ? onSuccess(id) : router.push(`/projects/${id}`);
        }
      } else if (mode === 'edit' && projectId) {
        const res = await fetch(`/api/projects/${projectId}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name: name.trim(), icon }),
        });
        if (res.ok) {
          onSuccess ? onSuccess(projectId) : router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 10px', fontWeight: 500 }}>
          Icon
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ICONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setIcon(e)}
              style={{
                width:          44,
                height:         44,
                borderRadius:   12,
                border:         icon === e ? '2px solid var(--color-brand)' : '2px solid rgba(255,255,255,0.08)',
                background:     icon === e ? 'rgba(var(--brand-rgb) / 0.12)' : 'var(--color-bg-elevated)',
                fontSize:       22,
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                transition:     'all 0.12s ease',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 8px', fontWeight: 500 }}>
          Project Name
        </p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fitness Challenge"
          maxLength={50}
          size="large"
          style={{ borderRadius: 12 }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        style={{
          padding:      '13px 0',
          borderRadius: 12,
          border:       'none',
          background:   name.trim() ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
          color:        name.trim() ? 'var(--color-bg-page)' : 'var(--color-text-muted)',
          fontWeight:   700,
          fontSize:     15,
          cursor:       name.trim() ? 'pointer' : 'not-allowed',
          transition:   'all 0.15s ease',
        }}
      >
        {loading ? 'Saving…' : mode === 'create' ? 'Create Project' : 'Save Changes'}
      </button>
    </form>
  );
}
