// src/components/animations/_shared/useRafAnim.ts
'use client';
import { useEffect, useRef } from 'react';

type AnimState = { anim: boolean; speed: number; t: number };
type SetS<T> = (updater: (prev: T) => T) => void;

/** speed=1 で 0.25周/秒（係数は必要に応じて変えてOK） */
export function useRafAnim<S extends AnimState>(state: S, setS: SetS<S>, hz = 0.25) {
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!state.anim) { if (raf.current) cancelAnimationFrame(raf.current); raf.current = null; last.current = null; return; }
    const loop = (ts: number) => {
      if (last.current == null) last.current = ts;
      const dt = (ts - last.current) / 1000;
      last.current = ts;
      setS(prev => ({ ...prev, t: (prev.t + prev.speed * hz * dt) % 1 }));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); raf.current = null; last.current = null; };
  }, [state.anim, state.speed, hz, setS]);
}
