'use client';
import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useThemeStore } from '@/store/theme/theme.store';
import { createPortal } from 'react-dom';
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import type {
  BottomSheetContextValue,
  BottomSheetProps,
} from './BottomSheet.types';

const SNAP_FULL = 0.08;
const SNAP_HALF = 0.50;
const SPRING = { type: 'spring', stiffness: 380, damping: 40, mass: 1 } as const;

const BottomSheetCtx = createContext<BottomSheetContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const heightMV = useMotionValue(900);
  const sheetY = useMotionValue(900);

  useEffect(() => {
    const h = window.innerHeight;
    heightMV.set(h);
    sheetY.set(h);

    function onResize() { heightMV.set(window.innerHeight); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [heightMV, sheetY]);

  return (
    <BottomSheetCtx value={{ sheetY, heightMV }}>
      {children}
    </BottomSheetCtx>
  );
}

// ── Background ────────────────────────────────────────────────────────────────
// Wrap your page content once. Scales down iOS-style when a sheet opens.
export function BottomSheetBackground({ children }: { children: ReactNode }) {
  const ctx = use(BottomSheetCtx);
  const fallbackHeight = useMotionValue(900);
  const fallbackY = useMotionValue(900);
  const { sheetY, heightMV } = ctx ?? { sheetY: fallbackY, heightMV: fallbackHeight };

  const scale = useTransform([sheetY, heightMV], ([y, h]: number[]) => {
    if (h === 0) return 1;
    const fullY = h * SNAP_FULL;
    if (y >= h) return 1;
    if (y <= fullY) return 0.93;
    return 0.93 + 0.07 * ((y - fullY) / (h - fullY));
  });

  const borderRadius = useTransform([sheetY, heightMV], ([y, h]: number[]) => {
    if (h === 0 || y >= h) return 0;
    const fullY = h * SNAP_FULL;
    if (y <= fullY) return 14;
    return 14 * (1 - (y - fullY) / (h - fullY));
  });

  return (
    <motion.div
      style={{
        scale,
        borderRadius,
        transformOrigin: 'center top',
        willChange: 'transform, border-radius',
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Sheet ─────────────────────────────────────────────────────────────────────
export function BottomSheet({
  open,
  onClose,
  children,
  defaultSnap = 'full',
  title,
}: BottomSheetProps) {
  const ctx = use(BottomSheetCtx);
  const fallbackHeight = useMotionValue(900);
  const fallbackY = useMotionValue(900);
  const { sheetY, heightMV } = ctx ?? { sheetY: fallbackY, heightMV: fallbackHeight };
  const appStyle = useThemeStore((s) => s.appStyle);
  const isGlassy = appStyle === 'glassy';

  const [mounted, setMounted] = useState(false);
  const snapRef = useRef<'full' | 'half'>('full');
  const dragControls = useDragControls();

  useEffect(() => { setMounted(true); }, []);

  // Animate on open/close
  useEffect(() => {
    if (!mounted) return;
    const h = heightMV.get();
    if (!h) return;

    if (open) {
      const targetY = defaultSnap === 'half' ? h * SNAP_HALF : h * SNAP_FULL;
      snapRef.current = defaultSnap ?? 'full';
      animate(sheetY, targetY, SPRING);
    } else {
      animate(sheetY, h, SPRING);
    }
  }, [open, mounted, defaultSnap, sheetY, heightMV]);

  // Keyboard close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function snapTo(targetY: number, snap: 'full' | 'half') {
    snapRef.current = snap;
    animate(sheetY, targetY, SPRING);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const h = heightMV.get();
    const fullY = h * SNAP_FULL;
    const halfY = h * SNAP_HALF;
    const currentY = sheetY.get();
    const vy = info.velocity.y;

    // Velocity-based snap
    if (vy > 500) {
      if (snapRef.current === 'full') {
        snapTo(halfY, 'half');
      } else {
        animate(sheetY, h, SPRING);
        onClose();
      }
      return;
    }
    if (vy < -500) {
      snapTo(fullY, 'full');
      return;
    }

    // Position-based snap
    const midFullHalf = (fullY + halfY) / 2;
    const midHalfClosed = (halfY + h) / 2;

    if (currentY <= midFullHalf) {
      snapTo(fullY, 'full');
    } else if (currentY <= midHalfClosed) {
      snapTo(halfY, 'half');
    } else {
      animate(sheetY, h, SPRING);
      onClose();
    }
  }

  const backdropMax = isGlassy ? 0.38 : 0.55;
  const backdropOpacity = useTransform([sheetY, heightMV], ([y, h]: number[]) => {
    if (h === 0) return 0;
    const fullY = h * SNAP_FULL;
    if (y <= fullY) return backdropMax;
    if (y >= h) return 0;
    return backdropMax * (1 - (y - fullY) / (h - fullY));
  });

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        pointerEvents: open ? 'auto' : 'none',
      }}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Backdrop */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,1)',
          opacity: backdropOpacity,
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '100dvh',
          y: sheetY,
          background: isGlassy ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
          backdropFilter: isGlassy
            ? 'blur(var(--glass-blur, 22px)) saturate(var(--glass-saturation, 185%))'
            : undefined,
          WebkitBackdropFilter: isGlassy
            ? 'blur(var(--glass-blur, 22px)) saturate(var(--glass-saturation, 185%))'
            : undefined,
          borderRadius: '28px 28px 0 0',
          border: isGlassy ? '1px solid rgba(255,255,255,0.12)' : undefined,
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          willChange: 'transform',
          boxShadow: isGlassy
            ? '0 -12px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)'
            : '0 -12px 64px rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: heightMV.get() }}
        dragElastic={{ top: 0.08, bottom: 0.2 }}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle — only this area triggers drag */}
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            paddingTop: 14,
            paddingBottom: title ? 8 : 14,
            flexShrink: 0,
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 99,
              background: isGlassy ? 'rgba(255,255,255,0.30)' : 'var(--color-text-muted)',
              opacity: isGlassy ? 1 : 0.35,
              pointerEvents: 'none',
            }}
          />
          {title && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                pointerEvents: 'none',
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Scrollable content — does not trigger drag */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch' as never,
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
