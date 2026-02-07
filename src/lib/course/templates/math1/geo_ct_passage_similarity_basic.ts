// src/lib/course/templates/math1/geo_ct_passage_similarity_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  big: number;
  small: number;
  base: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const scale = c.small / c.big;
  const smallBase = c.base * scale;
  const areaRatio = scale * scale;
  const midsegment = c.base / 2;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `相似比が ${c.small}:${c.big} の2つの三角形を考える。`,
    `大きい三角形の底辺が ${c.base} のとき、`,
    "（問1）小さい三角形の底辺を求めよ。",
    "（問2）面積比（小:大）を求めよ。",
    "（問3）底辺の中点を結ぶ線分の長さを求めよ。",
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "geo_ratio_theorems",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["geometry", "similarity", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "底辺" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "面積比" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "中点連結" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", smallBase);
      const q2Result = gradeNumeric(parsed.q2 ?? "", areaRatio);
      const q3Result = gradeNumeric(parsed.q3 ?? "", midsegment);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${smallBase} / 問2:${areaRatio} / 問3:${midsegment}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(smallBase) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(areaRatio) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(midsegment) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n相似比が $k$ のとき、辺の比は $k$、面積比は $k^2$。中点連結は底辺の半分。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "geo_ct_passage_similarity_1",
    title: "相似 連問 1",
    big: 5,
    small: 3,
    base: 20,
    context: "2つの相似な三角形について考える。",
    difficulty: 2,
  },
  {
    id: "geo_ct_passage_similarity_2",
    title: "相似 連問 2",
    big: 4,
    small: 1,
    base: 16,
    context: "2つの相似な三角形について考える。",
    difficulty: 3,
  },
];

export const geoCtPassageSimilarityTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
