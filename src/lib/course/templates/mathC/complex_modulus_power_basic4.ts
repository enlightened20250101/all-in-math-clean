// src/lib/course/templates/mathC/complex_modulus_power_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 4, n: 4, ans: 256 },
  { r: 5, n: 3, ans: 125 },
  { r: 6, n: 2, ans: 36 },
  { r: 2, n: 6, ans: 64 },
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
      const statement = `地図上の点を表す複素数 $z$ が $|z|=${params.r}$ を満たすとき、$|z|^{${params.n}}$ を求めよ。`;
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

export const complexModulusPowerExtraTemplates3: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_power_basic4_${i + 1}`, `絶対値のべき ${i + 1}`)
);
