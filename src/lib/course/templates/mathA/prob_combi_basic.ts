// src/lib/course/templates/mathA/prob_combi_basic.ts
import type { QuestionTemplate } from "../../types";
import { texComb, texFrac, texProb } from "@/lib/format/tex";

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
  choices: string[];
  explain: string;
};

function buildTemplate(c: Case): QuestionTemplate {
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
        choices: c.choices,
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

function buildBallCase(
  id: string,
  title: string,
  red: number,
  blue: number,
  draw: number,
  redPick: number
): Case {
  const total = comb(red + blue, draw);
  const favorable = comb(red, redPick) * comb(blue, draw - redPick);
  const correct = texFrac(favorable, total);
  const statement = `赤${red}個・青${blue}個の玉がある。${draw}個を同時に取り出すとき、赤が${redPick}個となる確率を求めよ（組合せで数える）。\n\n$$\n${texProb(`\\text{赤${redPick}個}`)}\n$$`;
  let choices = [
    correct,
    texFrac(comb(red, redPick + 1) * comb(blue, draw - redPick - 1), total),
    texFrac(comb(red, redPick - 1) * comb(blue, draw - redPick + 1), total),
    texFrac(comb(red, redPick) * comb(blue, draw - redPick), total + 2),
    texFrac(favorable + 1, total),
    texFrac(Math.max(1, favorable - 1), total),
  ]
    .filter((v) => !v.includes("NaN") && !v.includes("Infinity"))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 4);
  if (choices.length < 4) {
    const fallback = [texFrac(1, 2), texFrac(1, 3), texFrac(1, 4), texFrac(1, 6)];
    choices = Array.from(new Set([...choices, ...fallback])).slice(0, 4);
  }
  const explain = `
### この問題の解説
順序を区別しないので組合せで数えます。

$$
\\frac{${texComb(red, redPick)}\\cdot${texComb(blue, draw - redPick)}}{${texComb(red + blue, draw)}} = ${correct}
$$
`;
  return { id, title, statement, correct, choices, explain };
}

function buildCardCase(
  id: string,
  title: string,
  n: number,
  draw: number,
  want: number
): Case {
  const total = comb(n, draw);
  const favorable = comb(want, 1) * comb(n - want, draw - 1);
  const correct = texFrac(favorable, total);
  const statement = `1〜${n}の${n}枚のカードから${draw}枚を同時に引く。指定した${want}枚のうちちょうど1枚を含む確率を求めよ。\n\n$$\n${texProb("\\text{指定カードが1枚}")}\n$$`;
  let choices = [
    correct,
    texFrac(comb(want, 2) * comb(n - want, draw - 2), total),
    texFrac(comb(want, 1) * comb(n - want, draw - 1), total + 2),
    texFrac(comb(n - want, draw), total),
    texFrac(Math.max(1, favorable - 1), total),
    texFrac(favorable + 1, total),
  ]
    .filter((v) => !v.includes("NaN") && !v.includes("Infinity"))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 4);
  if (choices.length < 4) {
    const fallback = [texFrac(1, 2), texFrac(1, 3), texFrac(1, 4), texFrac(1, 6)];
    choices = Array.from(new Set([...choices, ...fallback])).slice(0, 4);
  }
  const explain = `
### この問題の解説
有利な場合は「指定カードから1枚」かつ「残りから${draw - 1}枚」です。

$$
\\frac{${texComb(want, 1)}\\cdot${texComb(n - want, draw - 1)}}{${texComb(n, draw)}} = ${correct}
$$
`;
  return { id, title, statement, correct, choices, explain };
}

