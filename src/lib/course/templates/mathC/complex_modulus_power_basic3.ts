// src/lib/course/templates/mathC/complex_modulus_power_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 6, n: 2, ans: 36 },
  { r: 7, n: 2, ans: 49 },
  { r: 3, n: 4, ans: 81 },
  { r: 2, n: 5, ans: 32 },
];

type Params = {
  r: number;
  n: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_modulus_power_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z$ が $|z|=${params.r}$ を満たすとき、$|z|^{${params.n}}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$|z|^{n}=(|z|)^n$。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexModulusPowerExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_power_basic3_${i + 1}`, `絶対値のべき ${i + 1}`)
);
