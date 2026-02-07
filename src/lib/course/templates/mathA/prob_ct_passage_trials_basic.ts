// src/lib/course/templates/mathA/prob_ct_passage_trials_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice, gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  n: number;
  p: number;
  k: number;
  context: string;
  difficulty: 2 | 3;
};

function comb(n: number, r: number): number {
  let res = 1;
  for (let i = 0; i < r; i += 1) res = (res * (n - i)) / (i + 1);
  return res;
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const n = c.n;
  const p = c.p;
  const q = 1 - p;
  const k = c.k;
  const expected = n * p;
  const variance = n * p * q;
  const pk = comb(n, k) * Math.pow(p, k) * Math.pow(q, n - k);
  const pAtLeast1 = 1 - Math.pow(q, n);
  const statement = [
    "次の文章を読み、問1〜問4に答えよ。",
    c.context,
    `（問1）成功回数の期待値を求めよ。`,
    `（問2）成功回数の分散を求めよ。`,
    `（問3）成功がちょうど ${k} 回である確率を求めよ。`,
    `（問4）成功が少なくとも1回起こる確率を求めよ。`,
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "prob_binomial_expectation_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["probability", "binomial", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "期待値" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "分散" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: `${k}回` },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "少なくとも1回" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", expected);
      const q2Result = gradeNumeric(parsed.q2 ?? "", variance);
      const q3Result = gradeNumeric(parsed.q3 ?? "", pk);
      const q4Result = gradeNumeric(parsed.q4 ?? "", pAtLeast1);
      return {
        isCorrect:
          q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect && q4Result.isCorrect,
        correctAnswer: `問1:${expected} / 問2:${variance} / 問3:${pk} / 問4:${pAtLeast1}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(expected) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(variance) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(pk) },
          q4: { isCorrect: q4Result.isCorrect, correctAnswer: String(pAtLeast1) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n二項分布で $E[X]=np$、$\\mathrm{Var}(X)=np(1-p)$。\\n確率は $\\binom{n}{k}p^k(1-p)^{n-k}$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "prob_ct_passage_trials_1",
    title: "独立試行 連問 1",
    n: 6,
    p: 0.5,
    k: 3,
    context: "成功確率0.5の試行を6回行う。",
    difficulty: 2,
  },
  {
    id: "prob_ct_passage_trials_2",
    title: "独立試行 連問 2",
    n: 8,
    p: 0.3,
    k: 2,
    context: "成功確率0.3の試行を8回行う。",
    difficulty: 3,
  },
];

export const probCtPassageTrialsTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
