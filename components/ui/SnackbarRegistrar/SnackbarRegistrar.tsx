'use client';
import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { setEnqueueSnackbar } from '@/lib/snackbar';

export function SnackbarRegistrar() {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    setEnqueueSnackbar(enqueueSnackbar);
  }, [enqueueSnackbar]);
  return null;
}
