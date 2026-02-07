// src/lib/course/templates/mathA/induction_basic.ts
import type { QuestionTemplate } from "../../types";

type InductionCase = {
  id: string;
  title: string;
  statement: string;
  holds: boolean;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: InductionCase): QuestionTemplate {
  const choices = ["成り立つ", "成り立たない"];
  const correct = c.holds ? "成り立つ" : "成り立たない";
  return {
    meta: {
      id: c.id,
      topicId: "induction_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["induction", "proof"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `次の命題 $P(n)$ について、$n=1$ のとき成り立つか判定せよ。\\n\\n$${c.statement}$`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `### この問題の解説\n$n=1$ を代入して確認します。答えは **${correct}** です。`;
    },
  };
}

const CASES: InductionCase[] = [
  { id: "ind_1", title: "帰納法 1", statement: "1+2+\\cdots+n=\\frac{n(n+1)}{2}", holds: true, difficulty: 1 },
  { id: "ind_2", title: "帰納法 2", statement: "1+2+\\cdots+n=n^2", holds: true, difficulty: 1 },
  { id: "ind_3", title: "帰納法 3", statement: "1+3+5+\\cdots+(2n-1)=n^2", holds: true, difficulty: 1 },
  { id: "ind_4", title: "帰納法 4", statement: "2^n=2n", holds: false, difficulty: 1 },
  { id: "ind_5", title: "帰納法 5", statement: "n^2+nは偶数である", holds: true, difficulty: 1 },
  { id: "ind_6", title: "帰納法 6", statement: "n^2-1は素数である", holds: false, difficulty: 1 },
  { id: "ind_7", title: "帰納法 7", statement: "1+2+\\cdots+n=\\frac{n(n+1)}{2}は$n=1$で成り立つ", holds: true, difficulty: 2 },
  { id: "ind_8", title: "帰納法 8", statement: "3^n-1は2で割り切れる", holds: true, difficulty: 2 },
  { id: "ind_9", title: "帰納法 9", statement: "n^2+1は偶数である", holds: false, difficulty: 3 },
];

export const inductionTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
