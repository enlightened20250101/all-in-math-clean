// src/lib/course/templates/mathC/complex_argument_degree_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { deg: 45, ans: 45 },
  { deg: 135, ans: 135 },
  { deg: 225, ans: 225 },
  { deg: 315, ans: 315 },
];

type Params = {
  deg: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_degree_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `偏角が ${params.deg}^\\circ$ のとき、$0^\\circ\\le\\theta<360^\\circ$ で表した偏角を答えよ。`;
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
角度は $0^\\circ\\le\\theta<360^\\circ$ に直します。
答えは **${p.ans}^\\circ**。
`;
    },
  };
}

export const complexArgumentDegreeExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_degree_basic2_${i + 1}`, `偏角（度数） ${i + 1}`)
);
