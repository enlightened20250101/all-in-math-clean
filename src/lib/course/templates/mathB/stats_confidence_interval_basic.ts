// src/lib/course/templates/mathB/stats_confidence_interval_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { mu: 50, se: 2, z: 2, margin: 4 },
  { mu: 70, se: 3, z: 2, margin: 6 },
  { mu: 80, se: 1, z: 2, margin: 2 },
  { mu: 65, se: 4, z: 2, margin: 8 },
  { mu: 90, se: 2, z: 3, margin: 6 },
  { mu: 55, se: 5, z: 2, margin: 10 },
  { mu: 75, se: 3, z: 3, margin: 9 },
  { mu: 60, se: 4, z: 3, margin: 12 },
  { mu: 85, se: 2, z: 1, margin: 2 },
  { mu: 95, se: 1, z: 3, margin: 3 },
  { mu: 40, se: 6, z: 2, margin: 12 },
  { mu: 100, se: 4, z: 1, margin: 4 },
  { mu: 88, se: 5, z: 2, margin: 10 },
  { mu: 72, se: 2, z: 3, margin: 6 },
  { mu: 68, se: 3, z: 1, margin: 3 },
  { mu: 110, se: 2, z: 2, margin: 4 },
  { mu: 52, se: 4, z: 2, margin: 8 },
  { mu: 62, se: 6, z: 1, margin: 6 },
];

type Params = {
  mu: number;
  se: number;
  z: number;
  margin: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "stats_confidence_interval_basic",
      title,
      difficulty: 1,
      tags: ["statistics", "confidence", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `標本平均が ${params.mu}、標準誤差が ${params.se} のとき、$z=${params.z}$ を用いた信頼区間の幅（片側）を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).margin);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
幅（片側）は $z\cdot \text{SE}$。
$$
${p.z}\times ${p.se}=${p.margin}
$$
`;
    },
  };
}

export const statsConfidenceIntervalTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`stats_confidence_interval_basic_${i + 1}`, `信頼区間 ${i + 1}`)
);
