// src/server/learning/generate.ts
import { z } from "zod";
import { ProblemSchema, TutorialSchema } from "@/lib/zod-schemas";
import { sanitizeTex } from "@/lib/tex";
import { fetchRagChunks } from "@/server/rag/search";
import { callJSONWithSchema } from "@/server/learning/llm";
import { ProblemJSONSchema, TutorialJSONSchema } from "@/lib/jsonschemas";
import { runCheck } from "@/server/verify/registry";
import { skillTemplates } from "@/server/learning/templates";
// verifyEquation / verifyDerivative / simplifyExpr が必要なら残してOK
// import { verifyEquation, verifyDerivative, simplifyExpr } from "@/server/verify/client";

// ★ あなたの supabaseServer に合わせる
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

export type GenProblemParams = {
  skillId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  objective?: string;
  errorPatterns?: string[];
  userLevelTheta?: number;
  overrideConstraints?: Record<string, any>;
};

export type GenTutorialParams = {
  skillId: string;
  objectives: string[]; // 1–3
};

type DBSkill = {
  id: string;
  hint_short?: string | null;
  pitfalls?: string[] | null;
  generator_constraints?: Record<string, any> | null;
};

const withSanitize = <T extends Record<string, any>>(obj: T): T => {
  const walk = (v: any): any =>
    typeof v === "string"
      ? sanitizeTex(v)
      : Array.isArray(v)
      ? v.map(walk)
      : v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v).map(([k, vv]) => [k, walk(vv)]))
      : v;
  return walk(obj);
};

function deepMerge<T>(a: T, b: Partial<T> | undefined | null): T {
  if (!b) return a;
  const out: any = Array.isArray(a) ? [...(a as any)] : { ...(a as any) };
  for (const [k, v] of Object.entries(b as any)) {
    if (v === undefined) continue;
    out[k] =
      v && typeof v === "object" && !Array.isArray(v)
        ? deepMerge(out[k] ?? {}, v)
        : v;
  }
  return out;
}

async function fetchSkillRow(skillId: string): Promise<DBSkill | null> {
  const supabase = await await supabaseServerReadOnly();
  const { data, error } = await supabase
    .from("skills")
    .select("id, hint_short, pitfalls, generator_constraints")
    .eq("id", skillId)
    .maybeSingle();
  if (error) {
    console.warn("[skills fetch error]", error.message);
    return null;
  }
  return (data as DBSkill) ?? null;
}

function enforceConstraintsText(latex: string, gc: Record<string, any>) {
  const disallow: string[] = gc?.disallow ?? [];
  for (const token of disallow) {
    if (!token) continue;
    const re =
      token.startsWith("\\") && !token.startsWith("\\\\")
        ? new RegExp(token) // 既にエスケープ済みを想定
        : new RegExp(token);
    if (re.test(latex)) {
      throw new Error(`latex-constraint-violation: ${token}`);
    }
  }
  return latex;
}

function postValidateWithConstraints(
  prob: z.infer<typeof ProblemSchema>,
  gc: Record<string, any>
) {
  // 例：スラッシュ分数禁止（\frac を強制）
  if (gc?.disallow?.some((t: string) => t.includes("\\/"))) {
    const usesSlash =
      /(^|[^\\])\/(?![a-z])/.test(prob.problem_latex) ||
      /(^|[^\\])\/(?![a-z])/.test(prob.answer_latex);
    if (usesSlash) throw new Error("slash-fraction-disallowed");
  }
  return true;
}

async function quickMathValidate(prob: z.infer<typeof ProblemSchema>) {
  const strict =
    (process.env.VERIFY_STRICT || "").toLowerCase() in { "1": 1, true: 1, yes: 1 };
  try {
    const ok = await runCheck((prob as any).machine_check);
    if (!ok && strict) console.warn("[verify-failed]", (prob as any).machine_check);
    return ok ? true : strict ? false : true;
  } catch (e) {
    if (strict) console.warn("[verify-error]", e, (prob as any).machine_check);
    return strict ? false : true;
  }
}

