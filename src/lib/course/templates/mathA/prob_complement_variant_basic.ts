// src/lib/course/templates/mathA/prob_complement_variant_basic.ts
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
      topicId: "prob_complement_basic",
      title: c.title,
      difficulty: 1,
      tags: ["probability", "complement"],
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
    id: "prob_comp_die_5",
    title: "サイコロ3回：6が少なくとも1回",
    statement: `サイコロを3回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{少なくとも1回6}")}\\n$$`,
    correct: texFrac(91, 216),
    choices: [texFrac(91, 216), texFrac(125, 216), texFrac(1, 6), texFrac(11, 36)],
    explain: `補集合は「3回とも6以外」。確率は $1-(\\frac{5}{6})^3=\\frac{91}{216}$。`,
  },
  {
    id: "prob_comp_coin_4",
    title: "コイン4回：少なくとも1回表",
    statement: `コインを4回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{少なくとも1回表}")}\\n$$`,
    correct: texFrac(15, 16),
    choices: [texFrac(15, 16), texFrac(1, 16), texFrac(7, 8), texFrac(3, 4)],
    explain: `補集合は「表が0回」。$1-\\frac{1}{16}=\\frac{15}{16}$。`,
  },
  {
    id: "prob_comp_balls_4",
    title: "玉3回：少なくとも1回赤",
    statement: `箱に赤2個・青4個の玉がある。続けて3個取り出す（戻さない）。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{少なくとも1回赤}")}\\n$$`,
    correct: texFrac(4, 5),
    choices: [texFrac(4, 5), texFrac(1, 5), texFrac(2, 5), texFrac(3, 5)],
    explain: `補集合は「3回とも青」。$\\frac{4}{6}\\cdot\\frac{3}{5}\\cdot\\frac{2}{4}=\\frac{1}{5}$、よって $1-\\frac{1}{5}=\\frac{4}{5}$。`,
  },
  {
    id: "prob_comp_die_6",
    title: "サイコロ2回：偶数が少なくとも1回",
    statement: `サイコロを2回投げる。次の確率を求めよ。\\n\\n$$\\n${texProb("\\text{少なくとも1回偶数}")}\\n$$`,
    correct: texFrac(3, 4),
    choices: [texFrac(3, 4), texFrac(1, 4), texFrac(1, 2), texFrac(5, 6)],
    explain: `補集合は「2回とも奇数」。$(\\frac{1}{2})^2=\\frac{1}{4}$、よって $\\frac{3}{4}$。`,
  },
];

export const probComplementVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
