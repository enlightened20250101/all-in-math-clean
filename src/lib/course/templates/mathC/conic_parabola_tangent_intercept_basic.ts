// src/lib/course/templates/mathC/conic_parabola_tangent_intercept_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texTerm } from "@/lib/format/tex";

const CASES = [
  { a: 1, t: 1, b: 1 },
  { a: 2, t: 1, b: 2 },
  { a: 3, t: 1, b: 3 },
  { a: 1, t: -1, b: 1 },
  { a: 2, t: -1, b: 2 },
  { a: 4, t: 1, b: 4 },
  { a: 5, t: -1, b: 5 },
];

type Params = {
  a: number;
  t: number;
  b: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_parabola_tangent_intercept_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const xTerm = params.a === 1 ? "t^2" : `${params.a}t^2`;
      const yCoef = 2 * params.a;
      const yTerm = yCoef === 1 ? "t" : `${yCoef}t`;
      const statement = `放物線 $y^2=4${params.a}x$ の点 $(${xTerm},${yTerm})$ における接線の $y$ 切片を求めよ。ただし $t=${params.t}$。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).b);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
接線は $ty=x+a t^2$。
$y$ 切片は $y$ 軸上（$x=0$）なので $y=a$。
よって **${p.b}**。
`;
    },
  };
}

export const conicParabolaTangentInterceptTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_tangent_intercept_basic_${i + 1}`, `接線の切片 ${i + 1}`)
);

const extraParabolaTangentInterceptTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_parabola_tangent_intercept_basic_${i + 7}`, `接線の切片 追加${i + 1}`)
);

conicParabolaTangentInterceptTemplates.push(...extraParabolaTangentInterceptTemplates);
