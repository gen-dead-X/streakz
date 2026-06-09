import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  return (
    <div
      className="mx-auto flex flex-col bg-bg-page"
      style={{ maxWidth: 430, minHeight: '100dvh' }}
    >
      {children}
    </div>
  );
}
