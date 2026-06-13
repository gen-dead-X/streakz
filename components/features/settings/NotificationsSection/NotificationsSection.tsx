'use client';
import { useState } from 'react';
import { Switch, Typography } from 'antd';
import { Bell, Send } from 'lucide-react';
import { usePushNotifications } from '@/hooks/push/usePushNotifications';

const { Text } = Typography;

type TestState = 'idle' | 'sending' | 'sent' | 'error';

export function NotificationsSection() {
  const { isSubscribed, isSupported, isLoading, toggle } = usePushNotifications();
  const [testState, setTestState] = useState<TestState>('idle');

  if (!isSupported) return null;

  async function sendTest() {
    setTestState('sending');
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      setTestState(res.ok ? 'sent' : 'error');
    } catch {
      setTestState('error');
    }
    setTimeout(() => setTestState('idle'), 3000);
  }

  const testLabel =
    testState === 'sending' ? 'Sending…' :
    testState === 'sent'    ? 'Sent!' :
    testState === 'error'   ? 'Failed' :
    'Send test';

  const testColor =
    testState === 'sent'  ? 'var(--color-success)' :
    testState === 'error' ? 'var(--color-error)'   :
    'var(--color-text-muted)';

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

      {/* Daily reminders row */}
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

      {/* Test notification row — only visible when subscribed */}
      {isSubscribed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--color-bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Send size={16} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <Text style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-heading)', display: 'block' }}>
                Test notification
              </Text>
              <Text style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Send a test push to this device
              </Text>
            </div>
          </div>
          <button
            onClick={sendTest}
            disabled={testState === 'sending'}
            style={{
              padding: '7px 16px',
              borderRadius: 99,
              border: '1.5px solid var(--color-bg-elevated)',
              background: 'transparent',
              cursor: testState === 'sending' ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: testColor,
              transition: 'color 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {testLabel}
          </button>
        </div>
      )}
    </div>
  );
}
