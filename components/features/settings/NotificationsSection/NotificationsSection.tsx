'use client';
import { Switch, Typography } from 'antd';
import { Bell } from 'lucide-react';
import { usePushNotifications } from '@/hooks/push/usePushNotifications';

const { Text } = Typography;

export function NotificationsSection() {
  const { isSubscribed, isSupported, isLoading, toggle } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <div>
      <p
        style={{
          fontSize: 11,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 16px',
        }}
      >
        Notifications
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 0',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <div>
            <Text style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-heading)', display: 'block' }}>
              Daily reminders
            </Text>
            <Text style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Get a push notification at 10 PM
            </Text>
          </div>
        </div>
        <Switch
          checked={isSubscribed}
          loading={isLoading}
          onChange={() => toggle()}
        />
      </div>
    </div>
  );
}
