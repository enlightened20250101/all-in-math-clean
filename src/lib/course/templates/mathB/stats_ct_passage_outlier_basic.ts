// src/lib/course/templates/mathB/stats_ct_passage_outlier_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  trend: "pos" | "neg" | "none";
  outlierEffect: "increase" | "decrease" | "none";
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const trendChoice = c.trend === "pos" ? "A" : c.trend === "neg" ? "B" : "C";
  const outlierChoice =
    c.outlierEffect === "increase" ? "A" : c.outlierEffect === "decrease" ? "B" : "C";
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    "（問1）相関の向きとして最も適切なのはどれか。",
    "（問2）外れ値を除いたとき、相関係数はどうなると考えられるか。",
    "（問3）回帰直線の傾きの符号として最も適切なのはどれか。",
  ].join("\n");
  const choicesTrend = [
    { id: "A", label: "正の相関" },
    { id: "B", label: "負の相関" },
    { id: "C", label: "相関なし" },
  ] as const;
  const choicesOutlier = [
    { id: "A", label: "大きくなる" },
    { id: "B", label: "小さくなる" },
    { id: "C", label: "ほとんど変わらない" },
  ] as const;
  return {
    meta: {
      id: c.id,
      topicId: "stats_scatter_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["stats", "scatter", "outlier", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "choice", choices: choicesTrend },
          { id: "q2", label: "問2", answerKind: "choice", choices: choicesOutlier },
          { id: "q3", label: "問3", answerKind: "choice", choices: choicesTrend },
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
      const q1Result = gradeChoice(parsed.q1 ?? "", trendChoice);
      const q2Result = gradeChoice(parsed.q2 ?? "", outlierChoice);
      const q3Result = gradeChoice(parsed.q3 ?? "", trendChoice);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${trendChoice} / 問2:${outlierChoice} / 問3:${trendChoice}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: trendChoice },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: outlierChoice },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: trendChoice },
        },
      };
    },
    explain() {
      return `### この問題の解説\n散布図の傾向から相関の向きを判断する。外れ値は相関係数の大きさに影響する。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_outlier_1",
    title: "外れ値の影響 連問 1",
    trend: "pos",
    outlierEffect: "increase",
    context: "散布図はおおむね右上がりで、1点だけ大きく外れた点が存在する。",
    difficulty: 2,
  },
  {
    id: "stats_ct_passage_outlier_2",
    title: "外れ値の影響 連問 2",
    trend: "neg",
    outlierEffect: "decrease",
    context: "散布図はおおむね右下がりだが、外れ値が1点含まれる。",
    difficulty: 3,
  },
];

export const statsCtPassageOutlierTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
