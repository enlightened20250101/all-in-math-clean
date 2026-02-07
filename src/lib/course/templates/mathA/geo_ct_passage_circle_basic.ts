// src/lib/course/templates/mathA/geo_ct_passage_circle_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  angle: number;
  chordAngle: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const opposite = 180 - c.angle;
  const inscribed = c.chordAngle;
  const central = 2 * inscribed;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `円に内接する四角形で $\\angle ABC=${c.angle}^\\circ$ とする。`,
    "（問1）対角の角 $\\angle ADC$ を求めよ。",
    `円周角が ${c.chordAngle}^\\circ$ のとき、同じ弧に対する中心角を求めよ。`,
    "（問3）接線と弦のなす角が円周角と等しいことを用いて、円周角の大きさを求めよ。",
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_geometry",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["geometry", "circle", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "対角" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "中心角" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "円周角" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", opposite);
      const q2Result = gradeNumeric(parsed.q2 ?? "", central);
      const q3Result = gradeNumeric(parsed.q3 ?? "", inscribed);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${opposite} / 問2:${central} / 問3:${inscribed}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(opposite) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(central) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(inscribed) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n内接四角形の対角は 180°。円周角と中心角の関係は 2 倍。接弦定理で円周角と等しい。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "geo_ct_passage_circle_1",
    title: "円の性質 連問 1",
    angle: 70,
    chordAngle: 40,
    context: "円に内接する四角形と円周角の性質を利用する。",
    difficulty: 2,
  },
  {
    id: "geo_ct_passage_circle_2",
    title: "円の性質 連問 2",
    angle: 95,
    chordAngle: 35,
    context: "円に内接する四角形と中心角の性質を利用する。",
    difficulty: 3,
  },
];

export const geoCtPassageCircleTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
