// src/lib/course/templates/mathB/sequence_ct_passage_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  kind: "arithmetic" | "geometric";
  a1: number;
  d?: number;
  r?: number;
  n1: number;
  n2: number;
  n3: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const an1 =
    c.kind === "arithmetic"
      ? c.a1 + (c.n1 - 1) * (c.d ?? 0)
      : c.a1 * Math.pow(c.r ?? 1, c.n1 - 1);
  const an2 =
    c.kind === "arithmetic"
      ? c.a1 + (c.n2 - 1) * (c.d ?? 0)
      : c.a1 * Math.pow(c.r ?? 1, c.n2 - 1);
  const an3 =
    c.kind === "arithmetic"
      ? c.a1 + (c.n3 - 1) * (c.d ?? 0)
      : c.a1 * Math.pow(c.r ?? 1, c.n3 - 1);
  const sum =
    c.kind === "arithmetic"
      ? (c.n3 * (c.a1 + an3)) / 2
      : c.r === 1
      ? c.a1 * c.n3
      : (c.a1 * (1 - Math.pow(c.r ?? 1, c.n3))) / (1 - (c.r ?? 1));
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）$a_{${c.n1}}$ を求めよ。`,
    `（問2）$a_{${c.n2}}$ を求めよ。`,
    `（問3）最初の ${c.n3} 項の和を求めよ。`,
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: c.kind === "arithmetic" ? "seq_arithmetic_sum_from_terms_basic" : "seq_geometric_sum_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["sequence", "ct", "passage", c.kind],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: `a${c.n1}` },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: `a${c.n2}` },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: `S${c.n3}` },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", an1);
      const q2Result = gradeNumeric(parsed.q2 ?? "", an2);
      const q3Result = gradeNumeric(parsed.q3 ?? "", sum);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${an1} / 問2:${an2} / 問3:${sum}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(an1) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(an2) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(sum) },
        },
      };
    },
    explain() {
      const rule =
        c.kind === "arithmetic"
          ? "等差数列の公式 $a_n=a_1+(n-1)d$、$S_n=\\frac{n}{2}(a_1+a_n)$ を使う。"
          : "等比数列の公式 $a_n=a_1 r^{n-1}$、$S_n=a_1\\frac{1-r^n}{1-r}$ を使う。";
      return `### この問題の解説\n${rule}\n答えは **${an1}**, **${an2}**, **${sum}**。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "seq_ct_passage_backsolve_arith_1",
    title: "等差数列の計算 連問 1",
    kind: "arithmetic",
    a1: 6,
    d: 4,
    n1: 5,
    n2: 9,
    n3: 9,
    context: "ある数列は初項6、公差4の等差数列である。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_backsolve_arith_2",
    title: "等差数列の計算 連問 2",
    kind: "arithmetic",
    a1: 30,
    d: -3,
    n1: 4,
    n2: 8,
    n3: 8,
    context: "初項30、公差-3の等差数列について考える。",
    difficulty: 3,
  },
  {
    id: "seq_ct_passage_backsolve_geo_1",
    title: "等比数列の計算 連問 1",
    kind: "geometric",
    a1: 5,
    r: 2,
    n1: 4,
    n2: 6,
    n3: 6,
    context: "初項5、公比2の等比数列 $a_n$ を考える。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_backsolve_geo_2",
    title: "等比数列の計算 連問 2",
    kind: "geometric",
    a1: 48,
    r: 0.5,
    n1: 3,
    n2: 5,
    n3: 5,
    context: "初項48、公比1/2の等比数列を考える。",
    difficulty: 3,
  },
];

export const sequenceCtPassageBacksolveTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
