// src/server/verify/client.ts
const VERIFY_BASE =
  process.env.VERIFY_BASE_URL ||
  process.env.VERIFY_ENDPOINT || // backward compat
  'http://127.0.0.1:8081';

type Json<T=any> = { ok: boolean; data?: T; error?: string };

// 呼び出し側との互換のための型（必要十分な union）
export type VerifyType =
  | 'equation' | 'derivative' | 'integral' | 'roots' | 'system'
  | 'inequality' | 'limit' | 'series' | 'numeric_compare'
  | 'sequence_term' | 'sum' | 'integer_identity'
  | 'complex_identity' | 'congruence'
  | 'matrix_equal' | 'determinant'
  | 'vector_equal' | 'vector_dot' | 'vector_cross'
  | 'vector_magnitude' | 'vector_angle'
  | 'vector_orthogonal' | 'vector_parallel'
  | 'line_equal' | 'line_slope' | 'circle_features' | 'parabola_features'
  | 'inequality_set' | 'solutions_interval' | 'function_transform';

  export async function callVerify(vtype: VerifyType, payload: any, opts?: { timeoutMs?: number }) {
    const r = await post<{ ok:boolean; results:any[] }>('/verify_batch', { items:[{type:vtype, payload}] }, opts);
    if (!r.ok) return { ok:false, error:r.error };
    const first = (r.data?.results ?? [])[0] ?? { ok:false, error:'no_result' };
    return { ok: !!first.ok, data: first };
  }

  export async function callVerifyBatch(items: Array<{ type: VerifyType; payload: any }>, opts?: { timeoutMs?: number }) {
    const r = await post<{ ok:boolean; results:any[] }>('/verify_batch', { items }, opts);
    if (!r.ok) return { ok:false, error:r.error };
    let results = r.data?.results ?? [];
    if (!Array.isArray(results) || results.length !== items.length) {
      // フォールバック（順次叩く）
      const seq: any[] = [];
      for (const it of items) {
        const one = await post<{ ok:boolean; results:any[] }>('/verify_batch', { items:[it] }, opts);
        seq.push((one.data?.results ?? [])[0] ?? { ok:false, error:'no_result' });
      }
      results = seq;
    }
    return { ok:true, data:{ results } };
  }


async function post<T>(path: string, payload: any, opts?: { timeoutMs?: number }): Promise<Json<T>> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts?.timeoutMs ?? 10_000);
  try {
    const r = await fetch(`${VERIFY_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      cache: 'no-store',
    });
    const data = await r.json().catch(()=> ({}));
    if (!r.ok) return { ok:false, error: data?.error || `HTTP ${r.status}` };
    return { ok: true, data: data as T };
  } catch (e:any) {
    return { ok:false, error: String(e?.message || e) };
  } finally {
    clearTimeout(t);
  }
}

export async function verifyEquation(lhsLatex: string, rhsLatex: string) {
  const r = await post<{ ok:boolean }>('/verify_equation', { lhs_latex: lhsLatex, rhs_latex: rhsLatex });
  return !!r.data?.ok;
}
export async function differentiate(exprLatex: string, variable = 'x') {
  const r = await post<{ result_latex:string }>('/differentiate', { expr_latex: exprLatex, variable });
  return r.data?.result_latex ?? '';
}
export async function solveEq(eqLatex: string, variable = 'x') {
  const r = await post<{ solutions_latex:string[] }>('/solve', { equation_latex: eqLatex, variable });
  return r.data?.solutions_latex ?? [];
}
export async function verifyDerivative(funcLatex: string, variable = 'x', expectedLatex: string) {
  const r = await post<{ ok:boolean }>('/verify_derivative', { func_latex: funcLatex, variable, expected_latex: expectedLatex });
  return !!r.data?.ok;
}
export async function verifyRoots(equation: string, variable: string, solutions: string[]) {
  const r = await post<{ ok:boolean }>('/verify_roots', { equation, var: variable, solutions });
  return !!r.data?.ok;
}
export async function verifyIntegral(integrand: string, variable: string, expected: string) {
  const r = await post<{ ok:boolean }>('/verify_integral', { integrand, var: variable, expected });
  return !!r.data?.ok;
}
export async function verifySystem(equations: string[], vars: string[], solution: string[], tol = 1e-6) {
  const r = await post<{ ok:boolean }>('/verify_system', { equations, vars, solution, tol });
  return !!r.data?.ok;
}
export const __VERIFY_BASE = VERIFY_BASE; // debug用

export async function verifyHealth() {
  const r = await post<any>('/health', {});
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, data: r.data };
}
