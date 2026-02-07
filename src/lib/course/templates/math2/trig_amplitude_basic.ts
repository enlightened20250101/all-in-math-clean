// src/lib/course/templates/math2/trig_amplitude_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type AmpParams = {
  a: number;
  value: number;
};

function buildParams(): AmpParams {
  const a = pick([-3, -2, -1, 1, 2, 3]);
  return { a, value: Math.abs(a) };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_amplitude_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const func = Math.random() < 0.5 ? "sin" : "cos";
      const aText = params.a === -1 ? "-" : params.a === 1 ? "" : `${params.a}`;
      const statement = `関数 $y=${aText}\\${func} x$ の振幅を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AmpParams).value);
    },
    explain(params) {
      const p = params as AmpParams;
      return `
### この問題の解説
振幅は係数の絶対値なので $|${p.a}|=${p.value}$ です。
答えは **${p.value}** です。
`;
    },
  };
}

export const trigAmplitudeTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_amplitude_basic_${i + 1}`, `振幅 ${i + 1}`)
);
