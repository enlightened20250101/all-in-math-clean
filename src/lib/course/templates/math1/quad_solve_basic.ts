// src/lib/course/templates/math1/quad_solve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeRoots, pick, randInt } from "../_shared/utils";
import { texLinear, texParenShift, texPoly2 } from "@/lib/format/tex";

type SolveParams = {
  a: number;
  b: number;
  c: number;
  r1: number;
  r2: number;
  caseType: number; // 0: two roots, 1: double root, 2: none
};

function buildFromDistinctRoots(rootRange: number[], aChoices: number[]) {
  const a = pick(aChoices);
  let r1 = pick(rootRange);
  let r2 = pick(rootRange);
  while (r2 === r1) {
    r2 = pick(rootRange);
  }
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  return { a, b, c, r1, r2, caseType: 0 } satisfies SolveParams;
}

function buildFromDoubleRoot(rootRange: number[], aChoices: number[]) {
  const a = pick(aChoices);
  const r1 = pick(rootRange);
  const b = -2 * a * r1;
  const c = a * r1 * r1;
  return { a, b, c, r1, r2: r1, caseType: 1 } satisfies SolveParams;
}

function buildNoReal(aChoices: number[], bMin: number, bMax: number, cMin: number, cMax: number) {
  while (true) {
    const a = pick(aChoices);
    const b = randInt(bMin, bMax);
    const c = randInt(cMin, cMax);
    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      return { a, b, c, r1: 0, r2: 0, caseType: 2 } satisfies SolveParams;
    }
  }
}

function explainSolve(params: SolveParams) {
  const { a, b, c, r1, r2, caseType } = params;
  const poly = texPoly2(a, b, c);
  const disc = b * b - 4 * a * c;
  const discLine = `D = ${b}^2 - 4\\cdot${a}\\cdot${c} = ${disc}`;

  if (caseType === 2) {
    return `
### この問題の解説
$$
${poly} = 0
$$
判別式を計算します。

$$
${discLine}
$$
${disc} < 0 なので実数解はありません。答えは **none**（実数解なし）です。
`;
  }

  if (caseType === 1) {
    const factor = texParenShift("x", -r1, 1);
    return `
### この問題の解説
$$
${poly} = 0
$$
判別式を計算します。

$$
${discLine}
$$
$D=0$ なので重解です。

$$
${a}${factor}=0
$$
よって解は $x=${r1}$ で、答えは **${r1},${r1}**（$a,a$ 形式）です。
`;
  }

  const f1 = texLinear(1, -r1);
  const f2 = texLinear(1, -r2);
  const roots = [r1, r2].sort((x, y) => x - y).join(",");
  return `
### この問題の解説
$$
${poly} = 0
$$
判別式を計算します。

$$
${discLine}
$$
$D>0$ なので異なる2つの実数解があります。

$$
${a}(${f1})(${f2})=0
$$
よって解は $x=${r1},\\ x=${r2}$ で、答えは **${roots}**（$a,b$ 形式）です。
`;
}

function buildTemplate(id: string, title: string, paramsFactory: () => SolveParams): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_solve_basic",
      title,
      difficulty: 1,
      tags: ["quadratic", "roots"],
    },
    generate() {
      const params = paramsFactory();
      const poly = texPoly2(params.a, params.b, params.c);
      return {
        templateId: id,
        statement: `次の二次方程式を解け。\\n\\n$$${poly} = 0$$`,
        answerKind: "multi_numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      if (params.caseType === 2) {
        return gradeRoots(userAnswer, "none");
      }
      if (params.caseType === 1) {
        return gradeRoots(userAnswer, [params.r1, params.r1]);
      }
      return gradeRoots(userAnswer, [params.r1, params.r2]);
    },
    explain(params) {
      return explainSolve(params as SolveParams);
    },
  };
}

