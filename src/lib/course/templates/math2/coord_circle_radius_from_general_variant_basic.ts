// src/lib/course/templates/math2/coord_circle_radius_from_general_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  a: number;
  b: number;
  r: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const D = -2 * c.a;
  const E = -2 * c.b;
  const F = c.a * c.a + c.b * c.b - c.r * c.r;
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
        statement: `円 $x^2+y^2${D >= 0 ? `+${D}` : D}x${E >= 0 ? `+${E}` : E}y${F >= 0 ? `+${F}` : F}=0$ の半径を求めよ。`,
        answerKind: "numeric",
        params: { r: c.r },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { r: number }).r);
    },
    explain(params) {
      const r = (params as { r: number }).r;
      return `### この問題の解説\n平方完成して半径を求めます。答えは **${r}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "coord_circle_r_gen_1", title: "一般形の半径 1", a: 2, b: -1, r: 3 },
  { id: "coord_circle_r_gen_2", title: "一般形の半径 2", a: -3, b: 2, r: 4 },
  { id: "coord_circle_r_gen_3", title: "一般形の半径 3", a: 1, b: 3, r: 5 },
  { id: "coord_circle_r_gen_4", title: "一般形の半径 4", a: -2, b: -4, r: 6 },
];

export const coordCircleRadiusFromGeneralVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
