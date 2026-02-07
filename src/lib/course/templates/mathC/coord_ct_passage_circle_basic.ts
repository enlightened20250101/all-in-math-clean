// src/lib/course/templates/mathC/coord_ct_passage_circle_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  center: [number, number];
  point: [number, number];
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const [cx, cy] = c.center;
  const [px, py] = c.point;
  const r = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
  const area = Math.PI * r * r;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `中心 $C(${cx},${cy})$ をもち、点 $P(${px},${py})$ を通る円を考える。`,
    "（問1）半径を求めよ。",
    "（問2）円の面積を求めよ。",
    "（問3）円の方程式を $x^2+y^2+Dx+Ey+F=0$ の形にしたときの $D$ を求めよ。",
  ].join("\n");
  const D = -2 * cx;
  return {
    meta: {
      id: c.id,
      topicId: "coord_circle_radius_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["coordinate", "circle", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "半径" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "面積" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "D" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", r);
      const q2Result = gradeNumeric(parsed.q2 ?? "", area);
      const q3Result = gradeNumeric(parsed.q3 ?? "", D);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${r} / 問2:${area} / 問3:${D}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(r) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(area) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(D) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n半径は距離公式、面積は $\\pi r^2$。一般形では $D=-2a$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "coord_ct_passage_circle_1",
    title: "円の基本 連問 1",
    center: [2, -1],
    point: [5, 3],
    context: "座標平面上の円について考える。",
    difficulty: 2,
  },
  {
    id: "coord_ct_passage_circle_2",
    title: "円の基本 連問 2",
    center: [-3, 4],
    point: [1, 2],
    context: "座標平面上の円について考える。",
    difficulty: 3,
  },
];

export const coordCtPassageCircleTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
