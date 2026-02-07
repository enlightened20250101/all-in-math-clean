// src/lib/course/templates/math2/exp_log_growth_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texPow, texEq } from "@/lib/format/tex";

type GrowthParams = {
  a: number;
  r: number;
  n: number;
  value: number;
};

function buildParams(): GrowthParams {
  const a = pick([2, 3, 4, 5]);
  const r = pick([2, 3]);
  const n = pick([2, 3, 4]);
  const value = a * Math.pow(r, n);
  return { a, r, n, value };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_growth_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `数列 $A_n=${params.a}\\times${texPow(String(params.r), "n")}$ が $${params.value}$ となる $n$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as GrowthParams).n);
    },
    explain(params) {
      const p = params as GrowthParams;
      return `
### この問題の解説
$${texEq(`${p.a}\\times${texPow(String(p.r), "n")}`, `${p.value}`)}$$
より ${texPow(String(p.r), "n")}=${p.value / p.a}$ となるので $n=${p.n}$ です。
答えは **${p.n}** です。
`;
    },
  };
}

export const expLogGrowthTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_growth_basic_${i + 1}`, `指数成長 ${i + 1}`)
);
