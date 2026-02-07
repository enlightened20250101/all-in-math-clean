// src/lib/course/templates/mathC/complex_midpoint_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function wrapNum(v: number) {
  return v < 0 ? `(${v})` : `${v}`;
}

type MidParams = { a1: number; b1: number; a2: number; b2: number; value: number };

function buildParams(): MidParams {
  const a1 = randInt(-4, 4);
  const b1 = randInt(-4, 4);
  const a2 = randInt(-4, 4);
  const b2 = randInt(-4, 4);
  const value = (a1 + a2) / 2;
  return { a1, b1, a2, b2, value };
}

function explain(params: MidParams) {
  const a1 = wrapNum(params.a1);
  const a2 = wrapNum(params.a2);
  return `
### この問題の解説
中点の x 座標は
$$
\\frac{${a1}+${a2}}{2}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_midpoint_basic",
      title,
      difficulty: 1,
      tags: ["complex", "midpoint"],
    },
    generate() {
      const params = buildParams();
      const z1 = texComplex(params.a1, params.b1);
      const z2 = texComplex(params.a2, params.b2);
      const statement = `複素数 $z_1=${z1}$, $z_2=${z2}$ に対応する点の中点の x 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as MidParams).value);
    },
    explain(params) {
      return explain(params as MidParams);
    },
  };
}

export const complexMidpointTemplates: QuestionTemplate[] = Array.from(
  { length: 32 },
  (_, i) => buildTemplate(`complex_midpoint_basic_${i + 1}`, `複素数中点 ${i + 1}`)
);
