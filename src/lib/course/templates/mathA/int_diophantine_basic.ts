// src/lib/course/templates/mathA/int_diophantine_basic.ts
import type { QuestionTemplate } from "../../types";

type DioCase = {
  id: string;
  title: string;
  context?: string;
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
      const lead = c.context ? `${c.context}\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}整数 $x,y$ について $${c.a}x+${c.b}y=${c.c}$ の整数解は ${"ある/ない"} のどちらか。`,
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
  {
    id: "dio_1",
    title: "不定方程式 1",
    context: "3円玉と5円玉で合計1円を作れるかを考える。",
    a: 3,
    b: 5,
    c: 1,
    hasSolution: true,
    difficulty: 1,
  },
  {
    id: "dio_2",
    title: "不定方程式 2",
    context: "6個入りと9個入りの箱で合計4個を作れるかを考える。",
    a: 6,
    b: 9,
    c: 4,
    hasSolution: false,
    difficulty: 1,
  },
  {
    id: "dio_3",
    title: "不定方程式 3",
    context: "4分と10分の講義を組み合わせて合計2分になるかを判定する。",
    a: 4,
    b: 10,
    c: 2,
    hasSolution: true,
    difficulty: 1,
  },
  {
    id: "dio_4",
    title: "不定方程式 4",
    context: "8枚と12枚のセットで合計7枚にできるかを考える。",
    a: 8,
    b: 12,
    c: 7,
    hasSolution: false,
    difficulty: 1,
  },
  {
    id: "dio_5",
    title: "不定方程式 5",
    context: "7円と9円の切符で合計5円にできるか判定する。",
    a: 7,
    b: 9,
    c: 5,
    hasSolution: true,
    difficulty: 1,
  },
  {
    id: "dio_6",
    title: "不定方程式 6",
    context: "5冊と15冊のセットで合計10冊にできるか考える。",
    a: 5,
    b: 15,
    c: 10,
    hasSolution: true,
    difficulty: 1,
  },
  { id: "dio_7", title: "不定方程式 7", a: 9, b: 12, c: 6, hasSolution: true, difficulty: 2 },
  { id: "dio_8", title: "不定方程式 8", a: 10, b: 14, c: 9, hasSolution: false, difficulty: 2 },
  { id: "dio_9", title: "不定方程式 9", a: 12, b: 18, c: 24, hasSolution: true, difficulty: 2 },
  { id: "dio_10", title: "不定方程式 10", a: 14, b: 21, c: 20, hasSolution: false, difficulty: 3 },
];

export const intDiophantineTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
