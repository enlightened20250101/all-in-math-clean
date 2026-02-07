// src/lib/course/templates/mathA/combi_conditions_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texComb, texPerm } from "@/lib/format/tex";

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let res = 1;
  for (let i = 1; i <= k; i += 1) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

function perm(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let res = 1;
  for (let i = 0; i < k; i += 1) {
    res *= n - i;
  }
  return res;
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
    id: "combi_cond_include_1",
    title: "特定の1人を含む",
    statement: `7人から3人を選ぶ。Aさんを必ず含むとき、選び方は何通りか。`,
    answer: comb(6, 2),
    explain: `
### この問題の解説
Aさんを含むので、残り6人から2人を選びます。

$$
${texComb(6, 2)} = ${comb(6, 2)}
$$
`,
  },
  {
    id: "combi_cond_exclude_1",
    title: "特定の1人を含まない",
    statement: `8人から4人を選ぶ。Bさんを含まないとき、選び方は何通りか。`,
    answer: comb(7, 4),
    explain: `
### この問題の解説
Bさんを除いた7人から4人を選びます。

$$
${texComb(7, 4)} = ${comb(7, 4)}
$$
`,
  },
  {
    id: "combi_cond_include_2",
    title: "2人を必ず含む",
    statement: `9人から4人を選ぶ。AさんとBさんを必ず含むとき、選び方は何通りか。`,
    answer: comb(7, 2),
    explain: `
### この問題の解説
AさんとBさんを固定し、残り7人から2人を選びます。

$$
${texComb(7, 2)} = ${comb(7, 2)}
$$
`,
  },
  {
    id: "combi_cond_atleast_1",
    title: "少なくとも1人を含む",
    statement: `8人から3人を選ぶ。AさんまたはBさんの少なくとも1人を含む選び方は何通りか。`,
    answer: comb(8, 3) - comb(6, 3),
    explain: `
### この問題の解説
全体からA・Bを含まない場合を引きます。

$$
${texComb(8, 3)} - ${texComb(6, 3)} = ${comb(8, 3)} - ${comb(6, 3)} = ${comb(8, 3) - comb(6, 3)}
$$
`,
  },
  {
    id: "combi_cond_exact_1",
    title: "ちょうど1人を含む",
    statement: `6人（男子4人・女子2人）から3人を選ぶ。女子をちょうど1人含む選び方は何通りか。`,
    answer: comb(2, 1) * comb(4, 2),
    explain: `
### この問題の解説
女子1人、男子2人を選びます。

$$
${texComb(2, 1)}\\cdot${texComb(4, 2)} = ${comb(2, 1)}\\cdot${comb(4, 2)} = ${comb(2, 1) * comb(4, 2)}
$$
`,
  },
  {
    id: "combi_cond_exact_2",
    title: "ちょうど2人を含む",
    statement: `9人（赤チーム5人・青チーム4人）から4人を選ぶ。赤チームをちょうど2人含む選び方は何通りか。`,
    answer: comb(5, 2) * comb(4, 2),
    explain: `
### この問題の解説
赤2人、青2人を選びます。

$$
${texComb(5, 2)}\\cdot${texComb(4, 2)} = ${comb(5, 2)}\\cdot${comb(4, 2)} = ${comb(5, 2) * comb(4, 2)}
$$
`,
  },
  {
    id: "combi_cond_atleast_2",
    title: "少なくとも2人",
    statement: `7人（A,B,C,D,E,F,G）から4人を選ぶ。A,B,Cの中から少なくとも2人を含む選び方は何通りか。`,
    answer: comb(3, 2) * comb(4, 2) + comb(3, 3) * comb(4, 1),
    explain: `
### この問題の解説
「2人含む」と「3人含む」で場合分けします。

$$
${texComb(3, 2)}\\cdot${texComb(4, 2)} + ${texComb(3, 3)}\\cdot${texComb(4, 1)}
$$
`,
  },
  {
    id: "combi_cond_not_1",
    title: "含まない（補集合）",
    statement: `10人から5人を選ぶ。Aさんを含まない選び方は何通りか。`,
    answer: comb(9, 5),
    explain: `
### この問題の解説
Aさんを除いた9人から5人を選びます。

$$
${texComb(9, 5)} = ${comb(9, 5)}
$$
`,
  },
  {
    id: "combi_cond_cases_1",
    title: "場合分け（2通り）",
    statement: `8人（女子3人・男子5人）から3人を選ぶ。女子が1人以上含まれる選び方は何通りか。`,
    answer: comb(3, 1) * comb(5, 2) + comb(3, 2) * comb(5, 1) + comb(3, 3),
    explain: `
### この問題の解説
女子1人・2人・3人で分けます。

$$
${texComb(3, 1)}${texComb(5, 2)} + ${texComb(3, 2)}${texComb(5, 1)} + ${texComb(3, 3)}
$$
`,
  },
  {
    id: "combi_cond_perm_1",
    title: "並べ方（順列）",
    statement: `1〜5の数字から重複なく3桁の整数を作るとき、何通りあるか。`,
    answer: perm(5, 3),
    explain: `
### この問題の解説
順序を区別するので順列です。

$$
${texPerm(5, 3)} = ${perm(5, 3)}
$$
`,
  },
  {
    id: "combi_cond_perm_2",
    title: "並べ方（先頭条件）",
    statement: `A,B,C,D,E,F の6文字から重複なく3文字を並べる。先頭がAである並べ方は何通りか。`,
    answer: perm(5, 2),
    explain: `
### この問題の解説
先頭をAで固定し、残り5文字から2文字を並べます。

$$
${texPerm(5, 2)} = ${perm(5, 2)}
$$
`,
  },
  {
    id: "combi_cond_include_3",
    title: "2人のうち1人以上",
    statement: `9人から4人を選ぶ。AさんまたはBさんを少なくとも1人含む選び方は何通りか。`,
    answer: comb(9, 4) - comb(7, 4),
    explain: `
### この問題の解説
全体からA,Bを含まない場合を引きます。

$$
${texComb(9, 4)} - ${texComb(7, 4)} = ${comb(9, 4) - comb(7, 4)}
$$
`,
  },
  {
    id: "combi_cond_exact_3",
    title: "ちょうど1人を含む",
    statement: `7人（赤3人・青4人）から3人を選ぶ。赤をちょうど1人含む選び方は何通りか。`,
    answer: comb(3, 1) * comb(4, 2),
    explain: `
### この問題の解説
赤1人、青2人を選びます。

$$
${texComb(3, 1)}\\cdot${texComb(4, 2)} = ${comb(3, 1) * comb(4, 2)}
$$
`,
  },
  {
    id: "combi_cond_exact_4",
    title: "ちょうど2人を含む",
    statement: `8人（女子5人・男子3人）から4人を選ぶ。男子をちょうど2人含む選び方は何通りか。`,
    answer: comb(3, 2) * comb(5, 2),
    explain: `
### この問題の解説
男子2人、女子2人を選びます。

$$
${texComb(3, 2)}\\cdot${texComb(5, 2)} = ${comb(3, 2) * comb(5, 2)}
$$
`,
  },
  {
    id: "combi_cond_atleast_3",
    title: "少なくとも1人",
    statement: `6人から3人を選ぶ。A,B,Cの中から少なくとも1人を含む選び方は何通りか。`,
    answer: comb(6, 3) - comb(3, 3),
    explain: `
### この問題の解説
A,B,Cを含まないのは残り3人だけから3人を選ぶ場合です。

$$
${texComb(6, 3)} - ${texComb(3, 3)} = ${comb(6, 3) - comb(3, 3)}
$$
`,
  },
  {
    id: "combi_cond_cases_2",
    title: "場合分け（女子の人数）",
    statement: `10人（女子4人・男子6人）から4人を選ぶ。女子が1人以上含まれる選び方は何通りか。`,
    answer: comb(4, 1) * comb(6, 3) + comb(4, 2) * comb(6, 2) + comb(4, 3) * comb(6, 1) + comb(4, 4),
    explain: `
### この問題の解説
女子1〜4人で場合分けします。

$$
${texComb(4, 1)}${texComb(6, 3)} + ${texComb(4, 2)}${texComb(6, 2)} + ${texComb(4, 3)}${texComb(6, 1)} + ${texComb(4, 4)}
$$
`,
  },
  {
    id: "combi_cond_not_2",
    title: "含まない（複数）",
    statement: `9人から4人を選ぶ。AさんとBさんを両方とも含まない選び方は何通りか。`,
    answer: comb(7, 4),
    explain: `
### この問題の解説
A,Bを除いた7人から4人を選びます。

$$
${texComb(7, 4)} = ${comb(7, 4)}
$$
`,
  },
  {
    id: "combi_cond_include_4",
    title: "必ず含む（2人）",
    statement: `11人から5人を選ぶ。AさんとBさんを必ず含む選び方は何通りか。`,
    answer: comb(9, 3),
    explain: `
### この問題の解説
A,Bを固定し、残り9人から3人を選びます。

$$
${texComb(9, 3)} = ${comb(9, 3)}
$$
`,
  },
  {
    id: "combi_cond_perm_3",
    title: "並べ方（4桁）",
    statement: `0,1,2,3,4,5 の6つの数字から重複なく4桁の整数を作る（先頭は0不可）。何通りあるか。`,
    answer: 5 * perm(5, 3),
    explain: `
### この問題の解説
先頭は1〜5の5通り。残り3桁は5P3通り。

$$
5\\times${texPerm(5, 3)} = ${5 * perm(5, 3)}
$$
`,
  },
  {
    id: "combi_cond_perm_4",
    title: "並べ方（Aを先頭に含む）",
    statement: `A,B,C,D,E の5文字から重複なく3文字を並べる。Aを含み、かつ先頭がAである並べ方は何通りか。`,
    answer: perm(4, 2),
    explain: `
### この問題の解説
先頭をAで固定し、残り4文字から2文字を並べます。

$$
${texPerm(4, 2)} = ${perm(4, 2)}
$$
`,
  },
  {
    id: "combi_cond_exact_5",
    title: "ちょうど1人（補集合）",
    statement: `8人（女子3人・男子5人）から4人を選ぶ。女子をちょうど1人含む選び方は何通りか。`,
    answer: comb(3, 1) * comb(5, 3),
    explain: `
### この問題の解説
女子1人、男子3人を選びます。

$$
${texComb(3, 1)}\\cdot${texComb(5, 3)} = ${comb(3, 1) * comb(5, 3)}
$$
`,
  },
  {
    id: "combi_cond_cases_3",
    title: "赤青の人数で場合分け",
    statement: `7人（赤チーム2人・青チーム5人）から3人を選ぶ。赤チームが1人以上含まれる選び方は何通りか。`,
    answer: comb(2, 1) * comb(5, 2) + comb(2, 2) * comb(5, 1),
    explain: `
### この問題の解説
赤1人と赤2人の場合で数えます。

$$
${texComb(2, 1)}${texComb(5, 2)} + ${texComb(2, 2)}${texComb(5, 1)}
$$
`,
  },
  {
    id: "combi_cond_include_5",
    title: "特定の1人を含む（人数多め）",
    statement: `12人から5人を選ぶ。Aさんを必ず含むとき、選び方は何通りか。`,
    answer: comb(11, 4),
    explain: `
### この問題の解説
Aさんを含むので、残り11人から4人を選びます。

$$
${texComb(11, 4)} = ${comb(11, 4)}
$$
`,
  },
  {
    id: "combi_cond_exclude_2",
    title: "2人を含まない",
    statement: `10人から4人を選ぶ。AさんとBさんを含まないとき、選び方は何通りか。`,
    answer: comb(8, 4),
    explain: `
### この問題の解説
A,Bを除いた8人から4人を選びます。

$$
${texComb(8, 4)} = ${comb(8, 4)}
$$
`,
  },
  {
    id: "combi_cond_exact_6",
    title: "女子をちょうど2人",
    statement: `9人（女子4人・男子5人）から5人を選ぶ。女子をちょうど2人含む選び方は何通りか。`,
    answer: comb(4, 2) * comb(5, 3),
    explain: `
### この問題の解説
女子2人、男子3人を選びます。

$$
${texComb(4, 2)}\\cdot${texComb(5, 3)} = ${comb(4, 2) * comb(5, 3)}
$$
`,
  },
  {
    id: "combi_cond_atleast_4",
    title: "3人のうち少なくとも2人",
    statement: `8人から4人を選ぶ。A,B,Cの中から少なくとも2人を含む選び方は何通りか。`,
    answer: comb(3, 2) * comb(5, 2) + comb(3, 3) * comb(5, 1),
    explain: `
### この問題の解説
「2人含む」「3人含む」で数えます。

$$
${texComb(3, 2)}${texComb(5, 2)} + ${texComb(3, 3)}${texComb(5, 1)}
$$
`,
  },
  {
    id: "combi_cond_perm_5",
    title: "0を必ず含む並べ方",
    statement: `0〜6の7つの数字から重複なく4桁の整数を作る（先頭は0不可）。0を必ず含むとき、何通りあるか。`,
    answer: 3 * perm(6, 3),
    explain: `
### この問題の解説
0の位置は3通り。残り3桁は6P3通り。

$$
3\\times${texPerm(6, 3)} = ${3 * perm(6, 3)}
$$
`,
  },
  {
    id: "combi_cond_exact_7",
    title: "A,Bのうちちょうど1人",
    statement: `8人から3人を選ぶ。AさんとBさんのうちちょうど1人を含む選び方は何通りか。`,
    answer: comb(2, 1) * comb(6, 2),
    explain: `
### この問題の解説
A,Bのどちらか1人を選び、残り6人から2人を選びます。

$$
${texComb(2, 1)}\\cdot${texComb(6, 2)} = ${comb(2, 1) * comb(6, 2)}
$$
`,
  },
  {
    id: "combi_cond_atleast_5",
    title: "特定グループを1人以上",
    statement: `10人から4人を選ぶ。A,B,C,Dの中から少なくとも1人を含む選び方は何通りか。`,
    answer: comb(10, 4) - comb(6, 4),
    explain: `
### この問題の解説
全体からA〜Dを含まない場合を引きます。

$$
${texComb(10, 4)} - ${texComb(6, 4)} = ${comb(10, 4) - comb(6, 4)}
$$
`,
  },
  {
    id: "combi_cond_include_6",
    title: "2人を含み1人を含まない",
    statement: `10人から5人を選ぶ。AさんとBさんを必ず含み、Cさんは含まないとき、選び方は何通りか。`,
    answer: comb(7, 3),
    explain: `
### この問題の解説
A,Bを固定し、Cを除いた7人から3人を選びます。

$$
${texComb(7, 3)} = ${comb(7, 3)}
$$
`,
  },
  {
    id: "combi_cond_perm_6",
    title: "Aを含む並べ方",
    statement: `A,B,C,D,E の5文字から重複なく3文字を並べる。Aを必ず含む並べ方は何通りか。`,
    answer: perm(5, 3) - perm(4, 3),
    explain: `
### この問題の解説
全体からAを含まない並べ方を引きます。

$$
${texPerm(5, 3)} - ${texPerm(4, 3)} = ${perm(5, 3) - perm(4, 3)}
$$
`,
  },
  {
    id: "combi_cond_not_3",
    title: "特定3人を含まない",
    statement: `8人から4人を選ぶ。A,B,Cを含まない選び方は何通りか。`,
    answer: comb(5, 4),
    explain: `
### この問題の解説
A,B,Cを除いた5人から4人を選びます。

$$
${texComb(5, 4)} = ${comb(5, 4)}
$$
`,
  },
  {
    id: "combi_cond_cases_4",
    title: "女子が2人以上",
    statement: `10人（女子4人・男子6人）から4人を選ぶ。女子が2人以上含まれる選び方は何通りか。`,
    answer: comb(4, 2) * comb(6, 2) + comb(4, 3) * comb(6, 1) + comb(4, 4),
    explain: `
### この問題の解説
女子2人・3人・4人で場合分けします。

$$
${texComb(4, 2)}${texComb(6, 2)} + ${texComb(4, 3)}${texComb(6, 1)} + ${texComb(4, 4)}
$$
`,
  },
  {
    id: "combi_cond_include_7",
    title: "特定の2人を含む",
    statement: `12人から5人を選ぶ。AさんとBさんを必ず含むとき、選び方は何通りか。`,
    answer: comb(10, 3),
    explain: `
### この問題の解説
A,Bを固定し、残り10人から3人を選びます。

$$
${texComb(10, 3)} = ${comb(10, 3)}
$$
`,
  },
  {
    id: "combi_cond_exact_8",
    title: "女子をちょうど1人",
    statement: `8人（女子3人・男子5人）から3人を選ぶ。女子をちょうど1人含む選び方は何通りか。`,
    answer: comb(3, 1) * comb(5, 2),
    explain: `
### この問題の解説
女子1人、男子2人を選びます。

$$
${texComb(3, 1)}\\cdot${texComb(5, 2)} = ${comb(3, 1) * comb(5, 2)}
$$
`,
  },
  {
    id: "combi_cond_atleast_6",
    title: "特定2人のうち1人以上",
    statement: `9人から4人を選ぶ。AさんとBさんのうち少なくとも1人を含む選び方は何通りか。`,
    answer: comb(9, 4) - comb(7, 4),
    explain: `
### この問題の解説
全体からA,Bを含まない場合を引きます。

$$
${texComb(9, 4)} - ${texComb(7, 4)} = ${comb(9, 4) - comb(7, 4)}
$$
`,
  },
  {
    id: "combi_cond_not_4",
    title: "特定1人を含まない（人数多め）",
    statement: `11人から4人を選ぶ。Aさんを含まない選び方は何通りか。`,
    answer: comb(10, 4),
    explain: `
### この問題の解説
Aさんを除いた10人から4人を選びます。

$$
${texComb(10, 4)} = ${comb(10, 4)}
$$
`,
  },
  {
    id: "combi_cond_perm_7",
    title: "並べ方（2文字を含む）",
    statement: `A,B,C,D,E の5文字から重複なく3文字を並べる。AとBを必ず含む並べ方は何通りか。`,
    answer: 18,
    explain: `
### この問題の解説
A,Bを含む3文字の並べ方なので、残り1文字を3通りで選び、並べ方は $3!$ です。

$$
3\\times 3! = 3\\times 6 = 18
$$
`,
  },
  {
    id: "combi_cond_cases_5",
    title: "男子が2人以上",
    statement: `9人（男子5人・女子4人）から4人を選ぶ。男子が2人以上含まれる選び方は何通りか。`,
    answer: comb(5, 2) * comb(4, 2) + comb(5, 3) * comb(4, 1) + comb(5, 4),
    explain: `
### この問題の解説
男子2人・3人・4人で場合分けします。

$$
${texComb(5, 2)}${texComb(4, 2)} + ${texComb(5, 3)}${texComb(4, 1)} + ${texComb(5, 4)}
$$
`,
  },
  {
    id: "combi_cond_perm_8",
    title: "並べ方（Aを含まない）",
    statement: `A,B,C,D,E,F の6文字から重複なく4文字を並べる。Aを含まない並べ方は何通りか。`,
    answer: perm(5, 4),
    explain: `
### この問題の解説
Aを除いた5文字から4文字を並べます。

$$
${texPerm(5, 4)} = ${perm(5, 4)}
$$
`,
  },
  {
    id: "combi_cond_include_8",
    title: "特定の1人を含む（人数多め2）",
    statement: `13人から6人を選ぶ。Aさんを必ず含むとき、選び方は何通りか。`,
    answer: comb(12, 5),
    explain: `
### この問題の解説
Aさんを含むので、残り12人から5人を選びます。

$$
${texComb(12, 5)} = ${comb(12, 5)}
$$
`,
  },
  {
    id: "combi_cond_exclude_3",
    title: "2人を含まない（人数多め）",
    statement: `12人から5人を選ぶ。AさんとBさんを含まないとき、選び方は何通りか。`,
    answer: comb(10, 5),
    explain: `
### この問題の解説
A,Bを除いた10人から5人を選びます。

$$
${texComb(10, 5)} = ${comb(10, 5)}
$$
`,
  },
  {
    id: "combi_cond_exact_9",
    title: "女子をちょうど2人（男女同数）",
    statement: `10人（女子5人・男子5人）から4人を選ぶ。女子をちょうど2人含む選び方は何通りか。`,
    answer: comb(5, 2) * comb(5, 2),
    explain: `
### この問題の解説
女子2人、男子2人を選びます。

$$
${texComb(5, 2)}\\cdot${texComb(5, 2)} = ${comb(5, 2) * comb(5, 2)}
$$
`,
  },
  {
    id: "combi_cond_atleast_7",
    title: "特定3人のうち1人以上",
    statement: `9人から4人を選ぶ。A,B,Cの中から少なくとも1人を含む選び方は何通りか。`,
    answer: comb(9, 4) - comb(6, 4),
    explain: `
### この問題の解説
全体からA,B,Cを含まない場合を引きます。

$$
${texComb(9, 4)} - ${texComb(6, 4)} = ${comb(9, 4) - comb(6, 4)}
$$
`,
  },
  {
    id: "combi_cond_atleast_8",
    title: "特定3人のうち2人以上",
    statement: `8人から3人を選ぶ。A,B,Cの中から少なくとも2人を含む選び方は何通りか。`,
    answer: comb(3, 2) * comb(5, 1) + comb(3, 3),
    explain: `
### この問題の解説
2人含む場合と3人含む場合を足します。

$$
${texComb(3, 2)}${texComb(5, 1)} + ${texComb(3, 3)}
$$
`,
  },
  {
    id: "combi_cond_include_9",
    title: "2人を含み1人を含まない（人数多め）",
    statement: `9人から4人を選ぶ。AさんとBさんを必ず含み、Cさんは含まないとき、選び方は何通りか。`,
    answer: comb(6, 2),
    explain: `
### この問題の解説
A,Bを固定し、Cを除いた6人から2人を選びます。

$$
${texComb(6, 2)} = ${comb(6, 2)}
$$
`,
  },
  {
    id: "combi_cond_perm_9",
    title: "並べ方（先頭固定）",
    statement: `A,B,C,D,E,F の6文字から重複なく4文字を並べる。先頭がAである並べ方は何通りか。`,
    answer: perm(5, 3),
    explain: `
### この問題の解説
先頭をAで固定し、残り5文字から3文字を並べます。

$$
${texPerm(5, 3)} = ${perm(5, 3)}
$$
`,
  },
  {
    id: "combi_cond_perm_10",
    title: "並べ方（特定の文字を含む）",
    statement: `1,2,3,4,5,6 の6つの数字から重複なく3桁の整数を作る。1を必ず含むとき、何通りあるか。`,
    answer: perm(6, 3) - perm(5, 3),
    explain: `
### この問題の解説
全体から1を含まない場合を引きます。

$$
${texPerm(6, 3)} - ${texPerm(5, 3)} = ${perm(6, 3) - perm(5, 3)}
$$
`,
  },
  {
    id: "combi_cond_not_5",
    title: "特定3人を含まない（小規模）",
    statement: `8人から3人を選ぶ。A,B,Cを含まない選び方は何通りか。`,
    answer: comb(5, 3),
    explain: `
### この問題の解説
A,B,Cを除いた5人から3人を選びます。

$$
${texComb(5, 3)} = ${comb(5, 3)}
$$
`,
  },
  {
    id: "combi_cond_cases_6",
    title: "女子がちょうど3人",
    statement: `11人（女子5人・男子6人）から5人を選ぶ。女子がちょうど3人含まれる選び方は何通りか。`,
    answer: comb(5, 3) * comb(6, 2),
    explain: `
### この問題の解説
女子3人、男子2人を選びます。

$$
${texComb(5, 3)}${texComb(6, 2)} = ${comb(5, 3) * comb(6, 2)}
$$
`,
  },
];

export const combiConditionsTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
