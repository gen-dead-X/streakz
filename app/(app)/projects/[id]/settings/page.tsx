import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProjectById, getEnrichedMembers } from '@/services/projects/projects.service';
import { MemberList }  from '@/components/features/projects/MemberList';
import { ProjectForm } from '@/components/features/projects/ProjectForm';
import { CopyInviteButton, RegenerateTokenButton } from './SettingsClientActions';

const sectionLabel: React.CSSProperties = {
  fontSize:      10,
  color:         'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight:    600,
  margin:        '0 0 10px',
};

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) redirect('/today');

  const isOwner       = project.ownerId === session.user.id;
  const inviteUrl     = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${project.inviteToken}`;
  const enrichedMembers = await getEnrichedMembers(project.members);

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          {project.name}
        </p>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--color-text-heading)' }}>
          Settings
        </h2>
      </div>

      <section>
        <p style={sectionLabel}>Invite Link</p>
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            background:   'var(--color-bg-elevated)',
            borderRadius: 12,
            padding:      '12px 14px',
            border:       '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <code style={{ flex: 1, fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {inviteUrl}
          </code>
          <CopyInviteButton url={inviteUrl} />
        </div>
        {isOwner && <RegenerateTokenButton projectId={id} />}
      </section>

      {isOwner && (
        <section>
          <p style={sectionLabel}>Edit Project</p>
          <ProjectForm
            mode="edit"
            projectId={id}
            initialName={project.name}
            initialIcon={project.icon}
          />
        </section>
      )}

      <section>
        <p style={sectionLabel}>Members</p>
        <MemberList project={project} members={enrichedMembers} currentUserId={session.user.id} />
      </section>
    </div>
  );
}
