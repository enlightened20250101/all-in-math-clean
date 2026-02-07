// src/lib/course/templates/mathB/sequence_recurrence_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";
import { texConst } from "@/lib/format/tex";

type RecParams = {
  a1: number;
  d?: number;
  r?: number;
  n: number;
  kind: number; // 0: arithmetic recurrence, 1: geometric recurrence
  value: number;
};

function buildParams(): RecParams {
  const kind = pick([0, 1]);
  const a1 = randInt(-4, 6);
  const n = randInt(3, 7);
  if (kind === 0) {
    const d = randInt(-3, 5);
    const value = a1 + (n - 1) * d;
    return { kind, a1, d, n, value };
  }
  const r = pick([2, 3, -2]);
  const value = a1 * Math.pow(r, n - 1);
  return { kind, a1, r, n, value };
}

function explain(params: RecParams) {
  if (params.kind === 0) {
    const shift = texConst(params.d ?? 0);
    return `
### この問題の解説
等差型の漸化式 $a_{n+1}=a_n${shift ? ` ${shift}` : ""}$ なので
$$
a_n = a_1 + (n-1)d
$$
より $a_${params.n}=${params.value}$ です。
`;
  }
  return `
### この問題の解説
等比型の漸化式 $a_{n+1}=${params.r}\\,a_n$ なので
$$
a_n = a_1 r^{n-1}
$$
より $a_${params.n}=${params.value}$ です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_recurrence_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "recurrence", "ct"],
    },
    generate() {
      const params = buildParams();
      const shift = texConst(params.d ?? 0);
      const statement =
        params.kind === 0
          ? `数列 $\\{a_n\\}$ が漸化式 $a_{n+1}=a_n${shift ? ` ${shift}` : ""}$, $a_1=${params.a1}$ を満たすとき、$a_${params.n}$ を求めよ。`
          : `数列 $\\{a_n\\}$ が漸化式 $a_{n+1}=${params.r}a_n$, $a_1=${params.a1}$ を満たすとき、$a_${params.n}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as RecParams).value);
    },
    explain(params) {
      return explain(params as RecParams);
    },
  };
}

export const sequenceRecurrenceTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`seq_recurrence_basic_${i + 1}`, `漸化式 ${i + 1}`)
);
