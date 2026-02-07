// src/lib/course/templates/mathC/complex_argument_quotient_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 90, b: 30, ans: 60 },
  { a: 120, b: 60, ans: 60 },
  { a: 150, b: 30, ans: 120 },
  { a: 180, b: 90, ans: 90 },
  { a: 210, b: 30, ans: 180 },
  { a: 270, b: 90, ans: 180 },
  { a: 300, b: 120, ans: 180 },
  { a: 240, b: 60, ans: 180 },
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
      topicId: "complex_argument_quotient_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z_1, z_2$ の偏角がそれぞれ $${params.a}^\\circ$, $${params.b}^\\circ$ のとき、$z_1/z_2$ の偏角を求めよ。`;
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
偏角は商で差になります。
よって ${p.a}-${p.b}=${p.ans}^\\circ。
`;
    },
  };
}

export const complexArgumentQuotientTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_quotient_basic_${i + 1}`, `偏角の差 ${i + 1}`)
);

const extraArgumentQuotientTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`complex_argument_quotient_basic_${i + 7}`, `偏角の差 追加${i + 1}`)
);

complexArgumentQuotientTemplates.push(...extraArgumentQuotientTemplates);
