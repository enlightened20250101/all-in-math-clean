// src/lib/course/templates/mathA/prob_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick } from "../_shared/utils";
import { texFrac, texProb } from "@/lib/format/tex";

type ProbCase = {
  id: string;
  title: string;
  statement: string;
  correct: string;
  choices: string[];
  explain: string;
};

function buildTemplate(c: ProbCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "prob_basic",
      title: c.title,
      difficulty: 1,
      tags: ["probability", "basic"],
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

const CASES: ProbCase[] = [
  {
    id: "prob_basic_die_1",
    title: "サイコロ：1が出る",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("1")}\n$$`,
    correct: texFrac(1, 6),
    choices: [texFrac(1, 6), texFrac(1, 3), texFrac(1, 2), texFrac(1, 4)],
    explain: `
### この問題の解説
全体6通りのうち、1が出るのは1通りです。

$$
${texProb("1")} = \\frac{1}{6}
$$
`,
  },
  {
    id: "prob_basic_die_2",
    title: "サイコロ：偶数が出る",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{偶数}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
偶数は 2,4,6 の3通りです。

$$
${texProb("\\text{偶数}")} = \\frac{3}{6} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_die_3",
    title: "サイコロ：5以上が出る",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{5以上}")}\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `
### この問題の解説
5以上は 5,6 の2通りです。

$$
${texProb("\\text{5以上}")} = \\frac{2}{6} = \\frac{1}{3}
$$
`,
  },
  {
    id: "prob_basic_die_4",
    title: "サイコロ：2以下が出る",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{2以下}")}\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `
### この問題の解説
2以下は 1,2 の2通りです。

$$
${texProb("\\text{2以下}")} = \\frac{2}{6} = \\frac{1}{3}
$$
`,
  },
  {
    id: "prob_basic_coin_1",
    title: "コイン：表が出る",
    statement: `コインを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 4), texFrac(3, 4), texFrac(1, 3)],
    explain: `
### この問題の解説
表/裏の2通りで、表は1通りです。

$$
${texProb("\\text{表}")} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_coin_2",
    title: "コイン2回：両方表",
    statement: `コインを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{両方表}")}\n$$`,
    correct: texFrac(1, 4),
    choices: [texFrac(1, 4), texFrac(1, 2), texFrac(3, 4), texFrac(1, 3)],
    explain: `
### この問題の解説
2回の結果は4通りで、両方表は1通りです。

$$
${texProb("\\text{両方表}")} = \\frac{1}{4}
$$
`,
  },
  {
    id: "prob_basic_coin_3",
    title: "コイン2回：表が1回",
    statement: `コインを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が1回}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 4), texFrac(3, 4), texFrac(2, 3)],
    explain: `
### この問題の解説
表が1回は (表裏, 裏表) の2通りです。

$$
${texProb("\\text{表が1回}")} = \\frac{2}{4} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_coin_4",
    title: "コイン3回：表が3回",
    statement: `コインを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が3回}")}\n$$`,
    correct: texFrac(1, 8),
    choices: [texFrac(1, 8), texFrac(3, 8), texFrac(1, 4), texFrac(1, 2)],
    explain: `
### この問題の解説
3回とも表は1通りです。

$$
${texProb("\\text{表が3回}")} = \\frac{1}{8}
$$
`,
  },
  {
    id: "prob_basic_coin_5",
    title: "コイン3回：表が2回",
    statement: `コインを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が2回}")}\n$$`,
    correct: texFrac(3, 8),
    choices: [texFrac(3, 8), texFrac(1, 8), texFrac(1, 4), texFrac(1, 2)],
    explain: `
### この問題の解説
表が2回は ${texFrac(3, 8)} です。
`,
  },
  {
    id: "prob_basic_sum_1",
    title: "2個のサイコロ：和が2",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=2")}\n$$`,
    correct: texFrac(1, 36),
    choices: [texFrac(1, 36), texFrac(1, 18), texFrac(1, 12), texFrac(1, 6)],
    explain: `
### この問題の解説
和が2は (1,1) の1通りです。

$$
${texProb("S=2")} = \\frac{1}{36}
$$
`,
  },
  {
    id: "prob_basic_sum_2",
    title: "2個のサイコロ：和が3",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=3")}\n$$`,
    correct: texFrac(1, 18),
    choices: [texFrac(1, 18), texFrac(1, 36), texFrac(1, 12), texFrac(1, 9)],
    explain: `
### この問題の解説
和が3は (1,2),(2,1) の2通りです。

$$
${texProb("S=3")} = \\frac{2}{36} = \\frac{1}{18}
$$
`,
  },
  {
    id: "prob_basic_sum_3",
    title: "2個のサイコロ：和が4",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=4")}\n$$`,
    correct: texFrac(1, 12),
    choices: [texFrac(1, 12), texFrac(1, 18), texFrac(1, 9), texFrac(1, 6)],
    explain: `
### この問題の解説
和が4は (1,3),(2,2),(3,1) の3通りです。

$$
${texProb("S=4")} = \\frac{3}{36} = \\frac{1}{12}
$$
`,
  },
  {
    id: "prob_basic_sum_4",
    title: "2個のサイコロ：和が5",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=5")}\n$$`,
    correct: texFrac(1, 9),
    choices: [texFrac(1, 9), texFrac(1, 12), texFrac(1, 18), texFrac(5, 36)],
    explain: `
### この問題の解説
和が5は4通りです。

$$
${texProb("S=5")} = \\frac{4}{36} = \\frac{1}{9}
$$
`,
  },
  {
    id: "prob_basic_sum_5",
    title: "2個のサイコロ：和が6",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=6")}\n$$`,
    correct: texFrac(5, 36),
    choices: [texFrac(5, 36), texFrac(1, 9), texFrac(1, 6), texFrac(1, 12)],
    explain: `
### この問題の解説
和が6は (1,5),(2,4),(3,3),(4,2),(5,1) の5通りです。

$$
${texProb("S=6")} = \\frac{5}{36}
$$
`,
  },
  {
    id: "prob_basic_sum_6",
    title: "2個のサイコロ：和が7",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=7")}\n$$`,
    correct: texFrac(1, 6),
    choices: [texFrac(1, 6), texFrac(5, 36), texFrac(1, 9), texFrac(1, 12)],
    explain: `
### この問題の解説
和が7は6通りです。

$$
${texProb("S=7")} = \\frac{6}{36} = \\frac{1}{6}
$$
`,
  },
  {
    id: "prob_basic_sum_7",
    title: "2個のサイコロ：和が8",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=8")}\n$$`,
    correct: texFrac(5, 36),
    choices: [texFrac(5, 36), texFrac(1, 6), texFrac(1, 9), texFrac(1, 12)],
    explain: `
### この問題の解説
和が8は5通りです。

$$
${texProb("S=8")} = \\frac{5}{36}
$$
`,
  },
  {
    id: "prob_basic_sum_8",
    title: "2個のサイコロ：和が9",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=9")}\n$$`,
    correct: texFrac(1, 9),
    choices: [texFrac(1, 9), texFrac(5, 36), texFrac(1, 6), texFrac(1, 12)],
    explain: `
### この問題の解説
和が9は4通りです。

$$
${texProb("S=9")} = \\frac{4}{36} = \\frac{1}{9}
$$
`,
  },
  {
    id: "prob_basic_sum_9",
    title: "2個のサイコロ：和が10",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=10")}\n$$`,
    correct: texFrac(1, 12),
    choices: [texFrac(1, 12), texFrac(1, 9), texFrac(1, 6), texFrac(5, 36)],
    explain: `
### この問題の解説
和が10は3通りです。

$$
${texProb("S=10")} = \\frac{3}{36} = \\frac{1}{12}
$$
`,
  },
  {
    id: "prob_basic_sum_10",
    title: "2個のサイコロ：和が11",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=11")}\n$$`,
    correct: texFrac(1, 18),
    choices: [texFrac(1, 18), texFrac(1, 12), texFrac(1, 9), texFrac(5, 36)],
    explain: `
### この問題の解説
和が11は2通りです。

$$
${texProb("S=11")} = \\frac{2}{36} = \\frac{1}{18}
$$
`,
  },
  {
    id: "prob_basic_sum_11",
    title: "2個のサイコロ：和が12",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=12")}\n$$`,
    correct: texFrac(1, 36),
    choices: [texFrac(1, 36), texFrac(1, 18), texFrac(1, 12), texFrac(1, 6)],
    explain: `
### この問題の解説
和が12は (6,6) の1通りです。

$$
${texProb("S=12")} = \\frac{1}{36}
$$
`,
  },
  {
    id: "prob_basic_coin_6",
    title: "コイン4回：表が4回",
    statement: `コインを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が4回}")}\n$$`,
    correct: texFrac(1, 16),
    choices: [texFrac(1, 16), texFrac(1, 8), texFrac(1, 4), texFrac(3, 16)],
    explain: `
### この問題の解説
4回とも表は1通りです。

$$
${texProb("\\text{表が4回}")} = \\frac{1}{16}
$$
`,
  },
  {
    id: "prob_basic_die_prime_1",
    title: "サイコロ：素数が出る",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{素数}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
素数は 2,3,5 の3通りです。

$$
${texProb("\\text{素数}")} = \\frac{3}{6} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_die_multiple_1",
    title: "サイコロ：3の倍数が出る",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("3\\text{の倍数}")}\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `
### この問題の解説
3の倍数は 3,6 の2通りです。

$$
${texProb("3\\text{の倍数}")} = \\frac{2}{6} = \\frac{1}{3}
$$
`,
  },
  {
    id: "prob_basic_sum_5",
    title: "2個のサイコロ：和が6",
    statement: `2個のサイコロを投げ、出た目の和を $S$ とする。次の確率を求めよ。\n\n$$\n${texProb("S=6")}\n$$`,
    correct: texFrac(5, 36),
    choices: [texFrac(5, 36), texFrac(1, 9), texFrac(1, 6), texFrac(1, 12)],
    explain: `
### この問題の解説
和が6は5通りです。

$$
${texProb("S=6")} = \\frac{5}{36}
$$
`,
  },
  {
    id: "prob_basic_balls_1",
    title: "玉：赤が出る",
    statement: `箱に赤3個・青2個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{赤}")}\n$$`,
    correct: texFrac(3, 5),
    choices: [texFrac(3, 5), texFrac(2, 5), texFrac(1, 2), texFrac(1, 3)],
    explain: `
### この問題の解説
全体5個中、赤は3個です。

$$
${texProb("\\text{赤}")} = \\frac{3}{5}
$$
`,
  },
  {
    id: "prob_basic_balls_2",
    title: "玉：青が出る",
    statement: `箱に赤4個・青1個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{青}")}\n$$`,
    correct: texFrac(1, 5),
    choices: [texFrac(1, 5), texFrac(4, 5), texFrac(1, 4), texFrac(1, 6)],
    explain: `
### この問題の解説
全体5個中、青は1個です。

$$
${texProb("\\text{青}")} = \\frac{1}{5}
$$
`,
  },
  {
    id: "prob_basic_balls_3",
    title: "玉：2回とも赤",
    statement: `箱に赤2個・青3個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{2回とも赤}")}\n$$`,
    correct: texFrac(1, 10),
    choices: [texFrac(1, 10), texFrac(1, 5), texFrac(3, 10), texFrac(1, 4)],
    explain: `
### この問題の解説
赤→赤の確率は

$$
\\frac{2}{5}\\cdot\\frac{1}{4} = \\frac{1}{10}
$$
`,
  },
  {
    id: "prob_basic_balls_4",
    title: "玉：2回とも青",
    statement: `箱に赤3個・青2個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{2回とも青}")}\n$$`,
    correct: texFrac(1, 10),
    choices: [texFrac(1, 10), texFrac(1, 5), texFrac(2, 5), texFrac(1, 4)],
    explain: `
### この問題の解説
青→青の確率は

$$
\\frac{2}{5}\\cdot\\frac{1}{4} = \\frac{1}{10}
$$
`,
  },
  {
    id: "prob_basic_balls_5",
    title: "玉：白が出る",
    statement: `箱に白5個・黒3個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{白}")}\n$$`,
    correct: texFrac(5, 8),
    choices: [texFrac(5, 8), texFrac(3, 8), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
全体8個中、白は5個です。

$$
${texProb("\\text{白}")} = \\frac{5}{8}
$$
`,
  },
  {
    id: "prob_basic_balls_6",
    title: "玉：2回とも白",
    statement: `箱に白5個・黒3個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{2回とも白}")}\n$$`,
    correct: texFrac(5, 14),
    choices: [texFrac(5, 14), texFrac(1, 2), texFrac(3, 14), texFrac(5, 16)],
    explain: `
### この問題の解説
白→白の確率は

$$
\\frac{5}{8}\\cdot\\frac{4}{7} = \\frac{20}{56} = \\frac{5}{14}
$$
`,
  },
  {
    id: "prob_basic_coin_4",
    title: "コイン2回：裏が1回",
    statement: `コインを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{裏が1回}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 4), texFrac(3, 4), texFrac(2, 3)],
    explain: `
### この問題の解説
裏が1回は (裏表, 表裏) の2通りです。

$$
${texProb("\\text{裏が1回}")} = \\frac{2}{4} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_die_5",
    title: "サイコロ：3の倍数",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{3の倍数}")}\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `
### この問題の解説
3の倍数は 3,6 の2通りです。

$$
${texProb("\\text{3の倍数}")} = \\frac{2}{6} = \\frac{1}{3}
$$
`,
  },
  {
    id: "prob_basic_balls_7",
    title: "玉：青が出る",
    statement: `箱に赤2個・青4個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{青}")}\n$$`,
    correct: texFrac(2, 3),
    choices: [texFrac(2, 3), texFrac(1, 3), texFrac(1, 2), texFrac(3, 5)],
    explain: `
### この問題の解説
全体6個中、青は4個です。

$$
${texProb("\\text{青}")} = \\frac{4}{6} = \\frac{2}{3}
$$
`,
  },
  {
    id: "prob_basic_balls_8",
    title: "玉：赤が出る",
    statement: `箱に赤1個・青3個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{赤}")}\n$$`,
    correct: texFrac(1, 4),
    choices: [texFrac(1, 4), texFrac(1, 2), texFrac(3, 4), texFrac(1, 3)],
    explain: `
### この問題の解説
全体4個中、赤は1個です。

$$
${texProb("\\text{赤}")} = \\frac{1}{4}
$$
`,
  },
  {
    id: "prob_basic_die_6",
    title: "サイコロ：1より大きい",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{1より大きい}")}\n$$`,
    correct: texFrac(5, 6),
    choices: [texFrac(5, 6), texFrac(1, 6), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
1より大きいのは 2,3,4,5,6 の5通りです。

$$
${texProb("\\text{1より大きい}")} = \\frac{5}{6}
$$
`,
  },
  {
    id: "prob_basic_extra_1",
    title: "サイコロ：奇数",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{奇数}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
奇数は 1,3,5 の3通りです。

$$
${texProb("\\text{奇数}")} = \\frac{3}{6} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_extra_2",
    title: "サイコロ：偶数",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{偶数}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
偶数は 2,4,6 の3通りです。

$$
${texProb("\\text{偶数}")} = \\frac{3}{6} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_extra_3",
    title: "サイコロ：4以上",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{4以上}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
4以上は 4,5,6 の3通りです。

$$
${texProb("\\text{4以上}")} = \\frac{3}{6} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_extra_4",
    title: "サイコロ：4以下",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{4以下}")}\n$$`,
    correct: texFrac(2, 3),
    choices: [texFrac(2, 3), texFrac(1, 2), texFrac(1, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
4以下は 1,2,3,4 の4通りです。

$$
${texProb("\\text{4以下}")} = \\frac{4}{6} = \\frac{2}{3}
$$
`,
  },
  {
    id: "prob_basic_extra_5",
    title: "サイコロ：1または2",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("1\\text{または}2")}\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `
### この問題の解説
1または2は2通りです。

$$
${texProb("1\\text{または}2")} = \\frac{2}{6} = \\frac{1}{3}
$$
`,
  },
  {
    id: "prob_basic_extra_6",
    title: "サイコロ：1または6",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("1\\text{または}6")}\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `
### この問題の解説
1または6は2通りです。

$$
${texProb("1\\text{または}6")} = \\frac{2}{6} = \\frac{1}{3}
$$
`,
  },
  {
    id: "prob_basic_extra_7",
    title: "サイコロ：素数でない",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{素数でない}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
素数でないのは 1,4,6 の3通りです。

$$
${texProb("\\text{素数でない}")} = \\frac{3}{6} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_extra_8",
    title: "サイコロ：4の倍数",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("4\\text{の倍数}")}\n$$`,
    correct: texFrac(1, 6),
    choices: [texFrac(1, 6), texFrac(1, 3), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
4の倍数は4のみです。

$$
${texProb("4\\text{の倍数}")} = \\frac{1}{6}
$$
`,
  },
  {
    id: "prob_basic_extra_9",
    title: "サイコロ：5以上",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{5以上}")}\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `
### この問題の解説
5以上は 5,6 の2通りです。

$$
${texProb("\\text{5以上}")} = \\frac{2}{6} = \\frac{1}{3}
$$
`,
  },
  {
    id: "prob_basic_extra_10",
    title: "サイコロ：2または3",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("2\\text{または}3")}\n$$`,
    correct: texFrac(1, 3),
    choices: [texFrac(1, 3), texFrac(1, 2), texFrac(1, 6), texFrac(2, 3)],
    explain: `
### この問題の解説
2または3は2通りです。

$$
${texProb("2\\text{または}3")} = \\frac{2}{6} = \\frac{1}{3}
$$
`,
  },
  {
    id: "prob_basic_extra_11",
    title: "コイン3回：表が1回",
    statement: `コインを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が1回}")}\n$$`,
    correct: texFrac(3, 8),
    choices: [texFrac(3, 8), texFrac(1, 8), texFrac(1, 4), texFrac(1, 2)],
    explain: `
### この問題の解説
表が1回は3通りです。

$$
${texProb("\\text{表が1回}")} = \\frac{3}{8}
$$
`,
  },
  {
    id: "prob_basic_extra_12",
    title: "コイン3回：表が2回",
    statement: `コインを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が2回}")}\n$$`,
    correct: texFrac(3, 8),
    choices: [texFrac(3, 8), texFrac(1, 8), texFrac(1, 4), texFrac(1, 2)],
    explain: `
### この問題の解説
表が2回は3通りです。

$$
${texProb("\\text{表が2回}")} = \\frac{3}{8}
$$
`,
  },
  {
    id: "prob_basic_extra_13",
    title: "コイン3回：表が0回",
    statement: `コインを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が0回}")}\n$$`,
    correct: texFrac(1, 8),
    choices: [texFrac(1, 8), texFrac(3, 8), texFrac(1, 4), texFrac(1, 2)],
    explain: `
### この問題の解説
3回とも裏は1通りです。

$$
${texProb("\\text{表が0回}")} = \\frac{1}{8}
$$
`,
  },
  {
    id: "prob_basic_extra_14",
    title: "コイン4回：表が2回",
    statement: `コインを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が2回}")}\n$$`,
    correct: texFrac(3, 8),
    choices: [texFrac(3, 8), texFrac(1, 8), texFrac(1, 4), texFrac(1, 2)],
    explain: `
### この問題の解説
表が2回は6通りです。

$$
${texProb("\\text{表が2回}")} = \\frac{6}{16} = \\frac{3}{8}
$$
`,
  },
  {
    id: "prob_basic_extra_15",
    title: "コイン4回：表が1回",
    statement: `コインを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が1回}")}\n$$`,
    correct: texFrac(1, 4),
    choices: [texFrac(1, 4), texFrac(3, 8), texFrac(1, 8), texFrac(1, 2)],
    explain: `
### この問題の解説
表が1回は4通りです。

$$
${texProb("\\text{表が1回}")} = \\frac{4}{16} = \\frac{1}{4}
$$
`,
  },
  {
    id: "prob_basic_extra_16",
    title: "コイン4回：表が3回",
    statement: `コインを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が3回}")}\n$$`,
    correct: texFrac(1, 4),
    choices: [texFrac(1, 4), texFrac(3, 8), texFrac(1, 8), texFrac(1, 2)],
    explain: `
### この問題の解説
表が3回は4通りです。

$$
${texProb("\\text{表が3回}")} = \\frac{4}{16} = \\frac{1}{4}
$$
`,
  },
  {
    id: "prob_basic_extra_17",
    title: "コイン2回：同じ面",
    statement: `コインを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{同じ面}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 4), texFrac(3, 4), texFrac(2, 3)],
    explain: `
### この問題の解説
同じ面は (表表, 裏裏) の2通りです。

$$
${texProb("\\text{同じ面}")} = \\frac{2}{4} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_extra_18",
    title: "2個のサイコロ：和が10以上",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("S\\ge 10")}\n$$`,
    correct: texFrac(1, 6),
    choices: [texFrac(1, 6), texFrac(1, 9), texFrac(1, 12), texFrac(5, 36)],
    explain: `
### この問題の解説
和が10,11,12は 3+2+1=6 通りです。

$$
${texProb("S\\ge 10")} = \\frac{6}{36} = \\frac{1}{6}
$$
`,
  },
  {
    id: "prob_basic_extra_19",
    title: "2個のサイコロ：和が4以下",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("S\\le 4")}\n$$`,
    correct: texFrac(1, 6),
    choices: [texFrac(1, 6), texFrac(1, 9), texFrac(1, 12), texFrac(5, 36)],
    explain: `
### この問題の解説
和が2,3,4は 1+2+3=6 通りです。

$$
${texProb("S\\le 4")} = \\frac{6}{36} = \\frac{1}{6}
$$
`,
  },
  {
    id: "prob_basic_extra_20",
    title: "2個のサイコロ：和が偶数",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("S\\text{が偶数}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
偶数の和は18通りです。

$$
${texProb("S\\text{が偶数}")} = \\frac{18}{36} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_extra_21",
    title: "2個のサイコロ：和が奇数",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("S\\text{が奇数}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 3), texFrac(2, 3), texFrac(1, 6)],
    explain: `
### この問題の解説
奇数の和は18通りです。

$$
${texProb("S\\text{が奇数}")} = \\frac{18}{36} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_basic_extra_22",
    title: "2個のサイコロ：和が7または11",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("S=7\\ \\text{or}\\ 11")}\n$$`,
    correct: texFrac(2, 9),
    choices: [texFrac(2, 9), texFrac(1, 6), texFrac(1, 9), texFrac(5, 36)],
    explain: `
### この問題の解説
和が7は6通り、11は2通りなので合計8通りです。

$$
${texProb("S=7\\ \\text{or}\\ 11")} = \\frac{8}{36} = \\frac{2}{9}
$$
`,
  },
  {
    id: "prob_basic_extra_23",
    title: "2個のサイコロ：和が6または8",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("S=6\\ \\text{or}\\ 8")}\n$$`,
    correct: texFrac(5, 18),
    choices: [texFrac(5, 18), texFrac(1, 6), texFrac(1, 9), texFrac(5, 36)],
    explain: `
### この問題の解説
和が6と8は5通りずつで合計10通りです。

$$
${texProb("S=6\\ \\text{or}\\ 8")} = \\frac{10}{36} = \\frac{5}{18}
$$
`,
  },
  {
    id: "prob_basic_extra_24",
    title: "2個のサイコロ：少なくとも1回6",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回6}")}\n$$`,
    correct: texFrac(11, 36),
    choices: [texFrac(11, 36), texFrac(25, 36), texFrac(1, 6), texFrac(1, 3)],
    explain: `
### この問題の解説
補集合は「どちらも6以外」です。

$$
${texProb("\\text{少なくとも1回6}")} = 1 - \\left(\\frac{5}{6}\\right)^2 = \\frac{11}{36}
$$
`,
  },
  {
    id: "prob_basic_extra_25",
    title: "2個のサイコロ：同じ目",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{同じ目}")}\n$$`,
    correct: texFrac(1, 6),
    choices: [texFrac(1, 6), texFrac(1, 9), texFrac(1, 12), texFrac(5, 36)],
    explain: `
### この問題の解説
同じ目は 6 通りです。

$$
${texProb("\\text{同じ目}")} = \\frac{6}{36} = \\frac{1}{6}
$$
`,
  },
  {
    id: "prob_basic_extra_26",
    title: "玉：赤が出る（2/1）",
    statement: `箱に赤2個・青1個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{赤}")}\n$$`,
    correct: texFrac(2, 3),
    choices: [texFrac(2, 3), texFrac(1, 3), texFrac(1, 2), texFrac(3, 5)],
    explain: `
### この問題の解説
全体3個中、赤は2個です。

$$
${texProb("\\text{赤}")} = \\frac{2}{3}
$$
`,
  },
  {
    id: "prob_basic_extra_27",
    title: "玉：白が出る（2/5）",
    statement: `箱に白2個・黒5個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{白}")}\n$$`,
    correct: texFrac(2, 7),
    choices: [texFrac(2, 7), texFrac(5, 7), texFrac(1, 2), texFrac(1, 3)],
    explain: `
### この問題の解説
全体7個中、白は2個です。

$$
${texProb("\\text{白}")} = \\frac{2}{7}
$$
`,
  },
  {
    id: "prob_basic_extra_28",
    title: "玉：2回とも赤（4/2）",
    statement: `箱に赤4個・青2個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{2回とも赤}")}\n$$`,
    correct: texFrac(2, 5),
    choices: [texFrac(2, 5), texFrac(1, 5), texFrac(1, 3), texFrac(1, 2)],
    explain: `
### この問題の解説
赤→赤の確率は

$$
\\frac{4}{6}\\cdot\\frac{3}{5} = \\frac{12}{30} = \\frac{2}{5}
$$
`,
  },
  {
    id: "prob_basic_extra_29",
    title: "玉：2回とも青（4/2）",
    statement: `箱に赤4個・青2個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{2回とも青}")}\n$$`,
    correct: texFrac(1, 15),
    choices: [texFrac(1, 15), texFrac(2, 15), texFrac(1, 10), texFrac(1, 6)],
    explain: `
### この問題の解説
青→青の確率は

$$
\\frac{2}{6}\\cdot\\frac{1}{5} = \\frac{1}{15}
$$
`,
  },
  {
    id: "prob_basic_extra_30",
    title: "2個のサイコロ：和が8以上",
    statement: `2個のサイコロを投げる。次の確率を求めよ。\n\n$$\n${texProb("S\\ge 8")}\n$$`,
    correct: texFrac(5, 12),
    choices: [texFrac(5, 12), texFrac(1, 2), texFrac(5, 18), texFrac(1, 3)],
    explain: `
### この問題の解説
和が8,9,10,11,12は 5+4+3+2+1=15 通りです。

$$
${texProb("S\\ge 8")} = \\frac{15}{36} = \\frac{5}{12}
$$
`,
  },
];

export const probBasicTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
