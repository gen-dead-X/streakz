'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectsStore } from '@/store/projects/projects.store';

interface JoinProjectButtonProps {
  token:     string;
  projectId: string;
}

export function JoinProjectButton({ token, projectId: _projectId }: JoinProjectButtonProps) {
  const router          = useRouter();
  const [busy, setBusy] = useState(false);
  const { joinProject } = useProjectsStore();

  async function handleJoin() {
    setBusy(true);
    const id = await joinProject(token);
    if (id) {
      router.push(`/projects/${id}`);
    } else {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleJoin}
      disabled={busy}
      style={{
        width:        '100%',
        padding:      '13px 0',
        borderRadius: 12,
        border:       'none',
        background:   'var(--color-brand)',
        color:        'var(--color-bg-page)',
        fontWeight:   700,
        fontSize:     15,
        cursor:       busy ? 'not-allowed' : 'pointer',
        opacity:      busy ? 0.7 : 1,
        transition:   'opacity 0.15s ease',
      }}
    >
      {busy ? 'Joining…' : 'Join Project'}
    </button>
  );
}
