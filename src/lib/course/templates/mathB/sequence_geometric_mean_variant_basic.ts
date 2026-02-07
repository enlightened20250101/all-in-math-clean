// src/lib/course/templates/mathB/sequence_geometric_mean_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  a1: number;
  a3: number;
  a2: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "seq_geometric_mean_basic",
      title: c.title,
      difficulty: 1,
      tags: ["sequence", "geometric", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `等比数列で $a_1=${c.a1}$, $a_3=${c.a3}$ のとき、$a_2$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.a2);
    },
    explain() {
      return `### この問題の解説\n等比中項は $a_2^2=a_1a_3$ より $a_2=${c.a2}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "seq_geo_mean_v1", title: "等比中項 1", a1: 2, a3: 8, a2: 4 },
  { id: "seq_geo_mean_v2", title: "等比中項 2", a1: 3, a3: 27, a2: 9 },
  { id: "seq_geo_mean_v3", title: "等比中項 3", a1: 1, a3: 9, a2: 3 },
  { id: "seq_geo_mean_v4", title: "等比中項 4", a1: 4, a3: 16, a2: 8 },
];

export const sequenceGeometricMeanVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
