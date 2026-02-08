// src/lib/course/templates/math2/identity_eval_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type Params = {
  x: number;
  y: number;
  val: number;
};

function buildParams(): Params {
  const x = randInt(-4, 4);
  const y = randInt(-4, 4);
  const val = 2 * (x * x + y * y);
  return { x, y, val };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "identity_eval_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `距離の計算で現れる恒等式 $(x+y)^2+(x-y)^2=2(x^2+y^2)$ が成り立つとき、$x=${params.x},y=${params.y}$ の値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).val);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
恒等式より
$$
2(${p.x}^2+${p.y}^2)=${p.val}
$$
答えは **${p.val}** です。
`;
    },
  };
}

export const identityEvalTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`identity_eval_basic_${i + 1}`, `恒等式の値 ${i + 1}`)
);
