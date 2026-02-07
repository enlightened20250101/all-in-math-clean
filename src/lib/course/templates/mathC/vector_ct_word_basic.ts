// src/lib/course/templates/mathC/vector_ct_word_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type ProjectionCase = {
  id: string;
  title: string;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  difficulty: 1 | 2 | 3;
};

function buildProjectionTemplate(c: ProjectionCase): QuestionTemplate {
  const aDotB = c.ax * c.bx + c.ay * c.by;
  const bLenSq = c.bx * c.bx + c.by * c.by;
  const value = aDotB * aDotB / bLenSq;
  return {
    meta: {
      id: c.id,
      topicId: "vector_projection_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["vector", "projection", "ct"],
    },
    generate() {
      const a = `\\vec{a}=(${c.ax},${c.ay})`;
      const b = `\\vec{b}=(${c.bx},${c.by})`;
      return {
        templateId: c.id,
        statement: `風の影響を表すベクトル ${a} を進行方向ベクトル ${b} に正射影したベクトルの長さの二乗を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, value);
    },
    explain() {
      return `### この問題の解説\n正射影の長さの二乗は $\\frac{(\\vec{a}\\cdot\\vec{b})^2}{|\\vec{b}|^2}$。\n答えは **${value}**。`;
    },
  };
}

type InnerCase = {
  id: string;
  title: string;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  difficulty: 1 | 2 | 3;
};

function buildInnerTemplate(c: InnerCase): QuestionTemplate {
  const value = c.ax * c.bx + c.ay * c.by;
  return {
    meta: {
      id: c.id,
      topicId: "vector_inner_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["vector", "inner", "ct"],
    },
    generate() {
      const a = `\\vec{a}=(${c.ax},${c.ay})`;
      const b = `\\vec{b}=(${c.bx},${c.by})`;
      return {
        templateId: c.id,
        statement: `移動量を表すベクトル ${a} と ${b} の内積を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, value);
    },
    explain() {
      return `### この問題の解説\n内積は $a_x b_x + a_y b_y$。\n答えは **${value}**。`;
    },
  };
}

const PROJECTION_CASES: ProjectionCase[] = [
  { id: "vector_ct_projection_1", title: "正射影 1", ax: 3, ay: 4, bx: 1, by: 0, difficulty: 1 },
  { id: "vector_ct_projection_2", title: "正射影 2", ax: 3, ay: 1, bx: 1, by: 2, difficulty: 2 },
  { id: "vector_ct_projection_3", title: "正射影 3", ax: 6, ay: 3, bx: 3, by: 0, difficulty: 2 },
];

const INNER_CASES: InnerCase[] = [
  { id: "vector_ct_inner_1", title: "内積 1", ax: 2, ay: 1, bx: 3, by: -1, difficulty: 1 },
  { id: "vector_ct_inner_2", title: "内積 2", ax: -3, ay: 2, bx: 1, by: 4, difficulty: 2 },
  { id: "vector_ct_inner_3", title: "内積 3", ax: 5, ay: -2, bx: -1, by: 3, difficulty: 2 },
];

export const vectorCtWordTemplates: QuestionTemplate[] = [
  ...PROJECTION_CASES.map(buildProjectionTemplate),
  ...INNER_CASES.map(buildInnerTemplate),
];
