// src/lib/course/templates/mathB/sequence_geometric_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type Params = {
  a1: number;
  r: number;
  n: number;
  m: number;
  an: number;
  am: number;
};

function buildParams(): Params {
  const a1 = pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]);
  const r = pick([2, 3, 4, -2, -3]);
  let n = randInt(1, 4);
  let m = randInt(n + 1, n + 4);
  if (r < 0 && (m - n) % 2 === 0) {
    m += 1;
  }
  const an = a1 * Math.pow(r, n - 1);
  const am = a1 * Math.pow(r, m - 1);
  return { a1, r, n, m, an, am };
}

export const sequenceGeometricBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `sequence_geometric_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_geometric_basic",
      title: `等比数列の逆算 ${i + 1}`,
      difficulty: 1,
      tags: ["sequence", "geometric", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等比数列 $\\{a_n\\}$ において、$a_${params.n}=${params.an}$, $a_${params.m}=${params.am}$ のとき、公比 $r$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).r);
    },
    explain(params) {
      const { n, m, an, am, r } = params as Params;
      return `
### この問題の解説
等比数列より $a_m = a_n r^{m-n}$。
$$
${am} = ${an} \\cdot r^{${m - n}}
$$
したがって $r=${r}$。答えは **${r}** です。
`;
    },
  };
});
