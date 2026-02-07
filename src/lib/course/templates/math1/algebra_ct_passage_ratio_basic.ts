// src/lib/course/templates/math1/algebra_ct_passage_ratio_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  total: number;
  ratioA: number;
  ratioB: number;
  delta: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "alg_ct_passage_ratio_1", title: "比の文章題 連問 1", total: 84, ratioA: 3, ratioB: 4, delta: 7, difficulty: 1 },
  { id: "alg_ct_passage_ratio_2", title: "比の文章題 連問 2", total: 96, ratioA: 5, ratioB: 3, delta: 16, difficulty: 1 },
  { id: "alg_ct_passage_ratio_3", title: "比の文章題 連問 3", total: 75, ratioA: 2, ratioB: 3, delta: 5, difficulty: 2 },
  { id: "alg_ct_passage_ratio_4", title: "比の文章題 連問 4", total: 110, ratioA: 4, ratioB: 6, delta: 10, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const sumRatio = c.ratioA + c.ratioB;
  const unit = c.total / sumRatio;
  const a = c.ratioA * unit;
  const b = c.ratioB * unit;
  const afterA = a + c.delta;
  const afterB = b - c.delta;
  const newDiff = afterA - afterB;
  const statement = [
    "次の文章を読み、問1〜問5に答えよ。",
    `$A:B=${c.ratioA}:${c.ratioB}$ で、$A+B=${c.total}$ とする。`,
    `さらに $A$ を ${c.delta} 増やし、$B$ を ${c.delta} 減らす。`,
    "（問1）$A$ を求めよ。",
    "（問2）$B$ を求めよ。",
    "（問3）操作後の $A$ を求めよ。",
    "（問4）操作後の $B$ を求めよ。",
    "（問5）操作後の $A-B$ を求めよ。",
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "algebra_linear_eq_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["algebra", "ratio", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "A" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "B" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "A後" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "B後" },
          { id: "q5", label: "問5", answerKind: "numeric", placeholder: "差" },
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
      const q1 = gradeNumeric(parsed.q1 ?? "", a);
      const q2 = gradeNumeric(parsed.q2 ?? "", b);
      const q3 = gradeNumeric(parsed.q3 ?? "", afterA);
      const q4 = gradeNumeric(parsed.q4 ?? "", afterB);
      const q5 = gradeNumeric(parsed.q5 ?? "", newDiff);
      return {
        isCorrect: q1.isCorrect && q2.isCorrect && q3.isCorrect && q4.isCorrect && q5.isCorrect,
        correctAnswer: `問1:${a} / 問2:${b} / 問3:${afterA} / 問4:${afterB} / 問5:${newDiff}`,
        partResults: {
          q1: { isCorrect: q1.isCorrect, correctAnswer: String(a) },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(b) },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(afterA) },
          q4: { isCorrect: q4.isCorrect, correctAnswer: String(afterB) },
          q5: { isCorrect: q5.isCorrect, correctAnswer: String(newDiff) },
        },
      };
    },
  };
}

export const algebraCtPassageRatioTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
