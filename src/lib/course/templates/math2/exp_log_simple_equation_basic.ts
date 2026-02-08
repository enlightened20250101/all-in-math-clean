// src/lib/course/templates/math2/exp_log_simple_equation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type EqParams = {
  a: number;
  k: number;
};

function buildParams(): EqParams {
  const a = pick([2, 3, 5, 10]);
  const k = randInt(1, 4);
  return { a, k };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_simple_equation_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `成長モデルとして、方程式 ${params.a}^x=${params.a}^${params.k} を解け。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as EqParams).k);
    },
    explain(params) {
      const p = params as EqParams;
      return `
### この問題の解説
同じ底なので指数が等しくなり、$x=${p.k}$ です。
答えは **${p.k}** です。
`;
    },
  };
}

export const expLogSimpleEquationTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_simple_equation_basic_${i + 1}`, `指数方程式 ${i + 1}`)
);
