// src/lib/course/templates/mathC/complex_division_real_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 6, b: 4, r: 2, ask: 0, ans: 3 },
  { a: 6, b: 4, r: 2, ask: 1, ans: 2 },
  { a: -9, b: 3, r: 3, ask: 0, ans: -3 },
  { a: -9, b: 3, r: 3, ask: 1, ans: 1 },
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
      topicId: "complex_division_real_basic",
      title,
      difficulty: 1,
      tags: ["complex", "division"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "実部" : "虚部";
      const statement = `地図上の点を表す複素数 $z=${params.a}+${params.b}i$ を実数 ${params.r} で割ったときの ${label} を答えよ。`;
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
実数で割ると各成分を同じ値で割ります。
${label}は **${p.ans}**。
`;
    },
  };
}

export const complexDivisionRealExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_division_real_basic2_${i + 1}`, `実数除算 ${i + 1}`)
);
