// src/lib/course/templates/mathC/conic_parabola_general_focus_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear, texParenShift } from "@/lib/format/tex";

const CASES = [
  { h: 2, k: -1, a: 3, ask: 0, ans: 2 },
  { h: 2, k: -1, a: 3, ask: 1, ans: 2 },
  { h: -4, k: 5, a: 2, ask: 0, ans: -4 },
  { h: -4, k: 5, a: 2, ask: 1, ans: 7 },
];

type Params = {
  h: number;
  k: number;
  a: number;
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
      topicId: "conic_parabola_general_focus_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const lhs = texParenShift("x", -params.h, 1);
      const yShift = texLinear(1, -params.k, "y");
      const rhs = `${4 * params.a}(${yShift})`;
      const statement = `放物線 $${lhs}=${rhs}$ の焦点の ${label} 座標を求めよ。`;
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
焦点は $(h,k+a)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const conicParabolaGeneralFocusExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_general_focus_basic2_${i + 1}`, `焦点 ${i + 1}`)
);
