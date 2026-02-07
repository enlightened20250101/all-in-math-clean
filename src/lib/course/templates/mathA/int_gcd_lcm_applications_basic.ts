// src/lib/course/templates/mathA/int_gcd_lcm_applications_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type AppKind = "gcd_group" | "lcm_cycle";

type AppCase = {
  id: string;
  title: string;
  kind: AppKind;
  nums: number[];
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function lcm(a: number, b: number): number {
  return Math.abs(a / gcd(a, b) * b);
}

function answerFor(c: AppCase): number {
  const [a, b] = c.nums;
  return c.kind === "gcd_group" ? gcd(a, b) : lcm(a, b);
}

function statementFor(c: AppCase): string {
  const [a, b] = c.nums;
  if (c.kind === "gcd_group") {
    return `$${a}$ 個の赤玉と $${b}$ 個の青玉を、同じ数ずつのセットに分ける。作れる最大のセット数を求めよ。`;
  }
  return `$${a}$ 分ごとと $${b}$ 分ごとに起こる出来事がある。次に同時に起こるのは何分後か。`;
}

function explainFor(c: AppCase): string {
  const ans = answerFor(c);
  if (c.kind === "gcd_group") {
    return `
### この問題の解説
同じ数ずつに分けるときは最大公約数を使います。
$$
\\gcd(${c.nums[0]},${c.nums[1]}) = ${ans}
$$
`;
  }
  return `
### この問題の解説
同時に起こる周期は最小公倍数です。
$$
\\mathrm{lcm}(${c.nums[0]},${c.nums[1]}) = ${ans}
$$
`;
}

function buildTemplate(c: AppCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_gcd_lcm_applications_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", c.kind],
    },
    generate() {
      return {
        templateId: c.id,
        statement: statementFor(c),
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, answerFor(c));
    },
    explain() {
      return explainFor(c);
    },
  };
}

