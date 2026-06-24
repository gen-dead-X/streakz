import React from 'react';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design/icons';
import type { NotificationInstance } from 'antd/lib/notification/interface';

type Variant = 'success' | 'error' | 'info' | 'warning';

let _api: NotificationInstance | null = null;

export function setNotificationApi(api: NotificationInstance) {
  _api = api;
}

const VARIANT: Record<Variant, { color: string; Icon: React.ComponentType<{ style?: React.CSSProperties }> }> = {
  success: { color: '#22c55e', Icon: CheckCircleFilled },
  error:   { color: '#ef4444', Icon: CloseCircleFilled },
  warning: { color: '#eab308', Icon: ExclamationCircleFilled },
  info:    { color: '#3b82f6', Icon: InfoCircleFilled },
};

function isDark(): boolean {
  if (typeof document === 'undefined') return true;
  return document.documentElement.getAttribute('data-mode') !== 'light';
}

export function notify(message: string, variant: Variant = 'info') {
  if (!_api) return;

  const dark = isDark();
  const bg          = dark ? '#111111' : '#ffffff';
  const border      = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const shadow      = dark ? '0 8px 24px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.12)';
  const bodyColor   = dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)';
  const { color, Icon } = VARIANT[variant];

  _api.open({
    title: message,
    duration: 3,
    placement: 'top',
    icon: React.createElement(Icon, { style: { color, fontSize: 20 } }),
    style: {
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      boxShadow: shadow,
      padding: '14px 20px',
    },
    styles: {
      // antd defaults wrapper to alignItems:'flex-start' — override to center icon with title
      wrapper:     { alignItems: 'center' },
      title:       { color, fontSize: 14, fontWeight: 600, lineHeight: 1 },
      description: { color: bodyColor, fontSize: 13 },
      // center the absolutely-positioned close button relative to our custom padding
      close:       { top: '50%', transform: 'translateY(-50%)' },
      icon:        { display: 'flex', alignItems: 'center', lineHeight: 1 },
    },
  });
}
