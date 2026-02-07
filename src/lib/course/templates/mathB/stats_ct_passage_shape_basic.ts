// src/lib/course/templates/mathB/stats_ct_passage_shape_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  shape: "linear" | "curve" | "none";
  trend: "pos" | "neg" | "none";
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const shapeChoice = c.shape === "linear" ? "A" : c.shape === "curve" ? "B" : "C";
  const trendChoice = c.trend === "pos" ? "A" : c.trend === "neg" ? "B" : "C";
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    "（問1）散布図の形として最も適切なのはどれか。",
    "（問2）相関の向きとして最も適切なのはどれか。",
    "（問3）一次回帰直線の適合が良いかどうかを答えよ（良い/良くない）。",
  ].join("\n");
  const choicesShape = [
    { id: "A", label: "直線的" },
    { id: "B", label: "曲線的" },
    { id: "C", label: "ばらつきが大きい" },
  ] as const;
  const choicesTrend = [
    { id: "A", label: "正の相関" },
    { id: "B", label: "負の相関" },
    { id: "C", label: "相関なし" },
  ] as const;
  const choicesFit = [
    { id: "A", label: "良い" },
    { id: "B", label: "良くない" },
  ] as const;
  const fitChoice = c.shape === "linear" ? "A" : "B";
  return {
    meta: {
      id: c.id,
      topicId: "stats_scatter_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["stats", "scatter", "shape", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "choice", choices: choicesShape },
          { id: "q2", label: "問2", answerKind: "choice", choices: choicesTrend },
          { id: "q3", label: "問3", answerKind: "choice", choices: choicesFit },
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
      const q1Result = gradeChoice(parsed.q1 ?? "", shapeChoice);
      const q2Result = gradeChoice(parsed.q2 ?? "", trendChoice);
      const q3Result = gradeChoice(parsed.q3 ?? "", fitChoice);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${shapeChoice} / 問2:${trendChoice} / 問3:${fitChoice}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: shapeChoice },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: trendChoice },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: fitChoice },
        },
      };
    },
    explain() {
      return `### この問題の解説\n散布図の形が直線的なら一次回帰が適合しやすい。曲線的なら適合は良くない。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_shape_1",
    title: "散布図の形 連問 1",
    shape: "linear",
    trend: "pos",
    context: "散布図がほぼ一直線に並び、右上がりの傾向が見られる。",
    difficulty: 2,
  },
  {
    id: "stats_ct_passage_shape_2",
    title: "散布図の形 連問 2",
    shape: "curve",
    trend: "none",
    context: "散布図が曲線に沿って並び、直線的な傾向は弱い。",
    difficulty: 3,
  },
];

export const statsCtPassageShapeTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
