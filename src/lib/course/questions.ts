// src/lib/course/questions.ts
import type { TopicId } from "./topics";
import { texPoly2 } from "@/lib/tex/format";

export type AnswerKind = "numeric" | "choice" | "multi_numeric" | "multi";
export type QuestionTemplateId =
  | "quad_vertex_x"
  | "quad_axis_p"
  | "quad_vertex_y"
  | "quad_min_value_unbounded"
  | "quad_min_x_unbounded"
  | "quad_value_at_x"
  | "combi_nC2"
  | "combi_nP2"
  | "combi_mult_rule";

export type QuestionParams = Record<string, number>;

export type QuestionGenerated = {
  templateId: QuestionTemplateId;
  topicId: TopicId;
  statement: string; // Markdown + TeX
  answerKind: AnswerKind;
  params: QuestionParams;
  choices?: string[];
};

export type GradeResult = {
  isCorrect: boolean;
  correctAnswer: string;
};

type QuestionTemplate = {
  id: QuestionTemplateId;
  // ★どのトピックで使えるテンプレか（複数対応できる）
  topics: TopicId[];
  answerKind: AnswerKind;
  generate: () => Omit<QuestionGenerated, "topicId">; // topicIdは後で強制上書き
  grade: (params: QuestionParams, userAnswer: string) => GradeResult;
};

// -------------------- util --------------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function fmtSigned(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

// 二次関数：y = ax^2 + bx + c（a>0）で頂点が整数になるように作る
function genQuadraticWithIntegerVertex() {
  const a = pick([1, 2, 3]);
  const p = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]); // 頂点x
  const b = -2 * a * p;
  const c = randInt(-6, 6);
  const q = a * (0) ** 2 + b * 0 + c; // dummy
  return { a, b, c, p };
}

function vertexX(a: number, b: number): number {
  return -b / (2 * a);
}
function vertexY(a: number, b: number, c: number): number {
  const p = vertexX(a, b);
  return a * p * p + b * p + c;
}

function gradeNumeric(userAnswer: string, correct: number): GradeResult {
  const user = Number(userAnswer);
  const ok = !Number.isNaN(user) && user === correct;
  return { isCorrect: ok, correctAnswer: String(correct) };
}

// -------------------- templates --------------------

