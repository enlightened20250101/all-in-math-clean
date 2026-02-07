// src/lib/course/templates/mathC/conic_parabola_vertex_shift_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst, texParenShift } from "@/lib/format/tex";

const CASES = [
  { h: 2, k: -1 },
  { h: -3, k: 2 },
  { h: 1, k: 4 },
  { h: -2, k: -3 },
  { h: 4, k: 1 },
  { h: 0, k: -2 },
];

type Params = {
  h: number;
  k: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const ask = Math.random() < 0.5 ? 1 : 0;
  const ans = ask === 1 ? base.h : base.k;
  return { ...base, ask, ans };
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
      const core = texParenShift("x", -params.h, 1);
      const shift = texConst(params.k);
      const fx = shift ? `${core} ${shift}` : core;
      const statement = `放物線 $y=${fx}$ の頂点の${params.ask === 1 ? "x" : "y"}座標を求めよ。`;
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
頂点は $(h,k)=(${p.h},${p.k})$。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicParabolaVertexShiftTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_vertex_shift_basic_${i + 1}`, `頂点 ${i + 1}`)
);

const extraParabolaVertexShiftTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_parabola_vertex_shift_basic_${i + 7}`, `頂点 追加${i + 1}`)
);

conicParabolaVertexShiftTemplates.push(...extraParabolaVertexShiftTemplates);
