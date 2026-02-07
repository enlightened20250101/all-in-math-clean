// src/server/learning/templates.ts
export type SkillTemplate = {
  systemHint: string;   // モデル向けの生成方針
  userHint: string;     // リクエストに混ぜる制約
  constraints?: Record<string, any>;
};

export const skillTemplates: Record<string, SkillTemplate> = {
  // 積の微分：y = u(x) v(x) → y' = u'v + uv'
  'diff.product': {
    systemHint:
      'For skill diff.product, generate a product-rule differentiation item. ' +
      'Use small integer coefficients and simple factors. Return a machine_check of type "derivative".',
    userHint:
      'Output JSON with: skill_id, difficulty, problem_latex, answer_latex, hint_steps[], and machine_check = { "type":"derivative", "expr": "<python style>", "var":"x", "expected":"<python style>" }. ' +
      'Use LaTeX in problem/answer; use python style operators in machine_check (e.g., 2*x, x**2). Example: y=(3*x+1)*(x**2-2).'
  },

  // 一次方程式（解を求める）→ machine_check は roots を使う
  'equation.linear': {
    systemHint:
      'For skill equation.linear, generate a single-variable linear equation with a unique real solution.',
    userHint:
      'Output JSON with: skill_id, difficulty, problem_latex, answer_latex, hint_steps[], ' +
      'and machine_check = { "type":"roots", "equation":"<python style equation or expr=0>", "var":"x", "solutions":["<unique_solution>"] }. ' +
      'Use small integers. Example: equation: "2*x+3=9", solutions: ["3"]. ' +
      'Use LaTeX in problem/answer; use python style in machine_check.'
  },
  

  // 二次方程式の実根（因数分解できる形でOK）
  'roots.quadratic': {
    systemHint:
      'For skill roots.quadratic, generate a quadratic with factorable integer roots and ask to find all real roots. ' +
      'Return machine_check of type "roots".',
    userHint:
      'machine_check must be { "type":"roots", "equation":"<python style equation or expr=0>", "var":"x", "solutions":[...] }. ' +
      'Use a single "=" for equations (not "=="). Example: "(x-1)*(x-2)=0".'
  },
  // 商の微分：y = u(x)/v(x)
  'diff.quotient': {
    systemHint:
      'For skill diff.quotient, generate a quotient-rule differentiation item. Keep u, v simple polynomials with small integers.',
    userHint:
      'Return machine_check = { "type":"derivative", "expr":"<python style>", "var":"x", "expected":"<python style>" }.\n' +
      'Example: y=(2*x+1)/(x**2-3). Use LaTeX in problem/answer; python style in machine_check.'
  },

  // 恒等式：すべての x で成り立つ等式
  'equation.identity': {
    systemHint:
      'For skill equation.identity, generate a polynomial identity that holds for all real x (e.g., expansions/factorings). Avoid domain issues.',
    userHint:
      'Return machine_check = { "type":"equation", "lhs":"<python expr>", "rhs":"<python expr>", "var":"x" }.\n' +
      'Use a single "=" when you show equations in text; in machine_check use separate lhs/rhs.\n' +
      'Examples: (x+1)**2  vs  x**2+2*x+1,   (x-2)*(x+3)  vs  x**2+x-6.'
  },

  'diff.trig': {
    systemHint:
      'For skill diff.trig, generate a derivative item with sin/cos/tan composed with linear terms (e.g., sin(2x), cos(3x)).',
    userHint:
      'machine_check = { "type":"derivative", "expr":"<python>", "var":"x", "expected":"<python>" }. ' +
      'Use python style: sin(2*x), cos(3*x). Avoid plain letters like s i n.'
  },
  
  // equation.system2
  'equation.system2': {
    systemHint:
      'For skill equation.system2, generate a 2x2 linear system with a unique integer or simple rational solution.',
    userHint:
      'machine_check = { "type":"roots_system", "equations":["<eq1>","<eq2>"], "vars":["x","y"], "solution":["<sx>","<sy>"] }. ' +
      'Use a single "=" in equations (not "=="). Do NOT concatenate equations: use an array.'
  },

  'int.basic': {
    systemHint:
      'For skill int.basic, generate an indefinite integral with a clean antiderivative (no +C in the JSON).',
    userHint:
      'Return machine_check = { "type":"integral", "integrand":"<python style>", "var":"x", "expected":"<python style>" }.\n' +
      'We will verify by differentiating expected to get the integrand.'
  },

  'roots.cubic_easy': {
    systemHint:
      'For skill roots.cubic_easy, generate a cubic with an obvious integer factor (e.g., (x-1)(x+2)(x-3)=0).',
    userHint:
      'Return machine_check = { "type":"roots", "equation":"<python style equation or expr=0>", "var":"x", "solutions":["<s1>","<s2>","<s3>"] }.\n' +
      'Example: equation:"(x-1)*(x+2)*(x-3)=0", solutions:["1","-2","3"].'
  },
};
