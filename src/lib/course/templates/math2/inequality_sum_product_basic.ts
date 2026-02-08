// src/lib/course/templates/math2/inequality_sum_product_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

function buildParams() {
  const s = pick([6, 8, 10, 12]);
  const x = randInt(1, s - 1);
  const y = s - x;
  const prod = x * y;
  return { s, x, y, prod };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "inequality_sum_product_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `長方形の縦横の長さを正の数 $x,y$ とし、周の長さが一定で $x+y=${params.s}$ を満たすとき、面積 $xy$ の最大値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as any;
      const max = (p.s / 2) * (p.s / 2);
      return gradeNumeric(userAnswer, max);
    },
    explain(params) {
      const p = params as any;
      const max = (p.s / 2) * (p.s / 2);
      return `
### この問題の解説
和一定のとき積は $x=y$ で最大。
よって $xy=(${p.s}/2)^2=${max}$。
`;
    },
  };
}

export const inequalitySumProductTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`inequality_sum_product_basic_${i + 1}`, `和と積 ${i + 1}`)
);
