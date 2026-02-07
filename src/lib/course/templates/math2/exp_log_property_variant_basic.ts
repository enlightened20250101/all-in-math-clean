// src/lib/course/templates/math2/exp_log_property_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPow } from "@/lib/format/tex";

type Params = {
  m: number;
  n: number;
  p: number;
  q: number;
  value: number;
  kindIndex: number;
};

function getKind(kindIndex: number) {
  if (kindIndex === 0) return "prod";
  if (kindIndex === 1) return "quot";
  return "power";
}

function buildParams(kindIndex: number): Params {
  const m = randInt(1, 4);
  const n = randInt(1, 4);
  const p = randInt(1, 3);
  const q = randInt(1, 3);
  const kind = getKind(kindIndex);
  if (kind === "prod") {
    return { m, n, p, q, value: p * m + q * n, kindIndex };
  }
  if (kind === "quot") {
    return { m, n, p, q, value: p * m - q * n, kindIndex };
  }
  return { m, n, p, q, value: p * (m + n), kindIndex };
}

function statement(params: Params) {
  const { m, n, p, q, kindIndex } = params;
  const kind = getKind(kindIndex);
  const base = "a";
  const logb = `$\\log_{${base}} b = ${m}$`;
  const logc = `$\\log_{${base}} c = ${n}$`;
  if (kind === "prod") {
    return `次の値を求めよ。\\n\\n${logb},\\ ${logc} のとき\\n$$\\log_{${base}}\\left(${texPow("b", p)} ${texPow("c", q)}\\right)$$`;
  }
  if (kind === "quot") {
    return `次の値を求めよ。\\n\\n${logb},\\ ${logc} のとき\\n$$\\log_{${base}}\\left(\\frac{${texPow(
      "b",
      p
    )}}{${texPow("c", q)}}\\right)$$`;
  }
  return `次の値を求めよ。\\n\\n${logb},\\ ${logc} のとき\\n$$\\log_{${base}}\\left(${texPow(
    "bc",
    p
  )}\\right)$$`;
}

function explain(params: Params) {
  const { m, n, p, q, value, kindIndex } = params;
  const kind = getKind(kindIndex);
  const base = "a";
  if (kind === "prod") {
    return `
### この問題の解説
対数の性質より
$$
\\log_{${base}}(b^${p}c^${q}) = ${p}\\log_{${base}} b + ${q}\\log_{${base}} c = ${p}m + ${q}n
$$
答えは **${value}** です。
`;
  }
  if (kind === "quot") {
    return `
### この問題の解説
対数の性質より
$$
\\log_{${base}}\\left(\\frac{b^${p}}{c^${q}}\\right) = ${p}\\log_{${base}} b - ${q}\\log_{${base}} c = ${p}m - ${q}n
$$
答えは **${value}** です。
`;
  }
  return `
### この問題の解説
$$
\\log_{${base}}((bc)^{${p}}) = ${p}(\\log_{${base}} b + \\log_{${base}} c) = ${p}(m+n)
$$
答えは **${value}** です。
`;
}

const kinds = [0, 1, 2];

export const expLogPropertyVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const kindIndex = kinds[i % kinds.length];
  const templateId = `exp_log_property_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_property_basic",
      title: `対数の性質（構造 ${i + 1}）`,
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
