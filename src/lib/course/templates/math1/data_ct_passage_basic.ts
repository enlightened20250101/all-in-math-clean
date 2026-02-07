// src/lib/course/templates/math1/data_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  data: number[];
  difficulty: 1 | 2 | 3;
  context: string;
};

function mean(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function variance(values: number[]): number {
  const m = mean(values);
  return values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
}

function range(values: number[]): number {
  return Math.max(...values) - Math.min(...values);
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const m = mean(c.data);
  const v = variance(c.data);
  const r = range(c.data);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `データ: ${c.data.join(", ")}`,
    "（問1）平均を求めよ。",
    "（問2）分散（母分散）を求めよ。",
    "（問3）範囲を求めよ。",
  ].join("\n");

  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: "平均" },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: "分散" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", m);
      const q2Result = gradeNumeric(parsed.q2 ?? "", v);
      const q3Result = gradeNumeric(parsed.q3 ?? "", r);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${m} / 問2:${v} / 問3:${r}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(m) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(v) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(r) },
        },
      };
    },
    explain() {
      return "### この問題の解説\n平均は合計/個数。分散は平均との差の二乗の平均。範囲は最大−最小。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "data_ct_passage_1",
    title: "データ分析 連問 1",
    data: [2, 4, 6, 8],
    context: "次のデータについて代表値と散らばりを調べる。",
    difficulty: 1,
  },
  {
    id: "data_ct_passage_2",
    title: "データ分析 連問 2",
    data: [3, 3, 5, 9],
    context: "次のデータについて平均・分散・範囲を求める。",
    difficulty: 2,
  },
  {
    id: "data_ct_passage_3",
    title: "データ分析 連問 3",
    data: [1, 2, 2, 5, 10],
    context: "少し数の多いデータで代表値を求める。",
    difficulty: 3,
  },
];

export const dataCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
