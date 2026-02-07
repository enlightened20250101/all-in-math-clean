// src/lib/course/templates/mathA/prob_ct_passage_mixed_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice, gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  red: number;
  blue: number;
  draw: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const total = c.red + c.blue;
  const all = (n: number, k: number) => {
    let res = 1;
    for (let i = 0; i < k; i += 1) res = (res * (n - i)) / (i + 1);
    return res;
  };
  const totalComb = all(total, c.draw);
  const red2 = all(c.red, 2) * all(c.blue, c.draw - 2);
  const red1 = all(c.red, 1) * all(c.blue, c.draw - 1);
  const noneRed = all(c.blue, c.draw);
  const pRed2 = red2 / totalComb;
  const pRed1 = red1 / totalComb;
  const pAtLeast1 = 1 - noneRed / totalComb;
  const statement = [
    "次の文章を読み、問1〜問4に答えよ。",
    c.context,
    `（問1）赤が2個出る確率を求めよ。`,
    `（問2）赤が1個出る確率を求めよ。`,
    `（問3）赤が少なくとも1個出る確率を求めよ。`,
    `（問4）問1〜3のうち最も大きい確率を選べ。`,
  ].join("\n");
  const choices = [
    { id: "A", label: "問1" },
    { id: "B", label: "問2" },
    { id: "C", label: "問3" },
  ] as const;
  const maxIdx =
    pRed2 >= pRed1 && pRed2 >= pAtLeast1 ? "A" : pRed1 >= pAtLeast1 ? "B" : "C";
  return {
    meta: {
      id: c.id,
      topicId: "prob_combi_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["probability", "combi", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "赤2個" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "赤1個" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "少なくとも1個" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", pRed2);
      const q2Result = gradeNumeric(parsed.q2 ?? "", pRed1);
      const q3Result = gradeNumeric(parsed.q3 ?? "", pAtLeast1);
      const q4Result = gradeChoice(parsed.q4 ?? "", maxIdx);
      return {
        isCorrect:
          q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect && q4Result.isCorrect,
        correctAnswer: `問1:${pRed2} / 問2:${pRed1} / 問3:${pAtLeast1} / 問4:${maxIdx}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(pRed2) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(pRed1) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(pAtLeast1) },
          q4: { isCorrect: q4Result.isCorrect, correctAnswer: maxIdx },
        },
      };
    },
    explain() {
      return `### この問題の解説\n組合せで全事象を数え、赤の個数ごとに数える。\\n最後は問1〜問3の大小比較。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "prob_ct_passage_mixed_1",
    title: "赤青玉の確率 連問 1",
    red: 3,
    blue: 5,
    draw: 3,
    context: "赤3個・青5個の玉から同時に3個取り出す。",
    difficulty: 2,
  },
  {
    id: "prob_ct_passage_mixed_2",
    title: "赤青玉の確率 連問 2",
    red: 4,
    blue: 6,
    draw: 4,
    context: "赤4個・青6個の玉から同時に4個取り出す。",
    difficulty: 3,
  },
];

export const probCtPassageMixedTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
