// src/server/anim/sanitize.ts
import { VizSpec } from "@/lib/vizSpec";

const ALLOWED_TYPES = new Set([
  "grid","axes","point","line","segment","circle","vector","text","curve","polygon","region"
]);

const FX_SAFE = /^[0-9x+\-*/().\s^]*$|^(sin|cos|tan|exp|log|sqrt|abs|PI|E|x|\d|\s|\+|\-|\*|\/|\(|\)|\.)+$/i;

export function sanitizeVizSpec(spec: VizSpec, opts?: { maxObjects?: number }): VizSpec {
  const out: VizSpec = JSON.parse(JSON.stringify(spec));
  const maxObjs = Math.min(Math.max(opts?.maxObjects ?? 32, 0), 64);

  // bbox クランプ
  if (out.bbox && out.bbox.length === 4) {
    const [x1,y1,x2,y2] = out.bbox;
    const clamp = (n:number)=> Math.max(-1e6, Math.min(1e6, n));
    out.bbox = [clamp(x1), clamp(y1), clamp(x2), clamp(y2)];
  }

  // objects フィルタ
  if (Array.isArray(out.objects)) {
    const filtered = [];
    for (const o of out.objects) {
      if (!o || typeof o !== "object") continue;
      if (!ALLOWED_TYPES.has(o.type)) continue;

      // curve.fx の簡易チェック
      if (o.type === "curve" && typeof o.fx === "string") {
        const ok = FX_SAFE.test(o.fx);
        if (!ok) continue;
      }
      // line.expr の簡易チェック
      if (o.type === "line" && typeof o.expr === "string") {
        const ok = /^y\s*=\s*[-0-9x+*().\s]+$|^x\s*=\s*[-0-9.]+$/.test(o.expr);
        if (!ok) continue;
      }
      filtered.push(o);
      if (filtered.length >= maxObjs) break;
    }
    out.objects = filtered;
  }

  // steps は最大数制限
  if (Array.isArray(out.steps) && out.steps.length > 12) {
    out.steps = out.steps.slice(0, 12);
  }

  return out;
}
