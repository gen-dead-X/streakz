'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/push/usePushNotifications';

const DISMISSED_KEY = 'push_prompt_dismissed';

export function PushPermissionBanner() {
  const [visible, setVisible] = useState(false);
  const { isSupported, isSubscribed, toggle } = usePushNotifications();

  useEffect(() => {
    if (!isSupported) return;
    if (isSubscribed) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return;

    // Small delay so the page settles before the banner slides in
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [isSupported, isSubscribed]);

  function handleAllow() {
    setVisible(false);
    // toggle() internally calls Notification.requestPermission() then subscribes
    toggle();
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          // Mobile: sits above BottomNav (72px tall). Desktop: bottom-right corner.
          // bottom-[84px] = BottomNav height (72) + gap (12)
          className="fixed z-50 left-4 right-4 bottom-[84px] md:left-auto md:right-6 md:bottom-6 md:w-80"
        >
          <div
            style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 20,
              padding: '14px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Bell icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgb(var(--brand-rgb) / 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bell size={18} style={{ color: 'var(--color-brand)' }} />
            </div>

            {/* Label */}
            <p
              style={{
                flex: 1,
                margin: 0,
                fontSize: 13,
                color: 'var(--color-text-body)',
                lineHeight: 1.4,
              }}
            >
              Get daily habit reminders?
            </p>

            {/* Allow */}
            <button
              onClick={handleAllow}
              style={{
                background: 'var(--color-brand)',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 8,
                color: 'var(--color-bg-page)',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              Allow
            </button>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                flexShrink: 0,
                lineHeight: 0,
              }}
            >
              <X size={16} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
