// src/lib/course/templates/mathC/complex_polar_value_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 2, theta: 0, value: 2 },
  { r: 3, theta: 90, value: 0 },
  { r: 4, theta: 180, value: -4 },
  { r: 5, theta: 270, value: 0 },
  { r: 6, theta: 0, value: 6 },
  { r: 7, theta: 180, value: -7 },
  { r: 8, theta: 90, value: 0 },
  { r: 9, theta: 270, value: 0 },
];

type Params = {
  r: number;
  theta: number;
  value: number;
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
      const statement = `観測点を表す複素数 $z=r(\\cos\\theta+i\\sin\\theta)$ で $r=${params.r},\\ \\theta=${params.theta}^\\circ$ のとき、$z$ の実部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
実部は $r\\cos\\theta$。
$$
${p.r}\\cos ${p.theta}^\\circ=${p.value}
$$
`;
    },
  };
}

export const complexPolarValueTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_polar_value_basic_${i + 1}`, `極形式 ${i + 1}`)
);

const extraPolarValueTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_polar_value_basic_${i + 7}`, `極形式 追加${i + 1}`)
);

complexPolarValueTemplates.push(...extraPolarValueTemplates);
