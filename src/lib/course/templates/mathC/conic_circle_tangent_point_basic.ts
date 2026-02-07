// src/lib/course/templates/mathC/conic_circle_tangent_point_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 3, x0: 3, y0: 0 },
  { r: 4, x0: 0, y0: 4 },
  { r: 5, x0: -5, y0: 0 },
  { r: 6, x0: 0, y0: -6 },
  { r: 7, x0: 7, y0: 0 },
  { r: 8, x0: 0, y0: 8 },
];

type Params = {
  r: number;
  x0: number;
  y0: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const ask = Math.random() < 0.5 ? 1 : 0;
  const ans = ask === 1 ? base.x0 : base.y0;
  return { ...base, ask, ans };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_tangent_point_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      const statement = `円 $x^2+y^2=${params.r ** 2}$ の点 $(${params.x0},${params.y0})$ における接点の${params.ask === 1 ? "x" : "y"}座標を求めよ。`;
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
接点は与えられているので、その座標を答えます。答えは **${p.ans}**。
`;
    },
  };
}

export const conicCircleTangentPointTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_tangent_point_basic_${i + 1}`, `接点 ${i + 1}`)
);

const extraCircleTangentPointTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_circle_tangent_point_basic_${i + 7}`, `接点 追加${i + 1}`)
);

conicCircleTangentPointTemplates.push(...extraCircleTangentPointTemplates);
