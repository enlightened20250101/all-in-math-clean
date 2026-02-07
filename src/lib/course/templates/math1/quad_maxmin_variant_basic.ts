// src/lib/course/templates/math1/quad_maxmin_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear, texPoly2 } from "@/lib/format/tex";
import { genQuadraticWithIntegerVertex, vertexX, vertexY } from "../_shared/quadratic";

function buildValueFromAxisTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_maxmin_basic",
      title,
      difficulty: 2,
      tags: ["vertex", "axis"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const p = vertexX(a, b);
      const q = vertexY(a, b, c);
      const poly = texPoly2(a, b, c);
      return {
        templateId: id,
        statement: `二次関数 $y=${poly}$ の軸が $x=${p}$ のとき、最小値を求めよ。`,
        answerKind: "numeric",
        params: { q },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { q: number }).q);
    },
    explain(params) {
      const q = (params as { q: number }).q;
      return `
### この問題の解説
軸の $x$ が分かれば頂点の $y$ が最小値です。
答えは **${q}** です。
`;
    },
  };
}

function buildValueAtTwoPointsTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_maxmin_basic",
      title,
      difficulty: 2,
      tags: ["vertex", "symmetry"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const p = vertexX(a, b);
      const offset = pick([1, 2, 3]);
      const x1 = p - offset;
      const x2 = p + offset;
      const q = vertexY(a, b, c);
      const y1 = a * offset * offset + q;
      const xShift = texLinear(1, -p);
      const aText = a === 1 ? "" : `${a}`;
      const form = `${aText}(${xShift})^2+q`;
      return {
        templateId: id,
        statement: `二次関数 $y=${form}$（$q$ は定数）で $x=${x1}$ と $x=${x2}$ のときの値がともに ${y1} である。最小値を求めよ。`,
        answerKind: "numeric",
        params: { q, y1, a, offset },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { q: number }).q);
    },
    explain(params) {
      const { q, y1, a, offset } = params as {
        q: number;
        y1: number;
        a: number;
        offset: number;
      };
      return `
### この問題の解説
同じ値になる2点は軸に対して対称なので、頂点の $y$ が最小値です。  
また、$y=a(x-p)^2+q$ に対して $x=p\\pm d$ では $y=q+ad^2$ なので  
$q = ${y1} - ${a}\\cdot ${offset}^2 = ${q}$ と求まります。
答えは **${q}** です。
`;
    },
  };
}

export const quadMaxMinVariantTemplates: QuestionTemplate[] = [
  buildValueFromAxisTemplate("quad_maxmin_axis_value_1", "軸から最小（最大）値 1"),
  buildValueFromAxisTemplate("quad_maxmin_axis_value_2", "軸から最小（最大）値 2"),
  buildValueFromAxisTemplate("quad_maxmin_axis_value_3", "軸から最小（最大）値 3"),
  buildValueAtTwoPointsTemplate("quad_maxmin_sym_value_1", "対称点から最小（最大）値 1"),
  buildValueAtTwoPointsTemplate("quad_maxmin_sym_value_2", "対称点から最小（最大）値 2"),
];
