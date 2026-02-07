// src/lib/course/templates/mathB/sequence_sum_variant_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  kind: "arith" | "geom";
  a1: number;
  d?: number;
  r?: number;
  n: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const value =
    c.kind === "arith"
      ? (c.n * (2 * c.a1 + (c.n - 1) * (c.d ?? 0))) / 2
      : c.r === 1
        ? c.a1 * c.n
        : (c.a1 * (1 - Math.pow(c.r ?? 1, c.n))) / (1 - (c.r ?? 1));
  return {
    meta: {
      id: c.id,
      topicId: "seq_sum_basic",
      title: c.title,
      difficulty: 1,
      tags: ["sequence", "sum", "ct"],
    },
    generate() {
      const statement =
        c.kind === "arith"
          ? `等差数列 $\\{a_n\\}$ において $a_1=${c.a1}$, $d=${c.d}$ のとき、$S_${c.n}$ を求めよ。`
          : `等比数列 $\\{a_n\\}$ において $a_1=${c.a1}$, $r=${c.r}$ のとき、$S_${c.n}$ を求めよ。`;
      return {
        templateId: c.id,
        statement,
        answerKind: "numeric",
        params: { value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { value: number }).value);
    },
    explain(params) {
      const v = (params as { value: number }).value;
      return `### この問題の解説\n答えは **${v}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "seq_sum_v21", title: "数列の和（別）1", kind: "arith", a1: 2, d: 3, n: 5 },
  { id: "seq_sum_v22", title: "数列の和（別）2", kind: "arith", a1: -1, d: 2, n: 6 },
  { id: "seq_sum_v23", title: "数列の和（別）3", kind: "geom", a1: 2, r: 2, n: 4 },
  { id: "seq_sum_v24", title: "数列の和（別）4", kind: "geom", a1: 1, r: 3, n: 3 },
];

export const sequenceSumVariantTemplates2: QuestionTemplate[] = CASES.map(buildTemplate);