export const quadSolveTemplates: QuestionTemplate[] = [
  buildTemplate("quad_solve_distinct_1", "二次方程式の解（2解）1", () =>
    buildFromDistinctRoots([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], [1, 2])
  ),
  buildTemplate("quad_solve_distinct_2", "二次方程式の解（2解）2", () =>
    buildFromDistinctRoots([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], [1, 2, 3])
  ),
  buildTemplate("quad_solve_distinct_3", "二次方程式の解（2解）3", () =>
    buildFromDistinctRoots([-4, -3, -2, -1, 0, 1, 2, 3, 4], [1, 3])
  ),
  buildTemplate("quad_solve_distinct_4", "二次方程式の解（2解）4", () =>
    buildFromDistinctRoots([-7, -5, -3, -1, 1, 3, 5, 7], [1, 2])
  ),
  buildTemplate("quad_solve_distinct_5", "二次方程式の解（2解）5", () =>
    buildFromDistinctRoots([-6, -4, -2, 0, 2, 4, 6], [1, 2, 3])
  ),
  buildTemplate("quad_solve_distinct_6", "二次方程式の解（2解）6", () =>
    buildFromDistinctRoots([-5, -3, -1, 1, 3, 5], [1, 2])
  ),
  buildTemplate("quad_solve_distinct_7", "二次方程式の解（2解）7", () =>
    buildFromDistinctRoots([-8, -6, -4, -2, 2, 4, 6, 8], [1, 2])
  ),
  buildTemplate("quad_solve_distinct_8", "二次方程式の解（2解）8", () =>
    buildFromDistinctRoots([-3, -2, -1, 1, 2, 3], [1, 3])
  ),
  buildTemplate("quad_solve_distinct_9", "二次方程式の解（2解）9", () =>
    buildFromDistinctRoots([-9, -6, -3, -1, 1, 3, 6, 9], [1, 2])
  ),
  buildTemplate("quad_solve_distinct_10", "二次方程式の解（2解）10", () =>
    buildFromDistinctRoots([-4, -2, -1, 1, 2, 4], [1, 2, 3])
  ),

  buildTemplate("quad_solve_double_1", "二次方程式の解（重解）1", () =>
    buildFromDoubleRoot([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], [1, 2])
  ),
  buildTemplate("quad_solve_double_2", "二次方程式の解（重解）2", () =>
    buildFromDoubleRoot([-6, -4, -2, 0, 2, 4, 6], [1, 3])
  ),
  buildTemplate("quad_solve_double_3", "二次方程式の解（重解）3", () =>
    buildFromDoubleRoot([-7, -5, -3, -1, 1, 3, 5, 7], [1, 2])
  ),
  buildTemplate("quad_solve_double_4", "二次方程式の解（重解）4", () =>
    buildFromDoubleRoot([-4, -3, -2, -1, 1, 2, 3, 4], [1, 2, 3])
  ),
  buildTemplate("quad_solve_double_5", "二次方程式の解（重解）5", () =>
    buildFromDoubleRoot([-8, -6, -4, -2, 2, 4, 6, 8], [1, 2])
  ),
  buildTemplate("quad_solve_double_6", "二次方程式の解（重解）6", () =>
    buildFromDoubleRoot([-3, -2, -1, 0, 1, 2, 3], [1, 3])
  ),
  buildTemplate("quad_solve_double_7", "二次方程式の解（重解）7", () =>
    buildFromDoubleRoot([-5, -3, -1, 1, 3, 5], [1, 2])
  ),

  buildTemplate("quad_solve_none_1", "二次方程式の解（実数解なし）1", () =>
    buildNoReal([1, 2, 3], -4, 4, 1, 6)
  ),
  buildTemplate("quad_solve_none_2", "二次方程式の解（実数解なし）2", () =>
    buildNoReal([1, 2], -6, 6, 2, 8)
  ),
  buildTemplate("quad_solve_none_3", "二次方程式の解（実数解なし）3", () =>
    buildNoReal([2, 3], -5, 5, 1, 6)
  ),
  buildTemplate("quad_solve_none_4", "二次方程式の解（実数解なし）4", () =>
    buildNoReal([1, 3], -3, 3, 2, 7)
  ),
  buildTemplate("quad_solve_none_5", "二次方程式の解（実数解なし）5", () =>
    buildNoReal([1, 2], -7, 7, 3, 9)
  ),
  buildTemplate("quad_solve_none_6", "二次方程式の解（実数解なし）6", () =>
    buildNoReal([2, 3], -6, 6, 2, 8)
  ),
  buildTemplate("quad_solve_none_7", "二次方程式の解（実数解なし）7", () =>
    buildNoReal([1, 2, 3], -5, 5, 1, 6)
  ),
  buildTemplate("quad_solve_none_8", "二次方程式の解（実数解なし）8", () =>
    buildNoReal([1, 3], -8, 8, 2, 9)
  ),
];

const extraSolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const id = `quad_solve_extra_${idx + 1}`;
  if (kind === 0) {
    return buildTemplate(id, "二次方程式の解（追加・2解）", () =>
      buildFromDistinctRoots([-6, -4, -2, -1, 1, 2, 4, 6], [1, 2])
    );
  }
  if (kind === 1) {
    return buildTemplate(id, "二次方程式の解（追加・重解）", () =>
      buildFromDoubleRoot([-5, -3, -1, 0, 1, 3, 5], [1, 2, 3])
    );
  }
  return buildTemplate(id, "二次方程式の解（追加・実数解なし）", () =>
    buildNoReal([1, 2, 3], -6, 6, 2, 9)
  );
});

quadSolveTemplates.push(...extraSolveTemplates);
