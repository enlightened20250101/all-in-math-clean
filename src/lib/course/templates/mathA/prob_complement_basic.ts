// src/lib/course/templates/mathA/prob_complement_basic.ts
import type { QuestionTemplate } from "../../types";
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
      topicId: "prob_complement_basic",
      title: c.title,
      difficulty: 1,
      tags: ["probability", "complement"],
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
    id: "prob_comp_coin_1",
    title: "コイン2回：少なくとも1回表",
    statement: `コインを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回表}")}\n$$`,
    correct: texFrac(3, 4),
    choices: [texFrac(3, 4), texFrac(1, 4), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
「少なくとも1回表」の補集合は「表が0回（=裏が2回）」です。

$$
${texProb("\\text{少なくとも1回表}")} = 1 - ${texProb("\\text{裏が2回}")} = 1 - \\frac{1}{4} = \\frac{3}{4}
$$
`,
  },
  {
    id: "prob_comp_coin_2",
    title: "コイン3回：少なくとも1回表",
    statement: `コインを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回表}")}\n$$`,
    correct: texFrac(7, 8),
    choices: [texFrac(7, 8), texFrac(1, 8), texFrac(3, 4), texFrac(5, 8)],
    explain: `
### この問題の解説
補集合は「表が0回（=裏が3回）」です。

$$
${texProb("\\text{少なくとも1回表}")} = 1 - \\frac{1}{8} = \\frac{7}{8}
$$
`,
  },
  {
    id: "prob_comp_die_1",
    title: "サイコロ2回：6が少なくとも1回",
    statement: `サイコロを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回6}")}\n$$`,
    correct: texFrac(11, 36),
    choices: [texFrac(11, 36), texFrac(1, 6), texFrac(25, 36), texFrac(5, 36)],
    explain: `
### この問題の解説
補集合は「2回とも6以外」です。

$$
${texProb("\\text{少なくとも1回6}")} = 1 - \\left(\\frac{5}{6}\\right)^2 = 1 - \\frac{25}{36} = \\frac{11}{36}
$$
`,
  },
  {
    id: "prob_comp_die_2",
    title: "サイコロ3回：1が少なくとも1回",
    statement: `サイコロを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回1}")}\n$$`,
    correct: texFrac(91, 216),
    choices: [texFrac(91, 216), texFrac(125, 216), texFrac(1, 6), texFrac(5, 6)],
    explain: `
### この問題の解説
補集合は「3回とも1以外」です。

$$
${texProb("\\text{少なくとも1回1}")} = 1 - \\left(\\frac{5}{6}\\right)^3 = 1 - \\frac{125}{216} = \\frac{91}{216}
$$
`,
  },
  {
    id: "prob_comp_balls_1",
    title: "玉2回：少なくとも1回赤",
    statement: `箱に赤2個・青3個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回赤}")}\n$$`,
    correct: texFrac(7, 10),
    choices: [texFrac(7, 10), texFrac(3, 10), texFrac(1, 2), texFrac(4, 5)],
    explain: `
### この問題の解説
補集合は「2回とも青」です。

$$
${texProb("\\text{少なくとも1回赤}")} = 1 - \\left(\\frac{3}{5}\\cdot\\frac{2}{4}\\right) = 1 - \\frac{3}{10} = \\frac{7}{10}
$$
`,
  },
  {
    id: "prob_comp_balls_2",
    title: "玉2回：少なくとも1回白",
    statement: `箱に白1個・黒3個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回白}")}\n$$`,
    correct: texFrac(1, 2),
    choices: [texFrac(1, 2), texFrac(1, 6), texFrac(5, 6), texFrac(1, 4)],
    explain: `
### この問題の解説
補集合は「2回とも黒」です。

$$
${texProb("\\text{少なくとも1回白}")} = 1 - \\left(\\frac{3}{4}\\cdot\\frac{2}{3}\\right) = 1 - \\frac{1}{2} = \\frac{1}{2}
$$
`,
  },
  {
    id: "prob_comp_die_3",
    title: "サイコロ2回：偶数が1回も出ない",
    statement: `サイコロを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{偶数が1回も出ない}")}\n$$`,
    correct: texFrac(1, 4),
    choices: [texFrac(1, 4), texFrac(3, 4), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
「偶数が1回も出ない」は2回とも奇数です。

$$
${texProb("\\text{偶数が1回も出ない}")} = \\left(\\frac{3}{6}\\right)^2 = \\frac{1}{4}
$$
`,
  },
  {
    id: "prob_comp_coin_3",
    title: "コイン3回：表が0回",
    statement: `コインを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が0回}")}\n$$`,
    correct: texFrac(1, 8),
    choices: [texFrac(1, 8), texFrac(7, 8), texFrac(3, 8), texFrac(1, 4)],
    explain: `
### この問題の解説
表が0回は裏が3回です。

$$
${texProb("\\text{表が0回}")} = \\frac{1}{8}
$$
`,
  },
  {
    id: "prob_comp_die_4",
    title: "サイコロ2回：1回も1が出ない",
    statement: `サイコロを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{1が1回も出ない}")}\n$$`,
    correct: texFrac(25, 36),
    choices: [texFrac(25, 36), texFrac(11, 36), texFrac(1, 6), texFrac(5, 6)],
    explain: `
### この問題の解説
1が出ない確率は1回で $\\frac{5}{6}$ です。

$$
${texProb("\\text{1が1回も出ない}")} = \\left(\\frac{5}{6}\\right)^2 = \\frac{25}{36}
$$
`,
  },
  {
    id: "prob_comp_balls_3",
    title: "玉1回：赤でない",
    statement: `箱に赤3個・青2個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{赤でない}")}\n$$`,
    correct: texFrac(2, 5),
    choices: [texFrac(2, 5), texFrac(3, 5), texFrac(1, 2), texFrac(1, 3)],
    explain: `
### この問題の解説
赤でないのは青が出ることです。

$$
${texProb("\\text{赤でない}")} = \\frac{2}{5}
$$
`,
  },
  {
    id: "prob_comp_balls_4",
    title: "玉1回：白でない",
    statement: `箱に白5個・黒3個の玉がある。1個取り出すとき、次の確率を求めよ。\n\n$$\n${texProb("\\text{白でない}")}\n$$`,
    correct: texFrac(3, 8),
    choices: [texFrac(3, 8), texFrac(5, 8), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
白でないのは黒が出ることです。

$$
${texProb("\\text{白でない}")} = \\frac{3}{8}
$$
`,
  },
  {
    id: "prob_comp_coin_4",
    title: "コイン2回：表が0回でない",
    statement: `コインを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が0回でない}")}\n$$`,
    correct: texFrac(3, 4),
    choices: [texFrac(3, 4), texFrac(1, 4), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
「表が0回でない」は「少なくとも1回表」と同じです。

$$
${texProb("\\text{表が0回でない}")} = 1 - \\frac{1}{4} = \\frac{3}{4}
$$
`,
  },
  {
    id: "prob_comp_die_5",
    title: "サイコロ1回：6でない",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{6でない}")}\n$$`,
    correct: texFrac(5, 6),
    choices: [texFrac(5, 6), texFrac(1, 6), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
6でないのは 1〜5 の5通りです。

$$
${texProb("\\text{6でない}")} = \\frac{5}{6}
$$
`,
  },
  {
    id: "prob_comp_coin_5",
    title: "コイン3回：表が1回も出ない",
    statement: `コインを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が1回も出ない}")}\n$$`,
    correct: texFrac(1, 8),
    choices: [texFrac(1, 8), texFrac(7, 8), texFrac(3, 8), texFrac(1, 4)],
    explain: `
### この問題の解説
表が出ないのは裏が3回です。

$$
${texProb("\\text{表が1回も出ない}")} = \\frac{1}{8}
$$
`,
  },
  {
    id: "prob_comp_balls_5",
    title: "玉2回：少なくとも1回青",
    statement: `箱に赤4個・青1個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回青}")}\n$$`,
    correct: texFrac(2, 5),
    choices: [texFrac(2, 5), texFrac(1, 5), texFrac(3, 5), texFrac(1, 2)],
    explain: `
### この問題の解説
補集合は「2回とも赤」です。

$$
${texProb("\\text{少なくとも1回青}")} = 1 - \\left(\\frac{4}{5}\\cdot\\frac{3}{4}\\right) = 1 - \\frac{3}{5} = \\frac{2}{5}
$$
`,
  },
  {
    id: "prob_comp_die_6",
    title: "サイコロ2回：少なくとも1回偶数",
    statement: `サイコロを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回偶数}")}\n$$`,
    correct: texFrac(3, 4),
    choices: [texFrac(3, 4), texFrac(1, 4), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
補集合は「2回とも奇数」です。

$$
${texProb("\\text{少なくとも1回偶数}")} = 1 - \\left(\\frac{3}{6}\\right)^2 = 1 - \\frac{1}{4} = \\frac{3}{4}
$$
`,
  },
  {
    id: "prob_comp_die_7",
    title: "サイコロ3回：少なくとも1回6",
    statement: `サイコロを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回6}")}\n$$`,
    correct: texFrac(91, 216),
    choices: [texFrac(91, 216), texFrac(125, 216), texFrac(11, 36), texFrac(5, 6)],
    explain: `
### この問題の解説
補集合は「3回とも6以外」です。

$$
${texProb("\\text{少なくとも1回6}")} = 1 - \\left(\\frac{5}{6}\\right)^3 = 1 - \\frac{125}{216} = \\frac{91}{216}
$$
`,
  },
  {
    id: "prob_comp_coin_6",
    title: "コイン2回：少なくとも1回裏",
    statement: `コインを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回裏}")}\n$$`,
    correct: texFrac(3, 4),
    choices: [texFrac(3, 4), texFrac(1, 4), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
補集合は「裏が0回（=両方表）」です。

$$
${texProb("\\text{少なくとも1回裏}")} = 1 - \\frac{1}{4} = \\frac{3}{4}
$$
`,
  },
  {
    id: "prob_comp_balls_6",
    title: "玉2回：少なくとも1回黒",
    statement: `箱に白5個・黒3個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回黒}")}\n$$`,
    correct: texFrac(9, 14),
    choices: [texFrac(9, 14), texFrac(5, 14), texFrac(1, 2), texFrac(3, 7)],
    explain: `
### この問題の解説
補集合は「2回とも白」です。

$$
${texProb("\\text{少なくとも1回黒}")} = 1 - \\frac{5}{14} = \\frac{9}{14}
$$
`,
  },
  {
    id: "prob_comp_die_8",
    title: "サイコロ1回：1でない",
    statement: `サイコロを1回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{1でない}")}\n$$`,
    correct: texFrac(5, 6),
    choices: [texFrac(5, 6), texFrac(1, 6), texFrac(1, 2), texFrac(2, 3)],
    explain: `
### この問題の解説
1でないのは 2〜6 の5通りです。

$$
${texProb("\\text{1でない}")} = \\frac{5}{6}
$$
`,
  },
  {
    id: "prob_comp_coin_7",
    title: "コイン4回：少なくとも1回表",
    statement: `コインを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回表}")}\n$$`,
    correct: texFrac(15, 16),
    choices: [texFrac(15, 16), texFrac(1, 16), texFrac(3, 4), texFrac(7, 8)],
    explain: `
### この問題の解説
補集合は「表が0回」です。

$$
${texProb("\\text{少なくとも1回表}")} = 1 - \\frac{1}{16} = \\frac{15}{16}
$$
`,
  },
  {
    id: "prob_comp_coin_8",
    title: "コイン4回：少なくとも1回裏",
    statement: `コインを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回裏}")}\n$$`,
    correct: texFrac(15, 16),
    choices: [texFrac(15, 16), texFrac(1, 16), texFrac(3, 4), texFrac(7, 8)],
    explain: `
### この問題の解説
補集合は「裏が0回（=全て表）」です。

$$
${texProb("\\text{少なくとも1回裏}")} = 1 - \\frac{1}{16} = \\frac{15}{16}
$$
`,
  },
  {
    id: "prob_comp_coin_9",
    title: "コイン4回：表が0回",
    statement: `コインを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が0回}")}\n$$`,
    correct: texFrac(1, 16),
    choices: [texFrac(1, 16), texFrac(15, 16), texFrac(1, 8), texFrac(1, 4)],
    explain: `
### この問題の解説
4回とも裏が出る確率です。

$$
${texProb("\\text{表が0回}")} = \\left(\\frac{1}{2}\\right)^4 = \\frac{1}{16}
$$
`,
  },
  {
    id: "prob_comp_coin_10",
    title: "コイン5回：少なくとも1回表",
    statement: `コインを5回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回表}")}\n$$`,
    correct: texFrac(31, 32),
    choices: [texFrac(31, 32), texFrac(1, 32), texFrac(15, 16), texFrac(7, 8)],
    explain: `
### この問題の解説
補集合は「表が0回」です。

$$
${texProb("\\text{少なくとも1回表}")} = 1 - \\frac{1}{32} = \\frac{31}{32}
$$
`,
  },
  {
    id: "prob_comp_coin_11",
    title: "コイン5回：表が0回",
    statement: `コインを5回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が0回}")}\n$$`,
    correct: texFrac(1, 32),
    choices: [texFrac(1, 32), texFrac(31, 32), texFrac(1, 16), texFrac(1, 8)],
    explain: `
### この問題の解説
5回とも裏が出る確率です。

$$
${texProb("\\text{表が0回}")} = \\left(\\frac{1}{2}\\right)^5 = \\frac{1}{32}
$$
`,
  },
  {
    id: "prob_comp_coin_12",
    title: "コイン5回：少なくとも1回裏",
    statement: `コインを5回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回裏}")}\n$$`,
    correct: texFrac(31, 32),
    choices: [texFrac(31, 32), texFrac(1, 32), texFrac(15, 16), texFrac(7, 8)],
    explain: `
### この問題の解説
補集合は「裏が0回（=全て表）」です。

$$
${texProb("\\text{少なくとも1回裏}")} = 1 - \\frac{1}{32} = \\frac{31}{32}
$$
`,
  },
  {
    id: "prob_comp_coin_13",
    title: "コイン6回：少なくとも1回表",
    statement: `コインを6回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回表}")}\n$$`,
    correct: texFrac(63, 64),
    choices: [texFrac(63, 64), texFrac(1, 64), texFrac(31, 32), texFrac(15, 16)],
    explain: `
### この問題の解説
補集合は「表が0回」です。

$$
${texProb("\\text{少なくとも1回表}")} = 1 - \\frac{1}{64} = \\frac{63}{64}
$$
`,
  },
  {
    id: "prob_comp_coin_14",
    title: "コイン6回：表が0回",
    statement: `コインを6回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{表が0回}")}\n$$`,
    correct: texFrac(1, 64),
    choices: [texFrac(1, 64), texFrac(63, 64), texFrac(1, 32), texFrac(1, 16)],
    explain: `
### この問題の解説
6回とも裏が出る確率です。

$$
${texProb("\\text{表が0回}")} = \\left(\\frac{1}{2}\\right)^6 = \\frac{1}{64}
$$
`,
  },
  {
    id: "prob_comp_coin_15",
    title: "コイン6回：少なくとも1回裏",
    statement: `コインを6回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回裏}")}\n$$`,
    correct: texFrac(63, 64),
    choices: [texFrac(63, 64), texFrac(1, 64), texFrac(31, 32), texFrac(15, 16)],
    explain: `
### この問題の解説
補集合は「裏が0回（=全て表）」です。

$$
${texProb("\\text{少なくとも1回裏}")} = 1 - \\frac{1}{64} = \\frac{63}{64}
$$
`,
  },
  {
    id: "prob_comp_die_9",
    title: "サイコロ4回：少なくとも1回6",
    statement: `サイコロを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回6}")}\n$$`,
    correct: texFrac(671, 1296),
    choices: [texFrac(671, 1296), texFrac(625, 1296), texFrac(91, 216), texFrac(11, 36)],
    explain: `
### この問題の解説
補集合は「4回とも6以外」です。

$$
${texProb("\\text{少なくとも1回6}")} = 1 - \\left(\\frac{5}{6}\\right)^4 = \\frac{671}{1296}
$$
`,
  },
  {
    id: "prob_comp_die_10",
    title: "サイコロ4回：6が1回も出ない",
    statement: `サイコロを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{6が1回も出ない}")}\n$$`,
    correct: texFrac(625, 1296),
    choices: [texFrac(625, 1296), texFrac(671, 1296), texFrac(125, 216), texFrac(25, 36)],
    explain: `
### この問題の解説
6が出ない確率は1回で $\\frac{5}{6}$ です。

$$
${texProb("\\text{6が1回も出ない}")} = \\left(\\frac{5}{6}\\right)^4 = \\frac{625}{1296}
$$
`,
  },
  {
    id: "prob_comp_die_11",
    title: "サイコロ2回：少なくとも1回1",
    statement: `サイコロを2回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回1}")}\n$$`,
    correct: texFrac(11, 36),
    choices: [texFrac(11, 36), texFrac(25, 36), texFrac(1, 6), texFrac(1, 3)],
    explain: `
### この問題の解説
補集合は「2回とも1以外」です。

$$
${texProb("\\text{少なくとも1回1}")} = 1 - \\left(\\frac{5}{6}\\right)^2 = \\frac{11}{36}
$$
`,
  },
  {
    id: "prob_comp_die_12",
    title: "サイコロ3回：偶数が1回も出ない",
    statement: `サイコロを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{偶数が1回も出ない}")}\n$$`,
    correct: texFrac(1, 8),
    choices: [texFrac(1, 8), texFrac(7, 8), texFrac(1, 4), texFrac(3, 8)],
    explain: `
### この問題の解説
奇数は3通りなので、1回で $\\frac{3}{6}$ です。

$$
${texProb("\\text{偶数が1回も出ない}")} = \\left(\\frac{3}{6}\\right)^3 = \\frac{1}{8}
$$
`,
  },
  {
    id: "prob_comp_die_13",
    title: "サイコロ3回：少なくとも1回偶数",
    statement: `サイコロを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回偶数}")}\n$$`,
    correct: texFrac(7, 8),
    choices: [texFrac(7, 8), texFrac(1, 8), texFrac(3, 4), texFrac(5, 8)],
    explain: `
### この問題の解説
補集合は「3回とも奇数」です。

$$
${texProb("\\text{少なくとも1回偶数}")} = 1 - \\frac{1}{8} = \\frac{7}{8}
$$
`,
  },
  {
    id: "prob_comp_die_14",
    title: "サイコロ4回：少なくとも1回奇数",
    statement: `サイコロを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回奇数}")}\n$$`,
    correct: texFrac(15, 16),
    choices: [texFrac(15, 16), texFrac(1, 16), texFrac(7, 8), texFrac(3, 4)],
    explain: `
### この問題の解説
補集合は「4回とも偶数」です。

$$
${texProb("\\text{少なくとも1回奇数}")} = 1 - \\left(\\frac{3}{6}\\right)^4 = \\frac{15}{16}
$$
`,
  },
  {
    id: "prob_comp_die_15",
    title: "サイコロ4回：奇数が1回も出ない",
    statement: `サイコロを4回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{奇数が1回も出ない}")}\n$$`,
    correct: texFrac(1, 16),
    choices: [texFrac(1, 16), texFrac(15, 16), texFrac(1, 8), texFrac(1, 4)],
    explain: `
### この問題の解説
偶数は3通りなので、1回で $\\frac{3}{6}$ です。

$$
${texProb("\\text{奇数が1回も出ない}")} = \\left(\\frac{3}{6}\\right)^4 = \\frac{1}{16}
$$
`,
  },
  {
    id: "prob_comp_die_16",
    title: "サイコロ5回：少なくとも1回6",
    statement: `サイコロを5回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回6}")}\n$$`,
    correct: texFrac(4651, 7776),
    choices: [texFrac(4651, 7776), texFrac(3125, 7776), texFrac(671, 1296), texFrac(91, 216)],
    explain: `
### この問題の解説
補集合は「5回とも6以外」です。

$$
${texProb("\\text{少なくとも1回6}")} = 1 - \\left(\\frac{5}{6}\\right)^5 = \\frac{4651}{7776}
$$
`,
  },
  {
    id: "prob_comp_die_17",
    title: "サイコロ5回：6が1回も出ない",
    statement: `サイコロを5回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{6が1回も出ない}")}\n$$`,
    correct: texFrac(3125, 7776),
    choices: [texFrac(3125, 7776), texFrac(4651, 7776), texFrac(625, 1296), texFrac(125, 216)],
    explain: `
### この問題の解説
6が出ない確率は1回で $\\frac{5}{6}$ です。

$$
${texProb("\\text{6が1回も出ない}")} = \\left(\\frac{5}{6}\\right)^5 = \\frac{3125}{7776}
$$
`,
  },
  {
    id: "prob_comp_ball_7",
    title: "玉2回：少なくとも1回赤",
    statement: `箱に赤3個・青2個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回赤}")}\n$$`,
    correct: texFrac(9, 10),
    choices: [texFrac(9, 10), texFrac(1, 10), texFrac(4, 5), texFrac(7, 10)],
    explain: `
### この問題の解説
補集合は「2回とも青」です。

$$
${texProb("\\text{少なくとも1回赤}")} = 1 - \\frac{1}{10} = \\frac{9}{10}
$$
`,
  },
  {
    id: "prob_comp_ball_8",
    title: "玉2回：少なくとも1回赤（赤1青4）",
    statement: `箱に赤1個・青4個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回赤}")}\n$$`,
    correct: texFrac(2, 5),
    choices: [texFrac(2, 5), texFrac(3, 5), texFrac(1, 5), texFrac(1, 2)],
    explain: `
### この問題の解説
補集合は「2回とも青」です。

$$
${texProb("\\text{少なくとも1回赤}")} = 1 - \\frac{6}{10} = \\frac{2}{5}
$$
`,
  },
  {
    id: "prob_comp_ball_9",
    title: "玉2回：赤が1回も出ない",
    statement: `箱に赤1個・青4個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{赤が1回も出ない}")}\n$$`,
    correct: texFrac(3, 5),
    choices: [texFrac(3, 5), texFrac(2, 5), texFrac(1, 5), texFrac(4, 5)],
    explain: `
### この問題の解説
2回とも青の確率です。

$$
${texProb("\\text{赤が1回も出ない}")} = \\frac{6}{10} = \\frac{3}{5}
$$
`,
  },
  {
    id: "prob_comp_ball_10",
    title: "玉3回：少なくとも1回赤",
    statement: `箱に赤2個・青5個の玉がある。続けて3個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回赤}")}\n$$`,
    correct: texFrac(5, 7),
    choices: [texFrac(5, 7), texFrac(2, 7), texFrac(1, 2), texFrac(3, 7)],
    explain: `
### この問題の解説
補集合は「3回とも青」です。

$$
${texProb("\\text{少なくとも1回赤}")} = 1 - \\frac{10}{35} = \\frac{5}{7}
$$
`,
  },
  {
    id: "prob_comp_ball_11",
    title: "玉3回：赤が1回も出ない",
    statement: `箱に赤2個・青5個の玉がある。続けて3個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{赤が1回も出ない}")}\n$$`,
    correct: texFrac(2, 7),
    choices: [texFrac(2, 7), texFrac(5, 7), texFrac(1, 3), texFrac(3, 7)],
    explain: `
### この問題の解説
3回とも青の確率です。

$$
${texProb("\\text{赤が1回も出ない}")} = \\frac{10}{35} = \\frac{2}{7}
$$
`,
  },
  {
    id: "prob_comp_ball_12",
    title: "玉2回：少なくとも1回青",
    statement: `箱に赤4個・青1個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回青}")}\n$$`,
    correct: texFrac(2, 5),
    choices: [texFrac(2, 5), texFrac(3, 5), texFrac(1, 5), texFrac(1, 2)],
    explain: `
### この問題の解説
補集合は「2回とも赤」です。

$$
${texProb("\\text{少なくとも1回青}")} = 1 - \\frac{6}{10} = \\frac{2}{5}
$$
`,
  },
  {
    id: "prob_comp_ball_13",
    title: "玉2回：青が1回も出ない",
    statement: `箱に赤4個・青1個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{青が1回も出ない}")}\n$$`,
    correct: texFrac(3, 5),
    choices: [texFrac(3, 5), texFrac(2, 5), texFrac(4, 5), texFrac(1, 5)],
    explain: `
### この問題の解説
2回とも赤の確率です。

$$
${texProb("\\text{青が1回も出ない}")} = \\frac{6}{10} = \\frac{3}{5}
$$
`,
  },
  {
    id: "prob_comp_ball_14",
    title: "玉2回：少なくとも1回赤（赤3青3）",
    statement: `箱に赤3個・青3個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回赤}")}\n$$`,
    correct: texFrac(4, 5),
    choices: [texFrac(4, 5), texFrac(1, 5), texFrac(3, 5), texFrac(2, 5)],
    explain: `
### この問題の解説
補集合は「2回とも青」です。

$$
${texProb("\\text{少なくとも1回赤}")} = 1 - \\frac{3}{15} = \\frac{4}{5}
$$
`,
  },
  {
    id: "prob_comp_ball_15",
    title: "玉2回：赤が1回も出ない（赤3青3）",
    statement: `箱に赤3個・青3個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{赤が1回も出ない}")}\n$$`,
    correct: texFrac(1, 5),
    choices: [texFrac(1, 5), texFrac(4, 5), texFrac(2, 5), texFrac(3, 5)],
    explain: `
### この問題の解説
2回とも青の確率です。

$$
${texProb("\\text{赤が1回も出ない}")} = \\frac{3}{15} = \\frac{1}{5}
$$
`,
  },
  {
    id: "prob_comp_ball_16",
    title: "玉2回：少なくとも1回赤（赤2青2）",
    statement: `箱に赤2個・青2個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回赤}")}\n$$`,
    correct: texFrac(5, 6),
    choices: [texFrac(5, 6), texFrac(1, 6), texFrac(2, 3), texFrac(3, 4)],
    explain: `
### この問題の解説
補集合は「2回とも青」です。

$$
${texProb("\\text{少なくとも1回赤}")} = 1 - \\frac{1}{6} = \\frac{5}{6}
$$
`,
  },
  {
    id: "prob_comp_ball_17",
    title: "玉2回：赤が1回も出ない（赤2青2）",
    statement: `箱に赤2個・青2個の玉がある。続けて2個取り出す（戻さない）。次の確率を求めよ。\n\n$$\n${texProb("\\text{赤が1回も出ない}")}\n$$`,
    correct: texFrac(1, 6),
    choices: [texFrac(1, 6), texFrac(5, 6), texFrac(1, 3), texFrac(1, 2)],
    explain: `
### この問題の解説
2回とも青の確率です。

$$
${texProb("\\text{赤が1回も出ない}")} = \\frac{1}{6}
$$
`,
  },
  {
    id: "prob_comp_die_18",
    title: "サイコロ3回：少なくとも1回5",
    statement: `サイコロを3回投げる。次の確率を求めよ。\n\n$$\n${texProb("\\text{少なくとも1回5}")}\n$$`,
    correct: texFrac(91, 216),
    choices: [texFrac(91, 216), texFrac(125, 216), texFrac(11, 36), texFrac(1, 6)],
    explain: `
### この問題の解説
補集合は「3回とも5以外」です。

$$
${texProb("\\text{少なくとも1回5}")} = 1 - \\left(\\frac{5}{6}\\right)^3 = \\frac{91}{216}
$$
`,
  },
];

export const probComplementTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
