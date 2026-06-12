'use client';
import { useState, useRef, useEffect } from 'react';
import { Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import { User, Settings2 } from 'lucide-react';
import { format } from 'date-fns';

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

const MENU_ITEM: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '13px 16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-heading)',
  fontSize: 15,
  fontWeight: 500,
  textAlign: 'left',
};

export function PageHeader({ user }: PageHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:hidden"
      style={{
        height: 64,
        background: 'linear-gradient(to bottom, var(--color-bg-page) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}
    >
      {/* Left: streak label + date */}
      <div style={{ pointerEvents: 'none' }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: 0,
            lineHeight: 1,
          }}
        >
          {format(new Date(), 'EEEE, MMM d')}
        </p>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--color-text-heading)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Your Streaks
        </h1>
      </div>

      {/* Right: avatar + dropdown */}
      <div ref={menuRef} style={{ position: 'relative', pointerEvents: 'auto' }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
          aria-label="Open profile menu"
        >
          <Avatar
            src={user.image ?? undefined}
            style={{ background: 'var(--color-brand)', color: 'var(--color-bg-page)', fontWeight: 700 }}
            size={40}
          >
            {!user.image && initials}
          </Avatar>
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 52,
              background: 'var(--color-bg-elevated)',
              borderRadius: 16,
              overflow: 'hidden',
              minWidth: 164,
              boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.08)',
              zIndex: 100,
            }}
          >
            <button
              onClick={() => { router.push('/profile'); setMenuOpen(false); }}
              style={MENU_ITEM}
            >
              <User size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              Profile
            </button>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <button
              onClick={() => { router.push('/settings'); setMenuOpen(false); }}
              style={MENU_ITEM}
            >
              <Settings2 size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
