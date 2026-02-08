// src/lib/course/templates/mathC/complex_locus_circle_center_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: -2, r: 3 },
  { a: -3, b: 1, r: 4 },
  { a: 2, b: 2, r: 2 },
  { a: 0, b: 0, r: 5 },
  { a: -4, b: -1, r: 6 },
  { a: 3, b: 3, r: 3 },
];

type Params = {
  a: number;
  b: number;
  r: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const ask = Math.random() < 0.5 ? 1 : 0;
  const ans = ask === 1 ? base.a : base.b;
  return { ...base, ask, ans };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_locus_circle_center_basic",
      title,
      difficulty: 1,
      tags: ["complex", "locus"],
    },
    generate() {
      const params = buildParams();
      const center = texComplex(params.a, params.b);
      const statement = `地図上の点を表す複素数 $z$ が $|z-(${center})|=${params.r}$ を満たすとき、この円の中心の${
        params.ask === 1 ? "x" : "y"
      }座標を求めよ。`;
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
中心は $(a,b)=(${p.a},${p.b})$。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexLocusCircleCenterTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_circle_center_basic_${i + 1}`, `軌跡の中心 ${i + 1}`)
);

const extraLocusCircleCenterTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`complex_locus_circle_center_basic_${i + 7}`, `軌跡の中心 追加${i + 1}`)
);

complexLocusCircleCenterTemplates.push(...extraLocusCircleCenterTemplates);
