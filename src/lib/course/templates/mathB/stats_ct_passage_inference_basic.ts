// src/lib/course/templates/mathB/stats_ct_passage_inference_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  n: number;
  mean: number;
  sigma: number;
  z: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const se = c.sigma / Math.sqrt(c.n);
  const half = c.z * se;
  const lower = c.mean - half;
  const upper = c.mean + half;
  const statement = [
    "次の文章を読み、問1〜問4に答えよ。",
    c.context,
    "（問1）標本平均の標準誤差を求めよ。",
    "（問2）$z$ を用いた信頼区間の片側の幅を求めよ。",
    "（問3）信頼区間の下限を求めよ。",
    "（問4）信頼区間の上限を求めよ。",
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "stats_confidence_interval_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["stats", "confidence", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "標準誤差" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "片側幅" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "下限" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "上限" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", se);
      const q2Result = gradeNumeric(parsed.q2 ?? "", half);
      const q3Result = gradeNumeric(parsed.q3 ?? "", lower);
      const q4Result = gradeNumeric(parsed.q4 ?? "", upper);
      return {
        isCorrect:
          q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect && q4Result.isCorrect,
        correctAnswer: `問1:${se} / 問2:${half} / 問3:${lower} / 問4:${upper}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(se) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(half) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(lower) },
          q4: { isCorrect: q4Result.isCorrect, correctAnswer: String(upper) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n標準誤差は $\\sigma/\\sqrt{n}$。片側の幅は $z\\cdot$標準誤差。\n区間は $\\bar{x}\\pm z\\cdot\\sigma/\\sqrt{n}$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_inference_1",
    title: "区間推定 連問 1",
    n: 36,
    mean: 70,
    sigma: 12,
    z: 2,
    context: "母標準偏差が12、標本サイズ36、標本平均70とする。",
    difficulty: 2,
  },
  {
    id: "stats_ct_passage_inference_2",
    title: "区間推定 連問 2",
    n: 64,
    mean: 55,
    sigma: 16,
    z: 1.96,
    context: "母標準偏差が16、標本サイズ64、標本平均55とする。",
    difficulty: 3,
  },
  {
    id: "stats_ct_passage_inference_3",
    title: "区間推定 連問 3",
    n: 25,
    mean: 62,
    sigma: 10,
    z: 1.64,
    context: "母標準偏差が10、標本サイズ25、標本平均62とする。",
    difficulty: 2,
  },
];

export const statsCtPassageInferenceTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
