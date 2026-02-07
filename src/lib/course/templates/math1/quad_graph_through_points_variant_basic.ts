// src/lib/course/templates/math1/quad_graph_through_points_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type Case = {
  id: string;
  title: string;
  a: number;
  b: number;
  x: number;
  c: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const y = c.a * c.x * c.x + c.b * c.x + c.c;
  const poly = texPoly2(c.a, c.b, 0);
  return {
    meta: {
      id: c.id,
      topicId: "quad_graph_basic",
      title: c.title,
      difficulty: 2,
      tags: ["quadratic", "coefficient"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `二次関数 $y=${poly}+c$ が点 $(${c.x},${y})$ を通るとき、$c$ を求めよ。`,
        answerKind: "numeric",
        params: { c: c.c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { c: number }).c);
    },
    explain() {
      return `
### この問題の解説
点を代入して $c$ を求めます。答えは **${c.c}** です。
`;
    },
  };
}

const CASES: Case[] = [
  { id: "quad_point_c_v1", title: "点を通る（c）1", a: 1, b: -2, x: 2, c: 1 },
  { id: "quad_point_c_v2", title: "点を通る（c）2", a: 2, b: 1, x: -1, c: -3 },
  { id: "quad_point_c_v3", title: "点を通る（c）3", a: -1, b: 4, x: 3, c: 2 },
  { id: "quad_point_c_v4", title: "点を通る（c）4", a: 3, b: -3, x: 1, c: -2 },
];

export const quadGraphThroughPointsVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
