// src/lib/course/templates/mathA/prob_ct_passage_bayes_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice, gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  pA: number;
  pB_given_A: number;
  pB_given_notA: number;
  context: string;
  difficulty: 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const pA = c.pA;
  const pNotA = 1 - pA;
  const pB_A = c.pB_given_A;
  const pB_notA = c.pB_given_notA;
  const pB = pA * pB_A + pNotA * pB_notA;
  const pA_and_B = pA * pB_A;
  const pA_given_B = pA_and_B / pB;
  const pNotA_given_B = 1 - pA_given_B;
  const statement = [
    "次の文章を読み、問1〜問4に答えよ。",
    c.context,
    "（問1）$P(B)$ を求めよ。",
    "（問2）$P(A\\cap B)$ を求めよ。",
    "（問3）$P(A\\mid B)$ を求めよ。",
    "（問4）$P(\\bar{A}\\mid B)$ を求めよ。",
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "prob_combi_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["probability", "bayes", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "P(B)" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "P(A∩B)" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "P(A|B)" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "P(¬A|B)" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", pB);
      const q2Result = gradeNumeric(parsed.q2 ?? "", pA_and_B);
      const q3Result = gradeNumeric(parsed.q3 ?? "", pA_given_B);
      const q4Result = gradeNumeric(parsed.q4 ?? "", pNotA_given_B);
      return {
        isCorrect:
          q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect && q4Result.isCorrect,
        correctAnswer: `問1:${pB} / 問2:${pA_and_B} / 問3:${pA_given_B} / 問4:${pNotA_given_B}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(pB) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(pA_and_B) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(pA_given_B) },
          q4: { isCorrect: q4Result.isCorrect, correctAnswer: String(pNotA_given_B) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n全確率とベイズの定理で計算する。\\n$P(A|B)=\\frac{P(A)P(B|A)}{P(B)}$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "prob_ct_passage_bayes_1",
    title: "ベイズ連問 1",
    pA: 0.2,
    pB_given_A: 0.9,
    pB_given_notA: 0.1,
    context: "事象Aの確率は0.2。AのときBが起こる確率は0.9、AでないときBが起こる確率は0.1。",
    difficulty: 3,
  },
  {
    id: "prob_ct_passage_bayes_2",
    title: "ベイズ連問 2",
    pA: 0.4,
    pB_given_A: 0.7,
    pB_given_notA: 0.2,
    context: "事象Aの確率は0.4。AのときBが起こる確率は0.7、AでないときBが起こる確率は0.2。",
    difficulty: 3,
  },
];

export const probCtPassageBayesTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
