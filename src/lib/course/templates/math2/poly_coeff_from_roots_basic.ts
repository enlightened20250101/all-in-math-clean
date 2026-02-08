// src/lib/course/templates/math2/poly_coeff_from_roots_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear, texPoly2 } from "@/lib/format/tex";

function buildParams() {
  const a = randInt(-5, 5);
  const b = randInt(-5, 5);
  return { a, b, sum: -(a + b), prod: a * b };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "poly_coeff_from_roots_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const t1 = texLinear(1, -params.a);
      const t2 = texLinear(1, -params.b);
      const statement = `面積の式として $(${t1})(${t2})$ を展開したときの $x$ の係数を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.sum);
    },
    explain(params) {
      const t1 = texLinear(1, -params.a);
      const t2 = texLinear(1, -params.b);
      const poly = texPoly2(1, params.sum, params.prod);
      return `
### この問題の解説
\[(${t1})(${t2})=${poly}\]
よって $x$ の係数は **${params.sum}** です。
`;
    },
  };
}

export const polyCoeffFromRootsTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`poly_coeff_from_roots_basic_${i + 1}`, `係数 ${i + 1}`)
);
