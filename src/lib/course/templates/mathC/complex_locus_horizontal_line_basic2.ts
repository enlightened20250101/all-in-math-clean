// src/lib/course/templates/mathC/complex_locus_horizontal_line_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 3, b: 2, ans: 0 },
  { a: -4, b: 5, ans: 0 },
  { a: 0, b: -7, ans: 0 },
  { a: 6, b: 1, ans: 0 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_locus_horizontal_line_basic",
      title,
      difficulty: 1,
      tags: ["complex", "locus"],
    },
    generate() {
      const params = buildParams();
      const z1 = texComplex(params.a, params.b);
      const z2 = texComplex(params.a, -params.b);
      const statement = `地図上の点を表す複素数 $z$ が $|z-(${z1})|=|z-(${z2})|$ を満たすとき、軌跡の $y$ 座標を答えよ。`;
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
2点 $(a,b)$ と $(a,-b)$ の垂直二等分線は $y=0$。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexLocusHorizontalLineExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_horizontal_line_basic2_${i + 1}`, `垂直二等分線 ${i + 1}`)
);