const TEMPLATES: QuestionTemplate[] = [
  // ===== quad_graph_basic / quad_maxmin_basic 共通で使える =====

  // 1) 頂点のx座標
  {
    id: "quad_vertex_x",
    topics: ["quad_graph_basic", "quad_maxmin_basic"],
    answerKind: "numeric",
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_vertex_x",
        statement: `二次関数 $y = ${poly}$ の頂点の $x$ 座標を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      const correct = vertexX(params.a, params.b);
      return gradeNumeric(userAnswer, correct);
    },
  },

  // 2) 軸（x=p）→ p を答える
  {
    id: "quad_axis_p",
    topics: ["quad_graph_basic"],
    answerKind: "numeric",
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_axis_p",
        statement: `二次関数 $y = ${poly}$ の軸の方程式は $x = p$ と表せる。$p$ を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      const correct = vertexX(params.a, params.b);
      return gradeNumeric(userAnswer, correct);
    },
  },

  // 3) 頂点のy座標
  {
    id: "quad_vertex_y",
    topics: ["quad_graph_basic"],
    answerKind: "numeric",
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_vertex_y",
        statement: `二次関数 $y = ${poly}$ の頂点の $y$ 座標を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      const correct = vertexY(params.a, params.b, params.c);
      return gradeNumeric(userAnswer, correct);
    },
  },

  // ===== quad_maxmin_basic =====

  // 4) a>0 のとき最小値（範囲なし）
  {
    id: "quad_min_value_unbounded",
    topics: ["quad_maxmin_basic"],
    answerKind: "numeric",
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex(); // a>0
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_min_value_unbounded",
        statement: `二次関数 $y = ${poly}$ の最小値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      const correct = vertexY(params.a, params.b, params.c);
      return gradeNumeric(userAnswer, correct);
    },
  },

  // 5) 最小となるx（範囲なし）
  {
    id: "quad_min_x_unbounded",
    topics: ["quad_maxmin_basic"],
    answerKind: "numeric",
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_min_x_unbounded",
        statement: `二次関数 $y = ${poly}$ が最小値をとるときの $x$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      const correct = vertexX(params.a, params.b);
      return gradeNumeric(userAnswer, correct);
    },
  },

  // 6) 値を代入して計算（ウォームアップ系）
  {
    id: "quad_value_at_x",
    topics: ["quad_maxmin_basic"],
    answerKind: "numeric",
    generate() {
      const a = pick([1, 2, 3]);
      const b = randInt(-6, 6);
      const c = randInt(-6, 6);
      const x = pick([-3, -2, -1, 1, 2, 3]);
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_value_at_x",
        statement: `二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      const correct = params.a * params.x * params.x + params.b * params.x + params.c;
      return gradeNumeric(userAnswer, correct);
    },
  },

  // ===== combi_basic =====

  // 7) nC2
  {
    id: "combi_nC2",
    topics: ["combi_basic"],
    answerKind: "numeric",
    generate() {
      const n = pick([4, 5, 6, 7, 8, 9, 10, 12]);
      return {
        templateId: "combi_nC2",
        statement: `数列 $1,2,\\dots,${n}$ の中から異なる $2$ 個を選ぶ方法は何通りですか。`,
        answerKind: "numeric",
        params: { n },
      };
    },
    grade(params, userAnswer) {
      const n = params.n;
      const correct = (n * (n - 1)) / 2;
      return gradeNumeric(userAnswer, correct);
    },
  },

  // 8) nP2
  {
    id: "combi_nP2",
    topics: ["combi_basic"],
    answerKind: "numeric",
    generate() {
      const n = pick([4, 5, 6, 7, 8, 9, 10, 12]);
      return {
        templateId: "combi_nP2",
        statement: `数列 $1,2,\\dots,${n}$ の中から異なる $2$ 個を選んで順に並べる方法は何通りですか。`,
        answerKind: "numeric",
        params: { n },
      };
    },
    grade(params, userAnswer) {
      const n = params.n;
      const correct = n * (n - 1);
      return gradeNumeric(userAnswer, correct);
    },
  },

  // 9) 積の法則の超基本（m通り×n通り）
  {
    id: "combi_mult_rule",
    topics: ["combi_basic"],
    answerKind: "numeric",
    generate() {
      const m = pick([2, 3, 4, 5, 6]);
      const n = pick([2, 3, 4, 5, 6]);
      return {
        templateId: "combi_mult_rule",
        statement: `A の選び方が ${m} 通り、B の選び方が ${n} 通りある。A を選んでから B を選ぶとき、全体で何通りですか。`,
        answerKind: "numeric",
        params: { m, n },
      };
    },
    grade(params, userAnswer) {
      const correct = params.m * params.n;
      return gradeNumeric(userAnswer, correct);
    },
  },
];

// -------------------- public API --------------------

export function generateNextQuestionForTopic(topicId: string): QuestionGenerated {
  const candidates = TEMPLATES.filter((t) => t.topics.includes(topicId as TopicId));
  if (!candidates.length) throw new Error(`No templates for topic ${topicId}`);

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  const q = picked.generate();

  // ★事故防止：URLのtopicIdを強制上書き
  return {
    ...q,
    topicId: topicId as TopicId,
  };
}

export function gradeAnswer(
  templateId: QuestionTemplateId,
  params: QuestionParams,
  userAnswer: string
): GradeResult {
  const t = TEMPLATES.find((t) => t.id === templateId);
  if (!t) throw new Error(`Unknown template: ${templateId}`);
  return t.grade(params, userAnswer);
}

