// src/lib/course/templates/mathC/conic_parabola_line_intersection_count_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

const CASES = [
  { k: 2, ans: 2 },
  { k: 0, ans: 1 },
  { k: -1, ans: 0 },
  { k: 4, ans: 2 },
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
      const line = texLinear(params.k, 0);
      const statement = `放物線 $y=x^2$ と直線 $y=${line}$ の交点の個数を答えよ。`;
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
$x^2=kx$ の解の個数で判定します。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicParabolaLineIntersectionCountExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_line_intersection_count_basic3_${i + 1}`, `交点の個数 ${i + 1}`)
);
