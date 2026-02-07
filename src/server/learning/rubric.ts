import type { VerifyType } from '@/server/verify/registry';
const VERIFY_BASE = process.env.VERIFY_BASE_URL ?? 'http://127.0.0.1:8081';

// --- helpers ---
async function diagnoseDerivative(funcLatex: string, userLatex: string, variable='x') {
  const r = await fetch(`${VERIFY_BASE}/diagnose_derivative`, {
    method: 'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ func_latex: funcLatex, user_latex: userLatex, variable })
  });
  return await r.json().catch(()=> ({}));
}
async function diagnoseRoots(equation: string, varName='x', userSolutions: string[]) {
  const r = await fetch(`${VERIFY_BASE}/diagnose_roots`, {
    method: 'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ equation, var: varName, user_solutions: userSolutions })
  });
  return await r.json().catch(()=> ({}));
}
export async function gradeSteps(
  steps: Array<{src:string;dst:string;kind?:string;var?:string}>,
  vars: string[] = ['x'],
  assumptions?: string[],
) {
  const r = await fetch(`${VERIFY_BASE}/grade_steps`, {
    method: 'POST', headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ steps, vars, assumptions }),
  });
  return await r.json().catch(() => ({}));
}

// ユーザー値から final/steps/配列を抜く
function extractFinalAndSteps(userValue: any): { final?: string, steps?: any[], arr?: string[] } {
  if (Array.isArray(userValue)) return { arr: userValue };
  if (userValue && typeof userValue === 'object') {
    const final = typeof userValue.final === 'string' ? userValue.final : undefined;
    const steps = Array.isArray(userValue.steps) ? userValue.steps : undefined;
    const arr = Array.isArray(userValue.final) ? userValue.final : undefined;
    return { final, steps, arr };
  }
  if (typeof userValue === 'string') {
    const s = userValue.trim();
    if (s.startsWith('{')) { try { return extractFinalAndSteps(JSON.parse(s)); } catch { return { final: s }; } }
    if (s.includes(',')) return { final: s, arr: s.split(',').map(t=>t.trim()).filter(Boolean) };
    return { final: s };
  }
  return {};
}

/** 部分点ロジック（steps 明細付きで返す） */
export async function partialCreditFor(
  r: { type: VerifyType|null; payload:any; result:any; id:string },
  userValue: any
): Promise<{ delta: number; note?: string; stepsDetail?: any[] }> {

  const { final, steps, arr } = extractFinalAndSteps(userValue);

  let delta = 0;
  const notes: string[] = [];
  let stepsDetail: any[] | undefined;

  // 1) derivative：符号/係数不足 → +0.5（あっても後続の steps を実行する）
  if (r.type === 'derivative' && r.payload?.func_latex && typeof (final ?? '') === 'string') {
    const diag = await diagnoseDerivative(r.payload.func_latex, final as string, r.payload.variable ?? 'x');
    if (diag?.kind === 'sign_error')     { delta += 0.5; notes.push('符号のみ誤り（±のミス）'); }
    if (diag?.kind === 'missing_factor') { delta += 0.5; notes.push('係数が不足（チェーンの係数など）'); }
  }

  // 2) roots：集合が一部正しい → +0.5
  if (r.type === 'roots' && r.payload?.equation) {
    const userArr =
      arr ??
      (Array.isArray((userValue?.final)) ? userValue.final :
        (typeof final === 'string' && final.includes(',') ? final.split(',').map(s=>s.trim()).filter(Boolean) :
          (typeof final === 'string' && final ? [final] : [])));
    const dr = await diagnoseRoots(r.payload.equation, r.payload.var ?? 'x', userArr);
    const miss = dr?.missing?.length ?? 0, extra = dr?.extra?.length ?? 0;
    if (miss > 0 || extra > 0) { delta += 0.5; notes.push('一部の根は合っている（集合が不完全）'); }
  }

  // 3) steps：score×0.5 を加点（最大 +0.5）＋ 明細を返す
  try {
    if (steps && steps.length > 0) {
      const vars = (r as any)?.payload?.vars ?? ['x'];
      const assumptions = Array.isArray((userValue as any)?.assumptions) ? (userValue as any).assumptions : undefined;
      const res = await gradeSteps(
        steps.map((s:any)=>({
          src:  s.src ?? s.from ?? s.lhs ?? '',
          dst:  s.dst ?? s.to   ?? s.rhs ?? '',
          kind: s.kind,
          var:  s.var,
        })),
        vars,
        assumptions
      );
      if (res?.ok && typeof res?.score === 'number') {
        const add = Math.max(0, Math.min(0.5, 0.5 * res.score));
        delta += add;
        stepsDetail = res.items ?? [];
      }
    }
  } catch {
    // noop
  }

  // 必要なら per-item 上限 1.0 に丸めたい場合はここで clamp
  // delta = Math.min(0.9999, delta);

  return { delta, note: notes.join(' / ') || undefined, stepsDetail };
}

