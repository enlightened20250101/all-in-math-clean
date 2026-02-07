// src/lib/course/templates/mathC/conic_ellipse_tangent_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, b: 3, ans: 5 },
  { a: 10, b: 6, ans: 10 },
  { a: 13, b: 12, ans: 13 },
  { a: 8, b: 6, ans: 8 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_ellipse_tangent_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse", "tangent"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ の点 $(${params.a},0)$ における接線の $x$ 切片を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
接線は $x=a$。よって $x$ 切片は **${p.ans}**。
`;
    },
  };
}

export const conicEllipseTangentExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_tangent_basic2_${i + 1}`, `接線 ${i + 1}`)
);
