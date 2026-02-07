// src/lib/course/templates/math2/exp_log_log_product_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type ProductParams = {
  a: number;
  m: number;
  n: number;
};

function buildParams(): ProductParams {
  const a = pick([2, 3, 5]);
  const m = randInt(1, 3);
  const n = randInt(1, 3);
  return { a, m, n };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_log_product_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を計算せよ。$\\log_{${params.a}}(${params.a}^{${params.m}}\\times${params.a}^{${params.n}})$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as ProductParams;
      return gradeNumeric(userAnswer, p.m + p.n);
    },
    explain(params) {
      const p = params as ProductParams;
      return `
### この問題の解説
指数法則で ${p.a}^{${p.m}}\\times${p.a}^{${p.n}}=${p.a}^{${p.m + p.n}} なので
$$
\\log_{${p.a}}(${p.a}^{${p.m + p.n}})=${p.m + p.n}
$$
です。答えは **${p.m + p.n}** です。
`;
    },
  };
}

export const expLogLogProductTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_log_product_basic_${i + 1}`, `対数の積 ${i + 1}`)
);
