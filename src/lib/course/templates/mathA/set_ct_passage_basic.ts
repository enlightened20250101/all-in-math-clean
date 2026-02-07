// src/lib/course/templates/mathA/set_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  nU: number;
  nA: number;
  nB: number;
  nAB: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "set_ct_passage_1", title: "集合 連問 1", nU: 50, nA: 28, nB: 22, nAB: 10, difficulty: 1 },
  { id: "set_ct_passage_2", title: "集合 連問 2", nU: 60, nA: 35, nB: 27, nAB: 12, difficulty: 1 },
  { id: "set_ct_passage_3", title: "集合 連問 3", nU: 45, nA: 20, nB: 18, nAB: 7, difficulty: 2 },
  { id: "set_ct_passage_4", title: "集合 連問 4", nU: 80, nA: 46, nB: 40, nAB: 18, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const onlyA = c.nA - c.nAB;
  const onlyB = c.nB - c.nAB;
  const nUnion = c.nA + c.nB - c.nAB;
  const neither = c.nU - nUnion;
  const statement = [
    "次の文章を読み、問1〜問4に答えよ。",
    `$n(U)=${c.nU}$、$n(A)=${c.nA}$、$n(B)=${c.nB}$、$n(A\\cap B)=${c.nAB}$ とする。`,
    "（問1）$A$ のみの要素数を求めよ。",
    "（問2）$B$ のみの要素数を求めよ。",
    "（問3）$n(A\\cup B)$ を求めよ。",
    "（問4）どちらにも属さない要素数を求めよ。",
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "set_operations_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["set", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "Aのみ" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "Bのみ" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "和集合" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "どちらでもない" },
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
      const q1 = gradeNumeric(parsed.q1 ?? "", onlyA);
      const q2 = gradeNumeric(parsed.q2 ?? "", onlyB);
      const q3 = gradeNumeric(parsed.q3 ?? "", nUnion);
      const q4 = gradeNumeric(parsed.q4 ?? "", neither);
      return {
        isCorrect: q1.isCorrect && q2.isCorrect && q3.isCorrect && q4.isCorrect,
        correctAnswer: `問1:${onlyA} / 問2:${onlyB} / 問3:${nUnion} / 問4:${neither}`,
        partResults: {
          q1: { isCorrect: q1.isCorrect, correctAnswer: String(onlyA) },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(onlyB) },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(nUnion) },
          q4: { isCorrect: q4.isCorrect, correctAnswer: String(neither) },
        },
      };
    },
  };
}

export const setCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
