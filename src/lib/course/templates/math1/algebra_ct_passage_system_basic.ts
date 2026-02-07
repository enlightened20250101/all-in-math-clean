// src/lib/course/templates/math1/algebra_ct_passage_system_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "alg_ct_passage_system_1", title: "連立方程式 連問 1", a1: 2, b1: 1, c1: 7, a2: 1, b2: -1, c2: 1, difficulty: 1 },
  { id: "alg_ct_passage_system_2", title: "連立方程式 連問 2", a1: 3, b1: -2, c1: 4, a2: 1, b2: 1, c2: 5, difficulty: 1 },
  { id: "alg_ct_passage_system_3", title: "連立方程式 連問 3", a1: 1, b1: 2, c1: 9, a2: 2, b2: -3, c2: -1, difficulty: 2 },
  { id: "alg_ct_passage_system_4", title: "連立方程式 連問 4", a1: 4, b1: 1, c1: 3, a2: 2, b2: -5, c2: -11, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const det = c.a1 * c.b2 - c.a2 * c.b1;
  const x = (c.c1 * c.b2 - c.c2 * c.b1) / det;
  const y = (c.a1 * c.c2 - c.a2 * c.c1) / det;
  const sum = x + y;
  const diff = x - y;
  const sign = sum > 0 ? "正" : sum < 0 ? "負" : "0";
  const statement = [
    "次の連立方程式を解き、問1〜問5に答えよ。",
    `\\begin{cases}\n${c.a1}x${c.b1 >= 0 ? "+" : ""}${c.b1}y=${c.c1}\\\\\n${c.a2}x${c.b2 >= 0 ? "+" : ""}${c.b2}y=${c.c2}\n\\end{cases}`,
    "（問1）$x$ を求めよ。",
    "（問2）$y$ を求めよ。",
    "（問3）$x+y$ を求めよ。",
    "（問4）$x-y$ を求めよ。",
    "（問5）$x+y$ の符号を答えよ。",
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "algebra_linear_eq_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["algebra", "linear", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "x" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "y" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "x+y" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "x-y" },
          { id: "q5", label: "問5", answerKind: "choice", choices: ["正", "負", "0"] },
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
      const q1 = gradeNumeric(parsed.q1 ?? "", x);
      const q2 = gradeNumeric(parsed.q2 ?? "", y);
      const q3 = gradeNumeric(parsed.q3 ?? "", sum);
      const q4 = gradeNumeric(parsed.q4 ?? "", diff);
      const q5Ok = (parsed.q5 ?? "") === sign;
      return {
        isCorrect: q1.isCorrect && q2.isCorrect && q3.isCorrect && q4.isCorrect && q5Ok,
        correctAnswer: `問1:${x} / 問2:${y} / 問3:${sum} / 問4:${diff} / 問5:${sign}`,
        partResults: {
          q1: { isCorrect: q1.isCorrect, correctAnswer: String(x) },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(y) },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(sum) },
          q4: { isCorrect: q4.isCorrect, correctAnswer: String(diff) },
          q5: { isCorrect: q5Ok, correctAnswer: sign },
        },
      };
    },
  };
}

export const algebraCtPassageSystemTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
