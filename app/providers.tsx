'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { SnackbarRegistrar } from '@/components/ui/SnackbarRegistrar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ThemeProvider>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <SnackbarRegistrar />
          {children}
        </SnackbarProvider>
      </ThemeProvider>
    </AntdRegistry>
  );
}
