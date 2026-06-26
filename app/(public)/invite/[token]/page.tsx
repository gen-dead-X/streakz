import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveInviteToken, getProjectById } from '@/services/projects/projects.service';
import { JoinProjectButton } from './JoinProjectButton';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview   = await resolveInviteToken(token);

  if (!preview) {
    return (
      <div style={centeredPage}>
        <h2 style={heading}>Invalid invite</h2>
        <p style={muted}>This link is no longer valid.</p>
      </div>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    // Already a member → go straight to project
    const project = await getProjectById(preview.projectId, session.user.id);
    if (project) redirect(`/projects/${preview.projectId}`);
  }

  return (
    <div style={centeredPage}>
      <div
        style={{
          background:   'var(--color-bg-surface)',
          borderRadius: 24,
          padding:      '32px 28px',
          border:       '1px solid rgba(255,255,255,0.07)',
          maxWidth:     380,
          width:        '100%',
          textAlign:    'center',
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 12 }}>{preview.projectIcon}</div>
        <h2 style={{ ...heading, marginBottom: 6 }}>{preview.projectName}</h2>
        <p style={{ ...muted, marginBottom: 24 }}>
          {preview.memberCount} member{preview.memberCount !== 1 ? 's' : ''} · Streakz Project
        </p>

        {session ? (
          <JoinProjectButton token={token} projectId={preview.projectId} />
        ) : (
          <a
            href={`/login?next=/invite/${token}`}
            style={{
              display:        'block',
              padding:        '13px 0',
              borderRadius:   12,
              background:     'var(--color-brand)',
              color:          'var(--color-bg-page)',
              fontWeight:     700,
              fontSize:       15,
              textDecoration: 'none',
            }}
          >
            Sign in to join
          </a>
        )}
      </div>
    </div>
  );
}

const centeredPage: React.CSSProperties = {
  minHeight:      '100dvh',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  padding:        '24px 16px',
  background:     'var(--color-bg-page)',
};

const heading: React.CSSProperties = {
  margin:     0,
  fontSize:   22,
  fontWeight: 800,
  color:      'var(--color-text-heading)',
};

const muted: React.CSSProperties = {
  margin:   0,
  fontSize: 14,
  color:    'var(--color-text-muted)',
};
