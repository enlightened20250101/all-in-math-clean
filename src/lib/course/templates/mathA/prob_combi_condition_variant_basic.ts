// src/lib/course/templates/mathA/prob_combi_condition_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { texFrac, texProb } from "@/lib/format/tex";

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let res = 1;
  for (let i = 1; i <= k; i += 1) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

type Case = {
  id: string;
  title: string;
  statement: string;
  correct: string;
  explain: string;
};

function buildTemplate(c: Case): QuestionTemplate {
  const choices = Array.from(new Set([c.correct, texFrac(1, 2), texFrac(1, 3), texFrac(1, 6)]));
  return {
    meta: {
      id: c.id,
      topicId: "prob_combi_basic",
      title: c.title,
      difficulty: 1,
      tags: ["probability", "combinatorics", "condition"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return c.explain;
    },
  };
}

const CASES: Case[] = [
  {
    id: "prob_cond_v1",
    title: "玉：少なくとも1個赤",
    statement: `赤2個・青4個の玉から3個取り出す。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{赤が少なくとも1個}")}\\n$$`,
    correct: texFrac(comb(6, 3) - comb(4, 3), comb(6, 3)),
    explain: `補集合を用いて $1-\\frac{\\binom{4}{3}}{\\binom{6}{3}}$。`,
  },
  {
    id: "prob_cond_v2",
    title: "玉：ちょうど2個赤",
    statement: `赤3個・青3個の玉から3個取り出す。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{赤がちょうど2個}")}\\n$$`,
    correct: texFrac(comb(3, 2) * comb(3, 1), comb(6, 3)),
    explain: `赤2個・青1個の選び方は $\\binom{3}{2}\\binom{3}{1}$。`,
  },
  {
    id: "prob_cond_v3",
    title: "カード：指定2枚を含む",
    statement: `1〜10のカードから4枚選ぶ。1と2を含む確率を求めよ。\\n\\n$$\\n${texProb("\\text{1と2を含む}")}\\n$$`,
    correct: texFrac(comb(8, 2), comb(10, 4)),
    explain: `1と2を固定し、残り8枚から2枚選ぶ。`,
  },
];

export const probCombiConditionVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
