// src/lib/course/templates/mathA/int_diophantine_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type DioCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
  hasSolution: boolean;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: DioCase): QuestionTemplate {
  const choices = ["ある", "ない"];
  const correct = c.hasSolution ? "ある" : "ない";
  return {
    meta: {
      id: c.id,
      topicId: "int_diophantine_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["integer", "diophantine"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `整数 $x,y$ について $${c.a}x+${c.b}y=${c.c}$ の整数解は ${"ある/ない"} のどちらか。`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `### この問題の解説\n$\\gcd(${c.a},${c.b})$ が ${c.c} を割り切るかどうかで判定します。答えは **${correct}** です。`;
    },
  };
}

const CASES: DioCase[] = [
  { id: "dio_v1", title: "不定方程式（別）1", a: 4, b: 6, c: 2, hasSolution: true, difficulty: 1 },
  { id: "dio_v2", title: "不定方程式（別）2", a: 6, b: 9, c: 5, hasSolution: false, difficulty: 1 },
  { id: "dio_v3", title: "不定方程式（別）3", a: 8, b: 12, c: 4, hasSolution: true, difficulty: 2 },
  { id: "dio_v4", title: "不定方程式（別）4", a: 10, b: 15, c: 7, hasSolution: false, difficulty: 2 },
];

export const intDiophantineVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
