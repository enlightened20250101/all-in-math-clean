// src/lib/sanitize-on-submit.ts
import { sanitizeTex } from '@/lib/tex';

/** 送信前の最終フィルタ。オブジェクト内の全ての string を sanitize します。 */
export function sanitizeOnSubmit<T>(payload: T): T {
  const walk = (val: any): any => {
    if (val == null) return val;
    if (typeof val === 'string') return sanitizeTex(val);
    if (Array.isArray(val)) return val.map(walk);
    if (typeof val === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(val)) out[k] = walk(v);
      return out;
    }
    return val;
  };
  return walk(payload);
}
