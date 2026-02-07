// src/lib/course/templates/math2/trig_graph_min_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

type MinParams = {
  a: number;
  c: number;
  min: number;
};

function buildParams(): MinParams {
  const a = pick([-3, -2, -1, 1, 2, 3]);
  const c = pick([-2, -1, 0, 1, 2]);
  const min = c - Math.abs(a);
  return { a, c, min };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_graph_min_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const func = Math.random() < 0.5 ? "sin" : "cos";
      const aTerm = texTerm(params.a, `\\${func} x`, true);
      const shift = texConst(params.c);
      const statement = `関数 $y=${aTerm}${shift ? ` ${shift}` : ""}$ の最小値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as MinParams).min);
    },
    explain(params) {
      const p = params as MinParams;
      return `
### この問題の解説
最小値は $c-|a|$ なので $${p.c}-|${p.a}|=${p.min}$ です。
答えは **${p.min}** です。
`;
    },
  };
}

export const trigGraphMinTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_graph_min_basic_${i + 1}`, `最小値 ${i + 1}`)
);
