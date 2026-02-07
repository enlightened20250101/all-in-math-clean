// src/lib/course/templates/math2/exp_log_mixed_equation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPow } from "@/lib/format/tex";

type Params = {
  a: number;
  x: number;
  c: number;
  kindIndex: number;
};

function buildParams(kindIndex: number): Params {
  const a = pick([2, 3, 5]);
  const x = randInt(1, 4);
  if (kindIndex === 0) {
    const c = Math.pow(a, x);
    return { a, x, c, kindIndex };
  }
  const c = x + 1;
  return { a, x, c, kindIndex };
}

function statement(p: Params) {
  if (p.kindIndex === 0) {
    return `次を満たす $x$ を求めよ。\\n\\n$$\\log_{${p.a}}(${p.c})=x$$`;
  }
  const right = texPow(String(p.a), p.c);
  return `次を満たす $x$ を求めよ。\\n\\n$$\\log_{${p.a}}(${right})=x+1$$`;
}

function explain(p: Params) {
  if (p.kindIndex === 0) {
    return `
### この問題の解説
定義より $\\log_{${p.a}}(${p.c})=x$ なので $${texPow(String(p.a), p.x)}=${p.c}$$。よって $x=${p.x}$。
答えは **${p.x}** です。
`;
  }
  return `
### この問題の解説
$$
\\log_{${p.a}}(${texPow(String(p.a), p.c)})=${p.c}=x+1
$$
より $x=${p.x}$。答えは **${p.x}** です。
`;
}

export const expLogMixedEquationTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const kindIndex = i % 2;
  const templateId = `exp_log_mixed_equation_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_equations_basic",
      title: `指数・対数の混合方程式 ${i + 1}`,
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
