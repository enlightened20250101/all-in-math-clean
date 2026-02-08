// src/lib/course/templates/mathC/vector_orthogonality_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type OrthoParams = { ax: number; ay: number; bx: number; by: number; value: number };

function buildParams(): OrthoParams {
  const ax = randInt(-4, 4) || 1;
  const ay = randInt(-4, 4);
  const bx = randInt(-4, 4);
  const by = randInt(-4, 4) || 1;
  // ax*bx + ay*by = 0 → bx = -ay*by/ax
  const value = -ay * by / ax;
  return { ax, ay, bx, by, value };
}

function explain(params: OrthoParams) {
  return `
### この問題の解説
直交条件は
$$
\\vec{a}\\cdot\\vec{b}=0
$$
なので
$$
${params.ax}x+${params.ay}\\cdot ${params.by}=0
$$
より $x=${params.value}$。答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_orthogonality_basic",
      title,
      difficulty: 1,
      tags: ["vector", "orthogonal", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `移動方向を表すベクトル $\\vec{a}=(${params.ax},${params.ay})$, $\\vec{b}=(x,${params.by})$ が直交するとき、$x$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as OrthoParams).value);
    },
    explain(params) {
      return explain(params as OrthoParams);
    },
  };
}

const extraVectorOrthogonalityTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_orthogonality_basic_${i + 21}`, `直交条件 追加${i + 1}`)
);

export const vectorOrthogonalityTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) =>
    buildTemplate(`vector_orthogonality_basic_${i + 1}`, `直交条件 ${i + 1}`)
  ),
  ...extraVectorOrthogonalityTemplates,
];
