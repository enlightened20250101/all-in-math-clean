// src/lib/course/templates/math1/algebra_ct_passage_inequality_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
  d: number;
  limit: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "alg_ct_passage_ineq_1", title: "不等式 連問 1", a: 3, b: 2, c: 1, d: 8, limit: 10, difficulty: 1 },
  { id: "alg_ct_passage_ineq_2", title: "不等式 連問 2", a: 5, b: -4, c: 2, d: 3, limit: 12, difficulty: 1 },
  { id: "alg_ct_passage_ineq_3", title: "不等式 連問 3", a: -2, b: 7, c: 1, d: -5, limit: 8, difficulty: 2 },
  { id: "alg_ct_passage_ineq_4", title: "不等式 連問 4", a: 4, b: -6, c: -1, d: 2, limit: 15, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const leftA = c.a - c.c;
  const rightB = c.d - c.b;
  const boundary = rightB / leftA;
  const isLess = leftA > 0;
  const minInt = isLess ? Math.floor(boundary) + 1 : Math.ceil(boundary);
  const maxInt = isLess ? Math.floor(boundary) : Math.ceil(boundary) - 1;
  const count = isLess ? Math.max(0, Math.min(c.limit, maxInt) - 1 + 1) : Math.max(0, c.limit - minInt + 1);
  const statement = [
    "次の不等式を解き、問1〜問4に答えよ。",
    `${c.a}x${c.b >= 0 ? "+" : ""}${c.b} > ${c.c}x${c.d >= 0 ? "+" : ""}${c.d}`,
    "（問1）解を $x>k$ あるいは $x<k$ の形で表すときの $k$ を求めよ。",
    "（問2）解の向きを答えよ（$x>k$ または $x<k$）。",
    "（問3）$x$ が整数で $1\\le x\\le " + c.limit + "$ のとき、解の個数を求めよ。",
    "（問4）$x$ の最小の整数解を求めよ。",
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "algebra_ineq_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["algebra", "inequality", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "k" },
          { id: "q2", label: "問2", answerKind: "choice", choices: ["x>k", "x<k"] },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "個数" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "最小" },
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
      const q1 = gradeNumeric(parsed.q1 ?? "", boundary);
      const q2Ok = (parsed.q2 ?? "") === (isLess ? "x<k" : "x>k");
      const q3 = gradeNumeric(parsed.q3 ?? "", count);
      const q4 = gradeNumeric(parsed.q4 ?? "", isLess ? 1 : minInt);
      return {
        isCorrect: q1.isCorrect && q2Ok && q3.isCorrect && q4.isCorrect,
        correctAnswer: `問1:${boundary} / 問2:${isLess ? "x<k" : "x>k"} / 問3:${count} / 問4:${isLess ? 1 : minInt}`,
        partResults: {
          q1: { isCorrect: q1.isCorrect, correctAnswer: String(boundary) },
          q2: { isCorrect: q2Ok, correctAnswer: isLess ? "x<k" : "x>k" },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(count) },
          q4: { isCorrect: q4.isCorrect, correctAnswer: String(isLess ? 1 : minInt) },
        },
      };
    },
  };
}

export const algebraCtPassageInequalityTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
