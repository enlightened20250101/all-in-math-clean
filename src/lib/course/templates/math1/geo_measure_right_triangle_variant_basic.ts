// src/lib/course/templates/math1/geo_measure_right_triangle_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texAngle, texSegmentLen } from "@/lib/format/tex";

type NumericCase = {
  id: string;
  title: string;
  statement: string;
  answer: number;
  explain: string;
};

function buildNumeric(c: NumericCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "geo_measure_right_triangle_basic",
      title: c.title,
      difficulty: 1,
      tags: ["geometry", "right-triangle"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.answer);
    },
    explain() {
      return c.explain;
    },
  };
}

function rightTriangleConditions(parts: string[]): string {
  return `$$\n${parts.join(",\\, ")}\n$$`;
}

const CASES: NumericCase[] = [
  {
    id: "geo_rt_v1",
    title: "sin30で高さ（別）",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 30),
      texSegmentLen("A", "B", 18),
    ])}`,
    answer: 9,
    explain: `
### この問題の解説
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2} なので、$BC=18\\times\\frac{1}{2}=9$ です。
`,
  },
  {
    id: "geo_rt_v2",
    title: "cos60で隣辺（別）",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 60),
      texSegmentLen("A", "B", 14),
    ])}`,
    answer: 7,
    explain: `
### この問題の解説
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2} なので、$AC=14\\times\\frac{1}{2}=7$ です。
`,
  },
  {
    id: "geo_rt_v3",
    title: "tan45で高さ（別）",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 45),
      texSegmentLen("A", "C", 7),
    ])}`,
    answer: 7,
    explain: `
### この問題の解説
\\tan 45^\\circ = \\frac{BC}{AC} = 1 なので、$BC=AC=7$ です。
`,
  },
  {
    id: "geo_rt_v4",
    title: "tan45で隣辺（別）",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 45),
      texSegmentLen("B", "C", 6),
    ])}`,
    answer: 6,
    explain: `
### この問題の解説
\\tan 45^\\circ = \\frac{BC}{AC} = 1 なので、$AC=BC=6$ です。
`,
  },
];

export const geoMeasureRightTriangleVariantTemplates: QuestionTemplate[] = CASES.map(buildNumeric);
