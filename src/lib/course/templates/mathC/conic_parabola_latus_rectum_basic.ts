// src/lib/course/templates/mathC/conic_parabola_latus_rectum_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { p: 1, length: 4 },
  { p: 2, length: 8 },
  { p: 3, length: 12 },
  { p: 4, length: 16 },
  { p: 5, length: 20 },
  { p: 6, length: 24 },
];

type Params = {
  p: number;
  length: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_parabola_latus_rectum_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const statement = `放物線 $y^2=4${params.p}x$ の準弦（latus rectum）の長さを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).length);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
準弦の長さは $4p$。
よって **${p.length}** です。
`;
    },
  };
}

export const conicParabolaLatusRectumTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_latus_rectum_basic_${i + 1}`, `準弦 ${i + 1}`)
);

const extraParabolaLatusRectumTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`conic_parabola_latus_rectum_basic_${i + 7}`, `準弦 追加${i + 1}`)
);

conicParabolaLatusRectumTemplates.push(...extraParabolaLatusRectumTemplates);
