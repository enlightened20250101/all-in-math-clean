// src/lib/course/templates/math2/exp_log_basic_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPow } from "@/lib/format/tex";

type Params = {
  a: number;
  m: number;
  n: number;
  kindIndex: number;
  value: number;
};

function buildParams(kindIndex: number): Params {
  const a = pick([2, 3, 5, 10]);
  const m = randInt(1, 3);
  const n = randInt(1, 3);
  if (kindIndex === 0) {
    const value = Math.pow(a, m + n);
    return { a, m, n, kindIndex, value };
  }
  const value = m + n;
  return { a, m, n, kindIndex, value };
}

function statement(p: Params) {
  if (p.kindIndex === 0) {
    return `成長モデルとして、次を計算せよ。\\n\\n$$${texPow(String(p.a), p.m)} \\times ${texPow(String(p.a), p.n)}$$`;
  }
  return `次を計算せよ。\\n\\n$$\\log_{${p.a}}\\left(${texPow(String(p.a), p.m + p.n)}\\right)$$`;
}

function explain(p: Params) {
  if (p.kindIndex === 0) {
    return `
### この問題の解説
指数法則より $a^m \\cdot a^n = a^{m+n}$。
したがって $${texPow(String(p.a), p.m + p.n)}=${p.value}$$ です。
答えは **${p.value}** です。
`;
  }
  return `
### この問題の解説
対数の定義より
$$
\\log_{${p.a}}\\left(${texPow(String(p.a), p.m + p.n)}\\right) = ${p.m + p.n}
$$
答えは **${p.value}** です。
`;
}

export const expLogBasicVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const kindIndex = i % 2;
  const templateId = `exp_log_basic_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_basic",
      title: `指数・対数の計算（構造）${i + 1}`,
      difficulty: 1,
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
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      return explain(params as Params);
    },
  };
});
