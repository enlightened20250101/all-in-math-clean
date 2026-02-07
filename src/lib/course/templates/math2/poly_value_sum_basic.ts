// src/lib/course/templates/math2/poly_value_sum_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  c: number;
  val: number;
};

function buildParams(): Params {
  for (let i = 0; i < 60; i += 1) {
    const a = randInt(-3, 3);
    if (a === 0) continue;
    const b = randInt(-5, 5);
    const c = randInt(-6, 6);
    const val = (a + b + c) + (a - b + c);
    if (Math.abs(val) <= 40) {
      return { a, b, c, val };
    }
  }
  return { a: 1, b: 0, c: 0, val: 2 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "poly_value_sum_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const poly = texPoly2(params.a, params.b, params.c);
      const statement = `多項式 $f(x)=${poly}$ について $f(1)+f(-1)$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).val);
    },
    explain(params) {
      const p = params as Params;
      const f1 = p.a + p.b + p.c;
      const fm1 = p.a - p.b + p.c;
      return `
### この問題の解説
$f(1)=${f1}$, $f(-1)=${fm1}$ なので
$$
f(1)+f(-1)=${f1}+${fm1}=${p.val}
$$
答えは **${p.val}** です。
`;
    },
  };
}

export const polyValueSumTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`poly_value_sum_basic_${i + 1}`, `値の和 ${i + 1}`)
);
