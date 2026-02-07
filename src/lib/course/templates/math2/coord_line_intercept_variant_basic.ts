// src/lib/course/templates/math2/coord_line_intercept_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type InterceptCase = {
  id: string;
  title: string;
  m: number;
  b: number;
};

function formatLine(m: number, b: number): string {
  return texLinear(m, b);
}

function xIntercept(c: InterceptCase): number {
  return -c.b / c.m;
}

function buildTemplate(c: InterceptCase): QuestionTemplate {
  const x0 = xIntercept(c);
  return {
    meta: {
      id: c.id,
      topicId: "coord_line_intercept_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const line = formatLine(c.m, c.b);
      return {
        templateId: c.id,
        statement: `直線 $y=${line}$ の $x$ 切片を求めよ。`,
        answerKind: "numeric",
        params: { m: c.m, b: c.b, x0 },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, x0);
    },
    explain() {
      return `
### この問題の解説
$y=0$ とおくと
$$
0=${c.m}x+${c.b}
$$
より $x=${x0}$。答えは **${x0}** です。
`;
    },
  };
}

const CASES: InterceptCase[] = [
  { id: "coord_xint_v1", title: "x切片 1", m: 1, b: -3 },
  { id: "coord_xint_v2", title: "x切片 2", m: -2, b: 6 },
  { id: "coord_xint_v3", title: "x切片 3", m: 3, b: -9 },
  { id: "coord_xint_v4", title: "x切片 4", m: -1, b: 4 },
  { id: "coord_xint_v5", title: "x切片 5", m: 2, b: -8 },
  { id: "coord_xint_v6", title: "x切片 6", m: -3, b: 12 },
  { id: "coord_xint_v7", title: "x切片 7", m: 4, b: -12 },
  { id: "coord_xint_v8", title: "x切片 8", m: -4, b: 16 },
];

export const coordLineInterceptVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
