// src/lib/course/templates/math2/poly_factor_k_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear, texPoly2 } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  k: number;
  p: number;
};

function buildParams(): Params {
  for (let i = 0; i < 80; i += 1) {
    const a = randInt(-3, 3);
    if (a === 0) continue;
    const b = randInt(-5, 5);
    const p = randInt(-3, 3);
    if (p === 0) continue;
    const k = -(a * p * p + b * p);
    if (Math.abs(k) <= 20) {
      return { a, b, k, p };
    }
  }
  return { a: 1, b: 0, k: -1, p: 1 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "poly_factor_k_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const poly = `${texPoly2(params.a, params.b, 0)}+k`;
      const factor = texLinear(1, -params.p);
      const statement = `費用モデル $f(x)=${poly}$ に対し、設計条件を満たすように $${factor}$ が因数となる $k$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).k);
    },
    explain(params) {
      const p = params as Params;
      const value = p.a * p.p * p.p + p.b * p.p + p.k;
      return `
### この問題の解説
因数定理より $f(${p.p})=0$ となるので
$$
${p.a}(${p.p})^2+${p.b}(${p.p})+k=0
$$
より $k=${p.k}$ です。
（確認: $f(${p.p})=${value}$）
`;
    },
  };
}

export const polyFactorKTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`poly_factor_k_basic_${i + 1}`, `因数定理 ${i + 1}`)
);
