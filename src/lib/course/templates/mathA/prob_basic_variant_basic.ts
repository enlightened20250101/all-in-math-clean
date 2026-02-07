// src/lib/course/templates/mathA/prob_basic_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { texFrac, texProb } from "@/lib/format/tex";

type ProbCase = {
  id: string;
  title: string;
  statement: string;
  correct: string;
  choices: string[];
  explain: string;
};

function buildTemplate(c: ProbCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "prob_basic",
      title: c.title,
      difficulty: 1,
      tags: ["probability", "basic"],
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

const CASES: ProbCase[] = [
  {
    id: "prob_basic_die_even",
    title: "サイコロ：偶数の補集合",
    statement: `サイコロを1回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{奇数}")}\\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `偶数3通りの補集合なので奇数も3通り。確率は $\\frac{3}{6}=\\frac{1}{2}$。`,
  },
  {
    id: "prob_basic_coin_3h",
    title: "コイン3回：表が2回",
    statement: `コインを3回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{表が2回}")}\\n$$`,
    correct: texFrac(3, 8),
    choices: [texFrac(3, 8), texFrac(1, 8), texFrac(1, 4), texFrac(1, 2)],
    explain: `表2回は $\\binom{3}{2}=3$ 通り。$\\frac{3}{8}$。`,
  },
  {
    id: "prob_basic_ball_red",
    title: "袋：赤玉を引く",
    statement: `赤玉3個、青玉2個が入った袋から1個取り出す。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{赤玉}")}\\n$$`,
    correct: texFrac(3, 5),
    choices: [texFrac(3, 5), texFrac(2, 5), texFrac(1, 5), texFrac(4, 5)],
    explain: `全体5個のうち赤は3個なので $\\frac{3}{5}$。`,
  },
  {
    id: "prob_basic_ball_not_red",
    title: "袋：赤玉以外",
    statement: `赤玉3個、青玉2個が入った袋から1個取り出す。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{赤玉以外}")}\\n$$`,
    correct: texFrac(2, 5),
    choices: [texFrac(2, 5), texFrac(3, 5), texFrac(1, 5), texFrac(4, 5)],
    explain: `赤玉以外は青玉2個。確率は $\\frac{2}{5}$。`,
  },
  {
    id: "prob_basic_two_dice_sum7",
    title: "サイコロ2個：和が7",
    statement: `サイコロを2個同時に投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{和が7}")}\\n$$`,
    correct: texFrac(1, 6),
    choices: [texFrac(1, 6), texFrac(1, 12), texFrac(1, 3), texFrac(5, 36)],
    explain: `和が7は6通り。全36通りなので $\\frac{6}{36}=\\frac{1}{6}$。`,
  },
  {
    id: "prob_basic_die_gt4",
    title: "サイコロ：4より大きい",
    statement: `サイコロを1回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{4より大きい}")}\\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `5,6の2通り。確率は $\\frac{2}{6}=\\frac{1}{3}$。`,
  },
  {
    id: "prob_basic_coin_no_head",
    title: "コイン2回：表が出ない",
    statement: `コインを2回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{表が出ない}")}\\n$$`,
    correct: texFrac(1, 4),
    choices: [texFrac(1, 4), texFrac(1, 2), texFrac(3, 4), texFrac(1, 8)],
    explain: `裏裏のみ。全4通りなので $\\frac{1}{4}$。`,
  },
  {
    id: "prob_basic_two_dice_sum8",
    title: "サイコロ2個：和が8",
    statement: `サイコロを2個同時に投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{和が8}")}\\n$$`,
    correct: texFrac(5, 36),
    choices: [texFrac(5, 36), texFrac(1, 6), texFrac(1, 9), texFrac(1, 12)],
    explain: `和が8は5通り。全36通りなので $\\frac{5}{36}$。`,
  },
];

export const probBasicVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
