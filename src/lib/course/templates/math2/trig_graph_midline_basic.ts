// src/lib/course/templates/math2/trig_graph_midline_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

type MidParams = {
  c: number;
};

function buildParams(): MidParams {
  const c = pick([-3, -2, -1, 0, 1, 2, 3]);
  return { c };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_graph_midline_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const aTerm = texTerm(2, "\\sin x", true);
      const shift = texConst(params.c);
      const statement =
        `波の高さを表す関数 $y=${aTerm}${shift ? ` ${shift}` : ""}$ を考える。` +
        `中心線を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as MidParams).c);
    },
    explain(params) {
      const p = params as MidParams;
      return `
### この問題の解説
中心線は $y=${p.c}$ なので答えは **${p.c}** です。
`;
    },
  };
}

export const trigGraphMidlineTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_graph_midline_basic_${i + 1}`, `中心線 ${i + 1}`)
);
