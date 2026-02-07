// src/lib/course/templates/math1/prop_proposition_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { texDivides, texImplies, texNot, texPow, texText } from "@/lib/format/tex";

type ChoiceCase = {
  id: string;
  title: string;
  statement: string;
  correct: string;
  choices: string[];
  explain: string;
};

function buildChoice(c: ChoiceCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "prop_proposition_basic",
      title: c.title,
      difficulty: 1,
      tags: ["logic", "proposition"],
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

const P = texDivides(3, "x");
const Q = texDivides(6, "x");

const CASES: ChoiceCase[] = [
  {
    id: "prop_conv_v1",
    title: "逆命題（別）",
    statement: `命題 $${texImplies(Q, P)}$ の逆命題を選べ。`,
    correct: texImplies(P, Q),
    choices: [
      texImplies(Q, P),
      texImplies(P, Q),
      texImplies(texNot(Q), texNot(P)),
      texImplies(texNot(P), texNot(Q)),
    ],
    explain: `### この問題の解説\n逆命題は $${texImplies(P, Q)}$ です。`,
  },
  {
    id: "prop_contra_v1",
    title: "対偶（別）",
    statement: `命題 $${texImplies(P, Q)}$ の対偶を選べ。`,
    correct: texImplies(texNot(Q), texNot(P)),
    choices: [
      texImplies(P, Q),
      texImplies(texNot(P), texNot(Q)),
      texImplies(texNot(Q), texNot(P)),
      texImplies(Q, P),
    ],
    explain: `### この問題の解説\n対偶は否定を入れ替えた命題です。`,
  },
  {
    id: "prop_truth_v1",
    title: "真偽判定（平方）",
    statement: `命題「$x$ が $${texDivides(5, "x")}$ ならば $${texPow("x", 2)}$ は $${texDivides(25, "x^2")}$ である」は真か偽か。`,
    correct: texText("真"),
    choices: [texText("真"), texText("偽")],
    explain: `### この問題の解説\n$5$ の倍数なら $x^2$ も $25$ の倍数なので真です。`,
  },
  {
    id: "prop_truth_v2",
    title: "真偽判定（反例）",
    statement: `命題「$x$ が $${texDivides(4, "x")}$ ならば $${texDivides(8, "x")}$ である」は真か偽か。`,
    correct: texText("偽"),
    choices: [texText("真"), texText("偽")],
    explain: `### この問題の解説\n$4$ の倍数でも $12$ のように $8$ の倍数でない例があるので偽です。`,
  },
  {
    id: "prop_nec_suf_v1",
    title: "必要十分（別）",
    statement: `$A: ${texDivides(12, "x")}$、$B: ${texDivides(6, "x")}$ とする。$A$ は $B$ の何条件か。`,
    correct: texText("十分条件"),
    choices: [texText("必要条件"), texText("十分条件"), texText("必要十分条件"), texText("どれでもない")],
    explain: `### この問題の解説\n$12$ の倍数なら $6$ の倍数なので十分条件です。`,
  },
  {
    id: "prop_negation_v1",
    title: "否定（別）",
    statement: `命題「すべての自然数 $x$ について $x^2 \\ge x$」の否定を選べ。`,
    correct: "\\text{ある自然数 }x\\text{ が存在して }x^2 < x",
    choices: [
      "\\text{ある自然数 }x\\text{ が存在して }x^2 < x",
      "\\text{すべての自然数 }x\\text{ について }x^2 < x",
      "\\text{ある自然数 }x\\text{ が存在して }x^2 \\ge x",
      "\\text{すべての自然数 }x\\text{ について }x^2 \\ge x",
    ],
    explain: `### この問題の解説\n全称命題の否定は「存在して〜でない」です。`,
  },
];

export const propPropositionVariantTemplates: QuestionTemplate[] = CASES.map(buildChoice);
