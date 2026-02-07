// src/lib/course/templates/math2/calculus_average_value_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type AvgParams = {
  a: number;
  b: number;
  p: number;
  q: number;
  answer: number;
};

function buildParams(): AvgParams {
  const a = randInt(1, 3);
  const b = randInt(0, 3);
  const p = randInt(0, 2);
  const q = p + randInt(1, 3);
  const avg = a * (p + q) / 2 + b;
  return { a, b, p, q, answer: avg };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_average_value_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.a, params.b);
      const statement = `関数 $f(x)=${fx}$ の区間 $[${params.p},${params.q}]$ における平均値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AvgParams).answer);
    },
    explain(params) {
      const p = params as AvgParams;
      return `
### この問題の解説
線形関数の平均値は端点の平均なので
$$
\\frac{f(${p.p})+f(${p.q})}{2}=${p.answer}
$$
です。答えは **${p.answer}** です。
`;
    },
  };
}

export const calcAverageValueTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_average_value_basic_${i + 1}`, `平均値 ${i + 1}`)
);
