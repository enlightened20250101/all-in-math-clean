// src/lib/course/templates/math1/data_variance_sd_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type VarCase = {
  id: string;
  title: string;
  kind: "variance" | "sd";
  data: number[];
  answer: number;
};

const CASES: VarCase[] = [
  { id: "data_var_var_1", title: "分散", kind: "variance", data: [1, 3], answer: 1 },
  { id: "data_var_var_2", title: "分散", kind: "variance", data: [2, 2, 2], answer: 0 },
  { id: "data_sd_var_1", title: "標準偏差", kind: "sd", data: [0, 0, 4, 4], answer: 2 },
];

function formatData(data: number[]): string {
  return data.join(", ");
}

export const dataVarianceSdVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `data_variance_sd_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "data_variance_sd_basic",
      title: `分散・標準偏差（追加）${i + 1}`,
      difficulty: 2,
      tags: ["data", c.kind],
    },
    generate() {
      const label = c.kind === "variance" ? "分散（母分散）" : "標準偏差";
      return {
        templateId,
        statement: `次のデータの${label}を求めよ。\\n\\nデータ: ${formatData(c.data)}`,
        answerKind: "numeric",
        params: { caseId: i % CASES.length },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.answer);
    },
    explain() {
      return `### この問題の解説\n平均との差の二乗平均（分散）やその平方根（標準偏差）を求めます。答えは **${c.answer}** です。`;
    },
  };
});
