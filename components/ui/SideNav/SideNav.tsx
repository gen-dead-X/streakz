'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, Typography } from 'antd';
import { CalendarDays, BarChart3, Plus, Flame } from 'lucide-react';

const { Text } = Typography;

interface SideNavProps {
  user: { name: string; image: string | null };
}

export function SideNav({ user }: SideNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isToday = pathname === '/today' || pathname === '/';
  const isInsights = pathname.startsWith('/insights');

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navItem = (
    icon: React.ReactNode,
    label: string,
    active: boolean,
    onClick: () => void,
  ) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '10px 16px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: active ? 'rgba(29,185,84,0.12)' : 'transparent',
        color: active ? 'var(--color-brand)' : 'var(--color-text-muted)',
        transition: 'all 0.15s ease',
        textAlign: 'left',
      }}
    >
      {icon}
      <Text style={{ fontSize: 15, fontWeight: active ? 600 : 400, color: 'inherit' }}>
        {label}
      </Text>
    </button>
  );

  return (
    <aside
      className="hidden md:flex flex-col fixed top-0 left-0 z-50"
      style={{
        width: 240,
        height: '100vh',
        background: 'var(--color-bg-sunken)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 16px',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--color-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Flame size={20} style={{ color: 'var(--color-bg-page)' }} />
        </div>
        <Text strong style={{ fontSize: 18, color: 'var(--color-text-heading)' }}>
          Streak Counter
        </Text>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItem(
          <CalendarDays size={20} />,
          'Today',
          isToday,
          () => router.push('/today'),
        )}
        {navItem(
          <BarChart3 size={20} />,
          'Insights',
          isInsights,
          () => router.push('/insights'),
        )}
      </nav>

      {/* Add Habit button */}
      <button
        onClick={() => router.push('/habits/new')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          background: 'var(--color-brand)',
          color: 'var(--color-bg-page)',
          marginBottom: 16,
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        <Plus size={20} />
        Add Habit
      </button>

      {/* User */}
      <button
        onClick={() => router.push('/profile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 8px',
          borderRadius: 12,
          background: 'var(--color-bg-elevated)',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          transition: 'background 0.15s ease',
        }}
      >
        <Avatar
          src={user.image ?? undefined}
          size={36}
          style={{
            background: 'var(--color-brand)',
            color: 'var(--color-bg-page)',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {!user.image && initials}
        </Avatar>
        <div className="min-w-0">
          <Text
            style={{
              fontSize: 14,
              color: 'var(--color-text-heading)',
              fontWeight: 600,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.name}
          </Text>
        </div>
      </button>
    </aside>
  );
}
