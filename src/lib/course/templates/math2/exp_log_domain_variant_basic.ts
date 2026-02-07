// src/lib/course/templates/math2/exp_log_domain_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type Case = {
  id: string;
  statement: string;
  choices: string[];
  answer: string;
  difficulty: 1 | 2 | 3;
};

const CASES: Case[] = [
  {
    id: "log_domain_1",
    statement: "次の式が定義される $x$ の範囲を選べ。\\n\\n$\\log_2(x-3)$",
    choices: ["x>3", "x\\ge 3", "x<3", "x\\neq 3"],
    answer: "x>3",
    difficulty: 1,
  },
  {
    id: "log_domain_2",
    statement: "次の式が定義される $x$ の範囲を選べ。\\n\\n$\\log_5(2x+1)$",
    choices: ["x>-\\frac{1}{2}", "x\\ge -\\frac{1}{2}", "x< -\\frac{1}{2}", "x\\neq -\\frac{1}{2}"],
    answer: "x>-\\frac{1}{2}",
    difficulty: 1,
  },
  {
    id: "log_domain_3",
    statement: "次の式が定義される $x$ の範囲を選べ。\\n\\n$\\log_{10}(5- x)$",
    choices: ["x<5", "x\\le 5", "x>5", "x\\neq 5"],
    answer: "x<5",
    difficulty: 1,
  },
];

export const expLogDomainVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `exp_log_domain_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_domain_basic",
      title: `定義域（変形）${i + 1}`,
      difficulty: c.difficulty,
      tags: [],
    },
    generate() {
      return {
        templateId,
        statement: c.statement,
        answerKind: "choice",
        choices: c.choices,
        params: { caseId: i % CASES.length },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.answer, correctAnswer: c.answer };
    },
    explain() {
      return `
### この問題の解説
対数の中身が正になる条件を満たす必要があります。答えは **${c.answer}** です。
`;
    },
  };
});
