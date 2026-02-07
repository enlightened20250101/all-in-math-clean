// src/lib/course/templates/math2/calculus_increasing_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

const CHOICES = ["増加", "減少"];

type Params = {
  a: number;
  b: number;
  x0: number;
  sign: number;
};

function buildParams(): Params {
  const a = pick([-3, -2, -1, 1, 2, 3]);
  const b = randInt(-4, 4);
  const x0 = randInt(-3, 3);
  const sign = a > 0 ? 1 : -1;
  return { a, b, x0, sign };
}

export const calcIncreasingVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_increasing_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_increasing_basic",
      title: `増減（一次）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `関数 $f(x)=${texLinear(params.a, params.b)}$ は $x=${params.x0}$ のとき増加か減少か。`;
      return {
        templateId,
        statement,
        answerKind: "choice",
        choices: CHOICES,
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as Params;
      const correct = p.sign > 0 ? "増加" : "減少";
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
一次関数の導関数は定数 $f'(x)=${p.a}$。符号が ${p.a > 0 ? "正" : "負"} なので **${p.sign > 0 ? "増加" : "減少"}** です。
`;
    },
  };
});
