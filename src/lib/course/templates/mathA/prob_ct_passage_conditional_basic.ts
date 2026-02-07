// src/lib/course/templates/mathA/prob_ct_passage_conditional_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  total: number;
  favorable: number;
  choices: string[];
  correctChoice: string;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    "（問1）全体の場合の数を求めよ。",
    "（問2）条件を満たす場合の数を求めよ。",
    "（問3）確率を選べ。",
  ].join("\n");

  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: "全体" },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: "条件" },
    { id: "q3", label: "問3", answerKind: "choice", choices: c.choices },
  ] as const;

  return {
    meta: {
      id: c.id,
      topicId: "prob_combi_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["probability", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [...subQuestions],
        params: {},
      };
    },
    grade(_params, userAnswer) {
      let parsed: Record<string, string> = {};
      try {
        parsed = JSON.parse(userAnswer) as Record<string, string>;
      } catch {
        parsed = {};
      }
      const q1Result = gradeNumeric(parsed.q1 ?? "", c.total);
      const q2Result = gradeNumeric(parsed.q2 ?? "", c.favorable);
      const q3Correct = (parsed.q3 ?? "") === c.correctChoice;
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Correct,
        correctAnswer: `問1:${c.total} / 問2:${c.favorable} / 問3:${c.correctChoice}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(c.total) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(c.favorable) },
          q3: { isCorrect: q3Correct, correctAnswer: c.correctChoice },
        },
      };
    },
    explain() {
      return "### この問題の解説\n条件付きのケース数を整理して確率を求める。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "prob_ct_passage_cond_1",
    title: "条件付き 連問 1",
    total: 12,
    favorable: 4,
    choices: ["1/3", "1/2", "2/3", "3/4"],
    correctChoice: "1/3",
    context: "1〜6のカードから2枚同時に引く。和が7となる確率を考える。",
    difficulty: 1,
  },
  {
    id: "prob_ct_passage_cond_2",
    title: "条件付き 連問 2",
    total: 20,
    favorable: 6,
    choices: ["3/10", "2/5", "1/3", "1/2"],
    correctChoice: "3/10",
    context: "赤3個・青2個の玉から2個同時に取り出す。赤がちょうど2個となる確率を考える。",
    difficulty: 2,
  },
  {
    id: "prob_ct_passage_cond_3",
    title: "条件付き 連問 3",
    total: 35,
    favorable: 10,
    choices: ["2/7", "1/3", "3/7", "1/2"],
    correctChoice: "2/7",
    context: "7人から3人を選ぶ。女子が3人となる確率を考える（女子5人、男子2人）。",
    difficulty: 3,
  },
];

export const probCtPassageConditionalTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
