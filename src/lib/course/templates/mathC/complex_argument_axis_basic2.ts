// src/lib/course/templates/mathC/complex_argument_axis_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x: 4, y: 0, ans: 0 },
  { x: -3, y: 0, ans: 180 },
  { x: 0, y: 5, ans: 90 },
  { x: 0, y: -7, ans: 270 },
];

type Params = {
  x: number;
  y: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_axis_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${texComplex(params.x, params.y)}$ の偏角を $0^\\circ\\le\\theta<360^\\circ$ で求めよ。`;
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
軸上の点なので偏角は $0^\\circ,90^\\circ,180^\\circ,270^\\circ$ のいずれか。
ここでは **${p.ans}^\\circ**。
`;
    },
  };
}

export const complexArgumentAxisExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_axis_basic2_${i + 1}`, `偏角（軸） ${i + 1}`)
);
