// src/lib/course/templates/mathB/sequence_common_difference_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  a1: number;
  a5: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const d = (c.a5 - c.a1) / 4;
  return {
    meta: {
      id: c.id,
      topicId: "seq_common_difference_basic",
      title: c.title,
      difficulty: 1,
      tags: ["sequence", "difference", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `一定の差で増減する量を考える。` +
          `$a_1=${c.a1}$, $a_5=${c.a5}$ のとき、公差 $d$ を求めよ。`,
        answerKind: "numeric",
        params: { d },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { d: number }).d);
    },
    explain(params) {
      const d = (params as { d: number }).d;
      return `### この問題の解説\n$a_5=a_1+4d$ より $d=${d}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "seq_diff_v1", title: "公差（a1,a5）1", a1: 2, a5: 10 },
  { id: "seq_diff_v2", title: "公差（a1,a5）2", a1: -3, a5: 5 },
  { id: "seq_diff_v3", title: "公差（a1,a5）3", a1: 4, a5: 0 },
  { id: "seq_diff_v4", title: "公差（a1,a5）4", a1: 1, a5: 13 },
];

export const sequenceCommonDifferenceVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
