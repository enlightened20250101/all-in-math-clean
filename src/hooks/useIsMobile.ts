// src/hooks/useIsMobile.ts
'use client';

import { useEffect, useState } from 'react';

/**
 * ビューポート幅に基づくシンプルなモバイル判定フック
 * 例: const isMobile = useIsMobile(); // < 768px なら true
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoint]);

  return isMobile;
}
