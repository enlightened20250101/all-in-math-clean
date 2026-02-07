// src/server/verify/registry.ts
import { z } from 'zod';
import { MachineCheckSchema } from '@/lib/zod-schemas';
import {
  verifyEquation,
  verifyDerivative,
  verifyRoots,
  verifyIntegral,
  verifySystem,
} from '@/server/verify/client';
import { numericCompare } from '@/server/verify/numeric';

export type VerifyType =
  | 'derivative' | 'integral' | 'equation' | 'roots' | 'system'
  | 'inequality' | 'limit' | 'series' | 'numeric_compare'
  | 'sequence_term' | 'sum' | 'integer_identity'
  | 'complex_identity' | 'congruence' | 'matrix_equal' | 'determinant'
  | 'vector_equal' | 'vector_dot' | 'vector_cross' | 'vector_magnitude'
  | 'vector_angle' | 'vector_orthogonal' | 'vector_parallel'
  | 'line_equal' | 'line_slope' | 'circle_features' | 'parabola_features'
  | 'solutions_interval' | 'inequality_set' | 'function_transform';

/**
 * skillId → VerifyType
 * - 小文字化して判定
 * - 拾えないものは 'equation' にフォールバック（「保留」を減らす）
 */
export function skillToVerifyType(skillId?: string): VerifyType | null {
  const id = (skillId ?? '').toLowerCase().trim();
  if (!id) return 'equation';

  // 微分・積分
  if (id.startsWith('diff.')) return 'derivative';
  if (id.startsWith('int.'))  return 'integral';

  // 方程式・連立
  if (id.startsWith('equation.system'))            return 'system';
  if (id.startsWith('equation.identity'))          return 'equation';
  if (id.startsWith('equation.linear'))            return 'equation';
  if (id.startsWith('equation'))                   return 'equation';

  // 根
  if (id.startsWith('roots.'))                     return 'roots';

  // 不等式・極限・テイラー
  if (id.startsWith('ineq.') || id.startsWith('inequality')) return 'inequality';
  if (id.startsWith('limit.'))                   return 'limit';
  if (id.startsWith('series.'))                  return 'series';

  // 数列・Σ・整数恒等式
  if (id.startsWith('seq.term'))                  return 'sequence_term';
  if (id.startsWith('sum.'))                      return 'sum';
  if (id.startsWith('comb.') || id.startsWith('integer.identity')) return 'integer_identity';

  // 複素・合同・行列
  if (id.startsWith('complex.'))                  return 'complex_identity';
  if (id.startsWith('cong.') || id.includes('congruence')) return 'congruence';
  if (id.startsWith('matrix.eq'))                 return 'matrix_equal';
  if (id.startsWith('matrix.det'))                return 'determinant';

  // ベクトル
  if (id.startsWith('vec.eq'))    return 'vector_equal';
  if (id.startsWith('vec.dot'))   return 'vector_dot';
  if (id.startsWith('vec.cross')) return 'vector_cross';
  if (id.startsWith('vec.mag'))   return 'vector_magnitude';
  if (id.startsWith('vec.ang'))   return 'vector_angle';
  if (id.startsWith('vec.orth'))  return 'vector_orthogonal';
  if (id.startsWith('vec.par'))   return 'vector_parallel';

  // 幾何
  if (id.startsWith('geo.line.eq'))    return 'line_equal';
  if (id.startsWith('geo.line.slope')) return 'line_slope';
  if (id.startsWith('geo.circle'))     return 'circle_features';
  if (id.startsWith('geo.parabola'))   return 'parabola_features';

  // 解（区間）/ 解集合 / 変換
  if (id.startsWith('trig.solutions') || id.startsWith('abs.eq') || id.startsWith('solve.interval'))
    return 'solutions_interval';
  if (id.startsWith('ineq.set'))       return 'inequality_set';
  if (id.startsWith('func.transform')) return 'function_transform';

  // フォールバック（unknown → equation）
  return 'equation';
}

/* ----------------- 機械採点（math-verify 直接） ----------------- */

type Checker = (mc: z.infer<typeof MachineCheckSchema>) => Promise<boolean>;

// lhs=rhs → (lhs)-(rhs) へ正規化。= が無ければ expr とみなす
function toExprZero(equation: string): string {
  const eq = (equation || '').replace('==', '=').trim();
  if (eq.includes('=')) {
    const [lhsRaw, rhsRaw] = eq.split('=', 2);
    const lhs = (lhsRaw ?? '').trim();
    const rhs = (rhsRaw ?? '').trim();
    return `(${lhs})-(${rhs})`;
  }
  return `(${eq})`;
}

