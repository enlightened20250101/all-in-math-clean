// src/lib/course/templates/mathB/stats_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  data: number[];
  points: Array<[number, number]>;
  correlation: "正の相関" | "負の相関" | "相関なし";
  context: string;
  difficulty: 1 | 2 | 3;
};

const CHOICES = ["正の相関", "負の相関", "相関なし"] as const;

function mean(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function variance(values: number[]): number {
  const m = mean(values);
  return values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const m = mean(c.data);
  const v = variance(c.data);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `データ: ${c.data.join(", ")}`,
    `散布図の点: ${c.points.map(([x, y]) => `(${x},${y})`).join(", ")}`,
    "（問1）データの平均を求めよ。",
    "（問2）データの分散（母分散）を求めよ。",
    "（問3）散布図の相関の向きを選べ。",
  ].join("\n");
  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: "平均" },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: "分散" },
    { id: "q3", label: "問3", answerKind: "choice", choices: [...CHOICES], placeholder: "" },
  ] as const;

  return {
    meta: {
      id: c.id,
      topicId: "stats_sample_mean_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "ct", "passage"],
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
      const q3Correct = (parsed.q3 ?? "") === c.correlation;
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Correct,
        correctAnswer: `問1:${m} / 問2:${v} / 問3:${c.correlation}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(m) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(v) },
          q3: { isCorrect: q3Correct, correctAnswer: c.correlation },
        },
      };
    },
    explain() {
      return `### この問題の解説\n平均は全体の合計を個数で割る。\n分散は平均との差の二乗の平均。\n相関は散布図の傾きで判断する。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_1",
    title: "データと相関 連問 1",
    data: [1, 3, 5, 7],
    points: [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    correlation: "正の相関",
    context: "あるクラスの得点データと、別の調査の散布図が示されている。",
    difficulty: 1,
  },
  {
    id: "stats_ct_passage_2",
    title: "データと相関 連問 2",
    data: [2, 4, 6, 8],
    points: [
      [1, 6],
      [2, 5],
      [3, 4],
      [4, 3],
    ],
    correlation: "負の相関",
    context: "測定値のデータと散布図が与えられている。",
    difficulty: 2,
  },
  {
    id: "stats_ct_passage_3",
    title: "データと相関 連問 3",
    data: [3, 3, 5, 5],
    points: [
      [1, 3],
      [2, 3],
      [3, 3],
      [4, 3],
    ],
    correlation: "相関なし",
    context: "複数の観測値と散布図が与えられている。",
    difficulty: 3,
  },
];

export const statsCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
