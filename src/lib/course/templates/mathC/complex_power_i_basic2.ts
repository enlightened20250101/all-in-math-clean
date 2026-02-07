// src/lib/course/templates/mathC/complex_power_i_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { n: 5, ans: 0 },
  { n: 6, ans: -1 },
  { n: 7, ans: 0 },
  { n: 8, ans: 1 },
];

type Params = {
  n: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function answerValue(n: number): number {
  const m = ((n % 4) + 4) % 4;
  if (m === 0) return 1;
  if (m === 1) return 0;
  if (m === 2) return -1;
  return 0;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_power_i_basic",
      title,
      difficulty: 1,
      tags: ["complex", "power"],
    },
    generate() {
      const params = buildParams();
      const statement = `$i^{${params.n}}$ の実部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params: { ...params, ans: answerValue(params.n) },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$i^n$ は周期4で変化します。
実部は **${p.ans}**。
`;
    },
  };
}

export const complexPowerIExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_power_i_basic2_${i + 1}`, `iの累乗 ${i + 1}`)
);
