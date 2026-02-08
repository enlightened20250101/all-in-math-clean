// src/lib/course/templates/mathA/prob_basic_condition_variant_basic.ts
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
      tags: ["probability", "basic", "condition"],
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
    id: "prob_basic_atleast1",
    title: "コイン3回：少なくとも1回表",
    statement: `コインを3回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{少なくとも1回表}")}\\n$$`,
    correct: texFrac(7, 8),
    choices: [texFrac(7, 8), texFrac(1, 8), texFrac(3, 4), texFrac(5, 8)],
    explain: `補集合を用いると $1-\\frac{1}{8}=\\frac{7}{8}$。`,
  },
  {
    id: "prob_basic_exactly1",
    title: "コイン3回：ちょうど1回表",
    statement: `コインを3回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{ちょうど1回表}")}\\n$$`,
    correct: texFrac(3, 8),
    choices: [texFrac(3, 8), texFrac(1, 8), texFrac(1, 4), texFrac(1, 2)],
    explain: `表1回は $\\binom{3}{1}=3$ 通りなので $\\frac{3}{8}$。`,
  },
  {
    id: "prob_basic_atleast_even",
    title: "サイコロ2回：少なくとも1回偶数",
    statement: `サイコロを2回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{少なくとも1回偶数}")}\\n$$`,
    correct: texFrac(3, 4),
    choices: [texFrac(3, 4), texFrac(1, 4), texFrac(1, 2), texFrac(2, 3)],
    explain: `補集合は2回とも奇数。$(\\frac{1}{2})^2=\\frac{1}{4}$。`,
  },
  {
    id: "prob_basic_exactly_even",
    title: "サイコロ2回：ちょうど1回偶数",
    statement: `サイコロを2回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{ちょうど1回偶数}")}\\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 4), texFrac(3, 4), texFrac(2, 3)],
    explain: `偶数1回は (偶,奇) と (奇,偶) の2通りなので $\\frac{2}{4}=\\frac{1}{2}$。`,
  },
  {
    id: "prob_basic_ball_atleast_1",
    title: "玉：少なくとも1個赤",
    statement: `赤2個・青3個の玉から2個取り出す（戻さない）。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{赤が少なくとも1個}")}\\n$$`,
    correct: texFrac(7, 10),
    choices: [texFrac(7, 10), texFrac(3, 10), texFrac(1, 2), texFrac(2, 5)],
    explain: `補集合は「2個とも青」。$1-\\frac{3}{5}\\cdot\\frac{2}{4}=1-\\frac{3}{10}=\\frac{7}{10}$。`,
  },
  {
    id: "prob_basic_card_atleast_even",
    title: "カード：偶数が少なくとも1枚",
    statement: `1〜10のカードから2枚同時に引く。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{偶数が少なくとも1枚}")}\\n$$`,
    correct: texFrac(7, 9),
    choices: [texFrac(7, 9), texFrac(2, 9), texFrac(1, 2), texFrac(5, 9)],
    explain: `補集合は「2枚とも奇数」。$1-\\frac{5}{10}\\cdot\\frac{4}{9}=1-\\frac{2}{9}=\\frac{7}{9}$。`,
  },
];

export const probBasicConditionVariantTemplates: QuestionTemplate[] = CASES.map((c) => {
  const base = buildTemplate(c);
  return {
    ...base,
    generate() {
      const q = base.generate();
      const choices = q.choices ?? [];
      const uniqueChoices =
        choices.length && typeof choices[0] === "string"
          ? Array.from(new Set(choices as string[]))
          : Array.from(
              new Map(
                (choices as { id: string; label: string }[]).map((c) => [c.id, c])
              ).values()
            );
      return { ...q, choices: uniqueChoices };
    },
  };
});
