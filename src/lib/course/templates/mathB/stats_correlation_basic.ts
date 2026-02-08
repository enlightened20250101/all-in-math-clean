// src/lib/course/templates/mathB/stats_correlation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type CorrCase = {
  id: string;
  title: string;
  cov: number;
  sx: number;
  sy: number;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: CorrCase): QuestionTemplate {
  const r = c.cov / (c.sx * c.sy);
  return {
    meta: {
      id: c.id,
      topicId: "stats_correlation_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "correlation", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `${c.title}のデータについて、共分散が ${c.cov}、標準偏差が $\\sigma_x=${c.sx}$, $\\sigma_y=${c.sy}$ のとき、相関係数 $r$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, r);
    },
    explain() {
      return `### この問題の解説\n$r=\\dfrac{\\mathrm{cov}}{\\sigma_x\\sigma_y}$ より $r=${r}$。`;
    },
  };
}

const CASES: CorrCase[] = [
  { id: "stats_corr_1", title: "学習時間と得点", cov: 1, sx: 1, sy: 1, difficulty: 1 },
  { id: "stats_corr_2", title: "気温と売上個数", cov: -2, sx: 2, sy: 1, difficulty: 1 },
  { id: "stats_corr_3", title: "通学時間と身長", cov: 0, sx: 3, sy: 2, difficulty: 1 },
  { id: "stats_corr_4", title: "広告費と来店数", cov: 2, sx: 1, sy: 2, difficulty: 1 },
  { id: "stats_corr_5", title: "睡眠時間と集中度", cov: 3, sx: 3, sy: 1, difficulty: 2 },
  { id: "stats_corr_6", title: "移動距離と体力残量", cov: -4, sx: 4, sy: 2, difficulty: 2 },
  { id: "stats_corr_7", title: "練習回数と記録", cov: 6, sx: 3, sy: 2, difficulty: 2 },
  { id: "stats_corr_8", title: "気温と暖房使用量", cov: -6, sx: 3, sy: 1, difficulty: 3 },
  { id: "stats_corr_9", title: "広告回数と反応数", cov: 5, sx: 5, sy: 1, difficulty: 3 },
];

export const statsCorrelationTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
