// src/lib/course/templates/mathC/conic_hyperbola_vertex_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, b: 3, ans: 2 },
  { a: 3, b: 4, ans: 3 },
  { a: 5, b: 12, ans: 5 },
  { a: 6, b: 8, ans: 6 },
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
      topicId: "conic_hyperbola_vertex_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の頂点の $x$ 座標（正）を求めよ。`;
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
頂点は $(\\pm a,0)$。
正の $x$ 座標は **${p.ans}**。
`;
    },
  };
}

export const conicHyperbolaVertexExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_vertex_basic2_${i + 1}`, `頂点 ${i + 1}`)
);
