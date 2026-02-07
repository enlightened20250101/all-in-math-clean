// src/hooks/useNarration.ts
'use client';
import { useCallback } from 'react';
export function useNarration(enabled: boolean) {
  const speak = useCallback((text: string) => {
    if (!enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const jp = speechSynthesis.getVoices().find(v => v.lang?.startsWith('ja'));
      if (jp) u.voice = jp;
      u.rate = 1.0;
      speechSynthesis.speak(u);
    } catch {}
  }, [enabled]);
  return { speak };
}
