// src/lib/course/templates/mathC/complex_root_unity_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { n: 3, k: 1, value: 120 },
  { n: 4, k: 1, value: 90 },
  { n: 6, k: 1, value: 60 },
  { n: 5, k: 2, value: 144 },
  { n: 8, k: 1, value: 45 },
  { n: 8, k: 3, value: 135 },
  { n: 10, k: 1, value: 36 },
  { n: 12, k: 1, value: 30 },
];

type Params = {
  n: number;
  k: number;
  value: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_root_unity_basic",
      title,
      difficulty: 1,
      tags: ["complex", "roots"],
    },
    generate() {
      const params = buildParams();
      const statement = `${params.n}乗根 $\\omega$ を $\\omega=\\cos\\theta+i\\sin\\theta$ で表すとき、$\\theta$ を求めよ。（$0^\\circ<\\theta<360^\\circ$）ただし $\\omega$ は $k=${params.k}$ 番目の解とする。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$n$ 乗根は $\\theta=\\frac{360^\\circ k}{n}$。
よって $\\theta=\\frac{360^\\circ\\times ${p.k}}{${p.n}}=${p.value}^\\circ$。
`;
    },
  };
}

export const complexRootUnityTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_root_unity_basic_${i + 1}`, `n乗根 ${i + 1}`)
);

const extraRootUnityTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`complex_root_unity_basic_${i + 7}`, `n乗根 追加${i + 1}`)
);

complexRootUnityTemplates.push(...extraRootUnityTemplates);
