// src/lib/course/templates/mathC/conic_circle_center_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type CenterParams = { h: number; k: number; r: number; ask: number; value: number };

function buildParams(): CenterParams {
  const h = randInt(-4, 4);
  const k = randInt(-4, 4);
  const r = randInt(1, 5);
  const ask = pick([0, 1]); // 0: h, 1: k
  const value = ask === 0 ? h : k;
  return { h, k, r, ask, value };
}

function explain(params: CenterParams) {
  return `
### この問題の解説
円 $(x-h)^2+(y-k)^2=r^2$ の中心は $(h,k)$。
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_center_basic",
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
      const statement =
        params.ask === 0
          ? `円 $(x${hSign}${hAbs})^2+(y${kSign}${kAbs})^2=${params.r * params.r}$ の中心の x 座標を求めよ。`
          : `円 $(x${hSign}${hAbs})^2+(y${kSign}${kAbs})^2=${params.r * params.r}$ の中心の y 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as CenterParams).value);
    },
    explain(params) {
      return explain(params as CenterParams);
    },
  };
}

export const conicCircleCenterTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`conic_circle_center_basic_${i + 1}`, `円の中心 ${i + 1}`)
);

const extraConicCircleCenterTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`conic_circle_center_basic_${i + 21}`, `円の中心 追加${i + 1}`)
);

conicCircleCenterTemplates.push(...extraConicCircleCenterTemplates);
