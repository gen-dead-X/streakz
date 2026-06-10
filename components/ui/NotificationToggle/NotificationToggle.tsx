'use client';
import { Button, Tooltip } from 'antd';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/push/usePushNotifications';
import type { NotificationToggleProps } from './NotificationToggle.types';

export function NotificationToggle({ className }: NotificationToggleProps) {
  const { isSubscribed, isSupported, isLoading, toggle } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <Tooltip
      title={isSubscribed ? 'Disable daily reminders' : 'Enable daily reminders at 10 PM'}
      placement="right"
    >
      <Button
        className={className}
        icon={isSubscribed ? <BellOff size={16} /> : <Bell size={16} />}
        loading={isLoading}
        onClick={toggle}
        style={{
          background: isSubscribed ? 'var(--color-bg-elevated)' : 'var(--color-brand)',
          borderColor: isSubscribed ? 'var(--color-border-subtle)' : 'var(--color-brand)',
          color: isSubscribed ? 'var(--color-text-body)' : 'var(--color-bg-page)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {isSubscribed ? 'Reminders on' : 'Enable reminders'}
      </Button>
    </Tooltip>
  );
}
