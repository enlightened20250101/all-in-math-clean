// src/lib/course/templates/mathC/complex_argument_quadrant_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { theta: 30, ans: 1 },
  { theta: 135, ans: 2 },
  { theta: 210, ans: 3 },
  { theta: 315, ans: 4 },
];

type Params = {
  theta: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_quadrant_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `点の偏角が ${params.theta}^\\circ$ の複素数は第何象限にあるか。第◯象限の番号を答えよ。`;
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
点の偏角の範囲で象限を判定します。
答えは **第${p.ans}象限**。
`;
    },
  };
}

export const complexArgumentQuadrantExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_quadrant_basic2_${i + 1}`, `象限判定 ${i + 1}`)
);
