'use client';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/snackbar';

interface CopyButtonProps { url: string }
interface RegenerateButtonProps { projectId: string }

export function CopyInviteButton({ url }: CopyButtonProps) {
  return (
    <button
      onClick={() =>
        navigator.clipboard.writeText(url).then(() => notify('Invite link copied!', 'success'))
      }
      style={{
        background:   'var(--color-brand)',
        border:       'none',
        borderRadius: 8,
        padding:      '6px 12px',
        color:        'var(--color-bg-page)',
        fontSize:     12,
        fontWeight:   600,
        cursor:       'pointer',
        flexShrink:   0,
      }}
    >
      Copy
    </button>
  );
}

export function RegenerateTokenButton({ projectId }: RegenerateButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        if (!confirm('Regenerate invite link? The old link will stop working.')) return;
        const res = await fetch(`/api/projects/${projectId}/regenerate-token`, { method: 'POST' });
        if (res.ok) {
          notify('Invite link regenerated', 'success');
          router.refresh();
        } else {
          notify('Failed to regenerate', 'error');
        }
      }}
      style={{
        marginTop:  8,
        background: 'none',
        border:     'none',
        cursor:     'pointer',
        fontSize:   12,
        color:      'var(--color-text-muted)',
        padding:    0,
      }}
    >
      Regenerate link
    </button>
  );
}
