import type { EnqueueSnackbar } from 'notistack';

let _enqueue: EnqueueSnackbar | null = null;

export function setEnqueueSnackbar(fn: EnqueueSnackbar) {
  _enqueue = fn;
}

export function notify(message: string, variant: 'success' | 'error' | 'info' = 'info') {
  _enqueue?.(message, { variant });
}
