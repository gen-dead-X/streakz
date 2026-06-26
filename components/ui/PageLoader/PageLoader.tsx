'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import lottieData from '../../../public/lottie/Loading_Lottie.json';

interface PageLoaderProps {
  /** 'page' fills the content area with bg + brand; 'section' is inline without bg */
  variant?: 'page' | 'section';
  /** Override the Lottie animation size in px */
  size?: number;
}

export function PageLoader({ variant = 'page', size }: PageLoaderProps) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const read = () =>
      document.documentElement.getAttribute('data-mode') !== 'light';
    setDark(read());

    const observer = new MutationObserver(() => setDark(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode'],
    });
    return () => observer.disconnect();
  }, []);

  const isPage = variant === 'page';
  const lottieSize = size ?? (isPage ? 320 : 140);
  const bg = dark ? '#0d0d0d' : '#f5f5f5';
  const textColor = dark ? '#ffffff' : '#0a0a0a';
  const marginTop = isPage ? -48 : -32;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: isPage ? 'calc(100dvh - 180px)' : 200,
        background: isPage ? bg : 'transparent',
        borderRadius: isPage ? 20 : 0,
      }}
    >
      {/* Same spring scale animation as the SplashScreen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: lottieSize,
          height: lottieSize,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Lottie animationData={lottieData} loop autoplay />
        {isPage && (
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: textColor,
              marginTop,
              fontFamily: 'var(--font-family-sans)',
              userSelect: 'none',
            }}
          >
            StreakZ
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
