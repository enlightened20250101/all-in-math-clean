import { z } from "zod";

const VERIFY_BASE = process.env.NEXT_PUBLIC_VERIFY_BASE || "http://localhost:8000";

const GradeResp = z.object({
  ok: z.boolean().optional(),
  score: z.number().optional(),
  items: z.array(z.object({ ok: z.boolean(), kind: z.string().optional() })).optional(),
  reason: z.string().optional(),
  computed_latex: z.string().optional(),
}).passthrough();

type Step = {
  src: string; dst: string; kind?: string; var?: string;
  factor?: string; let?: string[]; subs?: Record<string,string>; note?: string;
};

type Problem = {
  id: string;
  skill_id: string;
  kind?: string | null;              // 'integral' | 'derivative' | 'equation' | ...
  payload?: Record<string, any> | null;
};

async function post<T=any>(path: string, body: any): Promise<T> {
  const r = await fetch(`${VERIFY_BASE}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

export async function gradeAnswerWithProblem(input: {
  problem: Problem | null;
  answerLatex: string;
  steps?: Step[];
}) {
  const ans = input.answerLatex?.trim() || "";

  // 1) 問題の種類に応じて最適APIを選ぶ
  const kind = input.problem?.kind;
  const payload = input.problem?.payload || {};

  try {
    if (kind === "integral") {
      const body = { integrand: payload.integrand, var: payload.var || "x", expected: ans };
      const js = await post("/verify_integral", body);
      const parsed = GradeResp.safeParse(js);
      if (parsed.success) return { kind: "integral", ...parsed.data };
    }

    if (kind === "derivative") {
      const body = { func_latex: payload.func_latex, variable: payload.var || "x", expected_latex: ans };
      const js = await post("/verify_derivative", body);
      const parsed = GradeResp.safeParse(js);
      if (parsed.success) return { kind: "derivative", ...parsed.data };
    }

    if (kind === "equation") {
      // 期待：lhs = rhs 形式が payload に入っている想定。答えは rhs として扱う等、運用に合わせて調整可
      const body = { lhs_latex: payload.lhs || "y", rhs_latex: ans };
      const js = await post("/verify_equation", body);
      const parsed = GradeResp.safeParse(js);
      if (parsed.success) return { kind: "equation", ...parsed.data };
    }

    if (kind === "roots") {
      // 複数解対応：/diagnose_roots で不足/過剰を判定（集合一致）
      const sols = input.answerLatex
        .split(/[,\s]+/)
        .map(s => s.trim())
        .filter(Boolean);
      const body = {
        equation: payload.equation,
        var: payload.var || "x",
        user_solutions: sols,
      };
      const js: any = await post("/diagnose_roots", body);
      // 念のため型ガード
      const ok = !!js?.ok && Array.isArray(js.missing) && Array.isArray(js.extra) && js.missing.length === 0 && js.extra.length === 0;
      return {
        kind: "roots",
        ok,
        missing: js?.missing ?? [],
        extra: js?.extra ?? [],
      };
    }

    if (kind === "inequality_set") {
      // "(-oo,-1] U [1,oo)" → ["(-oo,-1]","[1,oo)"]
      const parts = input.answerLatex.replace(/\s+/g,"").replace(/[∪U]/g, ",").split(",").filter(Boolean);
      const body = { expr: payload.expr, var: payload.var || "x", expected: parts };
      const js = await post("/verify_inequality_set", body);
      const parsed = GradeResp.safeParse(js);
      if (parsed.success) return { kind: "inequality_set", ...parsed.data };
    }
  } catch {}

  // 2) ステップ採点（部分点）
  if (input.steps && input.steps.length > 0) {
    try {
      const js = await post("/grade_steps", {
        steps: input.steps, vars: ["x"], domain: [-5,5], samples: 16, tol: 1e-6,
      });
      const parsed = GradeResp.safeParse(js);
      if (parsed.success) return { kind: "steps", ...parsed.data };
    } catch {}
  }

  // 3) 最後の保険：等式一致（雑フォールバック）
  try {
    const js = await post("/verify_equation", { lhs_latex: "y", rhs_latex: ans });
    const parsed = GradeResp.safeParse(js);
    if (parsed.success) return { kind: "equation", ...parsed.data };
  } catch {}

  return { ok: false, kind: "unknown", reason: "unrecognized_or_incorrect" };
}
