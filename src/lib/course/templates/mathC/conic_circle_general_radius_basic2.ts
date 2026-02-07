// src/lib/course/templates/mathC/conic_circle_general_radius_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { d: -6, e: 4, f: -3, ans: 2 },
  { d: 8, e: -10, f: -7, ans: 6 },
  { d: -4, e: -6, f: -12, ans: 5 },
  { d: 2, e: 6, f: -4, ans: 4 },
];

type Params = {
  d: number;
  e: number;
  f: number;
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
      topicId: "conic_circle_general_radius_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      const statement = `円 $x^2+y^2${sign(params.d)}${Math.abs(params.d)}x${sign(params.e)}${Math.abs(params.e)}y${sign(params.f)}${Math.abs(params.f)}=0$ の半径を求めよ。`;
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
半径は $\\sqrt{\\left(\\frac{d}{2}\\right)^2+\\left(\\frac{e}{2}\\right)^2-f}$。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicCircleGeneralRadiusExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_general_radius_basic2_${i + 1}`, `半径 ${i + 1}`)
);
