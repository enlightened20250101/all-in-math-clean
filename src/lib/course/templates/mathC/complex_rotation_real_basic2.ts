// src/lib/course/templates/mathC/complex_rotation_real_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: 3, r: 2, ask: 0, ans: 4 },
  { a: -3, b: 1, r: 2, ask: 1, ans: 2 },
  { a: 1, b: -4, r: -1, ask: 0, ans: -1 },
  { a: 0, b: 5, r: -2, ask: 1, ans: -10 },
];

type Params = {
  a: number;
  b: number;
  r: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_rotation_real_basic",
      title,
      difficulty: 1,
      tags: ["complex", "rotation"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "実部" : "虚部";
      const statement = `地図上の点を表す複素数 $z=${texComplex(params.a, params.b)}$ を実数 ${params.r} 倍したときの ${label} を答えよ。`;
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
      const label = p.ask === 0 ? "実部" : "虚部";
      return `
### この問題の解説
実数倍は各成分に同じ倍率を掛けます。
${label}は **${p.ans}**。
`;
    },
  };
}

export const complexRotationRealExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_rotation_real_basic2_${i + 1}`, `実数倍 ${i + 1}`)
);
