// src/lib/course/templates/mathC/conic_line_intersection_count_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { b: 0, ans: 2 },
  { b: 4, ans: 1 },
  { b: 8, ans: 0 },
  { b: -4, ans: 1 },
  { b: -8, ans: 0 },
  { b: 2, ans: 2 },
];

type Params = {
  b: number;
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
      tags: ["conic", "intersection"],
    },
    generate() {
      const params = buildParams();
      const statement = `円 $x^2+y^2=16$ と直線 $y=${params.b}$ の交点の個数を答えよ。`;
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
      const cmp = p.b === 0 ? "<" : p.b === 4 ? "=" : ">";
      return `
### この問題の解説
半径は 4。$|b|${cmp}4$ より交点の個数は **${p.ans}**。
`;
    },
  };
}

export const conicLineIntersectionCountTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_line_intersection_count_basic_${i + 1}`, `交点の個数 ${i + 1}`)
);

const extraLineIntersectionCountTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`conic_line_intersection_count_basic_${i + 7}`, `交点の個数 追加${i + 1}`)
);

conicLineIntersectionCountTemplates.push(...extraLineIntersectionCountTemplates);
