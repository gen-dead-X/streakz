'use client';
import { Button } from 'antd';
import { CheckOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
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
        ) : checked ? (
          <CheckOutlined style={{ fontSize: 18 }} />
        ) : (
          <PlusOutlined style={{ fontSize: 18 }} />
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
