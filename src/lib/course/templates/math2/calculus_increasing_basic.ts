// src/lib/course/templates/math2/calculus_increasing_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

const CHOICES = ["増加", "減少"];

type IncParams = {
  a: number;
  b: number;
  c: number;
  x0: number;
  sign: number;
};

function buildParams(): IncParams {
  const a = pick([-2, -1, 1, 2]);
  const b = randInt(-4, 4);
  const c = randInt(-3, 3);
  let x0 = randInt(-3, 3);
  let slope = 2 * a * x0 + b;
  if (slope === 0) {
    x0 = x0 === 0 ? 1 : 0;
    slope = 2 * a * x0 + b;
  }
  const sign = slope > 0 ? 1 : -1;
  return { a, b, c, x0, sign };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_increasing_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const poly = texPoly2(params.a, params.b, params.c);
      const statement =
        `変化の様子を調べる。関数 $f(x)=${poly}$ は $x=${params.x0}$ のとき増加か減少か。`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: CHOICES,
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as IncParams;
      const correct = p.sign > 0 ? "増加" : "減少";
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain(params) {
      const p = params as IncParams;
      const slope = 2 * p.a * p.x0 + p.b;
      return `
### この問題の解説
導関数は $f'(x)=2ax+b$ なので $x=${p.x0}$ での値は ${slope} です。
符号が ${slope > 0 ? "正" : "負"} なので **${p.sign > 0 ? "増加" : "減少"}** になります。
`;
    },
  };
}

export const calcIncreasingTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_increasing_basic_${i + 1}`, `増減 ${i + 1}`)
);
