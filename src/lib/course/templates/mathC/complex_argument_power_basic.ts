// src/lib/course/templates/mathC/complex_argument_power_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { theta: 30, n: 3, ans: 90 },
  { theta: 45, n: 4, ans: 180 },
  { theta: 60, n: 2, ans: 120 },
  { theta: 90, n: 3, ans: 270 },
  { theta: 30, n: 4, ans: 120 },
  { theta: 45, n: 2, ans: 90 },
  { theta: 120, n: 2, ans: 240 },
  { theta: 135, n: 2, ans: 270 },
];

type Params = {
  theta: number;
  n: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_power_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z$ の点の偏角が $${params.theta}^\\circ$ のとき、$z^${params.n}$ の点の偏角を求めよ。（$0^\\circ\\le\\theta<360^\\circ$）`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
点の偏角はべきで $n\\theta$。
よって ${p.n}\times ${p.theta}=${p.ans}^\\circ。
`;
    },
  };
}

export const complexArgumentPowerTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_power_basic_${i + 1}`, `点の偏角のべき ${i + 1}`)
);

const extraArgumentPowerTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`complex_argument_power_basic_${i + 7}`, `点の偏角のべき 追加${i + 1}`)
);

complexArgumentPowerTemplates.push(...extraArgumentPowerTemplates);
