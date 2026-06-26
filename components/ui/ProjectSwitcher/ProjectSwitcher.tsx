'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Plus, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectsStore } from '@/store/projects/projects.store';

export function ProjectSwitcher() {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  const { projects, activeProjectId, fetchProjects, setActiveProject } = useProjectsStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const match = pathname.match(/^\/projects\/([^/]+)/);
    if (match) {
      setActiveProject(match[1]);
    } else {
      setActiveProject(null);
    }
  }, [pathname, setActiveProject]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const activeProject = projects.find((p) => p._id === activeProjectId);
  const label = activeProject ? activeProject.name : 'All Streaks';
  const icon  = activeProject ? activeProject.icon : null;

  function select(projectId: string | null) {
    setOpen(false);
    if (projectId === null) {
      setActiveProject(null);
      router.push('/today');
    } else {
      setActiveProject(projectId);
      router.push(`/projects/${projectId}`);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        6,
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          padding:    '4px 0',
          color:      'var(--color-text-heading)',
        }}
        aria-label="Switch project"
      >
        <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
          {icon ? `${icon} ${label}` : label}
        </span>
        <ChevronDown
          size={14}
          style={{
            color:      'var(--color-text-muted)',
            transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{
              position:     'absolute',
              top:          'calc(100% + 8px)',
              left:         0,
              minWidth:     200,
              background:   'var(--color-bg-elevated)',
              borderRadius: 14,
              border:       '1px solid rgba(255,255,255,0.08)',
              boxShadow:    '0 8px 28px rgba(0,0,0,0.5)',
              overflow:     'hidden',
              zIndex:       200,
            }}
          >
            <button onClick={() => select(null)} style={itemStyle(activeProjectId === null)}>
              <LayoutGrid size={15} style={{ flexShrink: 0 }} />
              <span>All Streaks</span>
              {activeProjectId === null && (
                <span style={{ marginLeft: 'auto', color: 'var(--color-brand)', fontSize: 12 }}>✓</span>
              )}
            </button>

            {projects.length > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            )}

            {projects.map((p) => (
              <button key={p._id} onClick={() => select(p._id)} style={itemStyle(activeProjectId === p._id)}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                {activeProjectId === p._id && (
                  <span style={{ marginLeft: 'auto', color: 'var(--color-brand)', fontSize: 12 }}>✓</span>
                )}
              </button>
            ))}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            <button
              onClick={() => { setOpen(false); router.push('/projects/new'); }}
              style={itemStyle(false)}
            >
              <Plus size={15} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-brand)' }}>New Project</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function itemStyle(active: boolean): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
    width:      '100%',
    padding:    '11px 14px',
    background: active ? 'rgba(255,255,255,0.05)' : 'none',
    border:     'none',
    cursor:     'pointer',
    color:      active ? 'var(--color-text-heading)' : 'var(--color-text-body)',
    fontSize:   14,
    fontWeight: active ? 600 : 400,
    textAlign:  'left',
    transition: 'background 0.1s ease',
  };
}
