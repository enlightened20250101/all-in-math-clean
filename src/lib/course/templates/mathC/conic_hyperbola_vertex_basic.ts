// src/lib/course/templates/mathC/conic_hyperbola_vertex_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type VertexParams = {
  a2: number;
  a: number;
};

const CASES: VertexParams[] = [
  { a2: 4, a: 2 },
  { a2: 9, a: 3 },
  { a2: 16, a: 4 },
  { a2: 25, a: 5 },
  { a2: 36, a: 6 },
  { a2: 49, a: 7 },
];

function buildParams(): VertexParams {
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
      const statement = `測定で得た反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a2}}-\\frac{y^2}{1}=1$ の頂点の $x$ 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as VertexParams).a);
    },
    explain(params) {
      const p = params as VertexParams;
      return `
### この問題の解説
標準形では頂点は $(\\pm a,0)$ なので $x$ 座標は ${p.a} です。
答えは **${p.a}** です。
`;
    },
  };
}

export const conicHyperbolaVertexTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_vertex_basic_${i + 1}`, `測定で得た反射鏡の断面を表す双曲線の頂点 ${i + 1}`)
);

const extraHyperbolaVertexTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_hyperbola_vertex_basic_${i + 7}`, `測定で得た反射鏡の断面を表す双曲線の頂点 追加${i + 1}`)
);

conicHyperbolaVertexTemplates.push(...extraHyperbolaVertexTemplates);
