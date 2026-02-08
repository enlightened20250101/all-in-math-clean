// src/lib/course/templates/math2/exp_log_log_sum_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, x: 8, y: 4, answer: 5 },
  { a: 3, x: 9, y: 3, answer: 3 },
  { a: 5, x: 25, y: 5, answer: 3 },
  { a: 10, x: 100, y: 10, answer: 3 },
  { a: 2, x: 16, y: 2, answer: 5 },
  { a: 3, x: 27, y: 9, answer: 5 },
  { a: 5, x: 125, y: 25, answer: 5 },
  { a: 10, x: 1000, y: 10, answer: 4 },
  { a: 2, x: 32, y: 8, answer: 8 },
  { a: 3, x: 81, y: 3, answer: 5 },
];

type SumParams = {
  a: number;
  x: number;
  y: number;
  answer: number;
};

function buildParams(): SumParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_log_sum_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `成長モデルとして、$\\log_{${params.a}}${params.x}+\\log_{${params.a}}${params.y}$ を計算せよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SumParams).answer);
    },
    explain(params) {
      const p = params as SumParams;
      return `
### この問題の解説
$\\log_a x+\\log_a y=\\log_a(xy)$ なので
$$
\\log_{${p.a}}(${p.x * p.y})=${p.answer}
$$
です。答えは **${p.answer}** です。
`;
    },
  };
}

export const expLogLogSumTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_log_sum_basic_${i + 1}`, `対数の加法 ${i + 1}`)
);
