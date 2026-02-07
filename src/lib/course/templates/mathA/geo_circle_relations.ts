// src/lib/course/templates/mathA/geo_circle_relations.ts
import type { QuestionTemplate } from "../../types";

type TwoCirclesCase = { id: string; title: string; r1: number; r2: number; d: number; answer: number };

function buildCase(c: TwoCirclesCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_relations",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_CIRCLE_RELATION"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `半径 ${c.r1}, ${c.r2} の2円の中心間距離が ${c.d} のとき、共通接線の本数を求めよ。`,
        answerKind: "choice",
        choices: ["0", "1", "2", "3", "4"],
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === String(c.answer), correctAnswer: String(c.answer) };
    },
    explain() {
      return `
### この問題の解説
中心間距離 $d$ と半径の和・差を比較して判定します。答えは ${c.answer} 本です。
`;
    },
  };
}

const CASES: TwoCirclesCase[] = [
  { id: "geo_circle_rel_1", title: "2円 1", r1: 3, r2: 5, d: 8, answer: 3 },
  { id: "geo_circle_rel_2", title: "2円 2", r1: 3, r2: 5, d: 2, answer: 1 },
  { id: "geo_circle_rel_3", title: "2円 3", r1: 4, r2: 6, d: 15, answer: 4 },
  { id: "geo_circle_rel_4", title: "2円 4", r1: 4, r2: 6, d: 5, answer: 2 },
  { id: "geo_circle_rel_5", title: "2円 5", r1: 2, r2: 7, d: 9, answer: 3 },
  { id: "geo_circle_rel_6", title: "2円 6", r1: 2, r2: 7, d: 5, answer: 2 },
  { id: "geo_circle_rel_7", title: "2円 7", r1: 5, r2: 5, d: 10, answer: 3 },
  { id: "geo_circle_rel_8", title: "2円 8", r1: 6, r2: 4, d: 1, answer: 0 },
  { id: "geo_circle_rel_9", title: "2円 9", r1: 6, r2: 4, d: 2, answer: 1 },
  { id: "geo_circle_rel_10", title: "2円 10", r1: 6, r2: 4, d: 12, answer: 4 },
  { id: "geo_circle_rel_11", title: "2円 11", r1: 8, r2: 3, d: 5, answer: 1 },
  { id: "geo_circle_rel_12", title: "2円 12", r1: 8, r2: 3, d: 20, answer: 4 },
  { id: "geo_circle_rel_13", title: "2円 13", r1: 3, r2: 3, d: 6, answer: 3 },
  { id: "geo_circle_rel_14", title: "2円 14", r1: 3, r2: 3, d: 8, answer: 4 },
  { id: "geo_circle_rel_15", title: "2円 15", r1: 3, r2: 3, d: 5, answer: 2 },
  { id: "geo_circle_rel_16", title: "2円 16", r1: 3, r2: 3, d: 2, answer: 2 },
  { id: "geo_circle_rel_17", title: "2円 17", r1: 7, r2: 2, d: 5, answer: 1 },
  { id: "geo_circle_rel_18", title: "2円 18", r1: 7, r2: 2, d: 4, answer: 0 },
  { id: "geo_circle_rel_19", title: "2円 19", r1: 7, r2: 2, d: 9, answer: 3 },
  { id: "geo_circle_rel_20", title: "2円 20", r1: 7, r2: 2, d: 12, answer: 4 },
  { id: "geo_circle_rel_21", title: "2円 21", r1: 6, r2: 1, d: 4, answer: 0 },
  { id: "geo_circle_rel_22", title: "2円 22", r1: 6, r2: 1, d: 5, answer: 1 },
  { id: "geo_circle_rel_23", title: "2円 23", r1: 6, r2: 1, d: 7, answer: 3 },
  { id: "geo_circle_rel_24", title: "2円 24", r1: 6, r2: 1, d: 8, answer: 4 },
  { id: "geo_circle_rel_25", title: "2円 25", r1: 5, r2: 1, d: 3, answer: 0 },
  { id: "geo_circle_rel_26", title: "2円 26", r1: 5, r2: 1, d: 4, answer: 1 },
  { id: "geo_circle_rel_27", title: "2円 27", r1: 5, r2: 1, d: 5, answer: 2 },
  { id: "geo_circle_rel_28", title: "2円 28", r1: 5, r2: 1, d: 6, answer: 3 },
  { id: "geo_circle_rel_29", title: "2円 29", r1: 5, r2: 1, d: 8, answer: 4 },
  { id: "geo_circle_rel_30", title: "2円 30", r1: 8, r2: 5, d: 13, answer: 3 },
  { id: "geo_circle_rel_31", title: "2円 31", r1: 8, r2: 5, d: 14, answer: 4 },
  { id: "geo_circle_rel_32", title: "2円 32", r1: 8, r2: 5, d: 4, answer: 2 },
  { id: "geo_circle_rel_33", title: "2円 33", r1: 8, r2: 5, d: 3, answer: 1 },
  { id: "geo_circle_rel_34", title: "2円 34", r1: 8, r2: 5, d: 2, answer: 0 },
  { id: "geo_circle_rel_35", title: "2円 35", r1: 9, r2: 4, d: 9, answer: 2 },
  { id: "geo_circle_rel_36", title: "2円 36", r1: 9, r2: 4, d: 5, answer: 1 },
  { id: "geo_circle_rel_37", title: "2円 37", r1: 9, r2: 4, d: 4, answer: 0 },
  { id: "geo_circle_rel_38", title: "2円 38", r1: 9, r2: 4, d: 13, answer: 3 },
  { id: "geo_circle_rel_39", title: "2円 39", r1: 9, r2: 4, d: 16, answer: 4 },
  { id: "geo_circle_rel_40", title: "2円 40", r1: 2, r2: 1, d: 1, answer: 1 },
  { id: "geo_circle_rel_41", title: "2円 41", r1: 2, r2: 1, d: 2, answer: 2 },
  { id: "geo_circle_rel_42", title: "2円 42", r1: 2, r2: 1, d: 3, answer: 3 },
  { id: "geo_circle_rel_43", title: "2円 43", r1: 4, r2: 2, d: 1, answer: 0 },
  { id: "geo_circle_rel_44", title: "2円 44", r1: 4, r2: 2, d: 2, answer: 1 },
  { id: "geo_circle_rel_45", title: "2円 45", r1: 4, r2: 2, d: 6, answer: 3 },
  { id: "geo_circle_rel_46", title: "2円 46", r1: 4, r2: 2, d: 7, answer: 4 },
  { id: "geo_circle_rel_47", title: "2円 47", r1: 5, r2: 3, d: 2, answer: 0 },
  { id: "geo_circle_rel_48", title: "2円 48", r1: 5, r2: 3, d: 3, answer: 1 },
  { id: "geo_circle_rel_49", title: "2円 49", r1: 5, r2: 3, d: 8, answer: 3 },
  { id: "geo_circle_rel_50", title: "2円 50", r1: 5, r2: 3, d: 9, answer: 4 },
];

export const geoCircleRelationsTemplates: QuestionTemplate[] = CASES.map(buildCase);
