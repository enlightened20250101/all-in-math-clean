// src/lib/course/templates/mathC/vector_section_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type SectionParams = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  m: number;
  n: number;
  value: number;
};

function buildParams(): SectionParams {
  const x1 = randInt(-4, 4);
  const y1 = randInt(-4, 4);
  const x2 = randInt(-4, 4);
  const y2 = randInt(-4, 4);
  const m = pick([1, 2, 3]);
  const n = pick([1, 2, 3]);
  const value = (n * x1 + m * x2) / (m + n);
  return { x1, y1, x2, y2, m, n, value };
}

function explain(params: SectionParams) {
  return `
### この問題の解説
内分点の公式より
$$
x=\\frac{n x_1 + m x_2}{m+n}
$$
なので
$$
x=\\frac{${params.n}\\cdot ${params.x1} + ${params.m}\\cdot ${params.x2}}{${params.m}+${params.n}}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_section_basic",
      title,
      difficulty: 1,
      tags: ["vector", "section", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `ベクトルとして、点 $A(${params.x1},${params.y1})$, $B(${params.x2},${params.y2})$ を $m:n=${params.m}:${params.n}$ に内分する点 $P$ の x 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SectionParams).value);
    },
    explain(params) {
      return explain(params as SectionParams);
    },
  };
}

const extraVectorSectionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_section_basic_${i + 21}`, `内分点 追加${i + 1}`)
);

export const vectorSectionTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) => buildTemplate(`vector_section_basic_${i + 1}`, `内分点 ${i + 1}`)),
  ...extraVectorSectionTemplates,
];
