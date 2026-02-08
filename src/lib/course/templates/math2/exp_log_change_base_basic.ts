// src/lib/course/templates/math2/exp_log_change_base_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texPow, texEq } from "@/lib/format/tex";

type ChangeBaseParams = {
  a: number;
  m: number;
  n: number;
  answer: number;
};

function buildParams(): ChangeBaseParams {
  const a = pick([2, 3, 5]);
  const m = pick([2, 3]);
  const k = pick([2, 3, 4]);
  const n = m * k;
  return { a, m, n, answer: k };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_change_base_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const base = texPow(String(params.a), params.m);
      const value = texPow(String(params.a), params.n);
      const statement =
        `底の変換を用いて次を計算せよ。\\n\\n$$${texEq(`\\log_{${base}}(${value})`, "?")}$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ChangeBaseParams).answer);
    },
    explain(params) {
      const p = params as ChangeBaseParams;
      return `
### この問題の解説
$$
\\log_{${texPow(String(p.a), p.m)}}(${texPow(String(p.a), p.n)})
= \\frac{${p.n}}{${p.m}}
= ${p.answer}
$$
です。答えは **${p.answer}** です。
`;
    },
  };
}

export const expLogChangeBaseTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_change_base_basic_${i + 1}`, `底の変換 ${i + 1}`)
);
