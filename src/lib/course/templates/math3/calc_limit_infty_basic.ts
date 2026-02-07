// src/lib/course/templates/math3/calc_limit_infty_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  value: number;
  kindIndex: number;
};

function buildRatioParams(): Params {
  const d = pick([1, 2, 3]);
  const k = pick([1, 2, 3, 4]);
  const a = d * k;
  const b = randInt(-5, 5);
  const c = randInt(-6, 6);
  const e = randInt(-5, 5);
  const f = randInt(-6, 6);
  return { a, b, c, d, e, f, value: k, kindIndex: 0 };
}

function buildRootParams(): Params {
  const k = pick([1, 2, 3, 4, 5]);
  const a = 2 * k;
  return { a, b: 0, c: 0, d: 0, e: 0, f: 0, value: k, kindIndex: 1 };
}

export const calcLimitInftyBasicTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const kind = i % 2 === 0 ? "ratio" : "root";
  const templateId = `calc_limit_infty_basic_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_limit_basic",
      title: "極限（無限・有理化）",
      difficulty: 2,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = kind === "ratio" ? buildRatioParams() : buildRootParams();
      if (params.kindIndex === 0) {
        const num = texPoly2(params.a, params.b, params.c);
        const den = texPoly2(params.d, params.e, params.f);
        return {
          templateId,
          statement: `次の極限を求めよ。\\n\\n$$\\lim_{x\\to \\infty} \\frac{${num}}{${den}}$$`,
          answerKind: "numeric",
          params,
        };
      }
      return {
        templateId,
        statement: `次の極限を求めよ。\\n\\n$$\\lim_{x\\to \\infty} \\left(\\sqrt{x^2+${params.a}x}-x\\right)$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      if ((params as Params).kindIndex === 0) {
        return `
### この問題の解説
最高次の項のみを比較すれば
$$
\\lim_{x\\\to \\infty} \\frac{ax^2+\\cdots}{dx^2+\\cdots} = \\frac{a}{d}
$$
答えは **${(params as Params).value}** です。
`;
      }
      return `
### この問題の解説
有理化して
$$
\\sqrt{x^2+${(params as Params).a}x}-x = \\frac{${(params as Params).a}}{\\sqrt{1+${(params as Params).a}/x}+1}
$$
より極限は
$$
\\frac{${(params as Params).a}}{2} = ${(params as Params).value}
$$
となります。答えは **${(params as Params).value}** です。
`;
    },
  };
});
