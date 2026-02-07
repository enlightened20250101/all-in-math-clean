// src/lib/course/templates/math1/quad_discriminant_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type DiscCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
};

function calcD(a: number, b: number, c: number) {
  return b * b - 4 * a * c;
}

function buildTemplate(c: DiscCase): QuestionTemplate {
  const D = calcD(c.a, c.b, c.c);
  const poly = texPoly2(c.a, c.b, c.c);
  return {
    meta: {
      id: c.id,
      topicId: "quad_discriminant_basic",
      title: c.title,
      difficulty: 1,
      tags: ["discriminant", "value"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `次の二次方程式の判別式 $D$ を求めよ。\\n\\n$$${poly}=0$$`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, D);
    },
    explain() {
      return `
### この問題の解説
判別式は $D=b^2-4ac$ です。
$$
D=${c.b}^2-4\\cdot${c.a}\\cdot${c.c}=${D}
$$
`;
    },
  };
}

const CASES: DiscCase[] = [
  { id: "quad_disc_v1", title: "判別式（別）1", a: 1, b: -3, c: -4 },
  { id: "quad_disc_v2", title: "判別式（別）2", a: 2, b: 1, c: -3 },
  { id: "quad_disc_v3", title: "判別式（別）3", a: 3, b: -4, c: 1 },
  { id: "quad_disc_v4", title: "判別式（別）4", a: 1, b: 2, c: -8 },
  { id: "quad_disc_v5", title: "判別式（別）5", a: 2, b: -5, c: 2 },
  { id: "quad_disc_v6", title: "判別式（別）6", a: -1, b: 4, c: -1 },
];

export const quadDiscriminantVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
