'use client';
import dynamic from 'next/dynamic';

// Client component shell so we can use ssr: false in a Server Component tree.
// This code-splits lottie-react out of the synchronous app bundle.
const SplashScreen = dynamic(
  () => import('./SplashScreen').then((m) => ({ default: m.SplashScreen })),
  { ssr: false },
);

export function SplashScreenLoader() {
  return <SplashScreen />;
}
