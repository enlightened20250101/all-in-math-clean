// src/lib/course/templates/math1/ineq_ct_passage_amgm_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "ineq_ct_passage_amgm_1", title: "平均 連問 1", a: 4, b: 16, difficulty: 1 },
  { id: "ineq_ct_passage_amgm_2", title: "平均 連問 2", a: 9, b: 25, difficulty: 1 },
  { id: "ineq_ct_passage_amgm_3", title: "平均 連問 3", a: 5, b: 45, difficulty: 2 },
  { id: "ineq_ct_passage_amgm_4", title: "平均 連問 4", a: 8, b: 72, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const am = (c.a + c.b) / 2;
  const gm = Math.sqrt(c.a * c.b);
  const diff = am - gm;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    `正の数 $a=${c.a},\\ b=${c.b}$ とする。`,
    "（問1）相加平均を求めよ。",
    "（問2）相乗平均を求めよ。",
    "（問3）相加平均と相乗平均の差を求めよ。",
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "inequality_amgm_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["inequality", "amgm", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "相加平均" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "相乗平均" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "差" },
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
      const q1 = gradeNumeric(parsed.q1 ?? "", am);
      const q2 = gradeNumeric(parsed.q2 ?? "", gm);
      const q3 = gradeNumeric(parsed.q3 ?? "", diff);
      return {
        isCorrect: q1.isCorrect && q2.isCorrect && q3.isCorrect,
        correctAnswer: `問1:${am} / 問2:${gm} / 問3:${diff}`,
        partResults: {
          q1: { isCorrect: q1.isCorrect, correctAnswer: String(am) },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(gm) },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(diff) },
        },
      };
    },
  };
}

export const inequalityCtPassageAmgmTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
