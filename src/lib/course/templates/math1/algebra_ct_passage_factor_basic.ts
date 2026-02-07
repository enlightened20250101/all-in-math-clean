// src/lib/course/templates/math1/algebra_ct_passage_factor_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  p: number;
  q: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "alg_ct_passage_factor_1", title: "因数分解 連問 1", p: 5, q: 6, difficulty: 1 },
  { id: "alg_ct_passage_factor_2", title: "因数分解 連問 2", p: 7, q: 10, difficulty: 1 },
  { id: "alg_ct_passage_factor_3", title: "因数分解 連問 3", p: 9, q: 8, difficulty: 2 },
  { id: "alg_ct_passage_factor_4", title: "因数分解 連問 4", p: 11, q: 12, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const sum = c.p + c.q;
  const prod = c.p * c.q;
  const value1 = 1 + sum + prod;
  const value2 = 1 - sum + prod;
  const sign = prod > 0 ? "正" : prod < 0 ? "負" : "0";
  const statement = [
    "次の文章を読み、問1〜問5に答えよ。",
    `二次式 $x^2+${sum}x+${prod}$ を考える。`,
    "（問1）因数分解すると $(x+a)(x+b)$ と表せる。$a+b$ を求めよ。",
    "（問2）$ab$ を求めよ。",
    "（問3）定数項の符号を答えよ。",
    "（問4）$x=1$ のときの値を求めよ。",
    "（問5）$x=-1$ のときの値を求めよ。",
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "algebra_factor_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["algebra", "factor", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "a+b" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "ab" },
          { id: "q3", label: "問3", answerKind: "choice", choices: ["正", "負", "0"] },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "x=1" },
          { id: "q5", label: "問5", answerKind: "numeric", placeholder: "x=-1" },
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
      const q1 = gradeNumeric(parsed.q1 ?? "", sum);
      const q2 = gradeNumeric(parsed.q2 ?? "", prod);
      const q4 = gradeNumeric(parsed.q4 ?? "", value1);
      const q5 = gradeNumeric(parsed.q5 ?? "", value2);
      const q3Ok = (parsed.q3 ?? "") === sign;
      return {
        isCorrect: q1.isCorrect && q2.isCorrect && q3Ok && q4.isCorrect && q5.isCorrect,
        correctAnswer: `問1:${sum} / 問2:${prod} / 問3:${sign} / 問4:${value1} / 問5:${value2}`,
        partResults: {
          q1: { isCorrect: q1.isCorrect, correctAnswer: String(sum) },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(prod) },
          q3: { isCorrect: q3Ok, correctAnswer: sign },
          q4: { isCorrect: q4.isCorrect, correctAnswer: String(value1) },
          q5: { isCorrect: q5.isCorrect, correctAnswer: String(value2) },
        },
      };
    },
  };
}

export const algebraCtPassageFactorTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
