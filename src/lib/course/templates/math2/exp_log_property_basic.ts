// src/lib/course/templates/math2/exp_log_property_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type LogParams = { a: number; n: number; value: number };

function buildParams(): LogParams {
  const a = pick([2, 3, 5, 10]);
  const n = randInt(1, 4);
  return { a, n, value: n };
}

function explain(params: LogParams) {
  return `
### この問題の解説
$$
\\log_{${params.a}}(${params.a}^{${params.n}})=${params.n}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_property_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を計算せよ。\\n\\n$$\\log_{${params.a}}(${params.a}^{${params.n}})$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LogParams).value);
    },
    explain(params) {
      return explain(params as LogParams);
    },
  };
}

export const expLogPropertyTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`exp_log_property_basic_${i + 1}`, `対数の性質 ${i + 1}`)
);
