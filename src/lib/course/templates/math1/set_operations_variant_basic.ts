// src/lib/course/templates/math1/set_operations_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texSet, texSetList, texSetUnion, texSetIntersection, texSetDiff, texCard, texEq } from "@/lib/format/tex";

type ChoiceCase = {
  id: string;
  title: string;
  statement: string;
  correct: string;
  choices: string[];
  explain: string;
};

type NumericCase = {
  id: string;
  title: string;
  statement: string;
  answer: number;
  explain: string;
};

function buildChoice(c: ChoiceCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "set_operations_basic",
      title: c.title,
      difficulty: 1,
      tags: ["set", "choice"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "choice",
        choices: c.choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return c.explain;
    },
  };
}

function buildNumeric(c: NumericCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "set_operations_basic",
      title: c.title,
      difficulty: 1,
      tags: ["set", "count"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.answer);
    },
    explain() {
      return c.explain;
    },
  };
}

const A = texSet("A");
const B = texSet("B");

const choiceCases: ChoiceCase[] = [
  {
    id: "set_union_variant_1",
    title: "和集合の要素（別）",
    statement: `$${texEq(A, texSetList([1, 3, 5]))},\\ ${texEq(B, texSetList([2, 3, 4]))}$ のとき、$3$ は $${texSetUnion("A", "B")}$ に含まれるか。`,
    correct: "はい",
    choices: ["はい", "いいえ"],
    explain: `### この問題の解説\n$3$ は $A,B$ のどちらにも含まれるので含まれます。`,
  },
  {
    id: "set_intersection_variant_1",
    title: "共通部分の要素（別）",
    statement: `$${texEq(A, texSetList([1, 2, 3]))},\\ ${texEq(B, texSetList([3, 4, 5]))}$ のとき、$2$ は $${texSetIntersection("A", "B")}$ に含まれるか。`,
    correct: "いいえ",
    choices: ["はい", "いいえ"],
    explain: `### この問題の解説\n$2$ は $B$ に含まれないため共通部分に含まれません。`,
  },
  {
    id: "set_diff_variant_1",
    title: "差集合の要素（別）",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4]))},\\ ${texEq(B, texSetList([2, 4]))}$ のとき、$3$ は $${texSetDiff("A", "B")}$ に含まれるか。`,
    correct: "はい",
    choices: ["はい", "いいえ"],
    explain: `### この問題の解説\n$3$ は $A$ に含まれ、$B$ に含まれないので差集合に含まれます。`,
  },
];

const numericCases: NumericCase[] = [
  {
    id: "set_count_variant_1",
    title: "要素数（和集合）",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4]))},\\ ${texEq(B, texSetList([3, 4, 5]))}$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 5,
    explain: `### この問題の解説\n$A\\cup B=\\{1,2,3,4,5\\}$ なので 5。`,
  },
  {
    id: "set_count_variant_2",
    title: "要素数（共通部分）",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4]))},\\ ${texEq(B, texSetList([2, 4, 6]))}$ のとき、$${texCard(texSetIntersection("A", "B"))}$ を求めよ。`,
    answer: 2,
    explain: `### この問題の解説\n共通部分は $\\{2,4\\}$ なので 2。`,
  },
  {
    id: "set_count_variant_3",
    title: "要素数（差集合）",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4]))},\\ ${texEq(B, texSetList([2, 4]))}$ のとき、$${texCard(texSetDiff("A", "B"))}$ を求めよ。`,
    answer: 2,
    explain: `### この問題の解説\n$A\\setminus B=\\{1,3\\}$ なので 2。`,
  },
];

export const setOperationsVariantTemplates: QuestionTemplate[] = [
  ...choiceCases.map(buildChoice),
  ...numericCases.map(buildNumeric),
];
