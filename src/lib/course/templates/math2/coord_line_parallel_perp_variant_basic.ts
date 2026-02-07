// src/lib/course/templates/math2/coord_line_parallel_perp_variant_basic.ts
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
      topicId: "coord_line_parallel_perp_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
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
    id: "coord_para_v1",
    title: "平行な傾き 1",
    statement: `直線 $y=2x+1$ に平行な直線の傾きを求めよ。`,
    answer: 2,
    explain: `平行なら傾きは同じなので $2$。`,
  },
  {
    id: "coord_para_v2",
    title: "平行な傾き 2",
    statement: `直線 $2x-y+3=0$ に平行な直線の傾きを求めよ。`,
    answer: 2,
    explain: `$2x-y+3=0 \\Rightarrow y=2x+3$ なので傾きは $2$。`,
  },
  {
    id: "coord_perp_v1",
    title: "垂直な傾き 1",
    statement: `直線 $y=x-4$ に垂直な直線の傾きを求めよ。`,
    answer: -1,
    explain: `垂直な傾きは負の逆数なので $-1$。`,
  },
  {
    id: "coord_perp_v2",
    title: "垂直な傾き 2",
    statement: `直線 $y=-x+2$ に垂直な直線の傾きを求めよ。`,
    answer: 1,
    explain: `垂直な傾きは負の逆数なので $1$。`,
  },
];

export const coordLineParallelPerpVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
