// src/lib/course/templates/mathC/conic_circle_radius_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texParenShift } from "@/lib/format/tex";

type CircleParams = {
  h: number;
  k: number;
  r: number;
};

const CASES: CircleParams[] = [
  { h: 1, k: -2, r: 3 },
  { h: -2, k: 1, r: 4 },
  { h: 0, k: 0, r: 5 },
  { h: 2, k: 3, r: 2 },
  { h: -3, k: -1, r: 6 },
  { h: 4, k: -2, r: 1 },
  { h: -1, k: 4, r: 7 },
  { h: 3, k: 0, r: 8 },
];

function buildParams(): CircleParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_radius_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      const xTerm = texParenShift("x", -params.h, 1);
      const yTerm = texParenShift("y", -params.k, 1);
      const statement = `円 $${xTerm}+${yTerm}=${params.r * params.r}$ の半径を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as CircleParams).r);
    },
    explain(params) {
      const p = params as CircleParams;
      return `
### この問題の解説
右辺が $r^2$ なので $r=${p.r}$ です。
答えは **${p.r}** です。
`;
    },
  };
}

export const conicCircleRadiusTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_radius_basic_${i + 1}`, `円の半径 ${i + 1}`)
);

const extraCircleRadiusTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_circle_radius_basic_${i + 7}`, `円の半径 追加${i + 1}`)
);

conicCircleRadiusTemplates.push(...extraCircleRadiusTemplates);
