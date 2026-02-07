// src/lib/course/templates/math2/calculus_area_between_lines_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = {
  m: number;
  b1: number;
  b2: number;
  p: number;
  q: number;
  area: number;
};

function buildParams(): Params {
  const m = pick([1, -1, 2, -2]);
  const b1 = randInt(-2, 4);
  const width = pick([2, 3, 4]);
  const p = randInt(-1, 1);
  const q = p + width;
  const diff = pick([1, 2, 3, 4]);
  const b2 = b1 - diff;
  const area = diff * width;
  return { m, b1, b2, p, q, area };
}

export const calcAreaBetweenLinesBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_area_between_lines_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_area_between_lines_basic",
      title: `直線間の面積（逆算）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const f = texLinear(params.m, params.b1);
      const g = `${texLinear(params.m, 0)}+b`;
      const statement = `区間 $[${params.p},${params.q}]$ における $y=${f}$ と $y=${g}$ に囲まれた面積が ${params.area} のとき、$b$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).b2);
    },
    explain(params) {
      const p = params as Params;
      const width = p.q - p.p;
      const diff = p.area / width;
      return `
### この問題の解説
平行な2直線の差は一定なので
$$
|b_1-b|\\times(${width})=${p.area}
$$
より $|b_1-b|=${diff}$。したがって $b=${p.b2}$。
答えは **${p.b2}** です。
`;
    },
  };
});
