// src/lib/course/templates/math1/alg_ct_passage_quadratic_graph_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
  left: number;
  right: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "alg_ct_passage_quad_graph_1", title: "二次関数グラフ 連問 1", a: 1, b: -4, c: 3, left: 0, right: 3, difficulty: 1 },
  { id: "alg_ct_passage_quad_graph_2", title: "二次関数グラフ 連問 2", a: 2, b: -8, c: 5, left: -1, right: 3, difficulty: 2 },
  { id: "alg_ct_passage_quad_graph_3", title: "二次関数グラフ 連問 3", a: 1, b: 6, c: 5, left: -5, right: -1, difficulty: 2 },
  { id: "alg_ct_passage_quad_graph_4", title: "二次関数グラフ 連問 4", a: 3, b: -12, c: 8, left: 1, right: 4, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const axis = -c.b / (2 * c.a);
  const vertexY = c.a * axis * axis + c.b * axis + c.c;
  const f = (x: number) => c.a * x * x + c.b * x + c.c;
  const leftVal = f(c.left);
  const rightVal = f(c.right);
  const within = axis >= c.left && axis <= c.right;
  const minVal = within ? vertexY : Math.min(leftVal, rightVal);
  const maxVal = within ? Math.max(leftVal, rightVal) : Math.max(leftVal, rightVal);
  const opens = c.a > 0 ? "上に開く" : "下に開く";
  const statement = [
    "次の文章を読み、問1〜問5に答えよ。",
    `二次関数 $f(x)=${c.a}x^2${c.b >= 0 ? "+" : ""}${c.b}x${c.c >= 0 ? "+" : ""}${c.c}$ を考える。`,
    "（問1）放物線の開き方を答えよ。",
    "（問2）軸の $x$ 座標を求めよ。",
    "（問3）頂点の $y$ 座標を求めよ。",
    `（問4）区間 $[${c.left},${c.right}]$ における最小値を求めよ。`,
    `（問5）区間 $[${c.left},${c.right}]$ における最大値を求めよ。`,
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
          { id: "q1", label: "問1", answerKind: "choice", choices: ["上に開く", "下に開く"] },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "軸" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "頂点y" },
          { id: "q4", label: "問4", answerKind: "numeric", placeholder: "最小値" },
          { id: "q5", label: "問5", answerKind: "numeric", placeholder: "最大値" },
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
      const q1Ok = (parsed.q1 ?? "") === opens;
      const q2 = gradeNumeric(parsed.q2 ?? "", axis);
      const q3 = gradeNumeric(parsed.q3 ?? "", vertexY);
      const q4 = gradeNumeric(parsed.q4 ?? "", minVal);
      const q5 = gradeNumeric(parsed.q5 ?? "", maxVal);
      return {
        isCorrect: q1Ok && q2.isCorrect && q3.isCorrect && q4.isCorrect && q5.isCorrect,
        correctAnswer: `問1:${opens} / 問2:${axis} / 問3:${vertexY} / 問4:${minVal} / 問5:${maxVal}`,
        partResults: {
          q1: { isCorrect: q1Ok, correctAnswer: opens },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(axis) },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(vertexY) },
          q4: { isCorrect: q4.isCorrect, correctAnswer: String(minVal) },
          q5: { isCorrect: q5.isCorrect, correctAnswer: String(maxVal) },
        },
      };
    },
  };
}

export const algCtPassageQuadraticGraphTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
