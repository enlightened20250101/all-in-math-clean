// src/lib/course/templates/math2/coord_circle_general_center_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type Case = {
  id: string;
  title: string;
  a: number;
  b: number;
  r: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const D = -2 * c.a;
  const E = -2 * c.b;
  const F = c.a * c.a + c.b * c.b - c.r * c.r;
  const correct = `(${c.a},${c.b})`;
  const choices = Array.from(
    new Set([
      correct,
      `(${c.a},${-c.b})`,
      `(${-c.a},${c.b})`,
      `(${-c.a},${-c.b})`,
    ])
  );
  return {
    meta: {
      id: c.id,
      topicId: "coord_circle_center_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `円形の設備の位置を一般形から読み取る場面を想定する。` +
          `円 $x^2+y^2${D >= 0 ? `+${D}` : D}x${E >= 0 ? `+${E}` : E}y${F >= 0 ? `+${F}` : F}=0$ の中心を選べ。`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `### この問題の解説\n一般形を平方完成して中心を求めます。答えは **${correct}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "coord_circle_center_gen_1", title: "一般形の中心 1", a: 2, b: -1, r: 3 },
  { id: "coord_circle_center_gen_2", title: "一般形の中心 2", a: -3, b: 2, r: 4 },
  { id: "coord_circle_center_gen_3", title: "一般形の中心 3", a: 1, b: 3, r: 5 },
  { id: "coord_circle_center_gen_4", title: "一般形の中心 4", a: -2, b: -4, r: 6 },
];

export const coordCircleGeneralCenterVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
