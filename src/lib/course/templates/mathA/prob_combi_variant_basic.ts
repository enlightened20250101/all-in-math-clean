// src/lib/course/templates/mathA/prob_combi_variant_basic.ts
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
  const choices = [c.correct, texFrac(1, 2), texFrac(1, 3), texFrac(1, 6)];
  const uniqueChoices = Array.from(new Set(choices));
  return {
    meta: {
      id: c.id,
      topicId: "prob_combi_basic",
      title: c.title,
      difficulty: 1,
      tags: ["probability", "combinatorics"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "choice",
        choices: uniqueChoices,
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
    id: "prob_combi_v1",
    title: "玉：赤1個",
    statement: `赤3個・青2個の玉から2個取り出す。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{赤1個}")}\\n$$`,
    correct: texFrac(comb(3, 1) * comb(2, 1), comb(5, 2)),
    explain: `赤1個・青1個の選び方は ${comb(3, 1) * comb(2, 1)} 通り、全体は ${comb(5, 2)} 通り。`,
  },
  {
    id: "prob_combi_v2",
    title: "玉：赤2個",
    statement: `赤4個・青3個の玉から3個取り出す。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{赤2個}")}\\n$$`,
    correct: texFrac(comb(4, 2) * comb(3, 1), comb(7, 3)),
    explain: `赤2個・青1個の選び方は ${comb(4, 2) * comb(3, 1)} 通り、全体は ${comb(7, 3)} 通り。`,
  },
  {
    id: "prob_combi_v3",
    title: "カード：指定1枚を含む",
    statement: `1〜8の番号カードから3枚選ぶ。1番を含む確率を求めよ。\\n\\n$$\\n${texProb("\\text{1を含む}")}\\n$$`,
    correct: texFrac(comb(7, 2), comb(8, 3)),
    explain: `1を含む場合は残り7枚から2枚選ぶ。`,
  },
];

export const probCombiVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
