// src/lib/course/templates/math1/quad_inequality_basic.ts
import type { QuestionTemplate } from "../../types";
import { texPoly2 } from "@/lib/format/tex";

type InequalityCase = {
  id: string;
  title: string;
  context?: string;
  a: number;
  r1: number;
  r2: number;
  sign: "ge" | "le";
};

function intervalText(r1: number, r2: number, kind: "inside" | "outside") {
  if (kind === "inside") {
    return `$${r1} \\le x \\le ${r2}$`;
  }
  return `$x \\le ${r1} \\text{ または } x \\ge ${r2}$`;
}

function correctInterval(c: InequalityCase) {
  const inside = intervalText(c.r1, c.r2, "inside");
  const outside = intervalText(c.r1, c.r2, "outside");
  const isInside = (c.sign === "ge" && c.a < 0) || (c.sign === "le" && c.a > 0);
  return isInside ? inside : outside;
}

function choicesFor(c: InequalityCase): string[] {
  const inside = intervalText(c.r1, c.r2, "inside");
  const outside = intervalText(c.r1, c.r2, "outside");
  const leftOnly = `$x \\le ${c.r1}$`;
  const rightOnly = `$x \\ge ${c.r2}$`;
  return [inside, outside, leftOnly, rightOnly];
}

function buildTemplate(c: InequalityCase): QuestionTemplate {
  const b = -c.a * (c.r1 + c.r2);
  const d = c.a * c.r1 * c.r2;
  const poly = texPoly2(c.a, b, d);
  const signText = c.sign === "ge" ? "\\ge" : "\\le";
  const correct = correctInterval(c);
  const choices = choicesFor(c);
  return {
    meta: {
      id: c.id,
      topicId: "quad_inequality_basic",
      title: c.title,
      difficulty: 1,
      tags: ["quadratic", "inequality"],
    },
    generate() {
      const lead = c.context ? `${c.context}\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}次の二次不等式を解け。\\n\\n$$${poly} ${signText} 0$$`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `
### この問題の解説
二次式を因数分解して符号を調べます。係数 $a$ の符号により、解が内側または外側になります。
答えは ${correct} です。
`;
    },
  };
}

const CASES: InequalityCase[] = [
  { id: "quad_ineq_1", title: "二次不等式 1", context: "放物線がx軸より上にある範囲を求める。", a: 1, r1: -2, r2: 3, sign: "ge" },
  { id: "quad_ineq_2", title: "二次不等式 2", context: "グラフがx軸より下にある範囲を判定する。", a: 1, r1: -1, r2: 4, sign: "le" },
  { id: "quad_ineq_3", title: "二次不等式 3", context: "条件を満たすxの範囲をグラフで考える。", a: 2, r1: 0, r2: 3, sign: "ge" },
  { id: "quad_ineq_4", title: "二次不等式 4", context: "放物線がx軸より下になる範囲を求める。", a: 2, r1: -3, r2: 1, sign: "le" },
  { id: "quad_ineq_5", title: "二次不等式 5", context: "下に開く放物線の範囲判定。", a: -1, r1: -2, r2: 2, sign: "ge" },
  { id: "quad_ineq_6", title: "二次不等式 6", context: "下に開く放物線で、x軸より下の範囲を調べる。", a: -1, r1: -1, r2: 3, sign: "le" },
  { id: "quad_ineq_7", title: "二次不等式 7", context: "条件を満たす区間を求める（外側か内側か）。", a: -2, r1: 1, r2: 4, sign: "ge" },
  { id: "quad_ineq_8", title: "二次不等式 8", context: "x軸との位置関係から解の範囲を決める。", a: -2, r1: -4, r2: -1, sign: "le" },
  { id: "quad_ineq_9", title: "二次不等式 9", context: "判別した解の区間を答える。", a: 1, r1: -5, r2: -2, sign: "ge" },
  { id: "quad_ineq_10", title: "二次不等式 10", context: "二次関数の値が0以下となる範囲を求める。", a: 3, r1: 1, r2: 2, sign: "le" },
];

export const quadInequalityTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
