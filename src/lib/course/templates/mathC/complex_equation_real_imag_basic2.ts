// src/lib/course/templates/mathC/complex_equation_real_imag_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 3, b: 2, ask: 0, ans: 3 },
  { a: -4, b: 1, ask: 1, ans: 1 },
  { a: 0, b: -5, ask: 0, ans: 0 },
  { a: 2, b: 7, ask: 1, ans: 7 },
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
      topicId: "complex_equation_real_imag_basic",
      title,
      difficulty: 1,
      tags: ["complex", "equation"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "実部" : "虚部";
      const statement = `複素数 $z=${texComplex(params.a, params.b)}$ の${label}を答えよ。`;
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
複素数 $a+bi$ の実部は $a$、虚部は $b$。
${label}は **${p.ans}**。
`;
    },
  };
}

export const complexEquationRealImagExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_equation_real_imag_basic2_${i + 1}`, `実部・虚部 ${i + 1}`)
);
