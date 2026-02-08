// src/lib/course/templates/mathA/int_gcd_lcm_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  context?: string;
  a: number;
  b: number;
  kind: "gcd" | "lcm";
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function buildTemplate(c: Case): QuestionTemplate {
  const value = c.kind === "gcd" ? gcd(c.a, c.b) : lcm(c.a, c.b);
  const label = c.kind === "gcd" ? "最大公約数" : "最小公倍数";
  return {
    meta: {
      id: c.id,
      topicId: "int_gcd_lcm_applications_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", c.kind],
    },
    generate() {
      const lead = c.context ? `${c.context}\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}${c.a} と ${c.b} の${label}を求めよ。`,
        answerKind: "numeric",
        params: { value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { value: number }).value);
    },
    explain(params) {
      const v = (params as { value: number }).value;
      return `### この問題の解説\n答えは **${v}** です。`;
    },
  };
}

const CASES: Case[] = [
  {
    id: "gcd_v1",
    title: "最大公約数 1",
    context: "長さ84cmと60cmのリボンを同じ長さに切るときの最大の長さを考える。",
    a: 84,
    b: 60,
    kind: "gcd",
  },
  {
    id: "gcd_v2",
    title: "最大公約数 2",
    context: "72枚と48枚のカードを同じ枚数に分けるときの最大枚数を求める。",
    a: 72,
    b: 48,
    kind: "gcd",
  },
  {
    id: "lcm_v1",
    title: "最小公倍数 1",
    context: "12分ごとと18分ごとのイベントが同時に起こる最短時間を考える。",
    a: 12,
    b: 18,
    kind: "lcm",
  },
  {
    id: "lcm_v2",
    title: "最小公倍数 2",
    context: "14日周期と35日周期の予定が重なる最短日数を求める。",
    a: 14,
    b: 35,
    kind: "lcm",
  },
];

export const intGcdLcmVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
