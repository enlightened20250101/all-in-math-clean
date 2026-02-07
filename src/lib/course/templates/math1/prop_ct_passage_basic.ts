// src/lib/course/templates/math1/prop_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";

type PassageCase = {
  id: string;
  title: string;
  statement: string;
  truth: "真" | "偽";
  contra: string;
  inverse: string;
  converse: string;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  {
    id: "prop_ct_passage_1",
    title: "命題 連問 1",
    statement: "$x$ が 4 の倍数ならば $x$ は偶数である。",
    truth: "真",
    contra: "$x$ が偶数でないならば $x$ は 4 の倍数でない。",
    inverse: "$x$ が 4 の倍数でないならば $x$ は偶数でない。",
    converse: "$x$ が偶数ならば $x$ は 4 の倍数である。",
    difficulty: 1,
  },
  {
    id: "prop_ct_passage_2",
    title: "命題 連問 2",
    statement: "$x$ が 6 の倍数ならば $x$ は 4 の倍数である。",
    truth: "偽",
    contra: "$x$ が 4 の倍数でないならば $x$ は 6 の倍数でない。",
    inverse: "$x$ が 6 の倍数でないならば $x$ は 4 の倍数でない。",
    converse: "$x$ が 4 の倍数ならば $x$ は 6 の倍数である。",
    difficulty: 2,
  },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const statement = [
    "次の命題について、問1〜問4に答えよ。",
    `命題: ${c.statement}`,
    "（問1）真偽を答えよ。",
    "（問2）対偶を答えよ。",
    "（問3）裏命題を答えよ。",
    "（問4）逆命題を答えよ。",
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "prop_proposition_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["proposition", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "choice", choices: ["真", "偽"] },
          { id: "q2", label: "問2", answerKind: "choice", choices: [c.contra, c.inverse, c.converse] },
          { id: "q3", label: "問3", answerKind: "choice", choices: [c.inverse, c.contra, c.converse] },
          { id: "q4", label: "問4", answerKind: "choice", choices: [c.converse, c.inverse, c.contra] },
        ],
        params: {},
      };
    },
    grade(_params, userAnswer) {
      let parsed: Record<string, string> = {};
      try {
        parsed = JSON.parse(userAnswer) as Record<string, string>;
      } catch {
        parsed = {};
      }
      const q1Ok = (parsed.q1 ?? "") === c.truth;
      const q2Ok = (parsed.q2 ?? "") === c.contra;
      const q3Ok = (parsed.q3 ?? "") === c.inverse;
      const q4Ok = (parsed.q4 ?? "") === c.converse;
      return {
        isCorrect: q1Ok && q2Ok && q3Ok && q4Ok,
        correctAnswer: `問1:${c.truth} / 問2:${c.contra} / 問3:${c.inverse} / 問4:${c.converse}`,
        partResults: {
          q1: { isCorrect: q1Ok, correctAnswer: c.truth },
          q2: { isCorrect: q2Ok, correctAnswer: c.contra },
          q3: { isCorrect: q3Ok, correctAnswer: c.inverse },
          q4: { isCorrect: q4Ok, correctAnswer: c.converse },
        },
      };
    },
  };
}

export const propCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
