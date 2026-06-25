'use client';

import { App } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { NotificationRegistrar } from '@/components/ui/NotificationRegistrar';
import { BottomSheetProvider } from '@/components/ui/BottomSheet';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ThemeProvider>
        <App>
          <NotificationRegistrar />
          <BottomSheetProvider>
            {children}
          </BottomSheetProvider>
        </App>
      </ThemeProvider>
    </AntdRegistry>
  );
}