// x → (s) を安全目に置換（関数名等の誤爆を減らす簡易版）
function substituteVar(expr: string, v: string, s: string): string {
  const re = new RegExp(`\\b${v}\\b`, 'g');
  return expr.replace(re, `(${s})`);
}

export const checkers: Record<string, Checker> = {
  derivative: async (mc: any) => verifyDerivative(mc.expr, mc.var, mc.expected),

  integral: async (mc: any) => {
    try {
      const ok = await verifyIntegral(mc.integrand, mc.var ?? 'x', mc.expected);
      if (ok) return true;
    } catch {}
    const diffExpr = `diff(${mc.expected}, ${mc.var ?? 'x'})`;
    return numericCompare({ lhs: diffExpr, rhs: mc.integrand, var: mc.var ?? 'x' });
  },

  equation: async (mc: any) => {
    try {
      const ok = await verifyEquation(mc.lhs, mc.rhs);
      if (ok) return true;
    } catch {}
    return numericCompare({ lhs: mc.lhs, rhs: mc.rhs, var: mc.var ?? 'x' });
  },

  roots: async (mc: any) => {
    try {
      const ok = await verifyRoots(mc.equation, mc.var ?? 'x', mc.solutions);
      if (ok) return true;
    } catch {}
    // 数値保険：各解 s について f(s) ≈ 0
    const v = mc.var ?? 'x';
    const expr0 = toExprZero(mc.equation);
    const checks = (mc.solutions as string[]).map((s: string) => {
      const exprAtS = substituteVar(expr0, v, s);
      return numericCompare({ lhs: exprAtS, rhs: '0', var: v });
    });
    const all = await Promise.all(checks);
    return all.every(Boolean);
  },

  // 2元一次連立（roots_system）
  roots_system: async (mc: any) => {
    try {
      const ok = await verifySystem(mc.equations, mc.vars, mc.solution);
      if (ok) return true;
    } catch {}
    // 数値保険：各式(expr==0)を解代入で 0 比較
    const subsMap = (expr: string, vars: string[], sol: string[]) => {
      let e = (expr || '').replace('==', '=').trim();
      if (e.includes('=')) {
        const [lhsRaw, rhsRaw] = e.split('=', 2);
        const lhs = (lhsRaw ?? '').trim();
        const rhs = (rhsRaw ?? '').trim();
        e = `(${lhs})-(${rhs})`;
      }
      vars.forEach((v, i) => { e = substituteVar(e, v, sol[i]); });
      return e;
    };
    const all = await Promise.all(
      (mc.equations as string[]).map((eq: string) =>
        numericCompare({ lhs: subsMap(eq, mc.vars, mc.solution), rhs: '0', var: mc.vars[0] })
      )
    );
    return all.every(Boolean);
  },
};

export async function runCheck(mc: any): Promise<boolean> {
  const parsed = MachineCheckSchema.parse(mc);
  const fn = checkers[parsed.type];
  if (fn) {
    try {
      const ok = await fn(parsed);
      if (ok) return true;
    } catch {}
  }
  // 最終保険（lhs/rhs があれば数値比較）
  if ((parsed as any).lhs && (parsed as any).rhs) {
    return numericCompare({
      lhs: (parsed as any).lhs,
      rhs: (parsed as any).rhs,
      var: (parsed as any).var ?? 'x',
    });
  }
  return false;
}

/* ----------------- payload ビルダー ----------------- */

/**
 * item / userAnswer → math-verify の payload 生成。
 * 優先順位: item.problem.* → item.* → userAnswer
 */
