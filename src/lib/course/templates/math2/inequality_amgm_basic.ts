// src/lib/course/templates/math2/inequality_amgm_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 4, b: 16, mean: 10, gm: 8 },
  { a: 9, b: 49, mean: 29, gm: 21 },
  { a: 16, b: 36, mean: 26, gm: 24 },
  { a: 1, b: 25, mean: 13, gm: 5 },
  { a: 1, b: 9, mean: 5, gm: 3 },
  { a: 9, b: 25, mean: 17, gm: 15 },
  { a: 4, b: 36, mean: 20, gm: 12 },
  { a: 16, b: 64, mean: 40, gm: 32 },
  { a: 25, b: 49, mean: 37, gm: 35 },
  { a: 36, b: 64, mean: 50, gm: 48 },
  { a: 49, b: 81, mean: 65, gm: 63 },
  { a: 64, b: 100, mean: 82, gm: 80 },
  { a: 4, b: 64, mean: 34, gm: 16 },
];

type Params = {
  a: number;
  b: number;
  mean: number;
  gm: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "inequality_amgm_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `正の数 $a=${params.a}, b=${params.b}$ とするとき、相加平均と相乗平均の差 $\\frac{a+b}{2}-\\sqrt{ab}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as Params;
      return gradeNumeric(userAnswer, p.mean - p.gm);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$\\frac{a+b}{2}=${p.mean}, \\sqrt{ab}=${p.gm}$ より差は ${p.mean - p.gm}。
`;
    },
  };
}

export const inequalityAmgmTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`inequality_amgm_basic_${i + 1}`, `相加相乗 ${i + 1}`)
);
