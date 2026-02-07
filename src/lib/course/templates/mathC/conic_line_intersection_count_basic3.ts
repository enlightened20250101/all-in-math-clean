// src/lib/course/templates/mathC/conic_line_intersection_count_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { k: 0, ans: 2 },
  { k: 5, ans: 1 },
  { k: 6, ans: 0 },
  { k: -5, ans: 1 },
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
      const statement = `円 $x^2+y^2=25$ と直線 $y=${params.k}$ の交点の個数を答えよ。`;
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
半径は5なので、$|k|<5$ で2個、$|k|=5$ で1個、$|k|>5$ で0個。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicLineIntersectionCountExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_line_intersection_count_basic3_${i + 1}`, `交点の個数 ${i + 1}`)
);
