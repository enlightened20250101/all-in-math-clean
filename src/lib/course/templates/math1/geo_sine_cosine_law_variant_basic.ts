// src/lib/course/templates/math1/geo_sine_cosine_law_variant_basic.ts
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
      topicId: "geo_sine_cosine_law_basic",
      title: c.title,
      difficulty: 1,
      tags: ["geometry", "sine-law", "cosine-law"],
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

function triangleConditions(parts: string[]): string {
  return `$$\n${parts.join(",\\, ")}\n$$`;
}

const CASES: NumericCase[] = [
  {
    id: "geo_sine_v1",
    title: "正弦定理（30°/90°）1",
    statement: `三角形ABCで次を満たす。$\\overline{AC}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("A", 30),
      texAngle("B", 90),
      texSegmentLen("B", "C", 5),
    ])}`,
    answer: 10,
    explain: `
### この問題の解説
正弦定理より $\\dfrac{BC}{\\sin A}=\\dfrac{AC}{\\sin B}$。
$$
AC = BC\\cdot\\frac{\\sin B}{\\sin A}=5\\cdot\\frac{1}{1/2}=10
$$
`,
  },
  {
    id: "geo_sine_v2",
    title: "正弦定理（30°/90°）2",
    statement: `三角形ABCで次を満たす。$\\overline{BC}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("A", 30),
      texAngle("B", 90),
      texSegmentLen("A", "C", 14),
    ])}`,
    answer: 7,
    explain: `
### この問題の解説
正弦定理より $\\dfrac{BC}{\\sin A}=\\dfrac{AC}{\\sin B}$。
$$
BC = AC\\cdot\\frac{\\sin A}{\\sin B}=14\\cdot\\frac{1/2}{1}=7
$$
`,
  },
  {
    id: "geo_cos_v1",
    title: "余弦定理（60°）1",
    statement: `三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 4),
      texSegmentLen("B", "C", 4),
    ])}`,
    answer: 4,
    explain: `
### この問題の解説
余弦定理より
$$
AB^2=AC^2+BC^2-2\\cdot AC\\cdot BC\\cos 60^\\circ=16+16-2\\cdot4\\cdot4\\cdot\\frac{1}{2}=16
$$
よって $AB=4$。
`,
  },
  {
    id: "geo_cos_v2",
    title: "余弦定理（60°）2",
    statement: `三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 3),
      texSegmentLen("B", "C", 3),
    ])}`,
    answer: 3,
    explain: `
### この問題の解説
余弦定理より
$$
AB^2=3^2+3^2-2\\cdot3\\cdot3\\cdot\\frac{1}{2}=9
$$
$AB=3$ です。
`,
  },
];

export const geoSineCosineLawVariantTemplates: QuestionTemplate[] = CASES.map(buildNumeric);
