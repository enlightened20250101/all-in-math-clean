// src/lib/course/templates/mathC/vector_area_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texEq } from "@/lib/format/tex";

type AreaParams = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  area: number;
};

const CASES = [
  { ax: 1, ay: 2, bx: 3, by: 0 },
  { ax: 2, ay: 1, bx: -1, by: 2 },
  { ax: -2, ay: 1, bx: 1, by: 3 },
  { ax: 3, ay: -1, bx: 1, by: 2 },
];

function buildParams(): AreaParams {
  const c = pick(CASES);
  const area = Math.abs(c.ax * c.by - c.ay * c.bx);
  return { ...c, area };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_area_basic",
      title,
      difficulty: 1,
      tags: ["vector", "area", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `畑の区画を表すベクトル $\\vec{a}=(${params.ax},${params.ay})$, $\\vec{b}=(${params.bx},${params.by})$ が張る平行四辺形の面積を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).area);
    },
    explain(params) {
      const p = params as AreaParams;
      const det = p.ax * p.by - p.ay * p.bx;
      return `
### この問題の解説
面積は $|a_x b_y - a_y b_x|$ なので
$$
${texEq("S", `|${det}|=${p.area}`)}
$$
です。答えは **${p.area}** です。
`;
    },
  };
}

const extraVectorAreaTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_area_basic_${i + 21}`, `平行四辺形の面積 追加${i + 1}`)
);

export const vectorAreaTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) =>
    buildTemplate(`vector_area_basic_${i + 1}`, `平行四辺形の面積 ${i + 1}`)
  ),
  ...extraVectorAreaTemplates,
];
