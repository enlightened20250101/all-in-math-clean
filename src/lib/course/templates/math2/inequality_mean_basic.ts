// src/lib/course/templates/math2/inequality_mean_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

function buildParams() {
  const t = randInt(1, 6);
  const ab = t * t;
  const minVal = 2 * t;
  return { t, ab, minVal };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "inequality_mean_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `正の数 $a,b$ が $ab=${params.ab}$ を満たすとき、$a+b$ の最小値を答えよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).minVal);
    },
    explain(params) {
      const p = params as any;
      return `
### この問題の解説
相加平均と相乗平均より $a+b\\ge 2\\sqrt{ab}$。
ここでは $ab=${p.ab}$ なので最小値は **${p.minVal}** です。
`;
    },
  };
}

export const inequalityMeanTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`inequality_mean_basic_${i + 1}`, `平均 ${i + 1}`)
);