const CASES: Case[] = [
  buildBallCase("prob_combi_ball_1", "玉：赤1個", 3, 2, 2, 1),
  buildBallCase("prob_combi_ball_2", "玉：赤2個", 4, 3, 2, 2),
  buildBallCase("prob_combi_ball_3", "玉：赤0個", 2, 4, 2, 0),
  buildBallCase("prob_combi_ball_4", "玉：赤1個", 5, 3, 3, 1),
  buildBallCase("prob_combi_ball_5", "玉：赤2個", 5, 4, 3, 2),
  buildBallCase("prob_combi_ball_6", "玉：赤3個", 6, 2, 3, 3),
  buildBallCase("prob_combi_ball_7", "玉：赤0個", 3, 5, 3, 0),
  buildBallCase("prob_combi_ball_8", "玉：赤1個", 2, 6, 3, 1),
  buildBallCase("prob_combi_ball_9", "玉：赤2個", 3, 3, 3, 2),
  buildBallCase("prob_combi_ball_10", "玉：赤1個", 4, 4, 2, 1),
  buildBallCase("prob_combi_ball_11", "玉：赤2個", 4, 5, 3, 2),
  buildBallCase("prob_combi_ball_12", "玉：赤1個", 6, 3, 2, 1),
  buildBallCase("prob_combi_ball_13", "玉：赤2個", 6, 4, 4, 2),
  buildBallCase("prob_combi_ball_14", "玉：赤3個", 5, 5, 4, 3),
  buildBallCase("prob_combi_ball_15", "玉：赤1個", 5, 2, 2, 1),
  buildBallCase("prob_combi_ball_16", "玉：赤0個", 2, 3, 2, 0),
  buildBallCase("prob_combi_ball_17", "玉：赤1個", 2, 3, 2, 1),
  buildBallCase("prob_combi_ball_18", "玉：赤2個", 2, 3, 2, 2),
  buildBallCase("prob_combi_ball_19", "玉：赤1個", 3, 4, 3, 1),
  buildBallCase("prob_combi_ball_20", "玉：赤2個", 3, 4, 3, 2),
  buildBallCase("prob_combi_ball_21", "玉：赤3個", 3, 4, 3, 3),
  buildBallCase("prob_combi_ball_22", "玉：赤1個", 4, 2, 3, 1),
  buildBallCase("prob_combi_ball_23", "玉：赤2個", 4, 2, 3, 2),
  buildBallCase("prob_combi_ball_24", "玉：赤3個", 4, 2, 3, 3),
  buildBallCase("prob_combi_ball_25", "玉：赤1個", 5, 1, 2, 1),
  buildBallCase("prob_combi_ball_26", "玉：赤2個", 5, 1, 2, 2),
  buildBallCase("prob_combi_ball_27", "玉：赤1個", 5, 3, 3, 1),
  buildBallCase("prob_combi_ball_28", "玉：赤2個", 5, 3, 3, 2),
  buildBallCase("prob_combi_ball_29", "玉：赤3個", 5, 3, 3, 3),
  buildBallCase("prob_combi_ball_30", "玉：赤2個", 6, 4, 4, 2),
  buildBallCase("prob_combi_ball_31", "玉：赤3個", 6, 4, 4, 3),
  buildBallCase("prob_combi_ball_32", "玉：赤4個", 6, 4, 4, 4),
  buildBallCase("prob_combi_ball_33", "玉：赤1個", 2, 6, 3, 1),
  buildBallCase("prob_combi_ball_34", "玉：赤0個", 2, 6, 3, 0),
  buildBallCase("prob_combi_ball_35", "玉：赤2個", 2, 6, 3, 2),
  buildCardCase("prob_combi_card_1", "カード：指定1枚", 8, 3, 2),
  buildCardCase("prob_combi_card_2", "カード：指定1枚", 10, 4, 3),
  buildCardCase("prob_combi_card_3", "カード：指定1枚", 9, 2, 2),
  buildCardCase("prob_combi_card_4", "カード：指定1枚", 12, 3, 3),
  buildCardCase("prob_combi_card_5", "カード：指定1枚", 7, 3, 2),
  buildCardCase("prob_combi_card_6", "カード：指定1枚", 11, 4, 2),
  buildCardCase("prob_combi_card_7", "カード：指定1枚", 6, 2, 1),
  buildCardCase("prob_combi_card_8", "カード：指定1枚", 9, 4, 2),
  buildCardCase("prob_combi_card_9", "カード：指定1枚", 12, 4, 3),
  buildCardCase("prob_combi_card_10", "カード：指定1枚", 10, 3, 2),
  buildCardCase("prob_combi_card_11", "カード：指定1枚", 13, 5, 4),
  buildCardCase("prob_combi_card_12", "カード：指定1枚", 9, 5, 3),
  buildCardCase("prob_combi_card_13", "カード：指定1枚", 8, 4, 2),
  buildCardCase("prob_combi_card_14", "カード：指定1枚", 14, 3, 3),
  buildCardCase("prob_combi_card_15", "カード：指定1枚", 15, 4, 5),
  buildCardCase("prob_combi_card_16", "カード：指定1枚", 11, 5, 3),
  buildCardCase("prob_combi_card_17", "カード：指定1枚", 16, 4, 2),
  buildCardCase("prob_combi_card_18", "カード：指定1枚", 12, 5, 4),
];

export const probCombiTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
