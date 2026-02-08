// src/lib/course/templates/mathC/complex_locus_bisector_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 1, b: 0, ans: 0 },
  { a: 2, b: 0, ans: 0 },
  { a: 3, b: 0, ans: 0 },
  { a: 4, b: 0, ans: 0 },
  { a: 5, b: 0, ans: 0 },
  { a: 6, b: 0, ans: 0 },
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
      topicId: "complex_locus_bisector_basic",
      title,
      difficulty: 1,
      tags: ["complex", "locus"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z$ が $|z-(${params.a}+${params.b}i)|=|z-(-${params.a}+${params.b}i)|$ を満たすとき、この軌跡の $x$ 座標を答えよ。`;
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
      return `
### この問題の解説
2点 $(a,b)$ と $(-a,b)$ の垂直二等分線は $x=0$。
答えは **0** です。
`;
    },
  };
}

export const complexLocusBisectorTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_bisector_basic_${i + 1}`, `垂直二等分線 ${i + 1}`)
);

const extraLocusBisectorTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_locus_bisector_basic_${i + 7}`, `垂直二等分線 追加${i + 1}`)
);

complexLocusBisectorTemplates.push(...extraLocusBisectorTemplates);
