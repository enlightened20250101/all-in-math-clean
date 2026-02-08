// src/lib/course/templates/math2/coord_circle_center_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

function shiftExpr(varName: string, v: number): string {
  if (v === 0) return varName;
  if (v > 0) return `${varName}-${v}`;
  return `${varName}+${Math.abs(v)}`;
}

type Params = {
  h: number;
  k: number;
  r: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  const h = randInt(-5, 5);
  const k = randInt(-5, 5);
  const r = pick([2, 3, 4, 5, 6]);
  const ask = Math.random() < 0.5 ? 1 : 0;
  const ans = ask === 1 ? h : k;
  return { h, k, r, ask, ans };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "coord_circle_center_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const exprX = shiftExpr("x", params.h);
      const exprY = shiftExpr("y", params.k);
      const statement =
        `噴水の中心を原点からの座標で表すとする。` +
        `円 $(${exprX})^2+(${exprY})^2=${params.r ** 2}$ の中心の${params.ask === 1 ? "x" : "y"}座標を求めよ。`;
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
      return `
### この問題の解説
円の標準形 $(x-h)^2+(y-k)^2=r^2$ より中心は $(h,k)=(${p.h},${p.k})$。
答えは **${p.ans}** です。
`;
    },
  };
}

export const coordCircleCenterTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`coord_circle_center_basic_${i + 1}`, `中心座標 ${i + 1}`)
);
