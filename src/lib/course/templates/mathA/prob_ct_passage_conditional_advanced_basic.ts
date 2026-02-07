// src/lib/course/templates/mathA/prob_ct_passage_conditional_advanced_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice, gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  n: number;
  pA: number;
  pB_given_A: number;
  pB_given_notA: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const pA = c.pA;
  const pNotA = 1 - pA;
  const pB_A = c.pB_given_A;
  const pB_notA = c.pB_given_notA;
  const pB = pA * pB_A + pNotA * pB_notA;
  const pA_and_B = pA * pB_A;
  const pA_given_B = pA_and_B / pB;
  const statement = [
    "次の文章を読み、問1〜問4に答えよ。",
    c.context,
    "（問1）$P(B)$ を求めよ。",
    "（問2）$P(A\\cap B)$ を求めよ。",
    "（問3）$P(A\\mid B)$ を求めよ。",
    "（問4）$P(A\\mid B)$ が最も大きくなるのは次のどれか。", 
  ].join("\n");
  const choices = [
    { id: "A", label: "問1の値が小さい場合" },
    { id: "B", label: "問2の値が大きい場合" },
    { id: "C", label: "問1と問2の比が大きい場合" },
  ] as const;
  const correctChoice = "C";
  return {
    meta: {
      id: c.id,
      topicId: "prob_combi_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["probability", "conditional", "ct", "passage"],
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
          { id: "q4", label: "問4", answerKind: "choice", choices },
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
      const q4Result = gradeChoice(parsed.q4 ?? "", correctChoice);
      return {
        isCorrect:
          q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect && q4Result.isCorrect,
        correctAnswer: `問1:${pB} / 問2:${pA_and_B} / 問3:${pA_given_B} / 問4:${correctChoice}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(pB) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(pA_and_B) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(pA_given_B) },
          q4: { isCorrect: q4Result.isCorrect, correctAnswer: correctChoice },
        },
      };
    },
    explain() {
      return `### この問題の解説\n全確率 $P(B)=P(A)P(B|A)+P(\\bar A)P(B|\\bar A)$。\n条件付き確率は $P(A|B)=\\frac{P(A\\cap B)}{P(B)}$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "prob_ct_passage_conditional_adv_1",
    title: "条件付き確率 連問 1",
    n: 100,
    pA: 0.4,
    pB_given_A: 0.7,
    pB_given_notA: 0.2,
    context: "ある検査で、事象Aが起こる確率は0.4。AのときBが起こる確率は0.7、AでないときBが起こる確率は0.2。",
    difficulty: 2,
  },
  {
    id: "prob_ct_passage_conditional_adv_2",
    title: "条件付き確率 連問 2",
    n: 200,
    pA: 0.3,
    pB_given_A: 0.8,
    pB_given_notA: 0.1,
    context: "事象Aの確率は0.3。AのときBが起こる確率は0.8、AでないときBが起こる確率は0.1。",
    difficulty: 3,
  },
];

export const probCtPassageConditionalAdvancedTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
