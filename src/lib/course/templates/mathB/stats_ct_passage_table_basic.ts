// src/lib/course/templates/mathB/stats_ct_passage_table_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  table: Array<{ x: number; f: number }>;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const total = c.table.reduce((acc, t) => acc + t.f, 0);
  const mean =
    c.table.reduce((acc, t) => acc + t.x * t.f, 0) / total;
  const variance =
    c.table.reduce((acc, t) => acc + t.f * Math.pow(t.x - mean, 2), 0) / total;
  const statement = [
    "次の度数分布表を読み、問1〜問3に答えよ。",
    c.context,
    `表: ${c.table.map((t) => `${t.x}(${t.f})`).join(", ")}`,
    "（問1）平均を求めよ。",
    "（問2）分散を求めよ。",
    "（問3）標準偏差を求めよ。",
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "data_variance_sd_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["stats", "table", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "平均" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "分散" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "標準偏差" },
        ],
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", mean);
      const q2Result = gradeNumeric(parsed.q2 ?? "", variance);
      const q3Result = gradeNumeric(parsed.q3 ?? "", Math.sqrt(variance));
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${mean} / 問2:${variance} / 問3:${Math.sqrt(variance)}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(mean) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(variance) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(Math.sqrt(variance)) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n度数分布表の平均は $\\frac{\\sum xf}{\\sum f}$、分散は $\\frac{\\sum f(x-\\bar{x})^2}{\\sum f}$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_table_1",
    title: "度数分布 連問 1",
    table: [
      { x: 2, f: 1 },
      { x: 4, f: 2 },
      { x: 6, f: 3 },
    ],
    context: "あるデータの度数分布が次で与えられる。",
    difficulty: 2,
  },
  {
    id: "stats_ct_passage_table_2",
    title: "度数分布 連問 2",
    table: [
      { x: 1, f: 2 },
      { x: 3, f: 4 },
      { x: 5, f: 2 },
      { x: 7, f: 2 },
    ],
    context: "別のデータの度数分布が次で与えられる。",
    difficulty: 3,
  },
];

export const statsCtPassageTableTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
