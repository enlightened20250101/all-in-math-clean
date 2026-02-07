// src/lib/course/templates/mathB/stats_ct_passage_regression_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  xValues: number[];
  line: { a: number; b: number };
  targetX: number;
  correlation: "正の相関" | "負の相関" | "相関なし";
  context: string;
  difficulty: 1 | 2 | 3;
};

const CHOICES = ["正の相関", "負の相関", "相関なし"] as const;

function mean(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const mx = mean(c.xValues);
  const yPred = c.line.a * c.targetX + c.line.b;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `xのデータ: ${c.xValues.join(", ")}`,
    `回帰直線: $y=${c.line.a}x+${c.line.b}$`,
    `（問1）xの平均を求めよ。`,
    `（問2）$x=${c.targetX}$ の推定値を求めよ。`,
    "（問3）相関の向きを選べ。",
  ].join("\n");

  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: "x平均" },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: "推定値" },
    { id: "q3", label: "問3", answerKind: "choice", choices: [...CHOICES] },
  ] as const;

  return {
    meta: {
      id: c.id,
      topicId: "stats_regression_basic",
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", mx);
      const q2Result = gradeNumeric(parsed.q2 ?? "", yPred);
      const q3Correct = (parsed.q3 ?? "") === c.correlation;
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Correct,
        correctAnswer: `問1:${mx} / 問2:${yPred} / 問3:${c.correlation}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(mx) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(yPred) },
          q3: { isCorrect: q3Correct, correctAnswer: c.correlation },
        },
      };
    },
    explain() {
      return "### この問題の解説\n平均は合計/個数。回帰直線に代入して推定値を求める。相関は傾きで判断。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_reg_1",
    title: "回帰直線 連問 1",
    xValues: [1, 2, 3, 4],
    line: { a: 2, b: 1 },
    targetX: 3,
    correlation: "正の相関",
    context: "回帰直線とxのデータが与えられている。",
    difficulty: 1,
  },
  {
    id: "stats_ct_passage_reg_2",
    title: "回帰直線 連問 2",
    xValues: [2, 4, 6, 8],
    line: { a: -1, b: 10 },
    targetX: 5,
    correlation: "負の相関",
    context: "右下がりの回帰直線を用いる。",
    difficulty: 2,
  },
  {
    id: "stats_ct_passage_reg_3",
    title: "回帰直線 連問 3",
    xValues: [0, 2, 4, 6, 8],
    line: { a: 3, b: -2 },
    targetX: 6,
    correlation: "正の相関",
    context: "データ数が多い場合を扱う。",
    difficulty: 3,
  },
];

export const statsCtPassageRegressionTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
