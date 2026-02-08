// src/lib/course/templates/mathC/complex_de_moivre_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 1, theta: 60, n: 2, real: -1 },
  { r: 1, theta: 90, n: 2, real: -1 },
  { r: 2, theta: 0, n: 3, real: 8 },
  { r: 1, theta: 180, n: 2, real: 1 },
  { r: 1, theta: 45, n: 2, real: 0 },
  { r: 2, theta: 45, n: 2, real: 0 },
  { r: 2, theta: 90, n: 2, real: -4 },
  { r: 3, theta: 0, n: 2, real: 9 },
];

type Params = {
  r: number;
  theta: number;
  n: number;
  real: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_de_moivre_basic",
      title,
      difficulty: 1,
      tags: ["complex", "de-moivre"],
    },
    generate() {
      const params = buildParams();
      const statement = `観測点を表す複素数 $z=r(\\cos\\theta+i\\sin\\theta)$ を $z^${params.n}$ にしたとき、実部を求めよ。ここで $r=${params.r},\\ \\theta=${params.theta}^\\circ$ とする。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).real);
    },
    explain(params) {
      const p = params as Params;
      const rn = Math.pow(p.r, p.n);
      const deg = p.n * p.theta;
      return `
### この問題の解説
ド・モアブルの定理より
$$
(r(\\cos\\theta+i\\sin\\theta))^n=r^n(\\cos n\\theta+i\\sin n\\theta)
$$
実部は $r^n\\cos(n\\theta)$。
ここでは $r^n=${rn},\ n\\theta=${deg}^\\circ$ なので **${p.real}**。
`;
    },
  };
}

export const complexDeMoivreTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_de_moivre_basic_${i + 1}`, `ド・モアブル ${i + 1}`)
);

const extraDeMoivreTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`complex_de_moivre_basic_${i + 7}`, `ド・モアブル 追加${i + 1}`)
);

complexDeMoivreTemplates.push(...extraDeMoivreTemplates);
