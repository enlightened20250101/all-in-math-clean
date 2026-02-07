// src/lib/course/templates/mathC/conic_circle_point_on_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 13, x: 5, y: 12, ans: 0 },
  { r: 13, x: 6, y: 12, ans: 1 },
  { r: 10, x: -6, y: 8, ans: 0 },
  { r: 10, x: -8, y: 8, ans: 1 },
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
      const statement = `円 $x^2+y^2=${params.r ** 2}$ 上に点 $(${params.x},${params.y})$ があるかを判定し、あるなら 0、なければ 1 を答えよ。`;
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
      return `
### この問題の解説
点を円の式に代入して判定します。
答えは **${(params as Params).ans}**。
`;
    },
  };
}

export const conicCirclePointOnExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_point_on_basic3_${i + 1}`, `円上判定 ${i + 1}`)
);
