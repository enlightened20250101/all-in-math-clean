// src/lib/course/templates/mathC/complex_argument_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick } from "../_shared/utils";

type ArgCase = { a: number; b: number; arg: string; explain: string };

const CASES: ArgCase[] = [
  { a: 1, b: 0, arg: "0^\\circ", explain: "正の実軸上なので点の偏角は0°" },
  { a: 0, b: 1, arg: "90^\\circ", explain: "正の虚軸上なので点の偏角は90°" },
  { a: -1, b: 0, arg: "180^\\circ", explain: "負の実軸上なので点の偏角は180°" },
  { a: 0, b: -1, arg: "270^\\circ", explain: "負の虚軸上なので点の偏角は270°" },
  { a: 2, b: 0, arg: "0^\\circ", explain: "正の実軸上なので点の偏角は0°" },
  { a: 0, b: 2, arg: "90^\\circ", explain: "正の虚軸上なので点の偏角は90°" },
  { a: -2, b: 0, arg: "180^\\circ", explain: "負の実軸上なので点の偏角は180°" },
  { a: 0, b: -2, arg: "270^\\circ", explain: "負の虚軸上なので点の偏角は270°" },
];

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const c = pick(CASES);
      const statement = `座標平面上の点を表す複素数 $z=${texComplex(c.a, c.b)}$ の点の偏角を答えよ（$0^\\circ \\le \\theta < 360^\\circ$）。`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: ["0^\\circ", "90^\\circ", "180^\\circ", "270^\\circ"],
        params: { a: c.a, b: c.b },
      };
    },
    grade(params, userAnswer) {
      const c = CASES.find((x) => x.a === params.a && x.b === params.b) ?? CASES[0];
      return { isCorrect: userAnswer === c.arg, correctAnswer: c.arg };
    },
    explain(params) {
      const c = CASES.find((x) => x.a === params.a && x.b === params.b) ?? CASES[0];
      return `
### この問題の解説
${c.explain}
答えは **${c.arg}** です。
`;
    },
  };
}

export const complexArgumentTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`complex_argument_basic_${i + 1}`, `点の偏角 ${i + 1}`)
);

const extraComplexArgumentTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`complex_argument_basic_${i + 21}`, `点の偏角 追加${i + 1}`)
);

complexArgumentTemplates.push(...extraComplexArgumentTemplates);
