// src/lib/course/templates/mathC/conic_parabola_vertex_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst, texParenShift } from "@/lib/format/tex";

type VertexParams = {
  h: number;
  k: number;
};

const CASES: VertexParams[] = [
  { h: 1, k: -2 },
  { h: -2, k: 3 },
  { h: 0, k: 1 },
  { h: 3, k: -1 },
  { h: -3, k: 2 },
  { h: 2, k: -3 },
];

function buildParams(): VertexParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_parabola_vertex_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const core = texParenShift("x", -params.h, 1);
      const shift = texConst(params.k);
      const fx = shift ? `${core} ${shift}` : core;
      const statement = `放物線 $y=${fx}$ の頂点の $y$ 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as VertexParams).k);
    },
    explain(params) {
      const p = params as VertexParams;
      return `
### この問題の解説
頂点は $(${p.h},${p.k})$ なので $y$ 座標は ${p.k} です。
答えは **${p.k}** です。
`;
    },
  };
}

export const conicParabolaVertexTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_vertex_basic_${i + 1}`, `放物線の頂点 ${i + 1}`)
);

const extraParabolaVertexTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`conic_parabola_vertex_basic_${i + 7}`, `放物線の頂点 追加${i + 1}`)
);

conicParabolaVertexTemplates.push(...extraParabolaVertexTemplates);
