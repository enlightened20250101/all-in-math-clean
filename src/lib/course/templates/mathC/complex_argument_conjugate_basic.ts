// src/lib/course/templates/mathC/complex_argument_conjugate_basic.ts
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
      topicId: "complex_argument_conjugate_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `観測点を表す複素数 $z$ の点の偏角が $${params.theta}^\\circ$ のとき、共役 $\\overline{z}$ の点の偏角を求めよ。（$0^\\circ\\le\\theta<360^\\circ$）`;
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
共役は点の偏角の符号が反転し、$[0,360)$ に戻します。
よって **${p.ans}^\\circ**。
`;
    },
  };
}

export const complexArgumentConjugateTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_conjugate_basic_${i + 1}`, `共役の点の偏角 ${i + 1}`)
);

const extraArgumentConjugateTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`complex_argument_conjugate_basic_${i + 7}`, `共役の点の偏角 追加${i + 1}`)
);

complexArgumentConjugateTemplates.push(...extraArgumentConjugateTemplates);
