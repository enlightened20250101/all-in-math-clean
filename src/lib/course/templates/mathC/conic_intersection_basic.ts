// src/lib/course/templates/mathC/conic_intersection_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type InterParams = { r: number; m: number; b: number; count: number };

function buildParams(): InterParams {
  const r = randInt(2, 5);
  const m = pick([1, -1, 2]);
  const b = pick([0, 1, -1, 2, -2, r, -r]);
  // 円 x^2+y^2=r^2 と 直線 y=mx+b の判別
  const A = 1 + m * m;
  const B = 2 * m * b;
  const C = b * b - r * r;
  const D = B * B - 4 * A * C;
  const count = D > 0 ? 2 : D === 0 ? 1 : 0;
  return { r, m, b, count };
}

function explain(params: InterParams) {
  return `
### この問題の解説
代入して判別式を調べます。$D$ の符号により交点の数が決まります。
答えは **${params.count}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_intersection_basic",
      title,
      difficulty: 1,
      tags: ["conic", "intersection"],
    },
    generate() {
      const params = buildParams();
      const line = texLinear(params.m, params.b);
      const statement = `円 $x^2+y^2=${params.r * params.r}$ と直線 $y=${line}$ の交点の個数を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return { isCorrect: Number(userAnswer) === (params as InterParams).count, correctAnswer: String((params as InterParams).count) };
    },
    explain(params) {
      return explain(params as InterParams);
    },
  };
}

export const conicIntersectionTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`conic_intersection_basic_${i + 1}`, `交点の個数 ${i + 1}`)
);

const extraConicIntersectionTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`conic_intersection_basic_${i + 21}`, `交点の個数 追加${i + 1}`)
);

conicIntersectionTemplates.push(...extraConicIntersectionTemplates);
