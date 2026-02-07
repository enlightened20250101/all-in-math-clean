// src/lib/course/templates/mathC/conic_circle_general_center_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { normalizeSigns, texConst, texTerm } from "@/lib/format/tex";

const CASES = [
  { h: 1, k: -2, r: 3 },
  { h: -2, k: 1, r: 4 },
  { h: 2, k: 2, r: 2 },
  { h: -3, k: -1, r: 5 },
  { h: 4, k: 0, r: 3 },
  { h: 0, k: -4, r: 6 },
];

type Params = {
  h: number;
  k: number;
  r: number;
  D: number;
  E: number;
  F: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const D = -2 * base.h;
  const E = -2 * base.k;
  const F = base.h * base.h + base.k * base.k - base.r * base.r;
  const ask = Math.random() < 0.5 ? 1 : 0;
  const ans = ask === 1 ? base.h : base.k;
  return { ...base, D, E, F, ask, ans };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_general_center_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      let expr = "x^2+y^2";
      if (params.D !== 0) expr += ` ${texTerm(params.D, "x")}`;
      if (params.E !== 0) expr += ` ${texTerm(params.E, "y")}`;
      if (params.F !== 0) expr += ` ${texConst(params.F)}`;
      expr = normalizeSigns(expr);
      const statement = `円 $${expr}=0$ の中心の${params.ask === 1 ? "x" : "y"}座標を求めよ。`;
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
平方完成で中心は $(${p.h},${p.k})$。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicCircleGeneralCenterTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_general_center_basic_${i + 1}`, `一般形の中心 ${i + 1}`)
);

const extraCircleGeneralCenterTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_circle_general_center_basic_${i + 7}`, `一般形の中心 追加${i + 1}`)
);

conicCircleGeneralCenterTemplates.push(...extraCircleGeneralCenterTemplates);
