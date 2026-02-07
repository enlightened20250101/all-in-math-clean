// src/lib/course/templates/math2/calculus_integral_constant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type ConstParams = {
  c: number;
  a: number;
  b: number;
  value: number;
};

function buildParams(): ConstParams {
  const c = randInt(1, 5);
  const a = randInt(0, 2);
  const b = a + randInt(1, 4);
  const value = c * (b - a);
  return { c, a, b, value };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_integral_constant_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を計算せよ。$\\int_${params.a}^{${params.b}} ${params.c}\\,dx$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ConstParams).value);
    },
    explain(params) {
      const p = params as ConstParams;
      return `
### この問題の解説
定数の積分は $c(b-a)$ なので $${p.c}\\times(${p.b}-${p.a})=${p.value}$ です。
答えは **${p.value}** です。
`;
    },
  };
}

export const calcIntegralConstantTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_integral_constant_basic_${i + 1}`, `定数の積分 ${i + 1}`)
);
