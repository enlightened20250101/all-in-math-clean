// src/lib/course/templates/math1/quad_graph_coefficient_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texConst, texParenShift, texPoly2 } from "@/lib/format/tex";

type Case = {
  id: string;
  title: string;
  p: number;
  q: number;
  x: number;
  y: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const a = (c.y - c.q) / ((c.x - c.p) * (c.x - c.p));
  const xShift = texParenShift("x", -c.p, 1);
  const aText = a === 1 ? "" : a === -1 ? "-" : `${a}`;
  const qText = texConst(c.q);
  const form = `${aText}${xShift}${qText ? ` ${qText}` : ""}`;
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
        statement: `頂点形式の係数を決める。二次関数 $y=${form}$ が点 $(${c.x},${c.y})$ を通る。$a$ を求めよ。`,
        answerKind: "numeric",
        params: { a },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { a: number }).a);
    },
    explain(params) {
      const aa = (params as { a: number }).a;
      const poly = texPoly2(aa, -2 * aa * c.p, aa * c.p * c.p + c.q);
      return `
### この問題の解説
与えられた点を代入して $a$ を求めます。答えは **${aa}** です。
（参考）標準形に直すと $y=${poly}$ です。
`;
    },
  };
}

const CASES: Case[] = [
  { id: "quad_coef_v1", title: "係数決定 1", p: 1, q: 2, x: 3, y: 6 },
  { id: "quad_coef_v2", title: "係数決定 2", p: -2, q: 1, x: 0, y: 9 },
  { id: "quad_coef_v3", title: "係数決定 3", p: 2, q: -1, x: 5, y: 8 },
  { id: "quad_coef_v4", title: "係数決定 4", p: -1, q: 0, x: 1, y: 4 },
];

export const quadGraphCoefficientVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
