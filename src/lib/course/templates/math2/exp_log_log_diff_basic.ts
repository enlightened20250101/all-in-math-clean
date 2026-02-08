// src/lib/course/templates/math2/exp_log_log_diff_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, x: 8, y: 4, answer: 1 },
  { a: 3, x: 27, y: 3, answer: 2 },
  { a: 5, x: 25, y: 5, answer: 1 },
  { a: 10, x: 100, y: 10, answer: 1 },
  { a: 2, x: 32, y: 4, answer: 3 },
  { a: 2, x: 64, y: 8, answer: 3 },
  { a: 3, x: 81, y: 9, answer: 2 },
  { a: 5, x: 125, y: 5, answer: 2 },
  { a: 10, x: 1000, y: 10, answer: 2 },
  { a: 3, x: 243, y: 3, answer: 4 },
];

type DiffParams = {
  a: number;
  x: number;
  y: number;
  answer: number;
};

function buildParams(): DiffParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_log_diff_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `比の対数として $\\log_{${params.a}}${params.x}-\\log_{${params.a}}${params.y}$ を計算せよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).answer);
    },
    explain(params) {
      const p = params as DiffParams;
      return `
### この問題の解説
$\\log_a x-\\log_a y=\\log_a(x/y)$ なので
$$
\\log_{${p.a}}(${p.x / p.y})=${p.answer}
$$
です。答えは **${p.answer}** です。
`;
    },
  };
}

export const expLogLogDiffTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_log_diff_basic_${i + 1}`, `対数の減法 ${i + 1}`)
);
