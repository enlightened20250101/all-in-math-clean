// src/lib/course/templates/math2/coord_line_slope_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

type SlopeCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
};

function formatEquation(a: number, b: number, c: number): string {
  const aTerm = texTerm(a, "x", true);
  const bTerm = texTerm(b, "y", false);
  const cTerm = texConst(c);
  const parts = [aTerm, bTerm, cTerm].filter(Boolean).join(" ");
  return `${parts}=0`;
}

function slope(c: SlopeCase): number {
  return -c.a / c.b;
}

function buildTemplate(c: SlopeCase): QuestionTemplate {
  const m = slope(c);
  return {
    meta: {
      id: c.id,
      topicId: "coord_line_slope_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const eq = formatEquation(c.a, c.b, c.c);
      return {
        templateId: c.id,
        statement: `直線 ${eq} の傾きを求めよ。`,
        answerKind: "numeric",
        params: { a: c.a, b: c.b, m },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, m);
    },
    explain() {
      return `
### この問題の解説
${c.a}x+${c.b}y+${c.c}=0 を $y=mx+b$ に直すと
$$
y=-\\frac{${c.a}}{${c.b}}x-\\frac{${c.c}}{${c.b}}
$$
なので傾きは $m=${m}$ です。
`;
    },
  };
}

const CASES: SlopeCase[] = [
  { id: "coord_slope_v1", title: "傾き（標準形）1", a: 2, b: -1, c: 4 },
  { id: "coord_slope_v2", title: "傾き（標準形）2", a: -3, b: 1, c: -3 },
  { id: "coord_slope_v3", title: "傾き（標準形）3", a: 4, b: -2, c: 2 },
  { id: "coord_slope_v4", title: "傾き（標準形）4", a: -6, b: 2, c: 6 },
  { id: "coord_slope_v5", title: "傾き（標準形）5", a: 1, b: -1, c: -5 },
  { id: "coord_slope_v6", title: "傾き（標準形）6", a: -2, b: 1, c: 1 },
];

export const coordLineSlopeVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
