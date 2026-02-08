// src/lib/course/templates/math2/exp_log_equations_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texEq, texPow } from "@/lib/format/tex";

type ExpEqParams = { a: number; n: number; value: number };
type LogEqParams = { a: number; n: number; value: number };

function buildExpEqParams(): ExpEqParams {
  const bases = [2, 3, 5, 10];
  const a = pick(bases);
  const n = randInt(1, a === 10 ? 3 : 5);
  return { a, n, value: Math.pow(a, n) };
}

function buildLogEqParams(): LogEqParams {
  const bases = [2, 3, 5, 10];
  const a = pick(bases);
  const n = randInt(1, a === 10 ? 3 : 5);
  return { a, n, value: Math.pow(a, n) };
}

function explainExpEq({ a, n, value }: ExpEqParams) {
  return `
### この問題の解説
$$
${texPow(String(a), "x")} = ${value}
$$
なので、$x=${n}$ です。答えは **${n}** です。
`;
}

function explainLogEq({ a, n, value }: LogEqParams) {
  return `
### この問題の解説
$$
\\log_{${a}} x = ${n}
$$
は、$x=${texPow(String(a), n)}=${value}$ を意味します。答えは **${value}** です。
`;
}

function buildExpEqTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_equations_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildExpEqParams();
      const statement =
        `指数モデルの条件を満たす $x$ を求めよ。\\n\\n$$${texEq(texPow(String(params.a), "x"), String(params.value))}$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ExpEqParams).n);
    },
    explain(params) {
      return explainExpEq(params as ExpEqParams);
    },
  };
}

function buildLogEqTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_equations_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildLogEqParams();
      const statement =
        `対数条件を満たす $x$ を求めよ。\\n\\n$$${texEq(`\\log_{${params.a}} x`, String(params.n))}$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LogEqParams).value);
    },
    explain(params) {
      return explainLogEq(params as LogEqParams);
    },
  };
}

const expEqTemplates = Array.from({ length: 50 }, (_, i) =>
  buildExpEqTemplate(`exp_log_equations_exp_${i + 1}`, `指数方程式 ${i + 1}`)
);
const logEqTemplates = Array.from({ length: 50 }, (_, i) =>
  buildLogEqTemplate(`exp_log_equations_log_${i + 1}`, `対数方程式 ${i + 1}`)
);

export const expLogEquationTemplates: QuestionTemplate[] = [
  ...expEqTemplates,
  ...logEqTemplates,
];
