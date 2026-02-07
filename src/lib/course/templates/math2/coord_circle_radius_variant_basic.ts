// src/lib/course/templates/math2/coord_circle_radius_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texParenShift } from "@/lib/format/tex";

type RadiusCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  r: number;
};

function buildTemplate(c: RadiusCase): QuestionTemplate {
  const xShift = texParenShift("x", -c.a, 1);
  const yShift = texParenShift("y", -c.b, 1);
  return {
    meta: {
      id: c.id,
      topicId: "coord_circle_radius_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `円 ${xShift}^2+${yShift}^2=${c.r}^2 の半径を求めよ。`,
        answerKind: "numeric",
        params: { a: c.a, b: c.b, r: c.r },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.r);
    },
    explain() {
      return `
### この問題の解説
標準形 $(x-a)^2+(y-b)^2=r^2$ の半径は $r$ です。
答えは **${c.r}** です。
`;
    },
  };
}

const CASES: RadiusCase[] = [
  { id: "coord_circle_r_v1", title: "半径（別）1", a: 2, b: -1, r: 3 },
  { id: "coord_circle_r_v2", title: "半径（別）2", a: -3, b: 2, r: 4 },
  { id: "coord_circle_r_v3", title: "半径（別）3", a: 1, b: 3, r: 5 },
  { id: "coord_circle_r_v4", title: "半径（別）4", a: -2, b: -4, r: 6 },
  { id: "coord_circle_r_v5", title: "半径（別）5", a: 0, b: -3, r: 4 },
  { id: "coord_circle_r_v6", title: "半径（別）6", a: 4, b: 1, r: 2 },
];

export const coordCircleRadiusVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
