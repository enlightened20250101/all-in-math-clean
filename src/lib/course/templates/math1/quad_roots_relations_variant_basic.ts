// src/lib/course/templates/math1/quad_roots_relations_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

type RelCase = {
  id: string;
  title: string;
  a: number;
  sum: number;
  prod: number;
};

function buildSumTemplate(c: RelCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "quad_roots_relations_basic",
      title: c.title,
      difficulty: 1,
      tags: ["vieta", "sum"],
    },
    generate() {
      const aTerm = texTerm(c.a, "x^2", true);
      const cTerm = texConst(c.prod * c.a);
      const expr = `${aTerm} + bx${cTerm ? ` ${cTerm}` : ""}`;
      return {
        templateId: c.id,
        statement: `二次方程式 $${expr}=0$ の2解の和が ${c.sum} となるように、$b$ を求めよ。`,
        answerKind: "numeric",
        params: { b: -c.a * c.sum },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { b: number }).b);
    },
    explain(params) {
      const b = (params as { b: number }).b;
      return `
### この問題の解説
係数と解の関係より、解の和は $-\\frac{b}{a}$。
$$
-\\frac{b}{${c.a}}=${c.sum}
$$
より $b=${b}$。
`;
    },
  };
}

function buildProdTemplate(c: RelCase): QuestionTemplate {
  const b = -c.a * c.sum;
  return {
    meta: {
      id: c.id,
      topicId: "quad_roots_relations_basic",
      title: c.title,
      difficulty: 1,
      tags: ["vieta", "product"],
    },
    generate() {
      const aTerm = texTerm(c.a, "x^2", true);
      const bTerm = texTerm(b, "x", false);
      const expr = `${aTerm}${bTerm ? ` ${bTerm}` : ""} + c`;
      return {
        templateId: c.id,
        statement: `二次方程式 $${expr}=0$ の2解の積が ${c.prod} となるように、$c$ を求めよ。`,
        answerKind: "numeric",
        params: { c: c.a * c.prod },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { c: number }).c);
    },
    explain(params) {
      const val = (params as { c: number }).c;
      return `
### この問題の解説
係数と解の関係より、解の積は $\\frac{c}{a}$。
$$
\\frac{c}{${c.a}}=${c.prod}
$$
より $c=${val}$。
`;
    },
  };
}

const CASES: RelCase[] = [
  { id: "quad_rel_b_v1", title: "和からb", a: 1, sum: 3, prod: -4 },
  { id: "quad_rel_b_v2", title: "和からb", a: 2, sum: -1, prod: 2 },
  { id: "quad_rel_b_v3", title: "和からb", a: 3, sum: 2, prod: -1 },
  { id: "quad_rel_c_v1", title: "積からc", a: 1, sum: 4, prod: -3 },
  { id: "quad_rel_c_v2", title: "積からc", a: 2, sum: -2, prod: 3 },
  { id: "quad_rel_c_v3", title: "積からc", a: -1, sum: 1, prod: -2 },
];

export const quadRootsRelationsVariantTemplates: QuestionTemplate[] = [
  buildSumTemplate(CASES[0]),
  buildSumTemplate(CASES[1]),
  buildSumTemplate(CASES[2]),
  buildProdTemplate(CASES[3]),
  buildProdTemplate(CASES[4]),
  buildProdTemplate(CASES[5]),
];
