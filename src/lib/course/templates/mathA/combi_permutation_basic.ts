// src/lib/course/templates/mathA/combi_permutation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PermCase = {
  id: string;
  title: string;
  n: number;
  r: number;
  difficulty: 1 | 2 | 3;
};

function perm(n: number, r: number): number {
  let v = 1;
  for (let i = 0; i < r; i += 1) {
    v *= n - i;
  }
  return v;
}

function buildTemplate(c: PermCase): QuestionTemplate {
  const ans = perm(c.n, c.r);
  return {
    meta: {
      id: c.id,
      topicId: "combi_permutation_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["combinatorics", "permutation"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `順列 ${c.n}P${c.r} の値を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, ans);
    },
    explain() {
      return `### この問題の解説\n${c.n}P${c.r} = ${ans} です。`;
    },
  };
}

const CASES: PermCase[] = [
  { id: "perm_1", title: "順列 1", n: 5, r: 2, difficulty: 1 },
  { id: "perm_2", title: "順列 2", n: 6, r: 3, difficulty: 1 },
  { id: "perm_3", title: "順列 3", n: 7, r: 2, difficulty: 1 },
  { id: "perm_4", title: "順列 4", n: 8, r: 3, difficulty: 1 },
  { id: "perm_5", title: "順列 5", n: 9, r: 4, difficulty: 1 },
  { id: "perm_6", title: "順列 6", n: 4, r: 3, difficulty: 1 },
  { id: "perm_7", title: "順列 7", n: 10, r: 3, difficulty: 2 },
  { id: "perm_8", title: "順列 8", n: 11, r: 4, difficulty: 2 },
  { id: "perm_9", title: "順列 9", n: 12, r: 5, difficulty: 3 },
];

export const combiPermutationTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
