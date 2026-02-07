// src/lib/course/templates/mathC/conic_line_intersection_count_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { k: 0, ans: 2 },
  { k: 13, ans: 1 },
  { k: 14, ans: 0 },
  { k: -13, ans: 1 },
];

type Params = {
  k: number;
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
      const statement = `円 $x^2+y^2=169$ と直線 $y=${params.k}$ の交点の個数を答えよ。`;
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
半径は13なので、$|k|<13$ で2個、$|k|=13$ で1個、$|k|>13$ で0個。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicLineIntersectionCountExtraTemplates3: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_line_intersection_count_basic4_${i + 1}`, `交点の個数 ${i + 1}`)
);
