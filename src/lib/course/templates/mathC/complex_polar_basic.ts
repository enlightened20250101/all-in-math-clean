// src/lib/course/templates/mathC/complex_polar_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = [
  "1(\\cos 0^\\circ + i\\sin 0^\\circ)",
  "1(\\cos 90^\\circ + i\\sin 90^\\circ)",
  "\\sqrt{2}(\\cos 45^\\circ + i\\sin 45^\\circ)",
  "1(\\cos 180^\\circ + i\\sin 180^\\circ)",
  "1(\\cos 270^\\circ + i\\sin 270^\\circ)",
  "\\sqrt{2}(\\cos 135^\\circ + i\\sin 135^\\circ)",
  "\\sqrt{2}(\\cos 315^\\circ + i\\sin 315^\\circ)",
];

type Case = {
  a: number;
  b: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { a: 1, b: 0, answer: CHOICES[0], explain: "原点からの距離は1、偏角は0^\\circ" },
  { a: 0, b: 1, answer: CHOICES[1], explain: "原点からの距離は1、偏角は90^\\circ" },
  { a: 1, b: 1, answer: CHOICES[2], explain: "原点からの距離は\\sqrt{2}、偏角は45^\\circ" },
  { a: -1, b: 0, answer: CHOICES[3], explain: "原点からの距離は1、偏角は180^\\circ" },
  { a: 0, b: -1, answer: CHOICES[4], explain: "原点からの距離は1、偏角は270^\\circ" },
  { a: -1, b: 1, answer: CHOICES[5], explain: "原点からの距離は\\sqrt{2}、偏角は135^\\circ" },
  { a: 1, b: -1, answer: CHOICES[6], explain: "原点からの距離は\\sqrt{2}、偏角は315^\\circ" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_polar_basic",
      title,
      difficulty: 1,
      tags: ["complex", "polar"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `観測点を表す複素数 $z=${c.a}${c.b >= 0 ? "+" : ""}${c.b}i$ を極形式で表したものとして正しいものを選べ。`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: CHOICES,
        params: { caseId },
      };
    },
    grade(params, userAnswer) {
      const c = CASES[params.caseId] ?? CASES[0];
      return { isCorrect: userAnswer === c.answer, correctAnswer: c.answer };
    },
    explain(params) {
      const c = CASES[params.caseId] ?? CASES[0];
      return `
### この問題の解説
${c.explain}。
答えは **${c.answer}** です。
`;
    },
  };
}

export const complexPolarTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_polar_basic_${i + 1}`, `極形式 ${i + 1}`)
);

const extraComplexPolarTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`complex_polar_basic_${i + 7}`, `極形式 追加${i + 1}`)
);

complexPolarTemplates.push(...extraComplexPolarTemplates);
