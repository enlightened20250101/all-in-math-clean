// src/lib/course/templates/math2/exp_log_log_equation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, value: 8, answer: 3 },
  { a: 3, value: 9, answer: 2 },
  { a: 5, value: 25, answer: 2 },
  { a: 10, value: 100, answer: 2 },
  { a: 2, value: 32, answer: 5 },
  { a: 2, value: 64, answer: 6 },
  { a: 3, value: 27, answer: 3 },
  { a: 3, value: 81, answer: 4 },
  { a: 5, value: 125, answer: 3 },
  { a: 10, value: 1000, answer: 3 },
];

type LogEqParams = {
  a: number;
  value: number;
  answer: number;
};

function buildParams(): LogEqParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_log_equation_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `方程式 $\\log_{${params.a}} x=${params.answer}$ を解け。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LogEqParams).value);
    },
    explain(params) {
      const p = params as LogEqParams;
      return `
### この問題の解説
$\\log_{${p.a}}x=${p.answer}$ なので $x=${p.a}^{${p.answer}}=${p.value}$ です。
答えは **${p.value}** です。
`;
    },
  };
}

export const expLogLogEquationTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_log_equation_basic_${i + 1}`, `対数方程式 ${i + 1}`)
);
