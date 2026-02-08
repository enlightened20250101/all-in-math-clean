// src/lib/course/templates/mathC/vector_inner_from_angle_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type InnerParams = {
  a: number;
  b: number;
  cos: number;
  value: number;
};

const CASES: InnerParams[] = [
  { a: 4, b: 6, cos: 1 / 2, value: 12 },
  { a: 5, b: 3, cos: 0, value: 0 },
  { a: 2, b: 4, cos: -1 / 2, value: -4 },
  { a: 3, b: 3, cos: 1, value: 9 },
];

function buildParams(): InnerParams {
  return pick(CASES);
}

function cosLabel(c: number) {
  if (c === 1 / 2) return "\\frac{1}{2}";
  if (c === -1 / 2) return "-\\frac{1}{2}";
  if (c === 0) return "0";
  if (c === 1) return "1";
  return String(c);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_inner_from_angle_basic",
      title,
      difficulty: 1,
      tags: ["vector", "inner", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `移動方向を表すベクトルで $|\\vec{a}|=${params.a}, |\\vec{b}|=${params.b}, \\cos\\theta=${cosLabel(params.cos)}$ のとき、$\\vec{a}\\cdot\\vec{b}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params: { a: params.a, b: params.b, cos: params.cos, value: params.value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as InnerParams).value);
    },
    explain(params) {
      const p = params as InnerParams;
      return `
### この問題の解説
$\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta$ なので答えは **${p.value}** です。
`;
    },
  };
}

const extraVectorInnerFromAngleTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_inner_from_angle_basic_${i + 21}`, `内積と角 追加${i + 1}`)
);

export const vectorInnerFromAngleTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) =>
    buildTemplate(`vector_inner_from_angle_basic_${i + 1}`, `内積と角 ${i + 1}`)
  ),
  ...extraVectorInnerFromAngleTemplates,
];
