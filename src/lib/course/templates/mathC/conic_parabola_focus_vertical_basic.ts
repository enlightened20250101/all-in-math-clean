// src/lib/course/templates/mathC/conic_parabola_focus_vertical_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { p: 1, fx: 0, fy: 1 },
  { p: 2, fx: 0, fy: 2 },
  { p: 3, fx: 0, fy: 3 },
  { p: 4, fx: 0, fy: 4 },
  { p: 5, fx: 0, fy: 5 },
  { p: 6, fx: 0, fy: 6 },
];

type Params = {
  p: number;
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
      topicId: "conic_parabola_focus_vertical_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const statement = `放物線 $x^2=4${params.p}y$ の焦点の${params.ask === 1 ? "x" : "y"}座標を求めよ。`;
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
$x^2=4py$ の焦点は $(0,p)$。
よって答えは **${p.ans}**。
`;
    },
  };
}

export const conicParabolaFocusVerticalTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_focus_vertical_basic_${i + 1}`, `焦点 ${i + 1}`)
);

const extraParabolaFocusVerticalTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_parabola_focus_vertical_basic_${i + 7}`, `焦点 追加${i + 1}`)
);

conicParabolaFocusVerticalTemplates.push(...extraParabolaFocusVerticalTemplates);
