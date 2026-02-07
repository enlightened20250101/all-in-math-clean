// src/lib/course/templates/mathB/stats_ct_passage_correlation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice, gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  r1: number;
  r2: number;
  slope: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const rStrength = Math.abs(c.r1) > Math.abs(c.r2) ? "A" : Math.abs(c.r1) < Math.abs(c.r2) ? "B" : "C";
  const slopeSign = c.slope > 0 ? "A" : c.slope < 0 ? "B" : "C";
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）相関係数 $r_1=${c.r1}$ と $r_2=${c.r2}$ のうち、相関が強いのはどれか。`,
    "（問2）回帰直線の傾きの符号を答えよ（正/負/0）。",
    "（問3）相関係数の符号を答えよ（正/負/0）。",
  ].join("\n");
  const choicesStrength = [
    { id: "A", label: "r1" },
    { id: "B", label: "r2" },
    { id: "C", label: "同じ" },
  ] as const;
  const choicesSign = [
    { id: "A", label: "正" },
    { id: "B", label: "負" },
    { id: "C", label: "0" },
  ] as const;
  const rSign = c.r1 > 0 ? "A" : c.r1 < 0 ? "B" : "C";
  return {
    meta: {
      id: c.id,
      topicId: "stats_correlation_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["stats", "correlation", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "choice", choices: choicesStrength },
          { id: "q2", label: "問2", answerKind: "choice", choices: choicesSign },
          { id: "q3", label: "問3", answerKind: "choice", choices: choicesSign },
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
      const q1Result = gradeChoice(parsed.q1 ?? "", rStrength);
      const q2Result = gradeChoice(parsed.q2 ?? "", slopeSign);
      const q3Result = gradeChoice(parsed.q3 ?? "", rSign);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${rStrength} / 問2:${slopeSign} / 問3:${rSign}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: rStrength },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: slopeSign },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: rSign },
        },
      };
    },
    explain() {
      return `### この問題の解説\n相関の強さは $|r|$ が大きい方。傾きと相関係数の符号は一致する。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_correlation_1",
    title: "相関の比較 連問 1",
    r1: 0.78,
    r2: 0.52,
    slope: 1.4,
    context: "2つの散布図の相関係数がそれぞれ $r_1=0.78, r_2=0.52$ である。",
    difficulty: 2,
  },
  {
    id: "stats_ct_passage_correlation_2",
    title: "相関の比較 連問 2",
    r1: -0.35,
    r2: -0.8,
    slope: -0.6,
    context: "2つの散布図の相関係数がそれぞれ $r_1=-0.35, r_2=-0.80$ である。",
    difficulty: 3,
  },
];

export const statsCtPassageCorrelationTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
