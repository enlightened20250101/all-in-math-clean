// src/lib/course/templates/mathC/conic_line_intersection_count_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { d: 1, ans: 2 },
  { d: 2, ans: 1 },
  { d: 3, ans: 0 },
  { d: 0, ans: 2 },
];

type Params = {
  d: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_line_intersection_count_basic",
      title,
      difficulty: 1,
      tags: ["conic", "line"],
    },
    generate() {
      const params = buildParams();
      const statement = `円 $x^2+y^2=4$ と直線 $y=${params.d}$ の交点の個数を答えよ。`;
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
半径は2なので、$|d|<2$ で2個、$|d|=2$ で1個、$|d|>2$ で0個。
ここでは **${p.ans}**。
`;
    },
  };
}

export const conicLineIntersectionCountExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_line_intersection_count_basic2_${i + 1}`, `交点の個数 ${i + 1}`)
);
