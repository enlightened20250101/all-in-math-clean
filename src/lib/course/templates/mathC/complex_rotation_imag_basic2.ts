// src/lib/course/templates/mathC/complex_rotation_imag_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, b: 3, k: 1, ask: 0, ans: -3 },
  { a: 2, b: 3, k: 1, ask: 1, ans: 2 },
  { a: -1, b: 4, k: 2, ask: 0, ans: -8 },
  { a: -1, b: 4, k: 2, ask: 1, ans: -2 },
];

type Params = {
  a: number;
  b: number;
  k: number;
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
      topicId: "complex_rotation_imag_basic",
      title,
      difficulty: 1,
      tags: ["complex", "rotation"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "実部" : "虚部";
      const statement = `地図上の点を表す複素数 $z=${params.a}+${params.b}i$ を $${params.k}i$ 倍したときの ${label} を答えよ。`;
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
$i(a+bi)=-b+ai$、$2i(a+bi)=-2b+2ai$。
${label}は **${p.ans}**。
`;
    },
  };
}

export const complexRotationImagExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_rotation_imag_basic2_${i + 1}`, `虚数倍 ${i + 1}`)
);
