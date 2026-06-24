'use client';

import { App } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { NotificationRegistrar } from '@/components/ui/NotificationRegistrar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ThemeProvider>
        <App>
          <NotificationRegistrar />
          {children}
        </App>
      </ThemeProvider>
    </AntdRegistry>
  );
}
