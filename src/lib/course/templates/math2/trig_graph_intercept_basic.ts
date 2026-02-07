// src/lib/course/templates/math2/trig_graph_intercept_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

const CASES = [
  { a: 1, c: 0 },
  { a: 2, c: 1 },
  { a: -3, c: 2 },
  { a: 4, c: -1 },
  { a: -2, c: -2 },
  { a: 3, c: -1 },
];

type InterceptParams = {
  a: number;
  c: number;
  funcId: number;
  y0: number;
};

function buildParams(): InterceptParams {
  const base = pick(CASES);
  const funcId = Math.random() < 0.5 ? 0 : 1;
  const y0 = funcId === 0 ? base.c : base.a + base.c;
  return { ...base, funcId, y0 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_graph_intercept_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const func = params.funcId === 0 ? "sin" : "cos";
      const aTerm = texTerm(params.a, `\\${func} x`, true);
      const shift = texConst(params.c);
      const statement = `関数 $y=${aTerm}${shift ? ` ${shift}` : ""}$ の $x=0$ における値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as InterceptParams).y0);
    },
    explain(params) {
      const p = params as InterceptParams;
      const func = p.funcId === 0 ? "sin" : "cos";
      const aTerm = texTerm(p.a, `\\${func} 0`, true);
      const shift = texConst(p.c);
      return `
### この問題の解説
$\\sin 0=0,\\cos 0=1$ なので
$y=${aTerm}${shift ? ` ${shift}` : ""}=${p.y0}$。
答えは **${p.y0}** です。
`;
    },
  };
}

export const trigGraphInterceptTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_graph_intercept_basic_${i + 1}`, `y切片 ${i + 1}`)
);
