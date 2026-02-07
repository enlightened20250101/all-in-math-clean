// src/lib/course/templates/mathC/vector_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: [number, number];
  b: [number, number];
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const [ax, ay] = c.a;
  const [bx, by] = c.b;
  const dot = ax * bx + ay * by;
  const normA = Math.sqrt(ax * ax + ay * ay);
  const normB = Math.sqrt(bx * bx + by * by);
  const cos = dot / (normA * normB);
  const area = Math.abs(ax * by - ay * bx);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `ベクトル $\\vec{a}=(${ax},${ay}),\\ \\vec{b}=(${bx},${by})$ とする。`,
    "（問1）内積 $\\vec{a}\\cdot\\vec{b}$ を求めよ。",
    "（問2）なす角の $\\cos\\theta$ を求めよ。",
    "（問3）これらが作る平行四辺形の面積を求めよ。",
  ].join("\n");
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
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "内積" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "cosθ" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "面積" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", dot);
      const q2Result = gradeNumeric(parsed.q2 ?? "", cos);
      const q3Result = gradeNumeric(parsed.q3 ?? "", area);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${dot} / 問2:${cos} / 問3:${area}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(dot) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(cos) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(area) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n内積と $|\\vec{a}||\\vec{b}|$ から $\\cos\\theta$ を求める。面積は $|ax\\cdot by-ay\\cdot bx|$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "vector_ct_passage_1",
    title: "ベクトル計算 連問 1",
    a: [3, 4],
    b: [1, -2],
    context: "平面上の2つのベクトルについて計算する。",
    difficulty: 2,
  },
  {
    id: "vector_ct_passage_2",
    title: "ベクトル計算 連問 2",
    a: [2, -1],
    b: [4, 3],
    context: "ベクトルの内積と面積を求める。",
    difficulty: 3,
  },
];

export const vectorCtPassageBasicTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