const CASES: AppCase[] = [
  { id: "int_gcdapp_1", title: "gcd 応用 24と36", kind: "gcd_group", nums: [24, 36] },
  { id: "int_gcdapp_2", title: "gcd 応用 30と45", kind: "gcd_group", nums: [30, 45] },
  { id: "int_gcdapp_3", title: "gcd 応用 42と56", kind: "gcd_group", nums: [42, 56] },
  { id: "int_gcdapp_4", title: "gcd 応用 48と60", kind: "gcd_group", nums: [48, 60] },
  { id: "int_gcdapp_5", title: "gcd 応用 54と72", kind: "gcd_group", nums: [54, 72] },
  { id: "int_gcdapp_6", title: "gcd 応用 63と84", kind: "gcd_group", nums: [63, 84] },
  { id: "int_gcdapp_7", title: "gcd 応用 75と90", kind: "gcd_group", nums: [75, 90] },
  { id: "int_gcdapp_8", title: "gcd 応用 80と120", kind: "gcd_group", nums: [80, 120] },
  { id: "int_gcdapp_9", title: "gcd 応用 96と144", kind: "gcd_group", nums: [96, 144] },
  { id: "int_gcdapp_10", title: "gcd 応用 105と140", kind: "gcd_group", nums: [105, 140] },
  { id: "int_gcdapp_11", title: "gcd 応用 18と30", kind: "gcd_group", nums: [18, 30] },
  { id: "int_gcdapp_12", title: "gcd 応用 27と45", kind: "gcd_group", nums: [27, 45] },
  { id: "int_gcdapp_13", title: "gcd 応用 32と48", kind: "gcd_group", nums: [32, 48] },
  { id: "int_gcdapp_14", title: "gcd 応用 36と54", kind: "gcd_group", nums: [36, 54] },
  { id: "int_gcdapp_15", title: "gcd 応用 40と56", kind: "gcd_group", nums: [40, 56] },
  { id: "int_gcdapp_16", title: "gcd 応用 45と60", kind: "gcd_group", nums: [45, 60] },
  { id: "int_gcdapp_17", title: "gcd 応用 50と70", kind: "gcd_group", nums: [50, 70] },
  { id: "int_gcdapp_18", title: "gcd 応用 64と96", kind: "gcd_group", nums: [64, 96] },
  { id: "int_gcdapp_19", title: "gcd 応用 72と90", kind: "gcd_group", nums: [72, 90] },
  { id: "int_gcdapp_20", title: "gcd 応用 84と126", kind: "gcd_group", nums: [84, 126] },
  { id: "int_gcdapp_21", title: "gcd 応用 96と108", kind: "gcd_group", nums: [96, 108] },
  { id: "int_gcdapp_22", title: "gcd 応用 120と168", kind: "gcd_group", nums: [120, 168] },
  { id: "int_gcdapp_23", title: "gcd 応用 132と198", kind: "gcd_group", nums: [132, 198] },
  { id: "int_gcdapp_24", title: "gcd 応用 150と210", kind: "gcd_group", nums: [150, 210] },
  { id: "int_gcdapp_25", title: "gcd 応用 160と240", kind: "gcd_group", nums: [160, 240] },

  { id: "int_lcmapp_1", title: "lcm 応用 6と8", kind: "lcm_cycle", nums: [6, 8] },
  { id: "int_lcmapp_2", title: "lcm 応用 9と12", kind: "lcm_cycle", nums: [9, 12] },
  { id: "int_lcmapp_3", title: "lcm 応用 10と15", kind: "lcm_cycle", nums: [10, 15] },
  { id: "int_lcmapp_4", title: "lcm 応用 12と18", kind: "lcm_cycle", nums: [12, 18] },
  { id: "int_lcmapp_5", title: "lcm 応用 14と21", kind: "lcm_cycle", nums: [14, 21] },
  { id: "int_lcmapp_6", title: "lcm 応用 16と20", kind: "lcm_cycle", nums: [16, 20] },
  { id: "int_lcmapp_7", title: "lcm 応用 18と30", kind: "lcm_cycle", nums: [18, 30] },
  { id: "int_lcmapp_8", title: "lcm 応用 24と36", kind: "lcm_cycle", nums: [24, 36] },
  { id: "int_lcmapp_9", title: "lcm 応用 28と42", kind: "lcm_cycle", nums: [28, 42] },
  { id: "int_lcmapp_10", title: "lcm 応用 32と48", kind: "lcm_cycle", nums: [32, 48] },
  { id: "int_lcmapp_11", title: "lcm 応用 4と6", kind: "lcm_cycle", nums: [4, 6] },
  { id: "int_lcmapp_12", title: "lcm 応用 8と12", kind: "lcm_cycle", nums: [8, 12] },
  { id: "int_lcmapp_13", title: "lcm 応用 12と15", kind: "lcm_cycle", nums: [12, 15] },
  { id: "int_lcmapp_14", title: "lcm 応用 15と20", kind: "lcm_cycle", nums: [15, 20] },
  { id: "int_lcmapp_15", title: "lcm 応用 18と24", kind: "lcm_cycle", nums: [18, 24] },
  { id: "int_lcmapp_16", title: "lcm 応用 21と28", kind: "lcm_cycle", nums: [21, 28] },
  { id: "int_lcmapp_17", title: "lcm 応用 25と40", kind: "lcm_cycle", nums: [25, 40] },
  { id: "int_lcmapp_18", title: "lcm 応用 27と36", kind: "lcm_cycle", nums: [27, 36] },
  { id: "int_lcmapp_19", title: "lcm 応用 30と45", kind: "lcm_cycle", nums: [30, 45] },
  { id: "int_lcmapp_20", title: "lcm 応用 35と42", kind: "lcm_cycle", nums: [35, 42] },
  { id: "int_lcmapp_21", title: "lcm 応用 40と64", kind: "lcm_cycle", nums: [40, 64] },
  { id: "int_lcmapp_22", title: "lcm 応用 44と66", kind: "lcm_cycle", nums: [44, 66] },
  { id: "int_lcmapp_23", title: "lcm 応用 48と72", kind: "lcm_cycle", nums: [48, 72] },
  { id: "int_lcmapp_24", title: "lcm 応用 50と75", kind: "lcm_cycle", nums: [50, 75] },
  { id: "int_lcmapp_25", title: "lcm 応用 54と90", kind: "lcm_cycle", nums: [54, 90] },
];

export const intGcdLcmApplicationsTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