export function buildVerifyPayload(skillId: string, item: any, userAnswer: any): any {
  const id = (skillId ?? '').toLowerCase();
  const ans = (v: any) => (typeof v === 'object' && v !== null ? (v.latex ?? v.text ?? '') : v);

  // derivative
  if (id.startsWith('diff.')) return {
    func_latex: item?.problem?.funcLatex ?? item?.funcLatex ?? item?.func ?? '',
    variable:   item?.problem?.variable  ?? item?.variable  ?? 'x',
    expected_latex: ans(userAnswer),
  };

  // integral
  if (id.startsWith('int.')) return {
    integrand: item?.problem?.integrand ?? item?.integrand ?? '',
    var:       item?.problem?.variable  ?? item?.variable  ?? 'x',
    expected:  ans(userAnswer),
  };

  // equation
  if (id.startsWith('equation')) return {
    lhs_latex: item?.problem?.lhs ?? item?.lhs ?? '',
    rhs_latex: ans(userAnswer),
  };

  // system
  if (id.startsWith('equation.system')) return {
    equations: item?.problem?.equations ?? item?.equations ?? [],
    vars:      item?.problem?.vars      ?? item?.vars      ?? [],
    solution:  Array.isArray(userAnswer) ? userAnswer.map(ans) : [ans(userAnswer)],
  };

  // roots
  if (id.startsWith('roots.')) return {
    equation: item?.problem?.equation ?? item?.equation ?? '',
    var:      item?.problem?.variable ?? item?.variable ?? 'x',
    solutions: Array.isArray(userAnswer) ? userAnswer.map(ans) : [ans(userAnswer)],
  };

  // inequality / limit / series
  if (id.startsWith('ineq.')) return {
    expr:     item?.problem?.expr     ?? item?.expr     ?? '',
    var:      item?.problem?.variable ?? item?.variable ?? 'x',
    domain:   item?.problem?.domain   ?? [-5, 5],
    samples:  item?.problem?.samples  ?? 7,
  };
  if (id.startsWith('limit.')) return {
    expr:     item?.problem?.expr     ?? item?.expr     ?? '',
    var:      item?.problem?.variable ?? item?.variable ?? 'x',
    at:       item?.problem?.at       ?? '0',
    dir:      item?.problem?.dir      ?? 'both',
    expected: ans(userAnswer),
  };
  if (id.startsWith('series.')) return {
    expr:     item?.problem?.expr     ?? item?.expr     ?? '',
    var:      item?.problem?.variable ?? item?.variable ?? 'x',
    center:   item?.problem?.center   ?? '0',
    order:    item?.problem?.order    ?? 5,
    expected: ans(userAnswer),
  };

  // sequence term
  if (id.startsWith('seq.term')) return {
    term:     item?.problem?.term ?? item?.term ?? '',
    expected: ans(userAnswer),
    var:      item?.problem?.var  ?? item?.var  ?? 'n',
    samples:  item?.problem?.samples ?? 8,
    domain:   item?.problem?.domain  ?? [1, 10],
  };

  // sum
  if (id.startsWith('sum.')) return {
    summand:  item?.problem?.summand ?? item?.summand ?? '',
    index:    item?.problem?.index   ?? item?.index   ?? 'k',
    lower:    item?.problem?.lower   ?? item?.lower   ?? '1',
    upper:    item?.problem?.upper   ?? item?.upper   ?? 'n',
    expected: ans(userAnswer),
    param_vars: item?.problem?.param_vars ?? item?.param_vars ?? ['n'],
  };

  // integer identity
  if (id.startsWith('comb.') || id.startsWith('integer.identity')) return {
    lhs:     item?.problem?.lhs  ?? item?.lhs  ?? '',
    rhs:     ans(userAnswer),
    vars:    item?.problem?.vars ?? item?.vars ?? ['n','k'],
    domain:  item?.problem?.domain  ?? [1, 10],
    samples: item?.problem?.samples ?? 10,
  };

  // vectors
  if (id.startsWith('vec.eq')) return {
    lhs:  item?.problem?.lhs  ?? item?.lhs  ?? [],
    rhs:  item?.problem?.rhs  ?? item?.rhs  ?? [],
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };
  if (id.startsWith('vec.dot')) return {
    a:  item?.problem?.a  ?? item?.a  ?? [],
    b:  item?.problem?.b  ?? item?.b  ?? [],
    expected: ans(userAnswer),
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };
  if (id.startsWith('vec.cross')) return {
    a:  item?.problem?.a  ?? item?.a  ?? [],
    b:  item?.problem?.b  ?? item?.b  ?? [],
    expected: item?.problem?.expected ?? item?.expected ?? (Array.isArray(userAnswer) ? userAnswer : []),
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };
  if (id.startsWith('vec.mag')) return {
    a:  item?.problem?.a  ?? item?.a  ?? [],
    expected: ans(userAnswer),
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };
  if (id.startsWith('vec.ang')) return {
    a:  item?.problem?.a  ?? item?.a  ?? [],
    b:  item?.problem?.b  ?? item?.b  ?? [],
    expected: ans(userAnswer) || undefined,
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };
  if (id.startsWith('vec.orth')) return {
    a:  item?.problem?.a  ?? item?.a  ?? [],
    b:  item?.problem?.b  ?? item?.b  ?? [],
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };
  if (id.startsWith('vec.par')) return {
    a:  item?.problem?.a  ?? item?.a  ?? [],
    b:  item?.problem?.b  ?? item?.b  ?? [],
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };

  // complex / congruence / matrix
  if (id.startsWith('complex.')) return {
    lhs:  item?.problem?.lhs ?? item?.lhs ?? '',
    rhs:  ans(userAnswer),
    vars: item?.problem?.vars ?? item?.vars ?? ['z'],
  };
  if (id.startsWith('cong.') || id.includes('congruence')) return {
    lhs:  item?.problem?.lhs ?? item?.lhs ?? '',
    rhs:  ans(userAnswer),
    mod:  item?.problem?.mod ?? item?.mod ?? 'm',
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };
  if (id.startsWith('matrix.eq')) return {
    lhs:  item?.problem?.lhs ?? item?.lhs ?? [],
    rhs:  item?.problem?.rhs ?? item?.rhs ?? [],
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };
  if (id.startsWith('matrix.det')) return {
    mat:  item?.problem?.mat ?? item?.mat ?? [],
    expected: ans(userAnswer),
    vars: item?.problem?.vars ?? item?.vars ?? [],
  };

  // geometry
  if (id.startsWith('geo.line.eq')) return {
    lhs: item?.lhs ?? item?.problem?.lhs ?? '',
    rhs: ans(userAnswer) || item?.rhs || item?.problem?.rhs || '',
  };
  if (id.startsWith('geo.line.slope')) return {
    equation:  item?.equation ?? item?.problem?.equation ?? '',
    slope:     ans(userAnswer) || item?.slope || item?.problem?.slope || '',
    intercept: item?.intercept || item?.problem?.intercept || '',
  };
  if (id.startsWith('geo.circle')) return {
    equation: item?.equation ?? item?.problem?.equation ?? '',
    center_x: item?.cx ?? item?.center_x ?? item?.problem?.center_x ?? '',
    center_y: item?.cy ?? item?.center_y ?? item?.problem?.center_y ?? '',
    radius:   ans(userAnswer) || item?.radius || item?.problem?.radius || '',
  };
  if (id.startsWith('geo.parabola')) return {
    equation:  item?.equation ?? item?.problem?.equation ?? '',
    vertex_x:  item?.vx ?? item?.vertex_x ?? item?.problem?.vertex_x ?? '',
    vertex_y:  item?.vy ?? item?.vertex_y ?? item?.problem?.vertex_y ?? '',
    focus_x:   item?.fx ?? item?.focus_x  ?? item?.problem?.focus_x ?? '',
    focus_y:   item?.fy ?? item?.focus_y  ?? item?.problem?.focus_y ?? '',
    directrix: item?.directrix ?? item?.problem?.directrix ?? '',
  };

  // solutions on interval
  if (id.startsWith('trig.solutions') || id.startsWith('abs.eq') || id.startsWith('solve.interval')) {
    return {
      equation: item?.equation ?? item?.problem?.equation ?? '',
      var:      item?.variable ?? item?.problem?.variable ?? 'x',
      lower:    item?.lower ?? item?.problem?.lower ?? '0',
      upper:    item?.upper ?? item?.problem?.upper ?? '2*pi',
      expected: Array.isArray(userAnswer)
        ? userAnswer.map((v:any)=> (typeof v==='object'? (v.latex??v.text??'') : String(v)))
        : (typeof userAnswer==='string' ? [userAnswer] : []),
    };
  }

  // inequality set
  if (id.startsWith('ineq.set')) {
    return {
      expr:     item?.expr ?? item?.problem?.expr ?? '',
      var:      item?.variable ?? item?.problem?.variable ?? 'x',
      expected: item?.expected ?? item?.problem?.expected ?? (Array.isArray(userAnswer) ? userAnswer : []),
      domain:   item?.domain ?? item?.problem?.domain ?? [-10, 10],
    };
  }

  // function transform
  if (id.startsWith('func.transform')) {
    return {
      base:   item?.base ?? item?.problem?.base ?? '',
      target: item?.target ?? item?.problem?.target ?? '',
      var:    item?.variable ?? item?.problem?.variable ?? 'x',
      a:      item?.a ?? item?.problem?.a ?? undefined,
      b:      item?.b ?? item?.problem?.b ?? undefined,
      h:      item?.h ?? item?.problem?.h ?? undefined,
      k:      item?.k ?? item?.problem?.k ?? undefined,
    };
  }

  // フォールバック（等式）
  return {
    lhs_latex: item?.lhs ?? item?.lhs_latex ?? (item?.expr ?? ''),
    rhs_latex: ans(userAnswer) || item?.rhs_latex || item?.rhs || '',
  };
}
