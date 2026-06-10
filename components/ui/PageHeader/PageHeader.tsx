'use client';
import { Avatar, Typography } from 'antd';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

export function PageHeader({ user }: PageHeaderProps) {
  const router = useRouter();
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = format(now, 'EEEE, MMMM d');
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:hidden"
      style={{
        height: 64,
        background: 'var(--color-bg-sunken)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div>
        <Text
          style={{
            display: 'block',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {dateStr}
        </Text>
        <Text
          strong
          style={{ fontSize: 20, color: 'var(--color-text-heading)', lineHeight: 1.2 }}
        >
          {greeting}
        </Text>
      </div>
      <button
        onClick={() => router.push('/profile')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
        aria-label="Go to profile"
      >
        <Avatar
          src={user.image ?? undefined}
          style={{ background: 'var(--color-brand)', color: 'var(--color-bg-page)', fontWeight: 700 }}
          size={40}
        >
          {!user.image && initials}
        </Avatar>
      </button>
    </header>
  );
}
