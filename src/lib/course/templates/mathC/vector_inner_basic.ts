// src/lib/course/templates/mathC/vector_inner_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type InnerParams = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  value: number;
};

function buildParams(): InnerParams {
  const ax = randInt(-4, 4);
  const ay = randInt(-4, 4);
  const bx = randInt(-4, 4);
  const by = randInt(-4, 4);
  const value = ax * bx + ay * by;
  return { ax, ay, bx, by, value };
}

function explain(params: InnerParams) {
  return `
### この問題の解説
内積は
$$
\\vec{a}\\cdot\\vec{b} = a_x b_x + a_y b_y
$$
なので、
$$
${params.ax}\\cdot ${params.bx} + ${params.ay}\\cdot ${params.by} = ${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_inner_basic",
      title,
      difficulty: 1,
      tags: ["vector", "inner", "ct"],
    },
    generate() {
      const params = buildParams();
      const a = `\\vec{a}=(${params.ax},${params.ay})`;
      const b = `\\vec{b}=(${params.bx},${params.by})`;
      const statement = `移動を表すベクトル ${a}, ${b} の内積 $\\vec{a}\\cdot\\vec{b}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as InnerParams).value);
    },
    explain(params) {
      return explain(params as InnerParams);
    },
  };
}

export const vectorInnerTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`vector_inner_basic_${i + 1}`, `内積 ${i + 1}`)
);

const extraVectorInnerTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`vector_inner_basic_${i + 21}`, `内積 追加${i + 1}`)
);

vectorInnerTemplates.push(...extraVectorInnerTemplates);
