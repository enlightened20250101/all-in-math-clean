// src/lib/course/templates/math1/set_operations_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import {
  texSet,
  texSetList,
  texSetUnion,
  texSetIntersection,
  texSetDiff,
  texSetComp,
  texCard,
  texIn,
  texEq,
  texText,
} from "@/lib/format/tex";

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
const U = texSet("U");

const choiceCases: ChoiceCase[] = [
  {
    id: "set_mem_1",
    title: "要素の判定 1",
    statement: `$${texEq(A, texSetList([1, 2, 4, 6]))}$ のとき、$${texIn("3", A)}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$3$ は $${A}$ に含まれません。`,
  },
  {
    id: "set_mem_2",
    title: "要素の判定 2",
    statement: `$${texEq(A, texSetList([0, 2, 3, 5]))}$ のとき、$${texIn("2", A)}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$2$ は $${A}$ に含まれます。`,
  },
  {
    id: "set_union_mem",
    title: "和集合の要素",
    statement: `$${texEq(A, texSetList([1, 2, 3]))},\\ ${texEq(B, texSetList([3, 4, 5]))}$ のとき、$${texIn("4", texSetUnion("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$4$ は $${B}$ に含まれるので和集合に含まれます。`,
  },
  {
    id: "set_intersection_mem",
    title: "共通部分の要素",
    statement: `$${texEq(A, texSetList([2, 4, 6]))},\\ ${texEq(B, texSetList([1, 2, 3, 4]))}$ のとき、$${texIn("6", texSetIntersection("A", "B"))}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$6$ は $${B}$ に含まれないので共通部分には含まれません。`,
  },
  {
    id: "set_diff_mem",
    title: "差集合の要素",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4]))},\\ ${texEq(B, texSetList([3, 4, 5]))}$ のとき、$${texIn("2", texSetDiff("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$2$ は $${A}$ に含まれ、$${B}$ に含まれないため差集合に含まれます。`,
  },
  {
    id: "set_comp_mem",
    title: "補集合の要素",
    statement: `$${texEq(U, texSetList([1, 2, 3, 4, 5, 6]))},\\ ${texEq(A, texSetList([2, 4, 6]))}$ のとき、$${texIn("3", texSetComp("A"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$3$ は $${A}$ に含まれないので補集合に含まれます。`,
  },
  {
    id: "set_mem_3",
    title: "要素の判定 3",
    statement: `$${texEq(A, texSetList([1, 3, 5, 7]))}$ のとき、$${texIn("4", A)}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$4$ は $${A}$ に含まれません。`,
  },
  {
    id: "set_union_mem_2",
    title: "和集合の要素 2",
    statement: `$${texEq(A, texSetList([2, 4, 6]))},\\ ${texEq(B, texSetList([1, 3, 5]))}$ のとき、$${texIn("5", texSetUnion("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$5$ は $${B}$ に含まれるので和集合に含まれます。`,
  },
  {
    id: "set_intersection_mem_2",
    title: "共通部分の要素 2",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4]))},\\ ${texEq(B, texSetList([3, 4, 5, 6]))}$ のとき、$${texIn("2", texSetIntersection("A", "B"))}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$2$ は $${B}$ に含まれないので共通部分には含まれません。`,
  },
  {
    id: "set_diff_mem_2",
    title: "差集合の要素 2",
    statement: `$${texEq(A, texSetList([2, 3, 4, 5]))},\\ ${texEq(B, texSetList([3, 5, 7]))}$ のとき、$${texIn("4", texSetDiff("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$4$ は $${A}$ に含まれ、$${B}$ に含まれないため差集合に含まれます。`,
  },
  {
    id: "set_comp_mem_2",
    title: "補集合の要素 2",
    statement: `$${texEq(U, texSetList([1, 2, 3, 4, 5, 6, 7]))},\\ ${texEq(A, texSetList([1, 3, 5, 7]))}$ のとき、$${texIn("2", texSetComp("A"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$2$ は $${A}$ に含まれないので補集合に含まれます。`,
  },
  {
    id: "set_mem_4",
    title: "要素の判定 4",
    statement: `$${texEq(A, texSetList([0, 2, 4, 8]))}$ のとき、$${texIn("8", A)}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$8$ は $${A}$ に含まれます。`,
  },
  {
    id: "set_mem_5",
    title: "要素の判定 5",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4, 5]))}$ のとき、$${texIn("0", A)}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$0$ は $${A}$ に含まれません。`,
  },
  {
    id: "set_union_mem_3",
    title: "和集合の要素 3",
    statement: `$${texEq(A, texSetList([1, 3, 5]))},\\ ${texEq(B, texSetList([2, 4, 6]))}$ のとき、$${texIn("6", texSetUnion("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$6$ は $${B}$ に含まれるので和集合に含まれます。`,
  },
  {
    id: "set_union_mem_4",
    title: "和集合の要素 4",
    statement: `$${texEq(A, texSetList([1, 2]))},\\ ${texEq(B, texSetList([3, 4]))}$ のとき、$${texIn("5", texSetUnion("A", "B"))}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$5$ は $${A}$ にも $${B}$ にも含まれません。`,
  },
  {
    id: "set_intersection_mem_3",
    title: "共通部分の要素 3",
    statement: `$${texEq(A, texSetList([2, 4, 6, 8]))},\\ ${texEq(B, texSetList([1, 2, 3, 4]))}$ のとき、$${texIn("4", texSetIntersection("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$4$ は $${A}$ と $${B}$ の両方に含まれるので共通部分に含まれます。`,
  },
  {
    id: "set_intersection_mem_4",
    title: "共通部分の要素 4",
    statement: `$${texEq(A, texSetList([1, 3, 5]))},\\ ${texEq(B, texSetList([2, 4, 6]))}$ のとき、$${texIn("3", texSetIntersection("A", "B"))}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$3$ は $${B}$ に含まれないので共通部分には含まれません。`,
  },
  {
    id: "set_diff_mem_3",
    title: "差集合の要素 3",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4, 5]))},\\ ${texEq(B, texSetList([2, 4]))}$ のとき、$${texIn("3", texSetDiff("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$3$ は $${A}$ に含まれ、$${B}$ に含まれないため差集合に含まれます。`,
  },
  {
    id: "set_diff_mem_4",
    title: "差集合の要素 4",
    statement: `$${texEq(A, texSetList([1, 2, 3, 4]))},\\ ${texEq(B, texSetList([1, 2, 3, 4]))}$ のとき、$${texIn("1", texSetDiff("A", "B"))}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$A$ と $B$ が同じなので差集合は空集合です。`,
  },
  {
    id: "set_comp_mem_3",
    title: "補集合の要素 3",
    statement: `$${texEq(U, texSetList([1, 2, 3, 4, 5, 6, 7, 8]))},\\ ${texEq(A, texSetList([2, 4, 6, 8]))}$ のとき、$${texIn("5", texSetComp("A"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$5$ は $${A}$ に含まれないので補集合に含まれます。`,
  },
  {
    id: "set_comp_mem_4",
    title: "補集合の要素 4",
    statement: `$${texEq(U, texSetList([1, 2, 3, 4, 5]))},\\ ${texEq(A, texSetList([1, 2, 3, 4, 5]))}$ のとき、$${texIn("2", texSetComp("A"))}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$A=U$ なので補集合は空集合です。`,
  },
  {
    id: "set_union_mem_5",
    title: "和集合の要素 5",
    statement: `$${texEq(A, texSetList([1, 4, 7]))},\\ ${texEq(B, texSetList([2, 5, 8]))}$ のとき、$${texIn("3", texSetUnion("A", "B"))}$ は成り立つか。`,
    correct: texText("いいえ"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$3$ は $${A}$ にも $${B}$ にも含まれません。`,
  },
  {
    id: "set_intersection_mem_5",
    title: "共通部分の要素 5",
    statement: `$${texEq(A, texSetList([1, 2, 3]))},\\ ${texEq(B, texSetList([3, 4, 5]))}$ のとき、$${texIn("3", texSetIntersection("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$3$ は $${A}$ と $${B}$ の両方に含まれます。`,
  },
  {
    id: "set_diff_mem_5",
    title: "差集合の要素 5",
    statement: `$${texEq(A, texSetList([2, 4, 6, 8]))},\\ ${texEq(B, texSetList([6, 8]))}$ のとき、$${texIn("4", texSetDiff("A", "B"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$4$ は $${A}$ に含まれ、$${B}$ に含まれないため差集合に含まれます。`,
  },
  {
    id: "set_comp_mem_5",
    title: "補集合の要素 5",
    statement: `$${texEq(U, texSetList([0, 1, 2, 3, 4, 5, 6]))},\\ ${texEq(A, texSetList([0, 2, 4, 6]))}$ のとき、$${texIn("1", texSetComp("A"))}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$1$ は $${A}$ に含まれないので補集合に含まれます。`,
  },
  {
    id: "set_mem_6",
    title: "要素の判定 6",
    statement: `$${texEq(A, texSetList(["-1", 0, 1]))}$ のとき、$${texIn("-1", A)}$ は成り立つか。`,
    correct: texText("はい"),
    choices: [texText("はい"), texText("いいえ")],
    explain: `### この問題の解説\n$-1$ は $${A}$ に含まれます。`,
  },
];

const numericCases: NumericCase[] = [
  {
    id: "set_union_count_1",
    title: "和集合の要素数 1",
    statement: `$${texCard("A")}=12,\\ ${texCard("B")}=9,\\ ${texCard(texSetIntersection("A", "B"))}=4$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 17,
    explain: `### この問題の解説\n$${texCard(texSetUnion("A", "B"))}=12+9-4=17$ です。`,
  },
  {
    id: "set_union_count_2",
    title: "和集合の要素数 2",
    statement: `$${texCard("A")}=10,\\ ${texCard("B")}=8,\\ ${texCard(texSetIntersection("A", "B"))}=3$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 15,
    explain: `### この問題の解説\n$10+8-3=15$ です。`,
  },
  {
    id: "set_comp_count_1",
    title: "補集合の要素数 1",
    statement: `$${texCard("U")}=20,\\ ${texCard("A")}=7$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 13,
    explain: `### この問題の解説\n$20-7=13$ です。`,
  },
  {
    id: "set_comp_count_2",
    title: "補集合の要素数 2",
    statement: `$${texCard("U")}=18,\\ ${texCard("A")}=5$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 13,
    explain: `### この問題の解説\n$18-5=13$ です。`,
  },
  {
    id: "set_diff_count_1",
    title: "差集合の要素数 1",
    statement: `$${texCard("A")}=11,\\ ${texCard(texSetIntersection("A", "B"))}=4$ のとき、$${texCard(texSetDiff("A", "B"))}$ を求めよ。`,
    answer: 7,
    explain: `### この問題の解説\n$11-4=7$ です。`,
  },
  {
    id: "set_diff_count_2",
    title: "差集合の要素数 2",
    statement: `$${texCard("A")}=9,\\ ${texCard(texSetIntersection("A", "B"))}=2$ のとき、$${texCard(texSetDiff("A", "B"))}$ を求めよ。`,
    answer: 7,
    explain: `### この問題の解説\n$9-2=7$ です。`,
  },
  {
    id: "set_venn_count_1",
    title: "ベン図の合計 1",
    statement: `集合 $${A},${B}$ で、$${A}$ のみが $5$、$${B}$ のみが $4$、共通部分が $2$ 個あるとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 11,
    explain: `### この問題の解説\n$5+4+2=11$ です。`,
  },
  {
    id: "set_venn_count_2",
    title: "ベン図の合計 2",
    statement: `集合 $${A},${B}$ で、$${A}$ のみが $3$、$${B}$ のみが $6$、共通部分が $1$ 個あるとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 10,
    explain: `### この問題の解説\n$3+6+1=10$ です。`,
  },
  {
    id: "set_union_count_3",
    title: "和集合の要素数 3",
    statement: `$${texCard("A")}=14,\\ ${texCard("B")}=9,\\ ${texCard(texSetIntersection("A", "B"))}=5$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 18,
    explain: `### この問題の解説\n$14+9-5=18$ です。`,
  },
  {
    id: "set_union_count_4",
    title: "和集合の要素数 4",
    statement: `$${texCard("A")}=8,\\ ${texCard("B")}=6,\\ ${texCard(texSetIntersection("A", "B"))}=1$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 13,
    explain: `### この問題の解説\n$8+6-1=13$ です。`,
  },
  {
    id: "set_union_count_5",
    title: "和集合の要素数 5",
    statement: `$${texCard("A")}=9,\\ ${texCard("B")}=7,\\ ${texCard(texSetIntersection("A", "B"))}=2$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 14,
    explain: `### この問題の解説\n$9+7-2=14$ です。`,
  },
  {
    id: "set_comp_count_3",
    title: "補集合の要素数 3",
    statement: `$${texCard("U")}=25,\\ ${texCard("A")}=9$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 16,
    explain: `### この問題の解説\n$25-9=16$ です。`,
  },
  {
    id: "set_comp_count_4",
    title: "補集合の要素数 4",
    statement: `$${texCard("U")}=30,\\ ${texCard("A")}=11$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 19,
    explain: `### この問題の解説\n$30-11=19$ です。`,
  },
  {
    id: "set_comp_count_5",
    title: "補集合の要素数 5",
    statement: `$${texCard("U")}=16,\\ ${texCard("A")}=6$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 10,
    explain: `### この問題の解説\n$16-6=10$ です。`,
  },
  {
    id: "set_diff_count_3",
    title: "差集合の要素数 3",
    statement: `$${texCard("A")}=14,\\ ${texCard(texSetIntersection("A", "B"))}=6$ のとき、$${texCard(texSetDiff("A", "B"))}$ を求めよ。`,
    answer: 8,
    explain: `### この問題の解説\n$14-6=8$ です。`,
  },
  {
    id: "set_venn_count_3",
    title: "ベン図の合計 3",
    statement: `集合 $${A},${B}$ で、$${A}$ のみが $4$、$${B}$ のみが $5$、共通部分が $3$ 個あるとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 12,
    explain: `### この問題の解説\n$4+5+3=12$ です。`,
  },
  {
    id: "set_venn_count_4",
    title: "ベン図の合計 4",
    statement: `集合 $${A},${B}$ で、$${A}$ のみが $2$、$${B}$ のみが $7$、共通部分が $4$ 個あるとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 13,
    explain: `### この問題の解説\n$2+7+4=13$ です。`,
  },
  {
    id: "set_union_count_11",
    title: "和集合の要素数 11",
    statement: `$${texCard("A")}=8,\\ ${texCard("B")}=6,\\ ${texCard(texSetIntersection("A", "B"))}=3$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 11,
    explain: `### この問題の解説\n$8+6-3=11$ です。`,
  },
  {
    id: "set_union_count_12",
    title: "和集合の要素数 12",
    statement: `$${texCard("A")}=15,\\ ${texCard("B")}=9,\\ ${texCard(texSetIntersection("A", "B"))}=4$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 20,
    explain: `### この問題の解説\n$15+9-4=20$ です。`,
  },
  {
    id: "set_union_count_13",
    title: "和集合の要素数 13",
    statement: `$${texCard("A")}=12,\\ ${texCard("B")}=10,\\ ${texCard(texSetIntersection("A", "B"))}=5$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 17,
    explain: `### この問題の解説\n$12+10-5=17$ です。`,
  },
  {
    id: "set_union_count_14",
    title: "和集合の要素数 14",
    statement: `集合 $${A},${B}$ で、$${A}$ のみが $6$、$${B}$ のみが $5$、共通部分が $2$ 個あるとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 13,
    explain: `### この問題の解説\n$6+5+2=13$ です。`,
  },
  {
    id: "set_union_count_15",
    title: "和集合の要素数 15",
    statement: `集合 $${A},${B}$ で、$${A}$ のみが $4$、$${B}$ のみが $7$、共通部分が $3$ 個あるとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 14,
    explain: `### この問題の解説\n$4+7+3=14$ です。`,
  },
  {
    id: "set_comp_count_6",
    title: "補集合の要素数 6",
    statement: `$${texCard("U")}=24,\\ ${texCard("A")}=9$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 15,
    explain: `### この問題の解説\n$24-9=15$ です。`,
  },
  {
    id: "set_comp_count_7",
    title: "補集合の要素数 7",
    statement: `$${texCard("U")}=40,\\ ${texCard("A")}=18$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 22,
    explain: `### この問題の解説\n$40-18=22$ です。`,
  },
  {
    id: "set_comp_count_8",
    title: "補集合の要素数 8",
    statement: `$${texCard("U")}=28,\\ ${texCard("A")}=12$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 16,
    explain: `### この問題の解説\n$28-12=16$ です。`,
  },
  {
    id: "set_diff_count_4",
    title: "差集合の要素数 4",
    statement: `$${texCard("A")}=14,\\ ${texCard(texSetIntersection("A", "B"))}=6$ のとき、$${texCard(texSetDiff("A", "B"))}$ を求めよ。`,
    answer: 8,
    explain: `### この問題の解説\n$14-6=8$ です。`,
  },
  {
    id: "set_diff_count_5",
    title: "差集合の要素数 5",
    statement: `$${texCard("A")}=9,\\ ${texCard(texSetIntersection("A", "B"))}=1$ のとき、$${texCard(texSetDiff("A", "B"))}$ を求めよ。`,
    answer: 8,
    explain: `### この問題の解説\n$9-1=8$ です。`,
  },
  {
    id: "set_diff_count_6",
    title: "差集合の要素数 6",
    statement: `$${texCard("A")}=20,\\ ${texCard(texSetIntersection("A", "B"))}=7$ のとき、$${texCard(texSetDiff("A", "B"))}$ を求めよ。`,
    answer: 13,
    explain: `### この問題の解説\n$20-7=13$ です。`,
  },
  {
    id: "set_diff_count_7",
    title: "差集合の要素数 7",
    statement: `$${texCard("A")}=16,\\ ${texCard(texSetIntersection("A", "B"))}=4$ のとき、$${texCard(texSetDiff("A", "B"))}$ を求めよ。`,
    answer: 12,
    explain: `### この問題の解説\n$16-4=12$ です。`,
  },
  {
    id: "set_union_count_16",
    title: "和集合の要素数 16",
    statement: `$${texCard("A")}=11,\\ ${texCard("B")}=8,\\ ${texCard(texSetIntersection("A", "B"))}=2$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 17,
    explain: `### この問題の解説\n$11+8-2=17$ です。`,
  },
  {
    id: "set_union_count_17",
    title: "和集合の要素数 17",
    statement: `$${texCard("A")}=9,\\ ${texCard("B")}=7,\\ ${texCard(texSetIntersection("A", "B"))}=0$ のとき、$${texCard(texSetUnion("A", "B"))}$ を求めよ。`,
    answer: 16,
    explain: `### この問題の解説\n$9+7-0=16$ です。`,
  },
  {
    id: "set_comp_count_9",
    title: "補集合の要素数 9",
    statement: `$${texCard("U")}=50,\\ ${texCard("A")}=23$ のとき、$${texCard(texSetComp("A"))}$ を求めよ。`,
    answer: 27,
    explain: `### この問題の解説\n$50-23=27$ です。`,
  },
];

export const setOperationsTemplates: QuestionTemplate[] = [
  ...choiceCases.map(buildChoice),
  ...numericCases.map(buildNumeric),
];
