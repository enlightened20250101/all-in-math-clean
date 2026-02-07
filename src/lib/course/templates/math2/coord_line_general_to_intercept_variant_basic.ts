// src/lib/course/templates/math2/coord_line_general_to_intercept_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const b = -c.c / c.b;
  const eq = `${c.a}x${c.b >= 0 ? `+${c.b}` : c.b}y${c.c >= 0 ? `+${c.c}` : c.c}=0`;
  return {
    meta: {
      id: c.id,
      topicId: "coord_line_intercept_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `直線 ${eq} の $y$ 切片を求めよ。`,
        answerKind: "numeric",
        params: { b },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { b: number }).b);
    },
    explain(params) {
      const value = (params as { b: number }).b;
      return `### この問題の解説\n$x=0$ を代入すると ${c.b}y+${c.c}=0 なので $y=${value}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "coord_int_gen_1", title: "切片（一般形）1", a: 2, b: -1, c: 4 },
  { id: "coord_int_gen_2", title: "切片（一般形）2", a: -3, b: 1, c: -6 },
  { id: "coord_int_gen_3", title: "切片（一般形）3", a: 4, b: -2, c: 8 },
  { id: "coord_int_gen_4", title: "切片（一般形）4", a: -2, b: 1, c: 3 },
];

export const coordLineGeneralInterceptVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
