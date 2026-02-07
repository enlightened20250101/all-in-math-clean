// src/lib/course/templates/mathC/conic_parabola_line_intersection_count_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { t: -1, ans: 0 },
  { t: 0, ans: 1 },
  { t: 4, ans: 2 },
  { t: -4, ans: 0 },
  { t: 1, ans: 2 },
  { t: 9, ans: 2 },
];

type Params = {
  t: number;
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
      const statement = `放物線 $y^2=4x$ と直線 $x=${params.t}$ の交点の個数を答えよ。`;
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
      const cmp = p.t < 0 ? "<" : p.t === 0 ? "=" : ">";
      return `
### この問題の解説
$x=${p.t}$ のとき $y^2=4x$ より $y^2=4\times ${p.t}$。
${p.t} ${cmp} 0 なので交点の個数は **${p.ans}**。
`;
    },
  };
}

export const conicParabolaLineIntersectionCountTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_line_intersection_count_basic_${i + 1}`, `交点の個数 ${i + 1}`)
);

const extraParabolaLineIntersectionCountTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_parabola_line_intersection_count_basic_${i + 7}`, `交点の個数 追加${i + 1}`)
);

conicParabolaLineIntersectionCountTemplates.push(...extraParabolaLineIntersectionCountTemplates);
