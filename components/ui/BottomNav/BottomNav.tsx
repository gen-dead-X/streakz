'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Typography } from 'antd';
import { CalendarDays, BarChart3, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDarkMode } from '@/hooks/theme/useDarkMode';
import { useHabitSheetStore } from '@/store/habitSheet/habitSheet.store';
import { useThemeStore } from '@/store/theme/theme.store';

const { Text } = Typography;

export function BottomNav() {
  const pathname = usePathname();
  const dark = useDarkMode();
  const openAdd = useHabitSheetStore((s) => s.openAdd);
  const appStyle = useThemeStore((s) => s.appStyle);
  const isGlassy = appStyle === 'glassy';

  const isToday = pathname === '/today' || pathname === '/';
  const isInsights = pathname.startsWith('/insights');

  const active = { color: 'var(--color-brand)' };
  const inactive = { color: 'var(--color-text-muted)' };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center md:hidden"
      style={{
        height: 72,
        background: isGlassy
          ? 'var(--color-bg-elevated)'
          : (dark ? 'rgba(8,8,8,0.88)' : 'rgba(255,255,255,0.94)'),
        backdropFilter: 'blur(var(--glass-blur, 20px)) saturate(var(--glass-saturation, 180%))',
        WebkitBackdropFilter: 'blur(var(--glass-blur, 20px)) saturate(var(--glass-saturation, 180%))',
        borderTop: isGlassy
          ? (dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.60)')
          : (dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)'),
        boxShadow: isGlassy ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : undefined,
      }}
    >
      <Link
        href="/today"
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
        style={{ textDecoration: 'none' }}
      >
        <CalendarDays size={22} style={isToday ? active : inactive} />
        <Text style={{ fontSize: 11, ...(isToday ? active : inactive) }}>Today</Text>
      </Link>

      {/* Add — centered CTA, floats above nav */}
      <div className="flex-1 flex items-center justify-center">
        <motion.button
          onClick={() => openAdd()}
          className="flex items-center justify-center"
          style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            background: 'var(--color-brand)',
            boxShadow: isGlassy
              ? `0 0 0 4px var(--color-bg-elevated), var(--shadow-brand)`
              : '0 0 0 5px var(--color-bg-sunken), var(--shadow-brand)',
            marginTop: -24,
            border: 'none',
            cursor: 'pointer',
          }}
          initial={{ scale: 0.78 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.86 }}
          transition={{ type: 'spring', stiffness: 440, damping: 18 }}
          aria-label="Add habit"
        >
          <Plus size={28} style={{ color: 'var(--color-bg-page)' }} />
        </motion.button>
      </div>

      <Link
        href="/insights"
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
        style={{ textDecoration: 'none' }}
      >
        <BarChart3 size={22} style={isInsights ? active : inactive} />
        <Text style={{ fontSize: 11, ...(isInsights ? active : inactive) }}>Insights</Text>
      </Link>
    </nav>
  );
}
