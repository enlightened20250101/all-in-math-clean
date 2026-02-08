// src/lib/course/templates/math2/identity_coeff_quadratic_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texTerm } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  c: number;
  k: number;
};

function buildParams(): Params {
  const a = randInt(1, 5);
  const b = randInt(-4, 4);
  const c = randInt(-5, 5);
  const k = b + c;
  return { a, b, c, k };
}

export const identityCoeffQuadraticVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `identity_coeff_quadratic_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "identity_coeff_quadratic_basic",
      title: `係数（二次）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const aTerm = texTerm(params.a, "x^2", true);
      const bTerm = texTerm(params.b, "x", false);
      const quad = `${aTerm}${bTerm ? ` ${bTerm}` : ""} + c`;
      const rhs = `${texTerm(params.a, "x^3", true)} + \\cdots ${texTerm(params.k, "x", false)}`;
      const statement = `面積の式として、(x+1)(${quad})\\equiv ${rhs}+\\cdots が成り立つとき、$c$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).c);
    },
    explain(params) {
      const p = params as Params;
      const aTerm = texTerm(p.a, "x^2", true);
      const bTerm = texTerm(p.b, "x", false);
      const quad = `${aTerm}${bTerm ? ` ${bTerm}` : ""} + c`;
      return `
### この問題の解説
$(x+1)(${quad})=${texTerm(p.a, "x^3", true)}+(${p.a}+${p.b})x^2+(${p.b}+c)x+c$。
よって $${p.b}+c=${p.k} \\Rightarrow c=${p.c}$。
`;
    },
  };
});
