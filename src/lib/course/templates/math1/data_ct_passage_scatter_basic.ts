// src/lib/course/templates/math1/data_ct_passage_scatter_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  points: Array<[number, number]>;
  correlation: "正の相関" | "負の相関" | "相関なし";
  context: string;
  difficulty: 1 | 2 | 3;
};

const CHOICES = ["正の相関", "負の相関", "相関なし"] as const;

function mean(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const xs = c.points.map((p) => p[0]);
  const ys = c.points.map((p) => p[1]);
  const mx = mean(xs);
  const my = mean(ys);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `散布図の点: ${c.points.map(([x, y]) => `(${x},${y})`).join(", ")}`,
    "（問1）xの平均を求めよ。",
    "（問2）yの平均を求めよ。",
    "（問3）散布図の相関の向きを選べ。",
  ].join("\n");

  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: "xの平均" },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: "yの平均" },
    { id: "q3", label: "問3", answerKind: "choice", choices: [...CHOICES] },
  ] as const;

  return {
    meta: {
      id: c.id,
      topicId: "data_scatter_basic",
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", mx);
      const q2Result = gradeNumeric(parsed.q2 ?? "", my);
      const q3Correct = (parsed.q3 ?? "") === c.correlation;
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Correct,
        correctAnswer: `問1:${mx} / 問2:${my} / 問3:${c.correlation}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(mx) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(my) },
          q3: { isCorrect: q3Correct, correctAnswer: c.correlation },
        },
      };
    },
    explain() {
      return "### この問題の解説\n平均は各座標の合計を個数で割る。相関は散布図の傾きで判断する。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "data_ct_passage_scatter_1",
    title: "散布図 連問 1",
    points: [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    correlation: "正の相関",
    context: "xとyの関係を調べる散布図が与えられている。",
    difficulty: 1,
  },
  {
    id: "data_ct_passage_scatter_2",
    title: "散布図 連問 2",
    points: [
      [1, 5],
      [2, 4],
      [3, 3],
      [4, 2],
    ],
    correlation: "負の相関",
    context: "xが増えるとyが減る傾向を考える。",
    difficulty: 2,
  },
  {
    id: "data_ct_passage_scatter_3",
    title: "散布図 連問 3",
    points: [
      [1, 3],
      [2, 3],
      [3, 3],
      [4, 3],
    ],
    correlation: "相関なし",
    context: "yがほぼ一定の場合を考える。",
    difficulty: 3,
  },
];

export const dataCtPassageScatterTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
