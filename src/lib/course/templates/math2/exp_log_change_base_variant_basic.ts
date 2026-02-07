// src/lib/course/templates/math2/exp_log_change_base_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texEq, texPow } from "@/lib/format/tex";

type Params = {
  a: number;
  m: number;
  k: number;
  base: number;
  value: number;
  kindIndex: number;
};

function getKind(kindIndex: number) {
  return kindIndex === 0 ? "log_base" : "ratio";
}

function buildParams(kindIndex: number): Params {
  const a = pick([2, 3, 5]);
  const m = randInt(1, 3);
  const k = randInt(2, 4);
  const base = Math.pow(a, m);
  const value = k;
  return { a, m, k, base, value, kindIndex };
}

function statement(params: Params) {
  const { a, m, k, base, kindIndex } = params;
  const kind = getKind(kindIndex);
  const c = Math.pow(a, m * k);
  if (kind === "log_base") {
    return `次の値を求めよ。\\n\\n$$\\log_{${base}} ${c}$$`;
  }
  return `次の値を求めよ。\\n\\n$$${texEq(
    `\\frac{\\log_{${a}} ${c}}{\\log_{${a}} ${base}}`,
    "?"
  )}$$`;
}

function explain(params: Params) {
  const { a, m, k, base, kindIndex } = params;
  const kind = getKind(kindIndex);
  const c = Math.pow(a, m * k);
  if (kind === "log_base") {
    return `
### この問題の解説
${texPow(String(base), k)} = ${c} より
$$
\\log_{${base}} ${c} = ${k}
$$
答えは **${k}** です。
`;
  }
  return `
### この問題の解説
$$
\\frac{\\log_{${a}} ${c}}{\\log_{${a}} ${base}} = \\log_{${base}} ${c}
$$
であり、${texPow(String(base), k)} = ${c} なので答えは **${k}** です。
`;
}

const kinds = [0, 1];

export const expLogChangeBaseVariantTemplates: QuestionTemplate[] = Array.from({ length: 20 }, (_, i) => {
  const kindIndex = kinds[i % kinds.length];
  const templateId = `exp_log_change_base_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_change_base_basic",
      title: `底の変換（構造 ${i + 1}）`,
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
