// src/lib/course/templates/math1/trig_ratio_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { texFrac } from "@/lib/format/tex";

type RatioType = "sin" | "cos" | "tan";
type Case = {
  id: string;
  title: string;
  opp: number;
  adj: number;
  hyp: number;
  ratio: RatioType;
};

function ratioValue(c: Case): string {
  if (c.ratio === "sin") return texFrac(c.opp, c.hyp);
  if (c.ratio === "cos") return texFrac(c.adj, c.hyp);
  return texFrac(c.opp, c.adj);
}

function ratioChoices(c: Case): string[] {
  const base = [
    texFrac(c.opp, c.hyp),
    texFrac(c.adj, c.hyp),
    texFrac(c.opp, c.adj),
    texFrac(c.adj, c.opp),
  ];
  return Array.from(new Set(base));
}

function buildTemplate(c: Case): QuestionTemplate {
  const correct = ratioValue(c);
  const choices = ratioChoices(c);
  return {
    meta: {
      id: c.id,
      topicId: "trig_ratio_basic",
      title: c.title,
      difficulty: 1,
      tags: ["trig", c.ratio, "ratio"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `直角三角形で、斜辺=${c.hyp}、隣辺=${c.adj}、対辺=${c.opp} のとき、$\\${c.ratio}\\,A$ を求めよ。`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `### この問題の解説\n$\\sin A=\\dfrac{\\text{対辺}}{\\text{斜辺}}$, $\\cos A=\\dfrac{\\text{隣辺}}{\\text{斜辺}}$, $\\tan A=\\dfrac{\\text{対辺}}{\\text{隣辺}}$。\n答えは **${correct}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_ratio_v1", title: "三角比（別）1", opp: 3, adj: 4, hyp: 5, ratio: "sin" },
  { id: "trig_ratio_v2", title: "三角比（別）2", opp: 3, adj: 4, hyp: 5, ratio: "cos" },
  { id: "trig_ratio_v3", title: "三角比（別）3", opp: 3, adj: 4, hyp: 5, ratio: "tan" },
  { id: "trig_ratio_v4", title: "三角比（別）4", opp: 5, adj: 12, hyp: 13, ratio: "sin" },
  { id: "trig_ratio_v5", title: "三角比（別）5", opp: 5, adj: 12, hyp: 13, ratio: "cos" },
  { id: "trig_ratio_v6", title: "三角比（別）6", opp: 5, adj: 12, hyp: 13, ratio: "tan" },
];

export const trigRatioVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
