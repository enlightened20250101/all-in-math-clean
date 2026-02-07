// src/lib/course/templates/math1/alg_ct_passage_quadratic_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
  evalX: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "alg_ct_passage_quad_1", title: "二次関数 連問 1", a: 1, b: -6, c: 5, evalX: 4, difficulty: 1 },
  { id: "alg_ct_passage_quad_2", title: "二次関数 連問 2", a: 1, b: -4, c: -5, evalX: -1, difficulty: 1 },
  { id: "alg_ct_passage_quad_3", title: "二次関数 連問 3", a: 2, b: -8, c: 6, evalX: 3, difficulty: 2 },
  { id: "alg_ct_passage_quad_4", title: "二次関数 連問 4", a: 1, b: 2, c: -8, evalX: 2, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const disc = c.b * c.b - 4 * c.a * c.c;
  const rootCount = disc > 0 ? 2 : disc === 0 ? 1 : 0;
  const axis = -c.b / (2 * c.a);
  const vertexY = c.a * axis * axis + c.b * axis + c.c;
  const valueAt = c.a * c.evalX * c.evalX + c.b * c.evalX + c.c;
  const sign = valueAt > 0 ? "正" : valueAt < 0 ? "負" : "0";
  const sumRoots = -c.b / c.a;
  const prodRoots = c.c / c.a;
  const statement = [
    "次の文章を読み、問1〜問6に答えよ。",
    `二次関数 $f(x)=${c.a}x^2${c.b >= 0 ? "+" : ""}${c.b}x${c.c >= 0 ? "+" : ""}${c.c}$ を考える。`,
    "（問1）判別式から実数解の個数を答えよ。",
    "（問2）軸の $x$ 座標を求めよ。",
    "（問3）頂点の $y$ 座標を求めよ。",
    `（問4）$x=${c.evalX}$ のときの $f(x)$ の符号を答えよ。`,
    "（問5）2解の和を求めよ（実数解がある場合）。",
    "（問6）2解の積を求めよ（実数解がある場合）。",
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "quad_graph_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["quadratic", "graph", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "choice", choices: ["0", "1", "2"] },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "軸" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "頂点y" },
          { id: "q4", label: "問4", answerKind: "choice", choices: ["正", "負", "0"] },
          { id: "q5", label: "問5", answerKind: "numeric", placeholder: "和" },
          { id: "q6", label: "問6", answerKind: "numeric", placeholder: "積" },
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
      const q1Ok = (parsed.q1 ?? "") === String(rootCount);
      const q2 = gradeNumeric(parsed.q2 ?? "", axis);
      const q3 = gradeNumeric(parsed.q3 ?? "", vertexY);
      const q4Ok = (parsed.q4 ?? "") === sign;
      const q5 = gradeNumeric(parsed.q5 ?? "", sumRoots);
      const q6 = gradeNumeric(parsed.q6 ?? "", prodRoots);
      return {
        isCorrect: q1Ok && q2.isCorrect && q3.isCorrect && q4Ok && q5.isCorrect && q6.isCorrect,
        correctAnswer: `問1:${rootCount} / 問2:${axis} / 問3:${vertexY} / 問4:${sign} / 問5:${sumRoots} / 問6:${prodRoots}`,
        partResults: {
          q1: { isCorrect: q1Ok, correctAnswer: String(rootCount) },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(axis) },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(vertexY) },
          q4: { isCorrect: q4Ok, correctAnswer: sign },
          q5: { isCorrect: q5.isCorrect, correctAnswer: String(sumRoots) },
          q6: { isCorrect: q6.isCorrect, correctAnswer: String(prodRoots) },
        },
      };
    },
  };
}

export const algCtPassageQuadraticTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
