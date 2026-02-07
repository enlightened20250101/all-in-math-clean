// src/lib/course/templates/mathC/conic_tangent_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type TangentParams = { r: number; m: number; c: number; isTangent: number };

function buildParams(): TangentParams {
  const r = randInt(2, 5);
  const m = pick([1, -1, 2]);
  // 接線条件: |c| = r * sqrt(1+m^2) → c^2 = r^2(1+m^2)
  const isTangent = pick([0, 1]);
  const c = isTangent
    ? r * Math.sqrt(1 + m * m)
    : r * Math.sqrt(1 + m * m) + pick([1, 2]);
  return { r, m, c, isTangent };
}

function explain(params: TangentParams) {
  return `
### この問題の解説
円 $x^2+y^2=r^2$ と直線 $y=mx+c$ が接する条件は
$$
|c|=r\\sqrt{1+m^2}
$$
です。答えは **${params.isTangent}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_tangent_basic",
      title,
      difficulty: 1,
      tags: ["conic", "tangent"],
    },
    generate() {
      const params = buildParams();
      const cVal = params.c.toFixed(2);
      const line = texLinear(params.m, Number(cVal));
      const statement = `円 $x^2+y^2=${params.r * params.r}$ と直線 $y=${line}$ が接するなら 1、接しないなら 0 を答えよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params: { ...params, c: Number(cVal) },
      };
    },
    grade(params, userAnswer) {
      return { isCorrect: Number(userAnswer) === (params as TangentParams).isTangent, correctAnswer: String((params as TangentParams).isTangent) };
    },
    explain(params) {
      return explain(params as TangentParams);
    },
  };
}

export const conicTangentTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`conic_tangent_basic_${i + 1}`, `接線判定 ${i + 1}`)
);

const extraConicTangentTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`conic_tangent_basic_${i + 21}`, `接線判定 追加${i + 1}`)
);

conicTangentTemplates.push(...extraConicTangentTemplates);
