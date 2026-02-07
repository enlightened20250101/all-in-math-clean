// src/lib/course/templates/math2/calculus_area_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type AreaParams = { a: number; b: number; x1: number; x2: number; value: number };

function buildParams(): AreaParams {
  const a = randInt(0, 4);
  const b = randInt(0, 6);
  const x1 = 0;
  const x2 = randInt(1, 4);
  const value = (a / 2) * (x2 * x2 - x1 * x1) + b * (x2 - x1);
  return { a, b, x1, x2, value };
}

function explain(params: AreaParams) {
  return `
### この問題の解説
面積は
$$
\\int_{${params.x1}}^{${params.x2}} (${texLinear(params.a, params.b)})\\,dx
$$
で求めます。計算すると **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_area_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次の面積を求めよ。\\n\\n$$\\int_{${params.x1}}^{${params.x2}} (${texLinear(params.a, params.b)})\\,dx$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      return explain(params as AreaParams);
    },
  };
}

export const areaBasicTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`calc_area_basic_${i + 1}`, `面積 ${i + 1}`)
);
