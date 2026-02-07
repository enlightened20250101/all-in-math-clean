// src/lib/course/templates/math2/calculus_average_value_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = {
  a: number;
  p: number;
  q: number;
  avg: number;
  b: number;
};

function buildParams(): Params {
  const a = randInt(1, 3);
  const p = randInt(0, 2);
  const q = p + randInt(1, 3);
  const b = randInt(0, 4);
  const avg = a * (p + q) / 2 + b;
  return { a, p, q, avg, b };
}

export const calcAverageValueBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_average_value_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_average_value_basic",
      title: `平均値（逆算）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = `${texLinear(params.a, 0)}+b`;
      const statement = `関数 $f(x)=${fx}$ の区間 $[${params.p},${params.q}]$ における平均値が ${params.avg} のとき、$b$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).b);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
平均値は $\\frac{f(${p.p})+f(${p.q})}{2}$ なので
$$
${p.avg} = ${p.a}\\cdot\\frac{${p.p}+${p.q}}{2} + b
$$
より $b=${p.b}$。答えは **${p.b}** です。
`;
    },
  };
});
