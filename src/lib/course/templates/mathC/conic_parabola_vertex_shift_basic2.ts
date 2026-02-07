// src/lib/course/templates/mathC/conic_parabola_vertex_shift_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear, texParenShift } from "@/lib/format/tex";

const CASES = [
  { h: 3, k: -2, ask: 0, ans: 3 },
  { h: 3, k: -2, ask: 1, ans: -2 },
  { h: -4, k: 5, ask: 0, ans: -4 },
  { h: -4, k: 5, ask: 1, ans: 5 },
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
      topicId: "conic_parabola_vertex_shift_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const lhs = texParenShift("x", -params.h, 1);
      const yShift = texLinear(1, -params.k, "y");
      const rhs = `4(${yShift})`;
      const statement = `放物線 $${lhs}=${rhs}$ の頂点の ${label} 座標を求めよ。`;
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
頂点は $(h,k)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const conicParabolaVertexShiftExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_vertex_shift_basic2_${i + 1}`, `頂点 ${i + 1}`)
);
