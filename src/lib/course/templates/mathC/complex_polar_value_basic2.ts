// src/lib/course/templates/mathC/complex_polar_value_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 2, theta: 60, ask: 0, ans: 1 },
  { r: 4, theta: 60, ask: 1, ans: 2 },
  { r: 6, theta: 30, ask: 0, ans: 3 },
  { r: 8, theta: 30, ask: 1, ans: 4 },
];

type Params = {
  r: number;
  theta: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_polar_value_basic",
      title,
      difficulty: 1,
      tags: ["complex", "polar"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const statement = `複素数 $z=${params.r}(\\cos ${params.theta}^\\circ + i\\sin ${params.theta}^\\circ)$ の ${label} 座標を求めよ。`;
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
      const label = p.ask === 0 ? "x" : "y";
      return `
### この問題の解説
$x=r\\cos\\theta$, $y=r\\sin\\theta$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const complexPolarValueExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_polar_value_basic2_${i + 1}`, `極形式 ${i + 1}`)
);
