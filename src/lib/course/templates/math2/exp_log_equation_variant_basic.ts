// src/lib/course/templates/math2/exp_log_equation_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPow } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  n: number;
  m: number;
  x: number;
  kindIndex: number;
};

function buildParams(kindIndex: number): Params {
  const a = pick([2, 3, 5]);
  const b = pick([2, 3, 4]);
  const n = randInt(2, 4);
  const m = randInt(1, 3);
  const x = randInt(1, 4);
  return { a, b, n, m, x, kindIndex };
}

function statement(p: Params) {
  if (p.kindIndex === 0) {
    const left = texPow(String(p.a), `x+${p.m}`);
    return `次を満たす $x$ を求めよ。\\n\\n$$${left}=${texPow(String(p.a), p.n)}$$`;
  }
  const right = texPow(String(p.b), p.x);
  return `次を満たす $x$ を求めよ。\\n\\n$$\\log_{${p.b}}(${right})=x$$`;
}

function explain(p: Params) {
  if (p.kindIndex === 0) {
    return `
### この問題の解説
指数の比較より
$$
x+${p.m}=${p.n}
$$
なので $x=${p.x}$。答えは **${p.x}** です。
`;
  }
  return `
### この問題の解説
対数の定義より
$$
\\log_{${p.b}}(${texPow(String(p.b), p.x)})=${p.x}
$$
答えは **${p.x}** です。
`;
}

export const expLogEquationVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const kindIndex = i % 2;
  const templateId = `exp_log_equation_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_equations_basic",
      title: `指数・対数の方程式（構造）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams(kindIndex);
      return {
        templateId,
        statement: statement(params),
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).x);
    },
    explain(params) {
      return explain(params as Params);
    },
  };
});
