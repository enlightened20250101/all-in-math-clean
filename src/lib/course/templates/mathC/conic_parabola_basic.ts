// src/lib/course/templates/mathC/conic_parabola_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";
import { texTerm } from "@/lib/format/tex";

type ParaParams = { p: number; axis: number; value: number };

function buildParams(): ParaParams {
  const p = randInt(1, 4);
  const axis = pick([0, 1]); // 0: y^2=4px, 1: x^2=4py
  return { p, axis, value: p };
}

function explain(params: ParaParams) {
  return `
### この問題の解説
標準形 $y^2=4px$ の焦点は $(p,0)$、$x^2=4py$ の焦点は $(0,p)$。
よって答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_parabola_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const coef = 4 * params.p;
      const statement =
        params.axis === 0
          ? `放物線 $y^2=${texTerm(coef, "x", true)}$ の焦点の x 座標を求めよ。`
          : `放物線 $x^2=${texTerm(coef, "y", true)}$ の焦点の y 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParaParams).value);
    },
    explain(params) {
      return explain(params as ParaParams);
    },
  };
}

export const conicParabolaTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`conic_parabola_basic_${i + 1}`, `放物線 ${i + 1}`)
);

const extraConicParabolaTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`conic_parabola_basic_${i + 21}`, `放物線 追加${i + 1}`)
);

conicParabolaTemplates.push(...extraConicParabolaTemplates);
