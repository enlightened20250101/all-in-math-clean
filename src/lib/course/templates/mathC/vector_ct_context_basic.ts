// src/lib/course/templates/mathC/vector_ct_context_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type OrthCase = {
  id: string;
  title: string;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  difficulty: 1 | 2 | 3;
};

type ComponentCase = {
  id: string;
  title: string;
  ax: number;
  ay: number;
  ask: "x" | "y";
  difficulty: 1 | 2 | 3;
};

function buildOrthTemplate(c: OrthCase): QuestionTemplate {
  const value = c.ax * c.bx + c.ay * c.by;
  const choices = ["直交する", "直交しない"];
  const correct = value === 0 ? "直交する" : "直交しない";
  return {
    meta: {
      id: c.id,
      topicId: "vector_orthogonal_condition_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["vector", "orthogonal", "ct"],
    },
    generate() {
      const a = `\\vec{a}=(${c.ax},${c.ay})`;
      const b = `\\vec{b}=(${c.bx},${c.by})`;
      return {
        templateId: c.id,
        statement: `進行方向を表すベクトル ${a} と ${b} が直交するかを選べ。`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `### この問題の解説\n直交条件は内積が0。\nここでは $\\vec{a}\\cdot\\vec{b}=${value}$ なので **${correct}**。`;
    },
  };
}

function buildComponentTemplate(c: ComponentCase): QuestionTemplate {
  const value = c.ask === "x" ? c.ax : c.ay;
  const label = c.ask === "x" ? "x" : "y";
  return {
    meta: {
      id: c.id,
      topicId: "vector_component_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["vector", "component", "ct"],
    },
    generate() {
      const a = `\\vec{a}=(${c.ax},${c.ay})`;
      return {
        templateId: c.id,
        statement: `移動量を表すベクトル ${a} の ${label} 成分を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, value);
    },
    explain() {
      return `### この問題の解説\n成分は座標そのもの。\n答えは **${value}**。`;
    },
  };
}

const ORTH_CASES: OrthCase[] = [
  { id: "vector_ct_orth_1", title: "直交 1", ax: 2, ay: 1, bx: -1, by: 2, difficulty: 1 },
  { id: "vector_ct_orth_2", title: "直交 2", ax: 3, ay: -2, bx: 2, by: 3, difficulty: 2 },
  { id: "vector_ct_orth_3", title: "直交 3", ax: 1, ay: 4, bx: 2, by: -1, difficulty: 1 },
  { id: "vector_ct_orth_4", title: "直交 4", ax: -2, ay: 5, bx: 1, by: 2, difficulty: 2 },
];

const COMPONENT_CASES: ComponentCase[] = [
  { id: "vector_ct_component_1", title: "成分 1", ax: 4, ay: -3, ask: "x", difficulty: 1 },
  { id: "vector_ct_component_2", title: "成分 2", ax: -2, ay: 5, ask: "y", difficulty: 1 },
  { id: "vector_ct_component_3", title: "成分 3", ax: 7, ay: 1, ask: "x", difficulty: 1 },
  { id: "vector_ct_component_4", title: "成分 4", ax: -6, ay: -2, ask: "y", difficulty: 2 },
];

export const vectorCtContextTemplates: QuestionTemplate[] = [
  ...ORTH_CASES.map(buildOrthTemplate),
  ...COMPONENT_CASES.map(buildComponentTemplate),
];
