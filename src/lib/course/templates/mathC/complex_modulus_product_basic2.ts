// src/lib/course/templates/mathC/complex_modulus_product_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r1: 3, r2: 4, ans: 12 },
  { r1: 2, r2: 5, ans: 10 },
  { r1: 6, r2: 2, ans: 12 },
  { r1: 7, r2: 3, ans: 21 },
];

type Params = {
  r1: number;
  r2: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_modulus_product_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z_1, z_2$ の絶対値がそれぞれ $${params.r1}$, $${params.r2}$ のとき、$|z_1 z_2|$ を求めよ。`;
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
$|z_1 z_2|=|z_1||z_2|$。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexModulusProductExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_product_basic2_${i + 1}`, `積の絶対値 ${i + 1}`)
);
