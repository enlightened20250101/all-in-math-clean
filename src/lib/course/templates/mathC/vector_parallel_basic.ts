// src/lib/course/templates/mathC/vector_parallel_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type ParallelParams = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  k: number;
};

const CASES: ParallelParams[] = [
  { ax: 1, ay: 2, bx: 2, by: 4, k: 2 },
  { ax: -1, ay: 3, bx: 2, by: -6, k: -2 },
  { ax: 2, ay: -1, bx: 6, by: -3, k: 3 },
  { ax: -2, ay: -1, bx: 4, by: 2, k: -2 },
];

function buildParams(): ParallelParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_parallel_basic",
      title,
      difficulty: 1,
      tags: ["vector", "parallel", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の移動を表すベクトル $\\vec{a}=(${params.ax},${params.ay})$ と $\\vec{b}=(${params.bx},${params.by})$ が同一直線上にあるとき、$\\vec{b}=k\\vec{a}$ の $k$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParallelParams).k);
    },
    explain(params) {
      const p = params as ParallelParams;
      return `
### この問題の解説
成分比が等しいので $k=${p.k}$ です。
答えは **${p.k}** です。
`;
    },
  };
}

export const vectorParallelTemplates: QuestionTemplate[] = Array.from({ length: 20 }, (_, i) =>
  buildTemplate(`vector_parallel_basic_${i + 1}`, `平行 ${i + 1}`)
);

const extraVectorParallelTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_parallel_basic_${i + 21}`, `平行 追加${i + 1}`)
);

vectorParallelTemplates.push(...extraVectorParallelTemplates);
