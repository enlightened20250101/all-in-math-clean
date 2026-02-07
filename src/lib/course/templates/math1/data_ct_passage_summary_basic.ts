// src/lib/course/templates/math1/data_ct_passage_summary_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  data: number[];
  median: number;
  mode: number;
  range: number;
  difficulty: 1 | 2 | 3;
  context: string;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `データ: ${c.data.join(", ")}`,
    "（問1）中央値を求めよ。",
    "（問2）最頻値を求めよ。",
    "（問3）範囲を求めよ。",
  ].join("\n");

  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: "中央値" },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: "最頻値" },
    { id: "q3", label: "問3", answerKind: "numeric", placeholder: "範囲" },
  ] as const;

  return {
    meta: {
      id: c.id,
      topicId: "data_summary_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["data", "ct", "passage"],
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", c.median);
      const q2Result = gradeNumeric(parsed.q2 ?? "", c.mode);
      const q3Result = gradeNumeric(parsed.q3 ?? "", c.range);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${c.median} / 問2:${c.mode} / 問3:${c.range}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(c.median) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(c.mode) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(c.range) },
        },
      };
    },
    explain() {
      return "### この問題の解説\n中央値は並べたときの中央、最頻値は最も多い値。範囲は最大−最小。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "data_ct_passage_summary_1",
    title: "代表値 連問 1",
    data: [1, 2, 2, 4, 5],
    median: 2,
    mode: 2,
    range: 4,
    context: "次のデータについて代表値を求める。",
    difficulty: 1,
  },
  {
    id: "data_ct_passage_summary_2",
    title: "代表値 連問 2",
    data: [0, 3, 3, 3, 7, 9],
    median: 3,
    mode: 3,
    range: 9,
    context: "データの中央値・最頻値・範囲を求める。",
    difficulty: 2,
  },
  {
    id: "data_ct_passage_summary_3",
    title: "代表値 連問 3",
    data: [2, 4, 4, 6, 8, 10],
    median: 5,
    mode: 4,
    range: 8,
    context: "個数が偶数のデータについて整理する。",
    difficulty: 3,
  },
];

export const dataCtPassageSummaryTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
