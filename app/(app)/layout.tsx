import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { BottomNav } from '@/components/ui/BottomNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const user = {
    name: session.user.name ?? 'User',
    image: session.user.image ?? null,
  };

  return (
    <div
      className="mx-auto flex flex-col relative"
      style={{ maxWidth: 430, minHeight: '100dvh', background: 'var(--color-bg-page)' }}
    >
      <PageHeader user={user} />
      <main className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingTop: 80, paddingBottom: 80 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
