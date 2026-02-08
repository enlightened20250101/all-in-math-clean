// src/lib/course/templates/mathC/vector_orthogonal_condition_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a1: 1, a2: 2, b2: 3, x: -6 },
  { a1: 2, a2: -1, b2: 4, x: 2 },
  { a1: -1, a2: 3, b2: 2, x: -6 },
  { a1: 3, a2: 1, b2: -2, x: -2 },
];

type OrthParams = {
  a1: number;
  a2: number;
  b2: number;
  x: number;
};

function buildParams(): OrthParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_orthogonal_condition_basic",
      title,
      difficulty: 1,
      tags: ["vector", "orthogonal", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `進行方向を表すベクトル $\\vec{a}=(${params.a1},${params.a2})$ と $\\vec{b}=(x,${params.b2})$ が直交するとき、$x$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as OrthParams).x);
    },
    explain(params) {
      const p = params as OrthParams;
      return `
### この問題の解説
直交条件は内積が0なので
$$
${p.a1}x+${p.a2}\\times${p.b2}=0
$$
より $x=${p.x}$ です。
答えは **${p.x}** です。
`;
    },
  };
}

const extraVectorOrthogonalConditionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_orthogonal_condition_basic_${i + 21}`, `直交条件 追加${i + 1}`)
);

export const vectorOrthogonalConditionTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) =>
    buildTemplate(`vector_orthogonal_condition_basic_${i + 1}`, `直交条件 ${i + 1}`)
  ),
  ...extraVectorOrthogonalConditionTemplates,
];
