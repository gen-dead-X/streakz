'use client';
import { useEffect } from 'react';
import { App } from 'antd';
import { setNotificationApi } from '@/lib/snackbar';

export function NotificationRegistrar() {
  const { notification } = App.useApp();
  useEffect(() => {
    setNotificationApi(notification);
  }, [notification]);
  return null;
}
