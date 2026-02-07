// src/lib/course/templates/mathC/complex_argument_power_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { theta: 15, n: 4, ans: 60 },
  { theta: 25, n: 6, ans: 150 },
  { theta: 40, n: 7, ans: 280 },
  { theta: 100, n: 4, ans: 40 },
];

type Params = {
  theta: number;
  n: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function norm(theta: number): number {
  const t = theta % 360;
  return t < 0 ? t + 360 : t;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_power_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z$ の偏角が $${params.theta}^\\circ$ のとき、$z^{${params.n}}$ の偏角を $0^\\circ\\le\\theta<360^\\circ$ で答えよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params: { ...params, ans: norm(params.ans) },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$\\arg(z^n)=n\\arg(z)$。
よって **${p.ans}^\\circ**。
`;
    },
  };
}

export const complexArgumentPowerExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_power_basic3_${i + 1}`, `偏角のn倍 ${i + 1}`)
);
