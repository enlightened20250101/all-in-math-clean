// src/lib/course/templates/mathC/complex_argument_inverse_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { theta: 30, ans: 330 },
  { theta: 60, ans: 300 },
  { theta: 120, ans: 240 },
  { theta: 210, ans: 150 },
  { theta: 45, ans: 315 },
  { theta: 90, ans: 270 },
  { theta: 135, ans: 225 },
  { theta: 300, ans: 60 },
];

type Params = {
  theta: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_inverse_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z$ の点の偏角が $${params.theta}^\\circ$ のとき、$1/z$ の点の偏角を求めよ。（$0^\\circ\\le\\theta<360^\\circ$）`;
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
$\arg(1/z)=-\arg(z)$。
よって **${p.ans}^\\circ**。
`;
    },
  };
}

export const complexArgumentInverseTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_inverse_basic_${i + 1}`, `点の偏角の逆数 ${i + 1}`)
);

const extraArgumentInverseTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`complex_argument_inverse_basic_${i + 7}`, `点の偏角の逆数 追加${i + 1}`)
);

complexArgumentInverseTemplates.push(...extraArgumentInverseTemplates);
