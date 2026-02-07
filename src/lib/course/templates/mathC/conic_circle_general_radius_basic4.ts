// src/lib/course/templates/mathC/conic_circle_general_radius_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { normalizeSigns, texConst, texTerm } from "@/lib/format/tex";

const CASES = [
  { d: -10, e: 0, f: 21, ans: 2 },
  { d: 0, e: 8, f: 0, ans: 4 },
  { d: -6, e: -8, f: -9, ans: 7 },
  { d: 4, e: -12, f: -11, ans: 7 },
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
      let expr = "x^2+y^2";
      if (params.d !== 0) expr += ` ${texTerm(params.d, "x")}`;
      if (params.e !== 0) expr += ` ${texTerm(params.e, "y")}`;
      if (params.f !== 0) expr += ` ${texConst(params.f)}`;
      expr = normalizeSigns(expr);
      const statement = `円 $${expr}=0$ の半径を求めよ。`;
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

export const conicCircleGeneralRadiusExtraTemplates3: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_general_radius_basic4_${i + 1}`, `半径 ${i + 1}`)
);
