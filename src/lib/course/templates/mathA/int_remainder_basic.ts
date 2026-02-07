// src/lib/course/templates/mathA/int_remainder_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type RemKind = "remainder" | "min_ge" | "max_le";

type RemCase = {
  id: string;
  title: string;
  kind: RemKind;
  nums: number[];
};

function answerFor(c: RemCase): number {
  const [n, k, r] = c.nums;
  if (c.kind === "remainder") return n % k;
  if (c.kind === "min_ge") {
    const start = n;
    const mod = start % k;
    const need = (r - mod + k) % k;
    return start + need;
  }
  const max = n;
  const mod = max % k;
  const back = (mod - r + k) % k;
  return max - back;
}

function statementFor(c: RemCase): string {
  const [n, k, r] = c.nums;
  if (c.kind === "remainder") {
    return `$${n}$ を $${k}$ で割ったときの余りを求めよ。`;
  }
  if (c.kind === "min_ge") {
    return `$x \\equiv ${r} \\pmod{${k}}$ かつ $x \\ge ${n}$ を満たす最小の $x$ を求めよ。`;
  }
  return `$x \\equiv ${r} \\pmod{${k}}$ かつ $x \\le ${n}$ を満たす最大の $x$ を求めよ。`;
}

function explainFor(c: RemCase): string {
  const ans = answerFor(c);
  if (c.kind === "remainder") {
    const q = Math.floor(c.nums[0] / c.nums[1]);
    return `
### この問題の解説
$${c.nums[0]} = ${c.nums[1]} \\times ${q} + ${ans}$ なので、余りは $${ans}$ です。
`;
  }
  if (c.kind === "min_ge") {
    return `
### この問題の解説
$x \\equiv ${c.nums[2]} \\pmod{${c.nums[1]}}$ かつ $x \\ge ${c.nums[0]}$ を満たす最小の数は $${ans}$ です。
`;
  }
  return `
### この問題の解説
$x \\equiv ${c.nums[2]} \\pmod{${c.nums[1]}}$ かつ $x \\le ${c.nums[0]}$ を満たす最大の数は $${ans}$ です。
`;
}

