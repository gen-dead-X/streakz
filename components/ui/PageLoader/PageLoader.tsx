'use client';
import Lottie from 'lottie-react';
import lottieData from '../../../public/lottie/Loading_Lottie.json';

interface PageLoaderProps {
  /** 'page' fills the main content area; 'section' is inline and smaller */
  variant?: 'page' | 'section';
  /** Override the Lottie animation size in px */
  size?: number;
}

export function PageLoader({ variant = 'page', size }: PageLoaderProps) {
  const lottieSize = size ?? (variant === 'page' ? 160 : 100);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: variant === 'page' ? 'calc(100dvh - 220px)' : 200,
        padding: variant === 'page' ? '40px 0' : '24px 0',
      }}
    >
      <div style={{ width: lottieSize, height: lottieSize, flexShrink: 0 }}>
        <Lottie animationData={lottieData} loop autoplay />
      </div>
    </div>
  );
}