export function explainProblem(
  templateId: QuestionTemplateId,
  params: QuestionParams
): string | null {
  // ここにテンプレ別の「解説生成」を足していく
  switch (templateId) {
    case "quad_vertex_x": {
      const a = params.a, b = params.b;
      const p = -b / (2 * a);
      return `
### この問題の解説
頂点の $x$ 座標は、放物線の軸 $x = -\\frac{b}{2a}$ を使います。

- $a=${a},\\ b=${b}$ なので  
  $$
  x = -\\frac{${b}}{2\\cdot ${a}} = ${p}
  $$

よって頂点の $x$ 座標は **${p}** です。
`;
    }

    case "quad_axis_p": {
      const a = params.a, b = params.b;
      const p = -b / (2 * a);
      return `
### この問題の解説
軸の方程式は $x=p$ で、$p=-\\frac{b}{2a}$ です。

- $a=${a},\\ b=${b}$ なので  
  $$
  p = -\\frac{${b}}{2\\cdot ${a}} = ${p}
  $$

したがって軸は **$x=${p}$** です。
`;
    }

    case "quad_vertex_y": {
      const a = params.a, b = params.b, c = params.c;
      const p = -b / (2 * a);
      const q = a * p * p + b * p + c;
      return `
### この問題の解説
頂点の $y$ 座標は、頂点の $x$ 座標 $p=-\\frac{b}{2a}$ を求めてから代入します。

1. $p=-\\frac{b}{2a}$  
   $$
   p = -\\frac{${b}}{2\\cdot ${a}} = ${p}
   $$

2. $x=p$ を代入  
   $$
   y = ${a}(${p})^2 ${b >= 0 ? "+" : ""}${b}(${p}) ${c >= 0 ? "+" : ""}${c} = ${q}
   $$

よって頂点の $y$ 座標は **${q}** です。
`;
    }

    case "quad_min_value_unbounded": {
      const a = params.a, b = params.b, c = params.c;
      const p = -b / (2 * a);
      const q = a * p * p + b * p + c;
      return `
### この問題の解説
$ a>0 $ なので放物線は上に開き、頂点で **最小値** を取ります。

- 頂点の $x$ 座標：$p=-\\frac{b}{2a}$
- 最小値：頂点の $y$ 座標 $q=f(p)$

ここでは  
$$
p=-\\frac{${b}}{2\\cdot ${a}}=${p},\\quad q=f(${p})=${q}
$$

したがって最小値は **${q}** です。
`;
    }

    case "quad_min_x_unbounded": {
      const a = params.a, b = params.b;
      const p = -b / (2 * a);
      return `
### この問題の解説
$ a>0 $ の二次関数は頂点で最小になります。  
最小となる $x$ は軸の式 $x=-\\frac{b}{2a}$ です。

$$
x = -\\frac{${b}}{2\\cdot ${a}} = ${p}
$$

よって **${p}** です。
`;
    }

    case "quad_value_at_x": {
      const a = params.a, b = params.b, c = params.c, x = params.x;
      const y = a * x * x + b * x + c;
      return `
### この問題の解説
指定された $x=${x}$ をそのまま代入します。

$$
y = ${a}(${x})^2 ${b >= 0 ? "+" : ""}${b}(${x}) ${c >= 0 ? "+" : ""}${c} = ${y}
$$

よって **${y}** です。
`;
    }

    case "combi_nC2": {
      const n = params.n;
      const ans = (n * (n - 1)) / 2;
      return `
### この問題の解説
「${n}個から異なる2個を選ぶ」→ 組合せ $\\binom{n}{2}$ です。

$$
\\binom{${n}}{2} = \\frac{${n}\\cdot(${n}-1)}{2} = ${ans}
$$

よって **${ans}通り** です。
`;
    }

    case "combi_nP2": {
      const n = params.n;
      const ans = n * (n - 1);
      return `
### この問題の解説
「${n}個から2個を選んで順に並べる」→ 順列 ${n}P2 です。

$$
${n}P2 = ${n}\\cdot(${n}-1) = ${ans}
$$

よって **${ans}通り** です。
`;
    }

    case "combi_mult_rule": {
      const m = params.m, n = params.n;
      const ans = m * n;
      return `
### この問題の解説
Aを選んでからBを選ぶので **積の法則（掛け算）** です。

$$
${m}\\times ${n} = ${ans}
$$

よって **${ans}通り** です。
`;
    }

    default:
      return null;
  }
}
