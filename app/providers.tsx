'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { antdTheme } from '@/lib/antd-theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </AntdRegistry>
  );
}
