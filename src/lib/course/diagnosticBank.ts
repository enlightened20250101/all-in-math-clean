export type DiagnosticArea = "algebra" | "quadratic" | "combinatorics";
export type AnswerKind = "numeric" | "choice" | "multi_numeric";

export type DiagnosticQuestion = {
  id: string;
  area: DiagnosticArea;
  statement: string;         // Markdown + TeX
  answerKind: AnswerKind;
  choices?: string[];        // choice用
  correct: string;           // numericでも文字列で
};

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // --- 数と式 / 代数 (algebra) : 3問 ---
  {
    id: "alg_1",
    area: "algebra",
    statement: `計算しなさい： $3(2x-1) - (x+5)$`,
    answerKind: "numeric",
    // 3(2x-1) - (x+5)=6x-3-x-5=5x-8 → 係数だけ聞くのは微妙なので x=1代入型にする方が楽
    // ここでは x=1 の値を聞く形に変更
    //（※このままだと数式入力が必要になるので、下で差し替えた版を使う）
    correct: "0",
  },
  {
    id: "alg_1_fixed",
    area: "algebra",
    statement: `次の式の $x=1$ のときの値を求めなさい： $3(2x-1) - (x+5)$`,
    answerKind: "numeric",
    // x=1 → 3(1)-6 = -3
    correct: "-3",
  },
  {
    id: "alg_2",
    area: "algebra",
    statement: `方程式を解きなさい： $2x+3=11$`,
    answerKind: "numeric",
    correct: "4",
  },
  {
    id: "alg_3",
    area: "algebra",
    statement: `不等式を解きなさい： $3x-6>0$ のときの最小の整数 $x$ は？`,
    answerKind: "numeric",
    correct: "3",
  },

  // --- 二次関数 (quadratic) : 4問 ---
  {
    id: "quad_1",
    area: "quadratic",
    statement: `二次関数 $y=x^2+4x+1$ の軸は $x=p$ と表せる。$p$ を求めなさい。`,
    answerKind: "numeric",
    correct: "-2",
  },
  {
    id: "quad_2",
    area: "quadratic",
    statement: `二次関数 $y=x^2-2x+5$ の頂点の $y$ 座標を求めなさい。`,
    answerKind: "numeric",
    // y=(x-1)^2+4 → 4
    correct: "4",
  },
  {
    id: "quad_3",
    area: "quadratic",
    statement: `二次関数 $y=2x^2-8x+3$ の最小値を求めなさい。`,
    answerKind: "numeric",
    // 2(x^2-4x)+3=2((x-2)^2-4)+3=2(x-2)^2-5 → min -5
    correct: "-5",
  },
  {
    id: "quad_4",
    area: "quadratic",
    statement: `二次関数 $y=x^2+2x-3$ について、$x=1$ のときの $y$ を求めなさい。`,
    answerKind: "numeric",
    // 1+2-3=0
    correct: "0",
  },

  // --- 場合の数 (combinatorics) : 3問 ---
  {
    id: "comb_1",
    area: "combinatorics",
    statement: `1〜6 の中から異なる2つを選ぶ方法は何通り？`,
    answerKind: "numeric",
    // 6C2=15
    correct: "15",
  },
  {
    id: "comb_2",
    area: "combinatorics",
    statement: `Aの選び方が3通り、Bの選び方が4通りある。A→B の順に選ぶ方法は何通り？`,
    answerKind: "numeric",
    correct: "12",
  },
  {
    id: "comb_3",
    area: "combinatorics",
    statement: `1〜5 の中から異なる2つを選んで順に並べる方法は何通り？`,
    answerKind: "numeric",
    // 5P2=20
    correct: "20",
  },
];

// alg_1 の旧版を混ぜないように、実際に使うセットを固定
export const DIAGNOSTIC_SET: DiagnosticQuestion[] = [
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "alg_1_fixed")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "alg_2")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "alg_3")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "quad_1")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "quad_2")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "quad_3")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "quad_4")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "comb_1")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "comb_2")!,
  DIAGNOSTIC_QUESTIONS.find(q => q.id === "comb_3")!,
];
