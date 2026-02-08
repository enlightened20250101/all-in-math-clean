// src/lib/course/templates/mathC/complex_argument_power_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { theta: 20, n: 5, ans: 100 },
  { theta: 30, n: 8, ans: 240 },
  { theta: 45, n: 6, ans: 270 },
  { theta: 80, n: 3, ans: 240 },
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
      const statement = `観測点を表す複素数 $z$ の点の偏角が $${params.theta}^\\circ$ のとき、$z^{${params.n}}$ の点の偏角を $0^\\circ\\le\\theta<360^\\circ$ で答えよ。`;
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

export const complexArgumentPowerExtraTemplates3: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_power_basic4_${i + 1}`, `点の偏角のn倍 ${i + 1}`)
);
