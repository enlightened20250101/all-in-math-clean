// src/lib/course/templates/mathC/complex_argument_degree_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x: 1, y: 1, arg: 45 },
  { x: -1, y: 1, arg: 135 },
  { x: -1, y: -1, arg: 225 },
  { x: 1, y: -1, arg: 315 },
  { x: 0, y: 2, arg: 90 },
  { x: 2, y: 0, arg: 0 },
  { x: -2, y: 0, arg: 180 },
  { x: 0, y: -2, arg: 270 },
  { x: 1, y: 0, arg: 0 },
  { x: 0, y: 1, arg: 90 },
];

type Params = {
  x: number;
  y: number;
  arg: number;
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
      topicId: "complex_argument_degree_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `観測点を表す複素数 $z=${texComplex(params.x, params.y)}$ の点の偏角（主値, 度数法）を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).arg);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
点 $(${p.x},${p.y})$ の点の偏角は **${p.arg}^\\circ** です。
`;
    },
  };
}

const extraComplexArgumentDegreeTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`complex_argument_degree_basic_${i + 21}`, `点の偏角（度） 追加${i + 1}`)
);

export const complexArgumentDegreeTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) =>
    buildTemplate(`complex_argument_degree_basic_${i + 1}`, `点の偏角（度） ${i + 1}`)
  ),
  ...extraComplexArgumentDegreeTemplates,
];
