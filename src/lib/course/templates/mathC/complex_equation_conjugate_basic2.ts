// src/lib/course/templates/mathC/complex_equation_conjugate_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: 5, ask: 0, ans: 2 },
  { a: -3, b: 4, ask: 1, ans: -4 },
  { a: 0, b: -7, ask: 1, ans: 7 },
  { a: 6, b: 1, ask: 0, ans: 6 },
];

type Params = {
  a: number;
  b: number;
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
      topicId: "complex_equation_conjugate_basic",
      title,
      difficulty: 1,
      tags: ["complex", "equation"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "実部" : "虚部";
      const statement = `地図上の点を表す複素数 $z=${texComplex(params.a, params.b)}$ の共役 $\\overline{z}$ の${label}を答えよ。`;
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
共役は虚部の符号を反転します。
${label}は **${p.ans}**。
`;
    },
  };
}

export const complexEquationConjugateExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_equation_conjugate_basic2_${i + 1}`, `共役 ${i + 1}`)
);
