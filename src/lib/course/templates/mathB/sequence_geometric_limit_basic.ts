// src/lib/course/templates/mathB/sequence_geometric_limit_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texFrac, texEq } from "@/lib/format/tex";

type LimitParams = {
  a1: number;
  rNum: number;
  rDen: number;
  sum: number;
};

function buildParams(): LimitParams {
  const r = pick([
    { n: 1, d: 2 },
    { n: 2, d: 3 },
  ]);
  const a1 = randInt(2, 8);
  const sum = (a1 * r.d) / (r.d - r.n);
  return { a1, rNum: r.n, rDen: r.d, sum };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_geometric_limit_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "geometric", "infinite", "ct"],
    },
    generate() {
      const params = buildParams();
      const r = texFrac(params.rNum, params.rDen);
      const statement = `初項 $a_1=${params.a1}$、公比 $r=${r}$ の等比数列について、極限を用いて無限和 $S$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LimitParams).sum);
    },
    explain(params) {
      const p = params as LimitParams;
      return `
### この問題の解説
$|r|<1$ なので無限和は
$$
${texEq("S", `\\frac{a_1}{1-r}=\\frac{${p.a1}}{1-${texFrac(p.rNum, p.rDen)}}=${p.sum}`)}
$$
です。答えは **${p.sum}** です。
`;
    },
  };
}

export const sequenceGeometricLimitTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`seq_geometric_limit_basic_${i + 1}`, `等比数列の無限和 ${i + 1}`)
);
