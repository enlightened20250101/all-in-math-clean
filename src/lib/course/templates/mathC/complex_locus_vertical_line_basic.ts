// src/lib/course/templates/mathC/complex_locus_vertical_line_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst, texJoin } from "@/lib/format/tex";

const CASES = [
  { a: -2, b: 2, x: 0 },
  { a: 1, b: 5, x: 3 },
  { a: -4, b: 0, x: -2 },
  { a: -6, b: 2, x: -2 },
  { a: -3, b: 5, x: 1 },
  { a: 0, b: 4, x: 2 },
];

type Params = {
  a: number;
  b: number;
  x: number;
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
      const statement = `複素数 $z$ が $${eq}$ を満たすとき、この軌跡の $x$ 座標を答えよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).x);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
2点 ${p.a} と ${p.b} の垂直二等分線なので $x=\\frac{${p.a}+${p.b}}{2}=${p.x}$。
`;
    },
  };
}

export const complexLocusVerticalLineTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_vertical_line_basic_${i + 1}`, `垂直二等分線 ${i + 1}`)
);

const extraLocusVerticalLineTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_locus_vertical_line_basic_${i + 7}`, `垂直二等分線 追加${i + 1}`)
);

complexLocusVerticalLineTemplates.push(...extraLocusVerticalLineTemplates);
