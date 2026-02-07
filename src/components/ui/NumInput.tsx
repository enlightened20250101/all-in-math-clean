// src/components/ui/NumInput.tsx
'use client';
import { useState } from 'react';

/** smart numeric input (fraction-friendly) */
function parseSmart(s: string): number | null {
  s = s.trim();
  if (!s) return null;
  if (/^[+-]?\d+\/\d+$/.test(s)) {
    const [n, d] = s.split('/').map(Number);
    if (d === 0) return null;
    return n / d;
  }
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}
function fractionString(x: number): string {
  const sign = Math.sign(x);
  x = Math.abs(x);
  let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
  for (let i = 0; i < 20; i++) {
    const a = Math.floor(b);
    const h2 = a*h1 + h0, k2 = a*k1 + k0;
    h0 = h1; h1 = h2; k0 = k1; k1 = k2;
    const frac = b - a;
    if (frac < 1e-12) break;
    b = 1/frac;
  }
  let n = sign*h1, d = k1;
  if (d < 0) { n = -n; d = -d; }
  const g = (a: number, b: number): number => (b ? g(b, a % b) : Math.abs(a) || 1);
  const G = g(Math.trunc(Math.abs(n)), Math.trunc(Math.abs(d)));
  n = Math.trunc(n/G); d = Math.trunc(d/G);
  return d === 1 ? String(n) : `${n}/${d}`;
}
export default function NumInput({ value, onChange, placeholder, step=0.1, className }:{ value:number; onChange:(v:number)=>void; placeholder?:string; step?:number; className?:string; }){
  const [isEditing, setIsEditing] = useState(false);
  const [s, setS] = useState<string>(fractionString(value));
  const displayValue = isEditing ? s : fractionString(value);
  const commit = ()=>{ const v=parseSmart(s); if(v!==null) onChange(v); };
  const bump = (delta:number)=>{
    const cur = parseSmart(s);
    const base = cur===null ? value : cur;
    const next = Math.round((base + delta) * 1e8) / 1e8;
    setS(fractionString(next));
    onChange(next);
  };
  const stepWithModifiers = (e: React.KeyboardEvent<HTMLInputElement>) => (e.shiftKey ? step*10 : e.altKey ? step/10 : step);
  return (
    <input
      inputMode="decimal"
      className={className ?? 'w-full rounded-xl border p-2'}
      value={displayValue}
      placeholder={placeholder}
      onFocus={()=>{
        setIsEditing(true);
        setS(fractionString(value));
      }}
      onBlur={()=>{ setIsEditing(false); commit(); }}
      onChange={(e)=> setS(e.target.value)}
      onKeyDown={(e)=>{
        if(e.key==='Enter'){ setIsEditing(false); commit(); }
        else if(e.key==='ArrowUp'){ e.preventDefault(); bump(stepWithModifiers(e)); }
        else if(e.key==='ArrowDown'){ e.preventDefault(); bump(-stepWithModifiers(e)); }
      }}
    />
  );
}
