// src/lib/course/templates/mathC/vector_component_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type CompParams = {
  ax: number;
  ay: number;
};

function buildParams(): CompParams {
  const ax = randInt(-5, 5);
  const ay = randInt(-5, 5);
  return { ax, ay };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_component_basic",
      title,
      difficulty: 1,
      tags: ["vector", "component", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `ベクトル $\\vec{a}=(${params.ax},${params.ay})$ の $x$ 成分を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as CompParams).ax);
    },
    explain(params) {
      const p = params as CompParams;
      return `
### この問題の解説
成分表示の $x$ 成分は ${p.ax} です。
答えは **${p.ax}** です。
`;
    },
  };
}

export const vectorComponentTemplates: QuestionTemplate[] = Array.from({ length: 20 }, (_, i) =>
  buildTemplate(`vector_component_basic_${i + 1}`, `成分 ${i + 1}`)
);

const extraVectorComponentTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_component_basic_${i + 21}`, `成分 追加${i + 1}`)
);

vectorComponentTemplates.push(...extraVectorComponentTemplates);
