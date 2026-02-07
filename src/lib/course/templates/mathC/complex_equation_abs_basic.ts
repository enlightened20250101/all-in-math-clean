// src/lib/course/templates/mathC/complex_equation_abs_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, ans: 5 },
  { a: 5, b: 12, ans: 13 },
  { a: 1, b: 0, ans: 1 },
  { a: 0, b: 6, ans: 6 },
  { a: 8, b: 15, ans: 17 },
  { a: 7, b: 24, ans: 25 },
  { a: 9, b: 12, ans: 15 },
  { a: 0, b: 9, ans: 9 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_equation_abs_basic",
      title,
      difficulty: 1,
      tags: ["complex", "equation"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${params.a}+${params.b}i$ の絶対値 $|z|$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$|a+bi|=\\sqrt{a^2+b^2}$。
ここでは $\\sqrt{${p.a}^2+${p.b}^2}=${p.ans}$。
`;
    },
  };
}

export const complexEquationAbsTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_equation_abs_basic_${i + 1}`, `絶対値 ${i + 1}`)
);

const extraEquationAbsTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_equation_abs_basic_${i + 7}`, `絶対値 追加${i + 1}`)
);

complexEquationAbsTemplates.push(...extraEquationAbsTemplates);
