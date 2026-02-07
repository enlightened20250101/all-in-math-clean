// src/lib/course/templates/math1/geo_ct_passage_angle_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  height: number;
  angle: 30 | 45 | 60;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const rad = (c.angle * Math.PI) / 180;
  const distance = c.height / Math.tan(rad);
  const line = c.height / Math.sin(rad);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `高さ ${c.height}m の塔を仰角 ${c.angle}^\\circ で見上げる。`,
    "（問1）水平距離を求めよ。",
    "（問2）視線の長さを求めよ。",
    "（問3）水平距離が10m伸びたときの仰角の大きさを求めよ（度）。",
  ].join("\n");
  const newDistance = distance + 10;
  const newAngle = (Math.atan(c.height / newDistance) * 180) / Math.PI;
  return {
    meta: {
      id: c.id,
      topicId: "geo_measure_right_triangle_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["geometry", "trig", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "水平距離" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "視線" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "仰角" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", distance);
      const q2Result = gradeNumeric(parsed.q2 ?? "", line);
      const q3Result = gradeNumeric(parsed.q3 ?? "", newAngle);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${distance} / 問2:${line} / 問3:${newAngle}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(distance) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(line) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(newAngle) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n$\\tan$ を使って水平距離、$\\sin$ を使って視線の長さを求める。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "geo_ct_passage_angle_1",
    title: "仰角 連問 1",
    height: 9,
    angle: 45,
    context: "仰角の問題を考える。",
    difficulty: 2,
  },
  {
    id: "geo_ct_passage_angle_2",
    title: "仰角 連問 2",
    height: 12,
    angle: 30,
    context: "仰角の問題を考える。",
    difficulty: 3,
  },
];

export const geoCtPassageAngleTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
