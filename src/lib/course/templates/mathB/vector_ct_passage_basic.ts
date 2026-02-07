// src/lib/course/templates/mathB/vector_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: [number, number];
  b: [number, number];
  difficulty: 1 | 2 | 3;
  context: string;
};

function dot(a: [number, number], b: [number, number]): number {
  return a[0] * b[0] + a[1] * b[1];
}

function normSq(v: [number, number]): number {
  return v[0] * v[0] + v[1] * v[1];
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const dotVal = dot(c.a, c.b);
  const a2 = normSq(c.a);
  const b2 = normSq(c.b);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `ベクトル \\(\\vec{a}=(${c.a[0]},${c.a[1]})\\), \\(\\vec{b}=(${c.b[0]},${c.b[1]})\\) とする。`,
    "（問1）内積 \\(\\vec{a}\\cdot\\vec{b}\\) を求めよ。",
    "（問2）\\(|\\vec{a}|^2\\) を求めよ。",
    "（問3）\\(|\\vec{b}|^2\\) を求めよ。",
  ].join("\n");

  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: "内積" },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: "|a|^2" },
    { id: "q3", label: "問3", answerKind: "numeric", placeholder: "|b|^2" },
  ] as const;

  return {
    meta: {
      id: c.id,
      topicId: "vector_inner_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["vector", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [...subQuestions],
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", dotVal);
      const q2Result = gradeNumeric(parsed.q2 ?? "", a2);
      const q3Result = gradeNumeric(parsed.q3 ?? "", b2);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${dotVal} / 問2:${a2} / 問3:${b2}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(dotVal) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(a2) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(b2) },
        },
      };
    },
    explain() {
      return "### この問題の解説\n内積は成分ごとの積の和。長さの二乗は成分の二乗和。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "vector_ct_passage_1",
    title: "内積 連問 1",
    a: [2, 1],
    b: [1, 3],
    context: "2つのベクトルの基本量を求める。",
    difficulty: 1,
  },
  {
    id: "vector_ct_passage_2",
    title: "内積 連問 2",
    a: [-3, 4],
    b: [2, -1],
    context: "成分に符号が含まれる場合を扱う。",
    difficulty: 2,
  },
  {
    id: "vector_ct_passage_3",
    title: "内積 連問 3",
    a: [5, -2],
    b: [-4, -3],
    context: "やや大きめの数値で計算する。",
    difficulty: 3,
  },
];

export const vectorCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
