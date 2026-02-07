// src/lib/course/templates/mathC/complex_rotation_180_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, ask: 0, ans: -3 },
  { a: 3, b: 4, ask: 1, ans: -4 },
  { a: -2, b: 5, ask: 0, ans: 2 },
  { a: -2, b: 5, ask: 1, ans: -5 },
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
      topicId: "complex_rotation_180_basic",
      title,
      difficulty: 1,
      tags: ["complex", "rotation"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "実部" : "虚部";
      const statement = `複素数 $z=${params.a}+${params.b}i$ を $-1$ 倍したときの ${label} を答えよ。`;
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
$-1$ 倍は $180^\\circ$ 回転と同じです。
${label}は **${p.ans}**。
`;
    },
  };
}

export const complexRotation180ExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_rotation_180_basic2_${i + 1}`, `180度回転 ${i + 1}`)
);
