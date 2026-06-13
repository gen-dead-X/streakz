'use client';
import { useEffect } from 'react';
import { playSound } from '@/lib/audio/playSound';

export function NotificationTonePlayer() {
  useEffect(() => {
    if (!navigator.serviceWorker) return;

    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'PLAY_NOTIFICATION_TONE') {
        playSound('/music/notification-tone.wav');
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);

  return null;
}
