// src/lib/course/templates/math2/identity_coefficient_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type Params = {
  p: number;
  q: number;
  r: number;
  a: number;
};

function buildParams(): Params {
  for (let i = 0; i < 60; i += 1) {
    const p = randInt(1, 3);
    const q = randInt(-3, 3);
    const r = randInt(-3, 3);
    const a = p;
    return { p, q, r, a };
  }
  return { p: 1, q: 0, r: 0, a: 1 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "identity_coefficient_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const poly = texPoly2(params.p, params.q, params.r);
      const statement = `恒等式 $(${poly})(x-2)\\equiv ax^3+\\cdots$ が成り立つとき、$a$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).a);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
最高次の係数だけ見ればよいので
$$
(px^2+\cdots)(x-2) \equiv p x^3 + \cdots
$$
より $a=p=${p.a} です。
`;
    },
  };
}

export const identityCoefficientTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`identity_coefficient_basic_${i + 1}`, `係数 ${i + 1}`)
);
