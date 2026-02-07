// src/lib/course/templates/mathB/sequence_geometric_term_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  a1: number;
  r: number;
  n: number;
  an: number;
};

function buildParams(): Params {
  const a1 = randInt(1, 5);
  const r = pick([2, 3]);
  const n = randInt(3, 7);
  const an = a1 * Math.pow(r, n - 1);
  return { a1, r, n, an };
}

export const sequenceGeometricTermBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `seq_geometric_term_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_geometric_basic",
      title: `等比数列の項（逆算）${i + 1}`,
      difficulty: 2,
      tags: ["sequence", "geometric", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等比数列で $a_1=${params.a1}$, 公比 $r=${params.r}$ のとき、$a_n=${params.an}$ を満たす $n$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).n);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
等比数列の一般項 $a_n=a_1 r^{n-1}$ より
$$
${p.an}=${p.a1}\\cdot${p.r}^{n-1}
$$
なので $n=${p.n}$。答えは **${p.n}** です。
`;
    },
  };
});
