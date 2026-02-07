// src/server/anim/selectCandidates.ts
const QUAD_PAT = /\b(ax\^?2|x\^?2|x\*\*2)\b|\\left\(x-[^)]+\)\\right\)\^?2|\\left\(x-[^)]+\)\\right\)\*\*2/i;
const TANGENT_PAT = /(接線|法線|tangent|f'|f\^\{|微分|導関数|接点)/i;
const INEQ_PAT = /(≤|>=|<|>|\\le|\\ge|不等式|inequal)/i;
const INEQ_2D_PAT = /(ax\+by|x\+y|半平面|half[-\s]?plane)/i;
const INTEGRAL_PAT = /(∫|\\int|リーマン|Riemann|区分求積|近似面積)/i;
const LOGEXP_PAT = /(\\log|\\ln|log\(|ln\(|exp\(|e\^)/i;
const SIN_COS_PAT = /(\\sin|\\cos|sin\(|cos\()/i;

export type CandidateResult = {
  candidates: string[]; // preset候補
  hints: Record<string, any>; // f, x0, a,b,n,mode など推定補助
};

/** summary/latex/topic から preset 候補を列挙（軽量ヒューリスティック） */
export function selectCandidates(input: { summary?: string; latex?: string; topic?: string }): CandidateResult {
  const s = [input.summary, input.latex, input.topic].filter(Boolean).join("\n");
  const lc = s.toLowerCase();

  const cands = new Set<string>();
  const hints: Record<string, any> = {};

  if (INTEGRAL_PAT.test(s)) {
    cands.add("riemann_sum_left_right_mid");
    hints.f = (SIN_COS_PAT.test(s) && "sin(x)") || (LOGEXP_PAT.test(s) && "exp(x)") || "x**2";
    hints.a = hints.a ?? 0;
    hints.b = hints.b ?? 3;
    hints.n = 6;
    hints.mode = "mid";
  }

  if (TANGENT_PAT.test(s)) {
    cands.add("tangent_at_point");
    hints.f = hints.f ?? ((SIN_COS_PAT.test(s) && "sin(x)") || (LOGEXP_PAT.test(s) && "exp(x)") || "x**2");
    hints.x0 = 1;
  }

  if (INEQ_PAT.test(s)) {
    // 1D or 2D を粗く切り分け
    if (INEQ_2D_PAT.test(s)) cands.add("inequality_conic_region");
    else cands.add("inequality_region_1d");
  }

  if (QUAD_PAT.test(s)) {
    cands.add("parabola_vertex_shift");
  }

  // デフォルト
  if (cands.size === 0) {
    cands.add("parabola_vertex_shift");
  }

  return { candidates: Array.from(cands), hints };
}
