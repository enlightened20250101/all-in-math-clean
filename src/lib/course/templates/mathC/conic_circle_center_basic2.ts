// src/lib/course/templates/mathC/conic_circle_center_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texParenShift } from "@/lib/format/tex";

const CASES = [
  { h: 2, k: -1, r: 3, ask: 0, ans: 2 },
  { h: 2, k: -1, r: 3, ask: 1, ans: -1 },
  { h: -4, k: 5, r: 2, ask: 0, ans: -4 },
  { h: -4, k: 5, r: 2, ask: 1, ans: 5 },
];

type Params = {
  h: number;
  k: number;
  r: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_center_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const xTerm = texParenShift("x", -params.h, 1);
      const yTerm = texParenShift("y", -params.k, 1);
      const statement = `円 $${xTerm}+${yTerm}=${params.r ** 2}$ の中心の ${label} 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      const label = p.ask === 0 ? "x" : "y";
      return `
### この問題の解説
中心は $(h,k)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const conicCircleCenterExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_center_basic2_${i + 1}`, `中心 ${i + 1}`)
);