function buildTemplate(c: RemCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_remainder_basic",
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

const CASES: RemCase[] = [
  { id: "int_rem_1", title: "余り 17÷5", kind: "remainder", nums: [17, 5, 0] },
  { id: "int_rem_2", title: "余り 29÷6", kind: "remainder", nums: [29, 6, 0] },
  { id: "int_rem_3", title: "余り 45÷8", kind: "remainder", nums: [45, 8, 0] },
  { id: "int_rem_4", title: "余り 73÷9", kind: "remainder", nums: [73, 9, 0] },
  { id: "int_rem_5", title: "余り 100÷7", kind: "remainder", nums: [100, 7, 0] },
  { id: "int_rem_6", title: "余り 84÷5", kind: "remainder", nums: [84, 5, 0] },
  { id: "int_rem_7", title: "余り 58÷4", kind: "remainder", nums: [58, 4, 0] },
  { id: "int_rem_8", title: "余り 121÷11", kind: "remainder", nums: [121, 11, 0] },
  { id: "int_rem_9", title: "余り 67÷10", kind: "remainder", nums: [67, 10, 0] },
  { id: "int_rem_10", title: "余り 95÷12", kind: "remainder", nums: [95, 12, 0] },

  { id: "int_min_ge_1", title: "最小の数 20以上", kind: "min_ge", nums: [20, 6, 1] },
  { id: "int_min_ge_2", title: "最小の数 50以上", kind: "min_ge", nums: [50, 7, 3] },
  { id: "int_min_ge_3", title: "最小の数 30以上", kind: "min_ge", nums: [30, 9, 4] },
  { id: "int_min_ge_4", title: "最小の数 41以上", kind: "min_ge", nums: [41, 5, 2] },
  { id: "int_min_ge_5", title: "最小の数 60以上", kind: "min_ge", nums: [60, 8, 5] },

  { id: "int_max_le_1", title: "最大の数 40以下", kind: "max_le", nums: [40, 6, 1] },
  { id: "int_max_le_2", title: "最大の数 60以下", kind: "max_le", nums: [60, 7, 3] },
  { id: "int_max_le_3", title: "最大の数 80以下", kind: "max_le", nums: [80, 9, 4] },
  { id: "int_max_le_4", title: "最大の数 50以下", kind: "max_le", nums: [50, 5, 2] },
  { id: "int_max_le_5", title: "最大の数 70以下", kind: "max_le", nums: [70, 8, 5] },

  { id: "int_rem_11", title: "余り 143÷12", kind: "remainder", nums: [143, 12, 0] },
  { id: "int_rem_12", title: "余り 88÷7", kind: "remainder", nums: [88, 7, 0] },
  { id: "int_rem_13", title: "余り 156÷13", kind: "remainder", nums: [156, 13, 0] },
  { id: "int_rem_14", title: "余り 217÷9", kind: "remainder", nums: [217, 9, 0] },
  { id: "int_rem_15", title: "余り 305÷11", kind: "remainder", nums: [305, 11, 0] },
  { id: "int_rem_16", title: "余り 98÷6", kind: "remainder", nums: [98, 6, 0] },
  { id: "int_rem_17", title: "余り 77÷8", kind: "remainder", nums: [77, 8, 0] },
  { id: "int_rem_18", title: "余り 65÷4", kind: "remainder", nums: [65, 4, 0] },
  { id: "int_rem_19", title: "余り 142÷15", kind: "remainder", nums: [142, 15, 0] },
  { id: "int_rem_20", title: "余り 256÷14", kind: "remainder", nums: [256, 14, 0] },

  { id: "int_min_ge_6", title: "最小の数 35以上", kind: "min_ge", nums: [35, 7, 1] },
  { id: "int_min_ge_7", title: "最小の数 72以上", kind: "min_ge", nums: [72, 10, 4] },
  { id: "int_min_ge_8", title: "最小の数 91以上", kind: "min_ge", nums: [91, 12, 7] },
  { id: "int_min_ge_9", title: "最小の数 58以上", kind: "min_ge", nums: [58, 9, 5] },
  { id: "int_min_ge_10", title: "最小の数 120以上", kind: "min_ge", nums: [120, 11, 3] },
  { id: "int_min_ge_11", title: "最小の数 43以上", kind: "min_ge", nums: [43, 8, 2] },
  { id: "int_min_ge_12", title: "最小の数 67以上", kind: "min_ge", nums: [67, 6, 4] },
  { id: "int_min_ge_13", title: "最小の数 150以上", kind: "min_ge", nums: [150, 13, 5] },
  { id: "int_min_ge_14", title: "最小の数 99以上", kind: "min_ge", nums: [99, 7, 0] },
  { id: "int_min_ge_15", title: "最小の数 80以上", kind: "min_ge", nums: [80, 9, 8] },

  { id: "int_max_le_6", title: "最大の数 95以下", kind: "max_le", nums: [95, 7, 3] },
  { id: "int_max_le_7", title: "最大の数 120以下", kind: "max_le", nums: [120, 11, 2] },
  { id: "int_max_le_8", title: "最大の数 65以下", kind: "max_le", nums: [65, 8, 1] },
  { id: "int_max_le_9", title: "最大の数 140以下", kind: "max_le", nums: [140, 9, 4] },
  { id: "int_max_le_10", title: "最大の数 200以下", kind: "max_le", nums: [200, 13, 6] },
  { id: "int_max_le_11", title: "最大の数 88以下", kind: "max_le", nums: [88, 6, 5] },
  { id: "int_max_le_12", title: "最大の数 111以下", kind: "max_le", nums: [111, 5, 2] },
  { id: "int_max_le_13", title: "最大の数 160以下", kind: "max_le", nums: [160, 12, 7] },
  { id: "int_max_le_14", title: "最大の数 75以下", kind: "max_le", nums: [75, 4, 3] },
  { id: "int_max_le_15", title: "最大の数 99以下", kind: "max_le", nums: [99, 10, 9] },
];

export const intRemainderTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
