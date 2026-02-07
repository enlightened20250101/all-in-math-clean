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
];

export const probBasicConditionVariantTemplates: QuestionTemplate[] = CASES.map((c) => {
  const base = buildTemplate(c);
  return {
    ...base,
    generate() {
      const q = base.generate();
      const uniqueChoices = Array.from(
        new Map(
          (q.choices ?? []).map((c) => [typeof c === 'string' ? c : c.id, c])
        ).values()
      );
      return { ...q, choices: uniqueChoices };
    },
  };
});
