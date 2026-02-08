// src/lib/course/templates/math2/exp_log_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPow, texEq, texText } from "@/lib/format/tex";

type ExpParams = { a: number; n: number; value: number };
type LogParams = { a: number; n: number; value: number };

function buildExpParams(): ExpParams {
  const bases = [2, 3, 5, 10];
  const a = pick(bases);
  const n = randInt(2, a === 10 ? 3 : 5);
  return { a, n, value: Math.pow(a, n) };
}

function buildLogParams(): LogParams {
  const bases = [2, 3, 5, 10];
  const a = pick(bases);
  const n = randInt(1, a === 10 ? 3 : 5);
  return { a, n, value: Math.pow(a, n) };
}

function explainExp({ a, n, value }: ExpParams) {
  return `
### この問題の解説
指数の定義より、
$$
${texPow(String(a), n)} = ${value}
$$
です。答えは **${value}** です。
`;
}

function explainLog({ a, n, value }: LogParams) {
  return `
### この問題の解説
対数の定義は
$$
\\log_{${a}}(${value}) = n \\iff ${texPow(String(a), n)} = ${value}
$$
です。よって答えは **${n}** です。
`;
}

function buildExpTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildExpParams();
      const statement =
        `ある倍率の計算として次を求めよ。\\n\\n$$${texPow(String(params.a), params.n)}$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ExpParams).value);
    },
    explain(params) {
      return explainExp(params as ExpParams);
    },
  };
}

function buildLogTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildLogParams();
      const statement =
        `ログの指数を求めよ。\\n\\n$$${texEq(`\\log_{${params.a}}(${params.value})`, "?")}$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LogParams).n);
    },
    explain(params) {
      return explainLog(params as LogParams);
    },
  };
}

const expTemplates = Array.from({ length: 50 }, (_, i) =>
  buildExpTemplate(`exp_log_basic_exp_${i + 1}`, `指数の計算 ${i + 1}`)
);
const logTemplates = Array.from({ length: 50 }, (_, i) =>
  buildLogTemplate(`exp_log_basic_log_${i + 1}`, `対数の計算 ${i + 1}`)
);

export const expLogBasicTemplates: QuestionTemplate[] = [
  ...expTemplates,
  ...logTemplates,
];
