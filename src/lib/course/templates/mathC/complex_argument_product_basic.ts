// src/lib/course/templates/mathC/complex_argument_product_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 30, b: 60, ans: 90 },
  { a: 45, b: 45, ans: 90 },
  { a: 30, b: 90, ans: 120 },
  { a: 60, b: 90, ans: 150 },
  { a: 45, b: 90, ans: 135 },
  { a: 120, b: 120, ans: 240 },
  { a: 150, b: 30, ans: 180 },
  { a: 210, b: 30, ans: 240 },
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
      topicId: "complex_argument_product_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z_1, z_2$ の点の偏角がそれぞれ $${params.a}^\\circ$, $${params.b}^\\circ$ のとき、積 $z_1z_2$ の点の偏角を求めよ。`;
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
点の偏角は積で加法になります。
よって ${p.a}+${p.b}=${p.ans}^\\circ。
`;
    },
  };
}

export const complexArgumentProductTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_product_basic_${i + 1}`, `点の偏角の和 ${i + 1}`)
);

const extraArgumentProductTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`complex_argument_product_basic_${i + 7}`, `点の偏角の和 追加${i + 1}`)
);

complexArgumentProductTemplates.push(...extraArgumentProductTemplates);
