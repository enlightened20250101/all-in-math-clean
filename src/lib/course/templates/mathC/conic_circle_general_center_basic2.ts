// src/lib/course/templates/mathC/conic_circle_general_center_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { d: -6, e: 4, f: -3, ask: 0, ans: 3 },
  { d: -6, e: 4, f: -3, ask: 1, ans: -2 },
  { d: 8, e: -10, f: -7, ask: 0, ans: -4 },
  { d: 8, e: -10, f: -7, ask: 1, ans: 5 },
];

type Params = {
  d: number;
  e: number;
  f: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function sign(n: number): string {
  return n >= 0 ? "+" : "-";
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_general_center_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const statement = `円 $x^2+y^2${sign(params.d)}${Math.abs(params.d)}x${sign(params.e)}${Math.abs(params.e)}y${sign(params.f)}${Math.abs(params.f)}=0$ の中心の ${label} 座標を求めよ。`;
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
中心は $\\left(-\\frac{d}{2},-\\frac{e}{2}\\right)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const conicCircleGeneralCenterExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_general_center_basic2_${i + 1}`, `中心 ${i + 1}`)
);
