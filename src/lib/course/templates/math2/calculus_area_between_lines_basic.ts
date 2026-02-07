// src/lib/course/templates/math2/calculus_area_between_lines_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type AreaParams = {
  m: number;
  b1: number;
  b2: number;
  p: number;
  q: number;
  area: number;
};

const CASES: AreaParams[] = [
  { m: 1, b1: 2, b2: -1, p: 0, q: 3, area: 9 },
  { m: -1, b1: 3, b2: 0, p: -1, q: 1, area: 6 },
  { m: 2, b1: 1, b2: -2, p: 0, q: 2, area: 6 },
  { m: -2, b1: 4, b2: 1, p: 1, q: 3, area: 6 },
];

function buildParams(): AreaParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_area_between_lines_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const f = texLinear(params.m, params.b1);
      const g = texLinear(params.m, params.b2);
      const statement = `区間 $[${params.p},${params.q}]$ における $y=${f}$ と $y=${g}$ に囲まれた面積を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).area);
    },
    explain(params) {
      const p = params as AreaParams;
      const diff = Math.abs(p.b1 - p.b2);
      const width = p.q - p.p;
      return `
### この問題の解説
平行な2直線なので差は一定で、面積は
$$
${diff}\times${width}=${p.area}
$$
です。答えは **${p.area}** です。
`;
    },
  };
}

export const calcAreaBetweenLinesTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_area_between_lines_basic_${i + 1}`, `直線間の面積 ${i + 1}`)
);
