// src/lib/course/templates/mathC/vector_operations_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type VecParams = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  op: number; // 0: add, 1: sub, 2: scalar
  k?: number;
  value: number;
};

function buildParams(): VecParams {
  const ax = randInt(-4, 4);
  const ay = randInt(-4, 4);
  const bx = randInt(-4, 4);
  const by = randInt(-4, 4);
  const op = pick([0, 1, 2]);
  if (op === 0) {
    return { ax, ay, bx, by, op, value: ax + bx };
  }
  if (op === 1) {
    return { ax, ay, bx, by, op, value: ax - bx };
  }
  const k = pick([2, -2, 3]);
  return { ax, ay, bx, by, op, k, value: k * ax };
}

function explain(params: VecParams) {
  if (params.op === 0) {
    return `
### この問題の解説
和の x 成分は $a_x+b_x$ なので、
$$
${params.ax}+${params.bx}=${params.value}
$$
答えは **${params.value}** です。
`;
  }
  if (params.op === 1) {
    return `
### この問題の解説
差の x 成分は $a_x-b_x$ なので、
$$
${params.ax}-${params.bx}=${params.value}
$$
答えは **${params.value}** です。
`;
  }
  return `
### この問題の解説
実数倍 $k\\vec{a}$ の x 成分は $k a_x$ なので、
$$
${params.k}\\cdot ${params.ax}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_operations_basic",
      title,
      difficulty: 1,
      tags: ["vector", "ct"],
    },
    generate() {
      const params = buildParams();
      const a = `\\vec{a}=(${params.ax},${params.ay})`;
      const b = `\\vec{b}=(${params.bx},${params.by})`;
      const statement =
        params.op === 0
          ? `ベクトル ${a}, ${b} について、$\\vec{a}+\\vec{b}$ の x 成分を求めよ。`
          : params.op === 1
          ? `ベクトル ${a}, ${b} について、$\\vec{a}-\\vec{b}$ の x 成分を求めよ。`
          : `ベクトル ${a} について、$${params.k}\\vec{a}$ の x 成分を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as VecParams).value);
    },
    explain(params) {
      return explain(params as VecParams);
    },
  };
}

export const vectorOperationsTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`vector_operations_basic_${i + 1}`, `ベクトル演算 ${i + 1}`)
);

const extraVectorOperationsTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`vector_operations_basic_${i + 21}`, `ベクトル演算 追加${i + 1}`)
);

vectorOperationsTemplates.push(...extraVectorOperationsTemplates);
