// src/lib/course/templates/mathB/stats_ct_standard_error_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type BacksolveCase = {
  id: string;
  title: string;
  sigma: number;
  se: number;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: BacksolveCase): QuestionTemplate {
  const n = (c.sigma / c.se) ** 2;
  return {
    meta: {
      id: c.id,
      topicId: "stats_standard_error_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "standard_error", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `母標準偏差が ${c.sigma}、標本平均の標準誤差が ${c.se} のとき、標本サイズ $n$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, n);
    },
    explain() {
      return `### この問題の解説\n標準誤差は $\\sigma/\\sqrt{n}$。\nよって $n=(\\sigma/\\text{SE})^2=${n}。`;
    },
  };
}

const CASES: BacksolveCase[] = [
  { id: "stats_ct_se_backsolve_1", title: "標本サイズ 1", sigma: 12, se: 2, difficulty: 1 },
  { id: "stats_ct_se_backsolve_2", title: "標本サイズ 2", sigma: 15, se: 3, difficulty: 1 },
  { id: "stats_ct_se_backsolve_3", title: "標本サイズ 3", sigma: 20, se: 4, difficulty: 2 },
  { id: "stats_ct_se_backsolve_4", title: "標本サイズ 4", sigma: 18, se: 3, difficulty: 2 },
  { id: "stats_ct_se_backsolve_5", title: "標本サイズ 5", sigma: 10, se: 1, difficulty: 2 },
  { id: "stats_ct_se_backsolve_6", title: "標本サイズ 6", sigma: 24, se: 6, difficulty: 2 },
];

export const statsCtStandardErrorBacksolveTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
