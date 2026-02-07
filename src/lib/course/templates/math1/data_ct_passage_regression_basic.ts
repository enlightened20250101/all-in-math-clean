// src/lib/course/templates/math1/data_ct_passage_regression_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice, gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  points: Array<[number, number]>;
  queryX: number;
  context: string;
  difficulty: 2 | 3;
};

function mean(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const xs = c.points.map((p) => p[0]);
  const ys = c.points.map((p) => p[1]);
  const xBar = mean(xs);
  const yBar = mean(ys);
  const cov =
    c.points.reduce((acc, [x, y]) => acc + (x - xBar) * (y - yBar), 0) / c.points.length;
  const varX = c.points.reduce((acc, [x]) => acc + Math.pow(x - xBar, 2), 0) / c.points.length;
  const slope = cov / varX;
  const intercept = yBar - slope * xBar;
  const estimate = slope * c.queryX + intercept;
  const statement = [
    "次の表と文章を読み、問1〜問4に答えよ。",
    c.context,
    `データ: ${c.points.map((p) => `(${p[0]},${p[1]})`).join(", ")}`,
    "（問1）$\\bar{x}$ を求めよ。",
    "（問2）$\\bar{y}$ を求めよ。",
    "（問3）回帰直線 $y=ax+b$ の係数 $a$ を求めよ。",
    `（問4）回帰直線で $x=${c.queryX}$ の推定値を求めよ。`,
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "data_regression_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["data", "regression", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "x平均" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "y平均" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "傾き" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "推定値" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", xBar);
      const q2Result = gradeNumeric(parsed.q2 ?? "", yBar);
      const q3Result = gradeNumeric(parsed.q3 ?? "", slope);
      const q4Result = gradeNumeric(parsed.q4 ?? "", estimate);
      return {
        isCorrect:
          q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect && q4Result.isCorrect,
        correctAnswer: `問1:${xBar} / 問2:${yBar} / 問3:${slope} / 問4:${estimate}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(xBar) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(yBar) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(slope) },
          q4: { isCorrect: q4Result.isCorrect, correctAnswer: String(estimate) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n$\\bar{x},\\bar{y}$ を求め、共分散と分散から $a=\\frac{\\mathrm{cov}}{\\mathrm{var}}$。\n切片 $b=\\bar{y}-a\\bar{x}$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "data_ct_passage_regression_1",
    title: "回帰直線 連問 1",
    points: [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 6],
    ],
    queryX: 5,
    context: "学習時間と得点の関係を調べた。",
    difficulty: 2,
  },
  {
    id: "data_ct_passage_regression_2",
    title: "回帰直線 連問 2",
    points: [
      [2, 5],
      [4, 6],
      [6, 8],
      [8, 10],
    ],
    queryX: 7,
    context: "練習回数と成功回数の関係を調べた。",
    difficulty: 3,
  },
];

export const dataCtPassageRegressionTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
