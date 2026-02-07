// src/lib/course/templates/mathC/conic_parabola_general_focus_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear, texParenShift } from "@/lib/format/tex";

const CASES = [
  { p: 1, h: 2, k: -1, fx: 3, fy: -1 },
  { p: 2, h: -1, k: 3, fx: 1, fy: 3 },
  { p: 3, h: 0, k: 0, fx: 3, fy: 0 },
  { p: 4, h: -2, k: 1, fx: 2, fy: 1 },
  { p: 5, h: 1, k: -2, fx: 6, fy: -2 },
  { p: 6, h: -1, k: 2, fx: 5, fy: 2 },
];

type Params = {
  p: number;
  h: number;
  k: number;
  fx: number;
  fy: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const ask = Math.random() < 0.5 ? 1 : 0;
  const ans = ask === 1 ? base.fx : base.fy;
  return { ...base, ask, ans };
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
      const lhs = texParenShift("y", -params.k, 1);
      const xShift = texLinear(1, -params.h);
      const rhs = `${4 * params.p}(${xShift})`;
      const statement = `放物線 $${lhs}=${rhs}$ の焦点の${params.ask === 1 ? "x" : "y"}座標を求めよ。`;
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
焦点は $(h+p,k)$ なので **${p.ans}**。
`;
    },
  };
}

export const conicParabolaGeneralFocusTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_general_focus_basic_${i + 1}`, `焦点 ${i + 1}`)
);

const extraParabolaGeneralFocusTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_parabola_general_focus_basic_${i + 7}`, `焦点 追加${i + 1}`)
);

conicParabolaGeneralFocusTemplates.push(...extraParabolaGeneralFocusTemplates);
