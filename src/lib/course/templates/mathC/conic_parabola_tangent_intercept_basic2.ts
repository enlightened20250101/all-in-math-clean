// src/lib/course/templates/mathC/conic_parabola_tangent_intercept_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texTerm } from "@/lib/format/tex";

const CASES = [
  { a: 1, t: 2, ans: -4 },
  { a: 2, t: 1, ans: -2 },
  { a: 3, t: -1, ans: -3 },
  { a: 4, t: -2, ans: -16 },
];

type Params = {
  a: number;
  t: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_parabola_tangent_intercept_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola", "tangent"],
    },
    generate() {
      const params = buildParams();
      const at2 = texTerm(params.a, "t^2", true);
      const line = at2.startsWith("-") ? `ty=x ${at2}` : `ty=x+${at2}`;
      const statement = `測定で得た放物線として、放物線 $y^2=4${params.a}x$ の接線 $${line}$ について、$x$ 切片を求めよ。（$t=${params.t}$）`;
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
$y=0$ として $x=-at^2$。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicParabolaTangentInterceptExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_tangent_intercept_basic2_${i + 1}`, `接線の切片 ${i + 1}`)
);
