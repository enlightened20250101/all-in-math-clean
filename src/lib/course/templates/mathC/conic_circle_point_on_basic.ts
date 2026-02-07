// src/lib/course/templates/mathC/conic_circle_point_on_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 3, x: 3, y: 0, ans: 1 },
  { r: 4, x: 0, y: 4, ans: 1 },
  { r: 5, x: 3, y: 4, ans: 1 },
  { r: 5, x: 1, y: 1, ans: 0 },
  { r: 6, x: 6, y: 0, ans: 1 },
  { r: 6, x: 3, y: 3, ans: 0 },
  { r: 7, x: 0, y: 7, ans: 1 },
  { r: 7, x: 4, y: 4, ans: 0 },
];

type Params = {
  r: number;
  x: number;
  y: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_point_on_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      const statement = `円 $x^2+y^2=${params.r ** 2}$ に点 $(${params.x},${params.y})$ があるなら 1、なければ 0 を答えよ。`;
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
      const lhs = p.x * p.x + p.y * p.y;
      return `
### この問題の解説
左辺は ${lhs}、右辺は ${p.r ** 2}。
一致するなら 1、しなければ 0。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicCirclePointOnTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_point_on_basic_${i + 1}`, `点の判定 ${i + 1}`)
);

const extraCirclePointOnTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_circle_point_on_basic_${i + 7}`, `点の判定 追加${i + 1}`)
);

conicCirclePointOnTemplates.push(...extraCirclePointOnTemplates);
