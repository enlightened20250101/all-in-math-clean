// src/lib/course/templates/mathA/int_divisibility_tests_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type ChoiceCase = {
  id: string;
  title: string;
  statement: string;
  correct: string;
  choices: string[];
};

type DigitCase = {
  id: string;
  title: string;
  base: string;
  divisor: number;
  correct: number;
};

function buildChoice(c: ChoiceCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_divisibility_tests_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "divisibility"],
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
      return `
### この問題の解説
正しい答えは $${c.correct}$ です。
`;
    },
  };
}

function buildDigit(c: DigitCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_divisibility_tests_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "divisibility", "digit"],
    },
    generate() {
      const baseTeX = c.base.replace("_", "x");
      return {
        templateId: c.id,
        statement: `$${baseTeX}$ の $x$ を 0〜9 の数字とする。$${baseTeX}$ が $${c.divisor}$ で割り切れるようにするための最小の $x$ を答えよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.correct);
    },
    explain() {
      const baseTeX = c.base.replace("_", "x");
      return `
### この問題の解説
$x=${c.correct}$ とすると $${baseTeX}$ は $${c.divisor}$ で割り切れます。
`;
    },
  };
}

const CHOICE_CASES: ChoiceCase[] = [
  {
    id: "int_divtest_1",
    title: "3の倍数",
    statement: "次のうち $3$ で割り切れる数を選べ。",
    correct: "312",
    choices: ["312", "314", "325", "331"],
  },
  {
    id: "int_divtest_2",
    title: "9の倍数",
    statement: "次のうち $9$ で割り切れる数を選べ。",
    correct: "729",
    choices: ["729", "738", "747", "756"],
  },
  {
    id: "int_divtest_3",
    title: "11の倍数",
    statement: "次のうち $11$ で割り切れる数を選べ。",
    correct: "363",
    choices: ["363", "352", "374", "385"],
  },
  {
    id: "int_divtest_4",
    title: "4の倍数",
    statement: "次のうち $4$ で割り切れる数を選べ。",
    correct: "124",
    choices: ["124", "126", "138", "142"],
  },
  {
    id: "int_divtest_5",
    title: "8の倍数",
    statement: "次のうち $8$ で割り切れる数を選べ。",
    correct: "216",
    choices: ["216", "214", "218", "222"],
  },
  {
    id: "int_divtest_6",
    title: "5の倍数",
    statement: "次のうち $5$ で割り切れる数を選べ。",
    correct: "315",
    choices: ["315", "312", "318", "321"],
  },
  {
    id: "int_divtest_7",
    title: "2の倍数",
    statement: "次のうち $2$ で割り切れる数を選べ。",
    correct: "408",
    choices: ["408", "409", "417", "425"],
  },
  {
    id: "int_divtest_8",
    title: "3の倍数",
    statement: "次のうち $3$ で割り切れる数を選べ。",
    correct: "402",
    choices: ["402", "409", "412", "421"],
  },
  {
    id: "int_divtest_9",
    title: "9の倍数",
    statement: "次のうち $9$ で割り切れる数を選べ。",
    correct: "648",
    choices: ["648", "642", "651", "657"],
  },
  {
    id: "int_divtest_10",
    title: "11の倍数",
    statement: "次のうち $11$ で割り切れる数を選べ。",
    correct: "121",
    choices: ["121", "123", "135", "145"],
  },
  {
    id: "int_divtest_11",
    title: "4の倍数",
    statement: "次のうち $4$ で割り切れる数を選べ。",
    correct: "732",
    choices: ["732", "734", "736", "739"],
  },
  {
    id: "int_divtest_12",
    title: "8の倍数",
    statement: "次のうち $8$ で割り切れる数を選べ。",
    correct: "504",
    choices: ["504", "502", "506", "512"],
  },
  {
    id: "int_divtest_13",
    title: "3の倍数",
    statement: "次のうち $3$ で割り切れる数を選べ。",
    correct: "222",
    choices: ["222", "221", "224", "227"],
  },
  {
    id: "int_divtest_14",
    title: "9の倍数",
    statement: "次のうち $9$ で割り切れる数を選べ。",
    correct: "819",
    choices: ["819", "818", "827", "835"],
  },
  {
    id: "int_divtest_15",
    title: "11の倍数",
    statement: "次のうち $11$ で割り切れる数を選べ。",
    correct: "605",
    choices: ["605", "604", "616", "625"],
  },
  {
    id: "int_divtest_16",
    title: "3の倍数",
    statement: "次のうち $3$ で割り切れる数を選べ。",
    correct: "531",
    choices: ["531", "532", "535", "527"],
  },
  {
    id: "int_divtest_17",
    title: "9の倍数",
    statement: "次のうち $9$ で割り切れる数を選べ。",
    correct: "918",
    choices: ["918", "919", "926", "935"],
  },
  {
    id: "int_divtest_18",
    title: "11の倍数",
    statement: "次のうち $11$ で割り切れる数を選べ。",
    correct: "682",
    choices: ["682", "674", "689", "693"],
  },
  {
    id: "int_divtest_19",
    title: "4の倍数",
    statement: "次のうち $4$ で割り切れる数を選べ。",
    correct: "516",
    choices: ["516", "514", "518", "522"],
  },
  {
    id: "int_divtest_20",
    title: "8の倍数",
    statement: "次のうち $8$ で割り切れる数を選べ。",
    correct: "624",
    choices: ["624", "622", "626", "628"],
  },
  {
    id: "int_divtest_21",
    title: "5の倍数",
    statement: "次のうち $5$ で割り切れる数を選べ。",
    correct: "745",
    choices: ["745", "742", "748", "751"],
  },
  {
    id: "int_divtest_22",
    title: "2の倍数",
    statement: "次のうち $2$ で割り切れる数を選べ。",
    correct: "906",
    choices: ["906", "907", "913", "925"],
  },
  {
    id: "int_divtest_23",
    title: "3の倍数",
    statement: "次のうち $3$ で割り切れる数を選べ。",
    correct: "609",
    choices: ["609", "610", "617", "625"],
  },
  {
    id: "int_divtest_24",
    title: "9の倍数",
    statement: "次のうち $9$ で割り切れる数を選べ。",
    correct: "999",
    choices: ["999", "998", "997", "995"],
  },
  {
    id: "int_divtest_25",
    title: "11の倍数",
    statement: "次のうち $11$ で割り切れる数を選べ。",
    correct: "1210",
    choices: ["1210", "1211", "1220", "1230"],
  },
  {
    id: "int_divtest_26",
    title: "4の倍数",
    statement: "次のうち $4$ で割り切れる数を選べ。",
    correct: "1332",
    choices: ["1332", "1330", "1334", "1335"],
  },
  {
    id: "int_divtest_27",
    title: "8の倍数",
    statement: "次のうち $8$ で割り切れる数を選べ。",
    correct: "712",
    choices: ["712", "714", "718", "719"],
  },
  {
    id: "int_divtest_28",
    title: "3の倍数",
    statement: "次のうち $3$ で割り切れる数を選べ。",
    correct: "783",
    choices: ["783", "781", "782", "785"],
  },
  {
    id: "int_divtest_29",
    title: "9の倍数",
    statement: "次のうち $9$ で割り切れる数を選べ。",
    correct: "738",
    choices: ["738", "739", "740", "741"],
  },
  {
    id: "int_divtest_30",
    title: "11の倍数",
    statement: "次のうち $11$ で割り切れる数を選べ。",
    correct: "1001",
    choices: ["1001", "1002", "1003", "1004"],
  },
];

const DIGIT_CASES: DigitCase[] = [
  { id: "int_divdigit_1", title: "3で割り切る", base: "12_", divisor: 3, correct: 0 },
  { id: "int_divdigit_2", title: "3で割り切る", base: "45_", divisor: 3, correct: 0 },
  { id: "int_divdigit_3", title: "3で割り切る", base: "27_", divisor: 3, correct: 0 },
  { id: "int_divdigit_4", title: "9で割り切る", base: "36_", divisor: 9, correct: 0 },
  { id: "int_divdigit_5", title: "9で割り切る", base: "18_", divisor: 9, correct: 0 },
  { id: "int_divdigit_6", title: "9で割り切る", base: "72_", divisor: 9, correct: 0 },
  { id: "int_divdigit_7", title: "3で割り切る", base: "14_", divisor: 3, correct: 1 },
  { id: "int_divdigit_8", title: "9で割り切る", base: "25_", divisor: 9, correct: 2 },
  { id: "int_divdigit_9", title: "9で割り切る", base: "52_", divisor: 9, correct: 3 },
  { id: "int_divdigit_10", title: "3で割り切る", base: "23_", divisor: 3, correct: 1 },
  { id: "int_divdigit_11", title: "3で割り切る", base: "1_4", divisor: 3, correct: 1 },
  { id: "int_divdigit_12", title: "3で割り切る", base: "7_2", divisor: 3, correct: 0 },
  { id: "int_divdigit_13", title: "3で割り切る", base: "8_5", divisor: 3, correct: 2 },
  { id: "int_divdigit_14", title: "3で割り切る", base: "3_6", divisor: 3, correct: 0 },
  { id: "int_divdigit_15", title: "3で割り切る", base: "9_1", divisor: 3, correct: 2 },
  { id: "int_divdigit_16", title: "3で割り切る", base: "2_8", divisor: 3, correct: 2 },
  { id: "int_divdigit_17", title: "3で割り切る", base: "4_7", divisor: 3, correct: 1 },
  { id: "int_divdigit_18", title: "3で割り切る", base: "5_9", divisor: 3, correct: 1 },
  { id: "int_divdigit_19", title: "3で割り切る", base: "6_3", divisor: 3, correct: 0 },
  { id: "int_divdigit_20", title: "9で割り切る", base: "1_7", divisor: 9, correct: 1 },
  { id: "int_divdigit_21", title: "9で割り切る", base: "4_5", divisor: 9, correct: 0 },
  { id: "int_divdigit_22", title: "9で割り切る", base: "2_3", divisor: 9, correct: 4 },
  { id: "int_divdigit_23", title: "9で割り切る", base: "6_4", divisor: 9, correct: 8 },
  { id: "int_divdigit_24", title: "9で割り切る", base: "5_8", divisor: 9, correct: 5 },
  { id: "int_divdigit_25", title: "9で割り切る", base: "7_0", divisor: 9, correct: 2 },
];

export const intDivisibilityTestsTemplates: QuestionTemplate[] = [
  ...CHOICE_CASES.map(buildChoice),
  ...DIGIT_CASES.map(buildDigit),
];
