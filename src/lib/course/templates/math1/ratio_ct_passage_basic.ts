// src/lib/course/templates/math1/ratio_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  whole: number;
  part: number;
  percent: number;
  inc: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "ratio_ct_passage_1", title: "割合 連問 1", whole: 240, part: 72, percent: 30, inc: 12, difficulty: 1 },
  { id: "ratio_ct_passage_2", title: "割合 連問 2", whole: 180, part: 45, percent: 25, inc: 10, difficulty: 1 },
  { id: "ratio_ct_passage_3", title: "割合 連問 3", whole: 320, part: 96, percent: 30, inc: 16, difficulty: 2 },
  { id: "ratio_ct_passage_4", title: "割合 連問 4", whole: 260, part: 65, percent: 25, inc: 13, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const rate = (c.part / c.whole) * 100;
  const newPart = c.part + c.inc;
  const newRate = (newPart / c.whole) * 100;
  const diff = newRate - rate;
  const statement = [
    "次の文章を読み、問1〜問4に答えよ。",
    `全体を ${c.whole} とし、ある部分は ${c.part} である。`,
    "（問1）部分が全体に占める割合（%）を求めよ。",
    `（問2）部分が ${c.inc} 増えたときの割合（%）を求めよ。`,
    "（問3）割合の増加分（%）を求めよ。",
    `（問4）割合が ${c.percent}% になる部分の値を求めよ。`,
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "algebra_linear_eq_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["ratio", "percentage", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "%" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "%" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "%" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "部分" },
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
      const q1 = gradeNumeric(parsed.q1 ?? "", rate);
      const q2 = gradeNumeric(parsed.q2 ?? "", newRate);
      const q3 = gradeNumeric(parsed.q3 ?? "", diff);
      const q4 = gradeNumeric(parsed.q4 ?? "", (c.percent / 100) * c.whole);
      return {
        isCorrect: q1.isCorrect && q2.isCorrect && q3.isCorrect && q4.isCorrect,
        correctAnswer: `問1:${rate} / 問2:${newRate} / 問3:${diff} / 問4:${(c.percent / 100) * c.whole}`,
        partResults: {
          q1: { isCorrect: q1.isCorrect, correctAnswer: String(rate) },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(newRate) },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(diff) },
          q4: { isCorrect: q4.isCorrect, correctAnswer: String((c.percent / 100) * c.whole) },
        },
      };
    },
  };
}

export const ratioCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
