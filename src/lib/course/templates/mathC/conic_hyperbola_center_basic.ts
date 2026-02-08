// src/lib/course/templates/mathC/conic_hyperbola_center_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texParenShift } from "@/lib/format/tex";

const CASES = [
  { h: 2, k: -1, a: 3, b: 2 },
  { h: -3, k: 2, a: 4, b: 1 },
  { h: 1, k: 4, a: 5, b: 3 },
  { h: -4, k: -2, a: 2, b: 1 },
  { h: 3, k: 0, a: 4, b: 2 },
  { h: 0, k: -3, a: 3, b: 2 },
];

type Params = {
  h: number;
  k: number;
  a: number;
  b: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const ask = Math.random() < 0.5 ? 1 : 0;
  const ans = ask === 1 ? base.h : base.k;
  return { ...base, ask, ans };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_center_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const xTerm = texParenShift("x", -params.h, 1);
      const yTerm = texParenShift("y", -params.k, 1);
      const statement = `測定で得た反射鏡の断面を表す双曲線 $\\frac{${xTerm}}{${params.a ** 2}}-\\frac{${yTerm}}{${params.b ** 2}}=1$ の中心の${
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
中心は $(h,k)=(${p.h},${p.k})$。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicHyperbolaCenterTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_center_basic_${i + 1}`, `中心 ${i + 1}`)
);

const extraHyperbolaCenterTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_hyperbola_center_basic_${i + 7}`, `中心 追加${i + 1}`)
);

conicHyperbolaCenterTemplates.push(...extraHyperbolaCenterTemplates);
