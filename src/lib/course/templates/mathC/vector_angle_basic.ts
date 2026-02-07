// src/lib/course/templates/mathC/vector_angle_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick } from "../_shared/utils";

type AngleCase = { ax: number; ay: number; bx: number; by: number; cos: string; explain: string };

const CASES: AngleCase[] = [
  { ax: 1, ay: 0, bx: 0, by: 1, cos: "0", explain: "直交なので cosθ=0" },
  { ax: 1, ay: 0, bx: 1, by: 0, cos: "1", explain: "同方向なので cosθ=1" },
  { ax: 1, ay: 0, bx: -1, by: 0, cos: "-1", explain: "反対方向なので cosθ=-1" },
  { ax: 1, ay: 1, bx: 1, by: -1, cos: "0", explain: "内積が0なので cosθ=0" },
  { ax: 1, ay: 0, bx: 1, by: 1, cos: "\\frac{1}{\\sqrt{2}}", explain: "内積=1, |a|=1, |b|=\\sqrt{2}" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_angle_basic",
      title,
      difficulty: 1,
      tags: ["vector", "angle", "ct"],
    },
    generate() {
      const idx = Math.floor(Math.random() * CASES.length);
      const c = CASES[idx];
      const statement = `ベクトル $\\vec{a}=(${c.ax},${c.ay})$, $\\vec{b}=(${c.bx},${c.by})$ のなす角を $\\theta$ とする。$\\cos\\theta$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: ["-1", "0", "1", "\\frac{1}{\\sqrt{2}}"],
        params: { caseId: idx },
      };
    },
    grade(params, userAnswer) {
      const c = CASES[params.caseId] ?? CASES[0];
      return { isCorrect: userAnswer === c.cos, correctAnswer: c.cos };
    },
    explain(params) {
      const c = CASES[params.caseId] ?? CASES[0];
      return `
### この問題の解説
${c.explain}
答えは **${c.cos}** です。
`;
    },
  };
}

const extraVectorAngleTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_angle_basic_${i + 21}`, `なす角 追加${i + 1}`)
);

export const vectorAngleTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) => buildTemplate(`vector_angle_basic_${i + 1}`, `なす角 ${i + 1}`)),
  ...extraVectorAngleTemplates,
];
