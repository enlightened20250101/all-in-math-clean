// src/lib/course/templates/math2/trig_graph_max_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

type MaxParams = {
  a: number;
  c: number;
  max: number;
};

function buildParams(): MaxParams {
  const a = pick([-3, -2, -1, 1, 2, 3]);
  const c = pick([-2, -1, 0, 1, 2]);
  const max = c + Math.abs(a);
  return { a, c, max };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_graph_max_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const func = Math.random() < 0.5 ? "sin" : "cos";
      const aTerm = texTerm(params.a, `\\${func} x`, true);
      const shift = texConst(params.c);
      const statement = `関数 $y=${aTerm}${shift ? ` ${shift}` : ""}$ の最大値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as MaxParams).max);
    },
    explain(params) {
      const p = params as MaxParams;
      return `
### この問題の解説
最大値は $c+|a|$ なので $${p.c}+|${p.a}|=${p.max}$ です。
答えは **${p.max}** です。
`;
    },
  };
}

export const trigGraphMaxTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_graph_max_basic_${i + 1}`, `最大値 ${i + 1}`)
);
