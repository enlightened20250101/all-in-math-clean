// src/lib/course/templates/mathC/conic_parabola_line_intersection_count_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { k: 1, ans: 2 },
  { k: 0, ans: 1 },
  { k: -1, ans: 0 },
  { k: 2, ans: 2 },
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
      topicId: "conic_parabola_line_intersection_count_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const statement = `放物線 $y=x^2$ と直線 $y=${params.k}$ の交点の個数を答えよ。`;
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
$x^2=k$ の解の個数で判定します。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicParabolaLineIntersectionCountExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_line_intersection_count_basic2_${i + 1}`, `交点の個数 ${i + 1}`)
);
