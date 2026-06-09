'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Typography } from 'antd';
import { CalendarDays, BarChart3, Plus } from 'lucide-react';

const { Text } = Typography;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isToday = pathname === '/today' || pathname === '/';
  const isInsights = pathname.startsWith('/insights');

  const active = { color: 'var(--color-brand)' };
  const inactive = { color: 'var(--color-text-muted)' };

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex items-center"
      style={{
        width: '100%',
        maxWidth: 430,
        height: 64,
        transform: 'translateX(-50%)',
        background: 'var(--color-bg-sunken)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Today */}
      <button
        onClick={() => router.push('/today')}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <CalendarDays size={22} style={isToday ? active : inactive} />
        <Text style={{ fontSize: 11, ...(isToday ? active : inactive) }}>Today</Text>
      </button>

      {/* Add */}
      <div className="flex-1 flex justify-center">
        <button
          onClick={() => router.push('/habits/new')}
          className="flex items-center justify-center"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--color-brand)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <Plus size={26} style={{ color: 'var(--color-bg-page)' }} />
        </button>
      </div>

      {/* Insights */}
      <button
        onClick={() => router.push('/insights')}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <BarChart3 size={22} style={isInsights ? active : inactive} />
        <Text style={{ fontSize: 11, ...(isInsights ? active : inactive) }}>Insights</Text>
      </button>
    </nav>
  );
}
