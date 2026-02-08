// src/lib/course/templates/mathC/complex_polar_imag_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 2, theta: 0, imag: 0 },
  { r: 3, theta: 90, imag: 3 },
  { r: 4, theta: 180, imag: 0 },
  { r: 5, theta: 270, imag: -5 },
  { r: 6, theta: 90, imag: 6 },
  { r: 7, theta: 270, imag: -7 },
  { r: 8, theta: 0, imag: 0 },
  { r: 9, theta: 180, imag: 0 },
];

type Params = {
  r: number;
  theta: number;
  imag: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_polar_imag_basic",
      title,
      difficulty: 1,
      tags: ["complex", "polar"],
    },
    generate() {
      const params = buildParams();
      const statement = `観測点を表す複素数 $z=r(\\cos\\theta+i\\sin\\theta)$ で $r=${params.r},\\ \\theta=${params.theta}^\\circ$ のとき、$z$ の虚部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).imag);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
虚部は $r\\sin\\theta$。
$$
${p.r}\\sin ${p.theta}^\\circ=${p.imag}
$$
`;
    },
  };
}

export const complexPolarImagTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_polar_imag_basic_${i + 1}`, `極形式の虚部 ${i + 1}`)
);

const extraPolarImagTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_polar_imag_basic_${i + 7}`, `極形式の虚部 追加${i + 1}`)
);

complexPolarImagTemplates.push(...extraPolarImagTemplates);
