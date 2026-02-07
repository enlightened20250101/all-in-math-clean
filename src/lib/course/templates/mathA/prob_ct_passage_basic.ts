// src/lib/course/templates/mathA/prob_ct_passage_basic.ts
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
      tags: ["probability", "combinatorics", "ct", "passage"],
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
      return "### この問題の解説\n全体→条件の順に数え、確率は「条件/全体」。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "prob_ct_passage_1",
    title: "玉の取り出し 連問 1",
    total: 10,
    favorable: 6,
    choices: ["1/2", "3/5", "2/3", "3/4"],
    correctChoice: "3/5",
    context: "赤3個・青2個の玉から2個同時に取り出す。赤が少なくとも1個となる確率を考える。",
    difficulty: 1,
  },
  {
    id: "prob_ct_passage_2",
    title: "カードの抽出 連問 2",
    total: 15,
    favorable: 5,
    choices: ["1/3", "1/2", "2/3", "3/5"],
    correctChoice: "1/3",
    context: "1〜6のカードから2枚同時に引く。偶数カードがちょうど1枚となる確率を考える。",
    difficulty: 2,
  },
  {
    id: "prob_ct_passage_3",
    title: "条件付き 連問 3",
    total: 28,
    favorable: 12,
    choices: ["3/7", "2/7", "3/14", "1/2"],
    correctChoice: "3/7",
    context: "7人から3人を選ぶ。女子が2人以上となる確率を考える（女子4人、男子3人）。",
    difficulty: 3,
  },
];

export const probCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
