import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProjectById } from '@/services/projects/projects.service';
import { ProjectPage } from '@/components/features/projects/ProjectPage';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) redirect('/today');

  return (
    <ProjectPage
      project={project}
      currentUserId={session.user.id}
    />
  );
}
