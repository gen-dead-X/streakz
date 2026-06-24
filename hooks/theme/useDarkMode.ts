import { useState, useEffect } from 'react';

export function useDarkMode(): boolean {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const read = () => document.documentElement.getAttribute('data-mode') !== 'light';
    setDark(read());
    const observer = new MutationObserver(() => setDark(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}
