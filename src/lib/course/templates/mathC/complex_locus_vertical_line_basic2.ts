// src/lib/course/templates/mathC/complex_locus_vertical_line_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst, texJoin } from "@/lib/format/tex";

const CASES = [
  { a: 2, b: 8, ans: 5 },
  { a: -3, b: 5, ans: 1 },
  { a: -6, b: -2, ans: -4 },
  { a: 0, b: 4, ans: 2 },
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
      topicId: "complex_locus_vertical_line_basic",
      title,
      difficulty: 1,
      tags: ["complex", "locus"],
    },
    generate() {
      const params = buildParams();
      const eq = texJoin(
        "|z",
        texConst(-params.a),
        "|=|z",
        texConst(-params.b),
        "|"
      );
      const statement = `地図上の点を表す複素数 $z$ が $${eq}$ を満たすとき、軌跡の $x$ 座標を答えよ。`;
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
実数軸上の2点の垂直二等分線は $x=\\frac{a+b}{2}$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const complexLocusVerticalLineExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_vertical_line_basic2_${i + 1}`, `垂直二等分線 ${i + 1}`)
);
