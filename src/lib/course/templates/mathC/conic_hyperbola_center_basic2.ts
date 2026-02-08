// src/lib/course/templates/mathC/conic_hyperbola_center_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texParenShift } from "@/lib/format/tex";

const CASES = [
  { h: 3, k: -2, ask: 0, ans: 3 },
  { h: -4, k: 1, ask: 1, ans: 1 },
  { h: 0, k: 5, ask: 0, ans: 0 },
  { h: -6, k: -3, ask: 1, ans: -3 },
];

type Params = {
  h: number;
  k: number;
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
      topicId: "conic_hyperbola_center_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const xTerm = texParenShift("x", -params.h, 1);
      const yTerm = texParenShift("y", -params.k, 1);
      const statement = `反射鏡の断面を表す双曲線 $\\frac{${xTerm}}{9}-\\frac{${yTerm}}{4}=1$ の中心の ${label} 座標を求めよ。`;
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
標準形の中心は $(h,k)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const conicHyperbolaCenterExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_center_basic2_${i + 1}`, `中心 ${i + 1}`)
);
