// src/lib/course/templates/math2/identity_coeff_quadratic_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

function buildParams() {
  const a = randInt(1, 5);
  const b = randInt(-4, 4);
  const c = randInt(-5, 5);
  const k = 2 * a;
  return { a, b, c, k };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "identity_coeff_quadratic_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const aTerm = texTerm(params.a, "x^2", true);
      const cTerm = texConst(params.c);
      const quad = `${aTerm} + bx${cTerm ? ` ${cTerm}` : ""}`;
      const rhs = `${texTerm(params.a, "x^3", true)} ${texTerm(params.k, "x^2", false)}`;
      const statement = `面積の式を整理して $(x+1)(${quad})\\equiv ${rhs}+\\cdots が成り立つとき、$b$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).b);
    },
    explain(params) {
      const p = params as any;
      const aTerm = texTerm(p.a, "x^2", true);
      const cTerm = texConst(p.c);
      const quad = `${aTerm} + bx${cTerm ? ` ${cTerm}` : ""}`;
      return `
### この問題の解説
$(x+1)(${quad})=${texTerm(p.a, "x^3", true)} + (${p.a}+b)x^2+\\cdots$
よって $${p.a}+b=${p.k} \Rightarrow b=${p.b}$。
`;
    },
  };
}

export const identityCoeffQuadraticTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`identity_coeff_quadratic_basic_${i + 1}`, `係数 ${i + 1}`)
);
