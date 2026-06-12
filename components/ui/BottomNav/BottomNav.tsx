'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Typography } from 'antd';
import { CalendarDays, BarChart3, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

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
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center md:hidden"
      style={{
        height: 72,
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

      {/* Add — centered CTA, floats above nav */}
      <div className="flex-1 flex items-center justify-center">
        <motion.button
          onClick={() => router.push('/habits/new')}
          className="flex items-center justify-center"
          style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            background: 'var(--color-brand)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 0 5px var(--color-bg-sunken), var(--shadow-brand)',
            marginTop: -24,
          }}
          initial={{ scale: 0.78 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.86 }}
          transition={{ type: 'spring', stiffness: 440, damping: 18 }}
        >
          <Plus size={28} style={{ color: 'var(--color-bg-page)' }} />
        </motion.button>
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
