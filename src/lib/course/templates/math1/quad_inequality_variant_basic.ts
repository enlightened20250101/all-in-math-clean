// src/lib/course/templates/math1/quad_inequality_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { texPoly2 } from "@/lib/format/tex";

type InequalityCase = {
  id: string;
  title: string;
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

function buildTemplate(c: InequalityCase): QuestionTemplate {
  const b = -c.a * (c.r1 + c.r2);
  const d = c.a * c.r1 * c.r2;
  const poly = texPoly2(c.a, b, d);
  const signText = c.sign === "ge" ? "\\ge" : "\\le";
  const correct = correctInterval(c);
  const choices = [
    intervalText(c.r1, c.r2, "inside"),
    intervalText(c.r1, c.r2, "outside"),
    `$x \\le ${c.r1}$`,
    `$x \\ge ${c.r2}$`,
  ];
  return {
    meta: {
      id: c.id,
      topicId: "quad_inequality_basic",
      title: c.title,
      difficulty: 1,
      tags: ["quadratic", "inequality"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `次の二次不等式を解け。\\n\\n$$${poly} ${signText} 0$$`,
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
因数分解して符号を調べます。係数 $a$ の符号で内側・外側が決まります。
答えは ${correct} です。
`;
    },
  };
}

const CASES: InequalityCase[] = [
  { id: "quad_ineq_v1", title: "二次不等式（別）1", a: 1, r1: -3, r2: 2, sign: "ge" },
  { id: "quad_ineq_v2", title: "二次不等式（別）2", a: 1, r1: -4, r2: -1, sign: "le" },
  { id: "quad_ineq_v3", title: "二次不等式（別）3", a: 2, r1: 1, r2: 3, sign: "le" },
  { id: "quad_ineq_v4", title: "二次不等式（別）4", a: -1, r1: -2, r2: 4, sign: "ge" },
  { id: "quad_ineq_v5", title: "二次不等式（別）5", a: -2, r1: -1, r2: 2, sign: "le" },
  { id: "quad_ineq_v6", title: "二次不等式（別）6", a: 3, r1: 0, r2: 2, sign: "ge" },
];

export const quadInequalityVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
