// src/lib/course/templates/mathA/combi_conditions_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texComb } from "@/lib/format/tex";

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let res = 1;
  for (let i = 1; i <= k; i += 1) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

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
      topicId: "combi_conditions_basic",
      title: c.title,
      difficulty: 1,
      tags: ["combinatorics", "conditions"],
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
    id: "combi_cond_v1",
    title: "特定の2人を含まない",
    statement: `9人から4人を選ぶ。AさんとBさんを含まない選び方は何通りか。`,
    answer: comb(7, 4),
    explain: `
### この問題の解説
A・Bを除いた7人から4人を選びます。

$$
${texComb(7, 4)} = ${comb(7, 4)}
$$
`,
  },
  {
    id: "combi_cond_v2",
    title: "少なくとも1人を含む（補集合）",
    statement: `10人から5人を選ぶ。AさんまたはBさんの少なくとも1人を含む選び方は何通りか。`,
    answer: comb(10, 5) - comb(8, 5),
    explain: `
### この問題の解説
全体からA・Bを含まない場合を引きます。

$$
${texComb(10, 5)} - ${texComb(8, 5)} = ${comb(10, 5) - comb(8, 5)}
$$
`,
  },
  {
    id: "combi_cond_v3",
    title: "ちょうど2人（男女）",
    statement: `7人（女子3人・男子4人）から4人を選ぶ。女子をちょうど2人含む選び方は何通りか。`,
    answer: comb(3, 2) * comb(4, 2),
    explain: `
### この問題の解説
女子2人、男子2人を選びます。

$$
${texComb(3, 2)}\\cdot${texComb(4, 2)} = ${comb(3, 2) * comb(4, 2)}
$$
`,
  },
  {
    id: "combi_cond_v4",
    title: "少なくとも2人（指定集合）",
    statement: `8人（A,B,C,D,E,F,G,H）から4人を選ぶ。A,B,Cの中から少なくとも2人を含む選び方は何通りか。`,
    answer: comb(3, 2) * comb(5, 2) + comb(3, 3) * comb(5, 1),
    explain: `
### この問題の解説
「2人含む」と「3人含む」で場合分けします。

$$
${texComb(3, 2)}\\cdot${texComb(5, 2)} + ${texComb(3, 3)}\\cdot${texComb(5, 1)}
$$
`,
  },
  {
    id: "combi_cond_v5",
    title: "少なくとも1人（チーム分け）",
    statement: `6人（赤チーム2人・青チーム4人）から3人を選ぶ。赤チームの人を少なくとも1人含む選び方は何通りか。`,
    answer: comb(6, 3) - comb(4, 3),
    explain: `
### この問題の解説
全体から赤チームを含まない場合を引きます。

$$
${texComb(6, 3)} - ${texComb(4, 3)} = ${comb(6, 3) - comb(4, 3)}
$$
`,
  },
];

export const combiConditionsVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
