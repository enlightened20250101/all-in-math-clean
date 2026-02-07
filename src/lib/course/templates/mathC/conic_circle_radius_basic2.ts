// src/lib/course/templates/mathC/conic_circle_radius_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texParenShift } from "@/lib/format/tex";

const CASES = [
  { h: 2, k: -1, r: 3, ans: 3 },
  { h: -4, k: 5, r: 2, ans: 2 },
  { h: 0, k: 0, r: 6, ans: 6 },
  { h: -3, k: -3, r: 5, ans: 5 },
];

type Params = {
  h: number;
  k: number;
  r: number;
  ans: number;
};

function buildParams(): Params {
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
      const statement = `円 $${xTerm}+${yTerm}=${params.r ** 2}$ の半径を求めよ。`;
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
      return `
### この問題の解説
標準形から半径は $r$。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicCircleRadiusExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_radius_basic2_${i + 1}`, `半径 ${i + 1}`)
);
