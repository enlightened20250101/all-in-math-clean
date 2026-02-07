// src/lib/course/templates/mathB/sequence_geometric_limit_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texFrac } from "@/lib/format/tex";

type Params = {
  rNum: number;
  rDen: number;
  sum: number;
  a1: number;
};

function buildParams(): Params {
  const r = pick([
    { n: 1, d: 2 },
    { n: 2, d: 3 },
    { n: 1, d: 3 },
  ]);
  const sum = pick([6, 9, 12, 15]);
  const a1 = Math.round(sum * (r.d - r.n) / r.d);
  return { rNum: r.n, rDen: r.d, sum, a1 };
}

export const sequenceGeometricLimitVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `seq_geometric_limit_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_geometric_limit_basic",
      title: `無限和の逆算 ${i + 1}`,
      difficulty: 1,
      tags: ["sequence", "geometric", "infinite", "ct"],
    },
    generate() {
      const params = buildParams();
      const r = texFrac(params.rNum, params.rDen);
      const statement = `公比 $r=${r}$ の等比数列の無限和が $S=${params.sum}$ のとき、初項 $a_1$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).a1);
    },
    explain(params) {
      const p = params as Params;
      const r = texFrac(p.rNum, p.rDen);
      return `
### この問題の解説
無限和は $S=\\dfrac{a_1}{1-r}$ より、
$$
a_1 = S(1-r) = ${p.sum}\\left(1-${r}\\right) = ${p.a1}
$$
答えは **${p.a1}** です。
`;
    },
  };
});
