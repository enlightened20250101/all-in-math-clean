// src/lib/course/templates/math2/exp_log_domain_basic.ts
import type { QuestionTemplate } from "../../types";

type Case = {
  shift: number;
  answer: string;
  choices: string[];
  explain: string;
};

const CASES: Case[] = [
  { shift: 2, answer: "x>2", choices: ["x>2", "x<2", "x>0", "x>=0"], explain: "x-2>0" },
  { shift: 1, answer: "x>1", choices: ["x>1", "x<1", "x>0", "x>=0"], explain: "x-1>0" },
  { shift: 0, answer: "x>0", choices: ["x>0", "x>=0", "x>1", "x<0"], explain: "x>0" },
  { shift: 3, answer: "x>3", choices: ["x>3", "x>=3", "x>0", "x<3"], explain: "x-3>0" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "exp_log_domain_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const inner = c.shift === 0 ? "x" : `x-${c.shift}`;
      const statement = `関数 $y=\\log_2(${inner})$ の定義域を選べ。`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: c.choices,
        params: { caseId },
      };
    },
    grade(params, userAnswer) {
      const c = CASES[params.caseId] ?? CASES[0];
      return { isCorrect: userAnswer === c.answer, correctAnswer: c.answer };
    },
    explain(params) {
      const c = CASES[params.caseId] ?? CASES[0];
      return `
### この問題の解説
対数の中身が正なので ${c.explain}。
答えは **${c.answer}** です。
`;
    },
  };
}

export const expLogDomainTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`exp_log_domain_basic_${i + 1}`, `定義域 ${i + 1}`)
);
