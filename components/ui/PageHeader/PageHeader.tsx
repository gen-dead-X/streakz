'use client';
import { Avatar, Typography } from 'antd';
import { format } from 'date-fns';

const { Text } = Typography;

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

export function PageHeader({ user }: PageHeaderProps) {
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
      className="fixed top-0 left-1/2 z-40 flex items-center justify-between px-4"
      style={{
        width: '100%',
        maxWidth: 430,
        height: 64,
        transform: 'translateX(-50%)',
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
      <Avatar
        src={user.image ?? undefined}
        style={{ background: 'var(--color-brand)', color: 'var(--color-bg-page)', fontWeight: 700 }}
        size={40}
      >
        {!user.image && initials}
      </Avatar>
    </header>
  );
}
