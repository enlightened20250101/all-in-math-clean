// src/lib/course/templates/mathA/prob_ct_passage_complement_basic.ts
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
      topicId: "prob_complement_basic",
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
      return "### この問題の解説\n余事象を用いて条件を整理し、確率は「条件/全体」。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "prob_ct_passage_comp_1",
    title: "余事象 連問 1",
    total: 25,
    favorable: 21,
    choices: ["4/25", "21/25", "3/5", "4/5"],
    correctChoice: "21/25",
    context: "赤2個・青3個の玉から2個を順に取り出す（戻さない）。少なくとも1回赤が出る確率を考える。",
    difficulty: 1,
  },
  {
    id: "prob_ct_passage_comp_2",
    title: "余事象 連問 2",
    total: 16,
    favorable: 13,
    choices: ["3/16", "13/16", "1/4", "3/4"],
    correctChoice: "13/16",
    context: "コインを4回投げる。少なくとも1回表が出る確率を考える。",
    difficulty: 2,
  },
  {
    id: "prob_ct_passage_comp_3",
    title: "余事象 連問 3",
    total: 20,
    favorable: 18,
    choices: ["1/10", "9/10", "2/5", "3/5"],
    correctChoice: "9/10",
    context: "1〜5のカードを2枚同時に引く。少なくとも1枚が偶数である確率を考える。",
    difficulty: 3,
  },
];

export const probCtPassageComplementTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
