// src/lib/course/templates/math2/trig_vertical_shift_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texConst } from "@/lib/format/tex";

type ShiftParams = {
  c: number;
  value: number;
};

function buildParams(): ShiftParams {
  const c = pick([-3, -2, -1, 1, 2, 3]);
  return { c, value: c };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_vertical_shift_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const func = Math.random() < 0.5 ? "sin" : "cos";
      const shift = texConst(params.c);
      const statement = `波形 $y=\\${func} x${shift ? ` ${shift}` : ""}$ の中心線（平均値）を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ShiftParams).value);
    },
    explain(params) {
      const p = params as ShiftParams;
      return `
### この問題の解説
中心線は $y=${p.c}$ なので答えは **${p.c}** です。
`;
    },
  };
}

export const trigVerticalShiftTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_vertical_shift_basic_${i + 1}`, `上下移動 ${i + 1}`)
);
