// src/lib/course/templates/mathC/conic_circle_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type CircleParams = { h: number; k: number; r: number; value: number };

function buildParams(): CircleParams {
  const h = randInt(-4, 4);
  const k = randInt(-4, 4);
  const r = randInt(1, 5);
  return { h, k, r, value: r };
}

function explain(params: CircleParams) {
  return `
### この問題の解説
円の標準形
$$
(x-h)^2+(y-k)^2=r^2
$$
より半径は $r=${params.r}$。答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      const hSign = params.h >= 0 ? "-" : "+";
      const kSign = params.k >= 0 ? "-" : "+";
      const hAbs = Math.abs(params.h);
      const kAbs = Math.abs(params.k);
      const statement = `円 $(x${hSign}${hAbs})^2+(y${kSign}${kAbs})^2=${params.r * params.r}$ の半径を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as CircleParams).value);
    },
    explain(params) {
      return explain(params as CircleParams);
    },
  };
}

export const conicCircleTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`conic_circle_basic_${i + 1}`, `円の方程式 ${i + 1}`)
);

const extraConicCircleTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`conic_circle_basic_${i + 21}`, `円の方程式 追加${i + 1}`)
);

conicCircleTemplates.push(...extraConicCircleTemplates);
