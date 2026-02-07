// src/lib/course/templates/math2/coord_circle_center_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texParenShift } from "@/lib/format/tex";

type CenterCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  r: number;
};

function buildTemplate(c: CenterCase): QuestionTemplate {
  const xShift = texParenShift("x", -c.a, 1);
  const yShift = texParenShift("y", -c.b, 1);
  const choices = [
    `(${c.a},${c.b})`,
    `(${c.a},${-c.b})`,
    `(${-c.a},${c.b})`,
    `(${-c.a},${-c.b})`,
  ];
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
        statement: `円 $${xShift}+${yShift}=${c.r}^2$ の中心を求めよ。`,
        answerKind: "choice",
        choices,
        params: { a: c.a, b: c.b, r: c.r },
      };
    },
    grade(_params, userAnswer) {
      const correct = `(${c.a},${c.b})`;
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `
### この問題の解説
標準形 $(x-a)^2+(y-b)^2=r^2$ の中心は $(a,b)$ です。
答えは **${c.a},${c.b}** です。
`;
    },
  };
}

const CASES: CenterCase[] = [
  { id: "coord_circle_center_v1", title: "円の中心（別）1", a: 2, b: -1, r: 3 },
  { id: "coord_circle_center_v2", title: "円の中心（別）2", a: -3, b: 2, r: 4 },
  { id: "coord_circle_center_v3", title: "円の中心（別）3", a: 1, b: 3, r: 5 },
  { id: "coord_circle_center_v4", title: "円の中心（別）4", a: -2, b: -4, r: 6 },
  { id: "coord_circle_center_v5", title: "円の中心（別）5", a: 0, b: -3, r: 4 },
  { id: "coord_circle_center_v6", title: "円の中心（別）6", a: 4, b: 1, r: 2 },
];

export const coordCircleCenterVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
