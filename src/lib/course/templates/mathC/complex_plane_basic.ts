// src/lib/course/templates/mathC/complex_plane_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

type PlaneParams = { a: number; b: number; ask: number; value: number };

function buildParams(): PlaneParams {
  const a = randInt(-4, 4);
  const b = randInt(-4, 4);
  const ask = pick([0, 1]); // 0: real, 1: imag
  const value = ask === 0 ? a : b;
  return { a, b, ask, value };
}

function explain(params: PlaneParams) {
  return `
### この問題の解説
$z=${params.a}+${params.b}i$ の実部は ${params.a}、虚部は ${params.b}。
よって答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_plane_basic",
      title,
      difficulty: 1,
      tags: ["complex", "plane"],
    },
    generate() {
      const params = buildParams();
      const statement =
        params.ask === 0
          ? `複素数 $z=${texComplex(params.a, params.b)}$ の実部を求めよ。`
          : `複素数 $z=${texComplex(params.a, params.b)}$ の虚部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as PlaneParams).value);
    },
    explain(params) {
      return explain(params as PlaneParams);
    },
  };
}

export const complexPlaneTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`complex_plane_basic_${i + 1}`, `複素数平面 ${i + 1}`)
);

const extraComplexPlaneTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`complex_plane_basic_${i + 21}`, `複素数平面 追加${i + 1}`)
);

complexPlaneTemplates.push(...extraComplexPlaneTemplates);
