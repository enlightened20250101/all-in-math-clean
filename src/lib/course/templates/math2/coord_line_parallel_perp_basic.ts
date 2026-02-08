// src/lib/course/templates/math2/coord_line_parallel_perp_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

const SLOPES = [-3, -2, -1, 1, 2, 3];

type Params = {
  m: number;
  c: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  const ask = Math.random() < 0.5 ? 1 : 0;
  const m = ask === 0 ? pick([-1, 1]) : pick(SLOPES);
  const c = randInt(-6, 6);
  const ans = ask === 0 ? -1 / m : m;
  return { m, c, ask, ans };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "coord_line_parallel_perp_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 1 ? "平行" : "垂直";
      const rhs = texLinear(params.m, params.c, "x");
      const statement =
        `道路の向きを直線で表すとする。` +
        `直線 $y=${rhs}$ に${label}な直線の傾きを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      const label = p.ask === 1 ? "平行" : "垂直";
      return `
### この問題の解説
傾き $m=${p.m}$ の直線に${label}な直線の傾きは ${p.ask === 1 ? "同じ" : "負の逆数"}。
答えは **${p.ans}** です。
`;
    },
  };
}

export const coordLineParallelPerpTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`coord_line_parallel_perp_basic_${i + 1}`, `平行・垂直 ${i + 1}`)
);
