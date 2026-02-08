// src/lib/course/templates/mathA/int_divisor_multiple_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type CaseKind =
  | "divisor_count"
  | "gcd"
  | "lcm"
  | "lcm_three"
  | "max_multiple"
  | "min_multiple_at_least";

type Case = {
  id: string;
  title: string;
  kind: CaseKind;
  nums: number[];
  context?: string;
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

function lcmThree(a: number, b: number, c: number): number {
  return lcm(lcm(a, b), c);
}

function divisorCount(n: number): number {
  let count = 0;
  for (let i = 1; i * i <= n; i += 1) {
    if (n % i === 0) {
      count += i * i === n ? 1 : 2;
    }
  }
  return count;
}

function answerFor(c: Case): number {
  if (c.kind === "divisor_count") return divisorCount(c.nums[0]);
  if (c.kind === "gcd") return gcd(c.nums[0], c.nums[1]);
  if (c.kind === "lcm") return lcm(c.nums[0], c.nums[1]);
  if (c.kind === "lcm_three") return lcmThree(c.nums[0], c.nums[1], c.nums[2]);
  if (c.kind === "max_multiple") {
    const [k, n] = c.nums;
    return Math.floor(n / k) * k;
  }
  const [k, n] = c.nums;
  return Math.ceil(n / k) * k;
}

function statementFor(c: Case): string {
  const [a, b, d] = c.nums;
  const lead = c.context ? `${c.context}\n` : "";
  if (c.kind === "divisor_count") {
    return `${lead}次の数の正の約数の個数を求めよ。\n\n数: $${a}$`;
  }
  if (c.kind === "gcd") {
    return `${lead}$\\gcd(${a},${b})$ を求めよ。`;
  }
  if (c.kind === "lcm") {
    return `${lead}$\\mathrm{lcm}(${a},${b})$ を求めよ。`;
  }
  if (c.kind === "lcm_three") {
    return `${lead}$\\mathrm{lcm}(${a},${b},${d})$ を求めよ。`;
  }
  if (c.kind === "max_multiple") {
    return `${lead}$${b}$ 以下で $${a}$ の倍数となる最大の整数を求めよ。`;
  }
  return `${lead}$${b}$ 以上で $${a}$ の倍数となる最小の整数を求めよ。`;
}

function explainFor(c: Case): string {
  const ans = answerFor(c);
  if (c.kind === "divisor_count") {
    return `
### この問題の解説
$${c.nums[0]}$ の正の約数の個数は $${ans}$ 個です。
`;
  }
  if (c.kind === "gcd") {
    return `
### この問題の解説
$\\gcd(${c.nums[0]},${c.nums[1]}) = ${ans}$ です。
`;
  }
  if (c.kind === "lcm" || c.kind === "lcm_three") {
    return `
### この問題の解説
共通の倍数のうち最小は $${ans}$ です。
`;
  }
  if (c.kind === "max_multiple") {
    return `
### この問題の解説
$${c.nums[1]}$ 以下の $${c.nums[0]}$ の倍数は $${ans}$ が最大です。
`;
  }
  return `
### この問題の解説
$${c.nums[1]}$ 以上の $${c.nums[0]}$ の倍数は $${ans}$ が最小です。
`;
}

function buildTemplate(c: Case): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_divisor_multiple_basic",
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

const CASES: Case[] = [
  {
    id: "int_div_count_1",
    title: "約数の個数 12",
    kind: "divisor_count",
    nums: [12],
    context: "12個を割り切れる数の個数を数える。",
  },
  {
    id: "int_div_count_2",
    title: "約数の個数 18",
    kind: "divisor_count",
    nums: [18],
    context: "18枚を同じ枚数に分けるときの分け方を数える。",
  },
  {
    id: "int_div_count_3",
    title: "約数の個数 20",
    kind: "divisor_count",
    nums: [20],
    context: "20個を等分できる個数の数を調べる。",
  },
  {
    id: "int_div_count_4",
    title: "約数の個数 24",
    kind: "divisor_count",
    nums: [24],
    context: "24を割り切る正の整数の個数を求める。",
  },
  { id: "int_div_count_5", title: "約数の個数 36", kind: "divisor_count", nums: [36] },
  { id: "int_div_count_6", title: "約数の個数 48", kind: "divisor_count", nums: [48] },
  { id: "int_div_count_7", title: "約数の個数 60", kind: "divisor_count", nums: [60] },
  { id: "int_div_count_8", title: "約数の個数 72", kind: "divisor_count", nums: [72] },

  {
    id: "int_gcd_1",
    title: "最大公約数 24と36",
    kind: "gcd",
    nums: [24, 36],
    context: "24cmと36cmのリボンを同じ長さに切るときの最大長を考える。",
  },
  {
    id: "int_gcd_2",
    title: "最大公約数 45と60",
    kind: "gcd",
    nums: [45, 60],
    context: "45枚と60枚のカードを同じ枚数に分けるときの最大枚数を考える。",
  },
  {
    id: "int_gcd_3",
    title: "最大公約数 84と70",
    kind: "gcd",
    nums: [84, 70],
    context: "84個と70個を等分できる最大の数を考える。",
  },
  {
    id: "int_gcd_4",
    title: "最大公約数 96と64",
    kind: "gcd",
    nums: [96, 64],
    context: "96cmと64cmの棒を同じ長さに切るときの最大長を求める。",
  },
  { id: "int_gcd_5", title: "最大公約数 75と105", kind: "gcd", nums: [75, 105] },
  { id: "int_gcd_6", title: "最大公約数 54と24", kind: "gcd", nums: [54, 24] },

  {
    id: "int_lcm_1",
    title: "最小公倍数 6と8",
    kind: "lcm",
    nums: [6, 8],
    context: "6分と8分の周期が同時に重なる最短時間を考える。",
  },
  {
    id: "int_lcm_2",
    title: "最小公倍数 9と12",
    kind: "lcm",
    nums: [9, 12],
    context: "9日と12日の周期が重なる最短日数を求める。",
  },
  {
    id: "int_lcm_3",
    title: "最小公倍数 10と15",
    kind: "lcm",
    nums: [10, 15],
    context: "10分ごとと15分ごとのイベントが同時に起こる最短時間を求める。",
  },
  {
    id: "int_lcm_4",
    title: "最小公倍数 12と18",
    kind: "lcm",
    nums: [12, 18],
    context: "12日周期と18日周期が重なる最短日数を求める。",
  },
  { id: "int_lcm_5", title: "最小公倍数 14と20", kind: "lcm", nums: [14, 20] },
  { id: "int_lcm_6", title: "最小公倍数 16と24", kind: "lcm", nums: [16, 24] },

  { id: "int_lcm_7", title: "最小公倍数 3,4,5", kind: "lcm_three", nums: [3, 4, 5] },
  { id: "int_lcm_8", title: "最小公倍数 4,6,9", kind: "lcm_three", nums: [4, 6, 9] },

  {
    id: "int_max_mul_1",
    title: "最大の倍数 7",
    kind: "max_multiple",
    nums: [7, 100],
    context: "100円以内で買える7円の商品を最大何円分買えるか考える。",
  },
  {
    id: "int_max_mul_2",
    title: "最大の倍数 12",
    kind: "max_multiple",
    nums: [12, 100],
    context: "100以内で12の倍数となる最大の数を求める。",
  },
  {
    id: "int_max_mul_3",
    title: "最大の倍数 9",
    kind: "max_multiple",
    nums: [9, 80],
    context: "80以下で9の倍数となる最大の数を求める。",
  },

  {
    id: "int_min_mul_1",
    title: "最小の倍数 8",
    kind: "min_multiple_at_least",
    nums: [8, 50],
    context: "50以上で8の倍数となる最小の数を探す。",
  },
  {
    id: "int_min_mul_2",
    title: "最小の倍数 6",
    kind: "min_multiple_at_least",
    nums: [6, 35],
    context: "35以上で6の倍数となる最小の数を求める。",
  },

  { id: "int_div_count_9", title: "約数の個数 84", kind: "divisor_count", nums: [84] },
  { id: "int_div_count_10", title: "約数の個数 90", kind: "divisor_count", nums: [90] },
  { id: "int_div_count_11", title: "約数の個数 96", kind: "divisor_count", nums: [96] },
  { id: "int_div_count_12", title: "約数の個数 108", kind: "divisor_count", nums: [108] },
  { id: "int_div_count_13", title: "約数の個数 120", kind: "divisor_count", nums: [120] },
  { id: "int_div_count_14", title: "約数の個数 144", kind: "divisor_count", nums: [144] },

  { id: "int_gcd_7", title: "最大公約数 18と30", kind: "gcd", nums: [18, 30] },
  { id: "int_gcd_8", title: "最大公約数 28と42", kind: "gcd", nums: [28, 42] },
  { id: "int_gcd_9", title: "最大公約数 36と48", kind: "gcd", nums: [36, 48] },
  { id: "int_gcd_10", title: "最大公約数 56と84", kind: "gcd", nums: [56, 84] },
  { id: "int_gcd_11", title: "最大公約数 66と99", kind: "gcd", nums: [66, 99] },
  { id: "int_gcd_12", title: "最大公約数 70と98", kind: "gcd", nums: [70, 98] },

  { id: "int_lcm_7", title: "最小公倍数 8と12", kind: "lcm", nums: [8, 12] },
  { id: "int_lcm_8", title: "最小公倍数 12と16", kind: "lcm", nums: [12, 16] },
  { id: "int_lcm_9", title: "最小公倍数 15と20", kind: "lcm", nums: [15, 20] },
  { id: "int_lcm_10", title: "最小公倍数 18と24", kind: "lcm", nums: [18, 24] },
  { id: "int_lcm_11", title: "最小公倍数 21と28", kind: "lcm", nums: [21, 28] },
  { id: "int_lcm_12", title: "最小公倍数 30と45", kind: "lcm", nums: [30, 45] },

  { id: "int_lcm_9_three", title: "最小公倍数 2,3,8", kind: "lcm_three", nums: [2, 3, 8] },
  { id: "int_lcm_10_three", title: "最小公倍数 3,5,6", kind: "lcm_three", nums: [3, 5, 6] },
  { id: "int_lcm_11_three", title: "最小公倍数 4,6,10", kind: "lcm_three", nums: [4, 6, 10] },
  { id: "int_lcm_12_three", title: "最小公倍数 6,8,9", kind: "lcm_three", nums: [6, 8, 9] },

  { id: "int_max_mul_4", title: "最大の倍数 11", kind: "max_multiple", nums: [11, 150] },
  { id: "int_max_mul_5", title: "最大の倍数 13", kind: "max_multiple", nums: [13, 120] },
  { id: "int_max_mul_6", title: "最大の倍数 15", kind: "max_multiple", nums: [15, 200] },
  { id: "int_max_mul_7", title: "最大の倍数 18", kind: "max_multiple", nums: [18, 170] },

  { id: "int_min_mul_3", title: "最小の倍数 7", kind: "min_multiple_at_least", nums: [7, 120] },
  { id: "int_min_mul_4", title: "最小の倍数 9", kind: "min_multiple_at_least", nums: [9, 95] },
  { id: "int_min_mul_5", title: "最小の倍数 11", kind: "min_multiple_at_least", nums: [11, 140] },
  { id: "int_min_mul_6", title: "最小の倍数 14", kind: "min_multiple_at_least", nums: [14, 155] },
];

export const intDivisorMultipleTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
