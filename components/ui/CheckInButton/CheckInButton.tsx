'use client';
import { Button } from 'antd';
import { CheckOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { CheckInButtonProps } from './CheckInButton.types';

export function CheckInButton({ checked, loading = false, onClick }: CheckInButtonProps) {
  return (
    <Button
      shape="circle"
      size="large"
      onClick={onClick}
      disabled={loading}
      icon={
        loading ? (
          <LoadingOutlined style={{ fontSize: 18 }} />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={checked ? 'checked' : 'unchecked'}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {checked ? (
                <CheckOutlined style={{ fontSize: 18 }} />
              ) : (
                <PlusOutlined style={{ fontSize: 18 }} />
              )}
            </motion.span>
          </AnimatePresence>
        )
      }
      style={{
        width: 44,
        height: 44,
        flexShrink: 0,
        background: checked ? 'var(--color-brand)' : 'transparent',
        borderColor: checked ? 'var(--color-brand)' : 'var(--color-border-subtle)',
        color: checked ? 'var(--color-bg-page)' : 'var(--color-text-muted)',
        transition: 'all 0.2s ease',
      }}
    />
  );
}
