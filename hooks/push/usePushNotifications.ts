'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'push_subscribed';

export function usePushNotifications() {
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    // Fast path: check localStorage before querying the SW
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setIsSubscribed(true);

    // Verify actual SW subscription state
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      const active = !!sub;
      setIsSubscribed(active);
      localStorage.setItem(STORAGE_KEY, String(active));
    }).catch(() => null);
  }, [isSupported]);

  async function toggle() {
    if (!isSupported) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');

      if (isSubscribed) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
        }
        setIsSubscribed(false);
        localStorage.setItem(STORAGE_KEY, 'false');
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });

        const json = sub.toJSON();
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' },
          }),
        });
        setIsSubscribed(true);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { isSubscribed, isSupported, isLoading, toggle };
}
