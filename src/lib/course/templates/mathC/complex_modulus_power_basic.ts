// src/lib/course/templates/mathC/complex_modulus_power_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 2, n: 3, ans: 8 },
  { r: 3, n: 2, ans: 9 },
  { r: 4, n: 2, ans: 16 },
  { r: 5, n: 1, ans: 5 },
  { r: 6, n: 2, ans: 36 },
  { r: 7, n: 2, ans: 49 },
  { r: 2, n: 4, ans: 16 },
  { r: 3, n: 3, ans: 27 },
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
      const target = params.n === 1 ? "|z|" : `|z^${params.n}|`;
      const statement = `複素数 $z$ の絶対値が ${params.r} のとき、$${target}$ を求めよ。`;
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
$|z^n|=|z|^n$。
よって ${p.r}^${p.n}=${p.ans}。
`;
    },
  };
}

export const complexModulusPowerTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_power_basic_${i + 1}`, `絶対値のべき ${i + 1}`)
);

const extraModulusPowerTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`complex_modulus_power_basic_${i + 7}`, `絶対値のべき 追加${i + 1}`)
);

complexModulusPowerTemplates.push(...extraModulusPowerTemplates);
