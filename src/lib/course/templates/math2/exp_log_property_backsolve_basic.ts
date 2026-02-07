// src/lib/course/templates/math2/exp_log_property_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPow } from "@/lib/format/tex";

type Params = {
  base: number;
  m: number;
  n: number;
  p: number;
  q: number;
  value: number;
};

function buildParams(): Params {
  const base = pick([2, 3, 5]);
  const m = randInt(1, 3);
  const n = randInt(1, 3);
  const p = randInt(1, 3);
  const q = randInt(1, 3);
  const value = p * m + q * n;
  return { base, m, n, p, q, value };
}

export const expLogPropertyBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `exp_log_property_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_property_basic",
      title: `対数の性質（逆算）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `$\\log_{${params.base}} b = ${params.m}$,\\ $\\log_{${params.base}} c = ${params.n}$ のとき、次を満たす $x$ を求めよ。\\n\\n$$\\log_{${params.base}}\\left(${texPow(
        "b",
        params.p
      )}${texPow("c", params.q)}\\right)=x$$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
対数の性質より
$$
\\log_{${p.base}}(b^{${p.p}}c^{${p.q}})=${p.p}m+${p.q}n=${p.value}
$$
答えは **${p.value}** です。
`;
    },
  };
});