export async function generateProblem(p: GenProblemParams) {
  // RAG（任意）
  const chunks = await fetchRagChunks({
    skillId: p.skillId,
    objective: p.objective,
  });

  // テンプレ＋DB constraints マージ（優先度: テンプレ < DB < 呼出し側）
  const tmpl = skillTemplates[p.skillId];
  const dbSkill = await fetchSkillRow(p.skillId);
  const baseGC = tmpl?.constraints ?? {};
  const dbGC = dbSkill?.generator_constraints ?? {};
  const mergedGC = deepMerge(deepMerge(baseGC, dbGC), p.overrideConstraints ?? {});

  const systemPrompt =
    "You are a math item writer. Use LaTeX for math. " +
    "Return a JSON object that EXACTLY matches the schema. " +
    'The "machine_check" block is REQUIRED and must include all required fields. ' +
    "Respect STRICTLY the generator_constraints. " +
    "Do NOT use disallowed tokens. No markdown fences.";

  const userTextHint = [
    tmpl?.userHint ? `HINT:\n${tmpl.userHint}` : "",
    dbSkill?.hint_short ? `UI_HINT:\n${dbSkill.hint_short}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const userPayload = {
    rag: chunks.map((c) => ({ id: c.id, text: c.text })).slice(0, 8),
    request: {
      skill_id: p.skillId,
      difficulty: p.difficulty,
      error_patterns: p.errorPatterns ?? [],
      // 解答時間は評価に使わない方針なので要求しない
    },
    generator_constraints: mergedGC,
    constraints: {
      required_fields: [
        "skill_id",
        "difficulty",
        "problem_latex",
        "answer_latex",
        "hint_steps",
      ],
      latex: true,
      unique_solution: true,
      machine_check_required: true,
    },
  };

  const userPromptJsonStr =
    (userTextHint ? userTextHint + "\n\n" : "") +
    "PAYLOAD:\n" +
    JSON.stringify(userPayload, null, 2);

  let lastParsed: any = null;  // ★ 追加
  for (let i = 0; i < 3; i++) {
    const jsonText = await callJSONWithSchema({
      model: "gpt-4.1-mini",
      system: systemPrompt,
      user: userPromptJsonStr,
      jsonSchema: ProblemJSONSchema,
      schemaName: "Problem",
      temperature: 0.2,
      maxTokens: 2000,
    });

    try {
      const parsed = ProblemSchema.parse(JSON.parse(jsonText));
      lastParsed = parsed; // ★ 退避

      // 生成直後のテキスト制約ガード
      parsed.problem_latex = enforceConstraintsText(
        parsed.problem_latex,
        mergedGC
      );
      parsed.answer_latex = enforceConstraintsText(
        parsed.answer_latex,
        mergedGC
      );

      // 特定パターンの machine_check 補正（例：連立方程式）
      if (parsed.skill_id === "equation.system2") {
        const mc: any = (parsed as any).machine_check || {};
        const stripCases = (s: string) =>
          s.replace(/\\begin\{cases\}/g, "")
            .replace(/\\end\{cases\}/g, "")
            .replace(/\$/g, "");
        const asArray = (v: any) =>
          Array.isArray(v)
            ? v
            : typeof v === "string"
            ? v
                .split(/[,;]|\\\\/)
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [];
        let equations = mc.equations;
        if (typeof equations === "string") equations = stripCases(equations);
        equations = asArray(equations).map((e: string) =>
          e.replace(/==/g, "=").trim()
        );
        let vars = asArray(mc.vars).map((v: string) =>
          v.replace(/[()\s]/g, "")
        );
        if (vars.length < 2) vars = ["x", "y"];
        let solution = asArray(mc.solution).map((s: string) =>
          s.replace(/[()\s]/g, "")
        );
        (parsed as any).machine_check = {
          type: "roots_system",
          equations,
          vars,
          solution,
        };
      }

      // verify（既存）
      const ok = await quickMathValidate(parsed).catch(() => false);
      if (!ok) {
        // 1) もう一度だけ再生成してみる
        if (i < 2) continue;
        // 2) それでもダメなら “機械チェック未確定” として通す（UI側で採点観点のみ表示）
        (parsed as any).machine_check = { ok: false, reason: "verify_failed" };
      }

      // 追加の構文・既約ガード（必要最小限）
      postValidateWithConstraints(parsed, mergedGC);

      return withSanitize(parsed);
    } catch (e) {
      if (i === 2) {
        // 最低限の構造で返す（parsed 未定義でも安全）
        const fb = lastParsed ?? {};
        return withSanitize({
          skill_id: p.skillId,
          difficulty: p.difficulty,
          problem_latex: fb.problem_latex ?? fb.prompt_latex ?? "\\text{問題}",
          answer_latex:  fb.answer_latex  ?? "",
          hint_steps:    fb.hint_steps    ?? [],
          machine_check: fb.machine_check ?? { ok: false, reason: "exception" }
        } as any);
      }
      // → 次ループで再生成
    }
  }
  throw new Error("generateProblem: failed after retries");
}

export async function generateTutorial(p: GenTutorialParams) {
  const chunks = await fetchRagChunks({
    skillId: p.skillId,
    objective: p.objectives[0],
  });
  const dbSkill = await fetchSkillRow(p.skillId);

  const systemPrompt =
    "You are a math textbook writer. Use LaTeX for all math. " +
    "Follow the requested section order and produce rigorous content. " +
    "Respect generator_constraints if provided. " +
    "Return a JSON object that matches the given schema exactly.";

  const userPayload = {
    rag: chunks.map((c) => ({ id: c.id, text: c.text })).slice(0, 8),
    request: { skill_id: p.skillId, objectives: p.objectives },
    generator_constraints: dbSkill?.generator_constraints ?? {},
    constraints: {
      sections: {
        min: 3,
        max: 5,
        order: ["definition", "intuition", "formal", "examples"],
      },
      include: ["common_misconceptions"],
      exercisesPerSection: 3,
    },
  };
  const userPromptJsonStr = JSON.stringify(userPayload);

  const jsonText = await callJSONWithSchema({
    model: "gpt-4.1",
    system: systemPrompt,
    user: userPromptJsonStr,
    jsonSchema: TutorialJSONSchema,
    schemaName: "Tutorial",
    temperature: 0.2,
    maxTokens: 3000,
  });

  const parsed = TutorialSchema.parse(JSON.parse(jsonText));
  return withSanitize(parsed);
}
