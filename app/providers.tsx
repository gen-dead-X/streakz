'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { SnackbarProvider } from 'notistack';
import { antdTheme } from '@/lib/antd-theme';
import { SnackbarRegistrar } from '@/components/ui/SnackbarRegistrar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={antdTheme}>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <SnackbarRegistrar />
          {children}
        </SnackbarProvider>
      </ConfigProvider>
    </AntdRegistry>
  );
}
