// src/lib/course/templates/math2/exp_log_power_equation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, k: 4 },
  { a: 3, k: 2 },
  { a: 5, k: 4 },
  { a: 10, k: 2 },
  { a: 2, k: 6 },
  { a: 3, k: 4 },
  { a: 5, k: 2 },
  { a: 10, k: 4 },
];

type EqParams = {
  a: number;
  k: number;
};

function buildParams(): EqParams {
  const c = pick(CASES);
  return { a: c.a, k: c.k };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_power_equation_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `成長モデルとして、方程式 $${params.a}^{2x}=${params.a}^{${params.k}}$ を解け。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as EqParams).k / 2);
    },
    explain(params) {
      const p = params as EqParams;
      return `
### この問題の解説
同じ底なので指数が等しくなり、$2x=${p.k}$ です。
したがって $x=${p.k / 2}$。
答えは **${p.k / 2}** です。
`;
    },
  };
}

export const expLogPowerEquationTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_power_equation_basic_${i + 1}`, `指数方程式（2x） ${i + 1}`)
);
