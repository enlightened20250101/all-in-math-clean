// src/lib/course/templates/mathC/vector_equation_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type Params = {
  u1: number;
  u2: number;
  v1: number;
  v2: number;
  a: number;
  b: number;
  w1: number;
  w2: number;
};

function buildParams(): Params {
  let u1 = 0;
  let u2 = 0;
  let v1 = 0;
  let v2 = 0;
  let det = 0;
  while (det === 0) {
    u1 = randInt(-3, 4);
    u2 = randInt(-3, 4);
    v1 = randInt(-3, 4);
    v2 = randInt(-3, 4);
    det = u1 * v2 - u2 * v1;
  }
  const a = randInt(-3, 4);
  const b = randInt(-3, 4);
  const w1 = a * u1 + b * v1;
  const w2 = a * u2 + b * v2;
  return { u1, u2, v1, v2, a, b, w1, w2 };
}

export const vectorEquationVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `vector_equation_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "vector_equation_basic",
      title: `ベクトル方程式の係数 ${i + 1}`,
      difficulty: 2,
      tags: ["vector", "equation", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `合成移動として $a\\vec{u}+b\\vec{v}=\\vec{w}$ を満たす $a+b$ を求めよ。\\n\\n$\\vec{u}=(${params.u1},${params.u2})$, $\\vec{v}=(${params.v1},${params.v2})$, $\\vec{w}=(${params.w1},${params.w2})$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { a, b } = params as Params;
      return gradeNumeric(userAnswer, a + b);
    },
    explain(params) {
      const { a, b } = params as Params;
      return `### この問題の解説\n連立方程式を解いて $a=${a}, b=${b}$。したがって $a+b=${a + b}$。`;
    },
  };
});
