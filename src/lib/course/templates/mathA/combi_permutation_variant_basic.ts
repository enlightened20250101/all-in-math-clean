// src/lib/course/templates/mathA/combi_permutation_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  statement: string;
  answer: number;
  explain: string;
};

function buildTemplate(c: Case): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "combi_permutation_basic",
      title: c.title,
      difficulty: 1,
      tags: ["combinatorics", "permutation"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.answer);
    },
    explain() {
      return c.explain;
    },
  };
}

const CASES: Case[] = [
  {
    id: "perm_word_1",
    title: "並べ方（5人）",
    statement: `5人が横一列に並ぶときの並べ方は何通りか。`,
    answer: 120,
    explain: `### この問題の解説\n$5! = 120$。`,
  },
  {
    id: "perm_word_2",
    title: "並べ方（4人から3人）",
    statement: `4人から3人を選んで順に並べるときの並べ方は何通りか。`,
    answer: 24,
    explain: `### この問題の解説\n$4P3=4\\cdot3\\cdot2=24$。`,
  },
  {
    id: "perm_word_3",
    title: "3桁の整数",
    statement: `0〜4の数字を重複なく使って3桁の整数を作るとき、何通りあるか。`,
    answer: 48,
    explain: `### この問題の解説\n百の位は1〜4の4通り、残りは4通り・3通り。$4\\cdot4\\cdot3=48$。`,
  },
  {
    id: "perm_word_4",
    title: "順列（数字並べ）",
    statement: `1〜6の数字から3つを選んで順に並べるとき、何通りあるか。`,
    answer: 120,
    explain: `### この問題の解説\n$6P3=6\\cdot5\\cdot4=120$。`,
  },
];

export const combiPermutationVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
