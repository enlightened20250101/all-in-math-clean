// src/lib/course/templates/math1/quad_roots_relations_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear, texParenShift, texPoly2 } from "@/lib/format/tex";

type RelParams = {
  a: number;
  b: number;
  c: number;
  r1: number;
  r2: number;
};

function buildFromRoots(rootRange: number[], aChoices: number[], allowDouble: boolean): RelParams {
  const a = pick(aChoices);
  let r1 = pick(rootRange);
  let r2 = pick(rootRange);
  if (!allowDouble) {
    while (r2 === r1) r2 = pick(rootRange);
  }
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  return { a, b, c, r1, r2 };
}

function factorLine(params: RelParams) {
  const { a, r1, r2 } = params;
  if (r1 === r2) {
    return `${a}${texParenShift("x", -r1, 1)}=0`;
  }
  const f1 = texLinear(1, -r1);
  const f2 = texLinear(1, -r2);
  return `${a}(${f1})(${f2})=0`;
}

function buildSumTemplate(id: string, title: string, paramsFactory: () => RelParams): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_roots_relations_basic",
      title,
      difficulty: 1,
      tags: ["vieta", "sum"],
    },
    generate() {
      const params = paramsFactory();
      const poly = texPoly2(params.a, params.b, params.c);
      return {
        templateId: id,
        statement: `次の二次方程式の2解の和を求めよ。\n\n$$\n${poly} = 0\n$$`,
        answerKind: "numeric",
        params: params as unknown as Record<string, number>,
      };
    },
    grade(params, userAnswer) {
      const rel = params as unknown as RelParams;
      const sum = rel.r1 + rel.r2;
      return gradeNumeric(userAnswer, sum);
    },
    explain(params) {
      const rel = params as unknown as RelParams;
      const { a, b, r1, r2 } = rel;
      const poly = texPoly2(rel.a, rel.b, rel.c);
      const sum = r1 + r2;
      const line = factorLine(rel);
      return `
### この問題の解説
係数と解の関係より、解の和は $-\\frac{b}{a}$ です。

$$
${poly} = 0
$$

$$
\\alpha+\\beta = -\\frac{${b}}{${a}} = ${sum}
$$

（参考）${line}
`;
    },
  };
}

function buildProductTemplate(id: string, title: string, paramsFactory: () => RelParams): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_roots_relations_basic",
      title,
      difficulty: 1,
      tags: ["vieta", "product"],
    },
    generate() {
      const params = paramsFactory();
      const poly = texPoly2(params.a, params.b, params.c);
      return {
        templateId: id,
        statement: `次の二次方程式の2解の積を求めよ。\n\n$$\n${poly} = 0\n$$`,
        answerKind: "numeric",
        params: params as unknown as Record<string, number>,
      };
    },
    grade(params, userAnswer) {
      const rel = params as unknown as RelParams;
      const product = rel.r1 * rel.r2;
      return gradeNumeric(userAnswer, product);
    },
    explain(params) {
      const rel = params as unknown as RelParams;
      const { a, c, r1, r2 } = rel;
      const poly = texPoly2(rel.a, rel.b, rel.c);
      const product = r1 * r2;
      const line = factorLine(rel);
      return `
### この問題の解説
係数と解の関係より、解の積は $\\frac{c}{a}$ です。

$$
${poly} = 0
$$

$$
\\alpha\\beta = \\frac{${c}}{${a}} = ${product}
$$

（参考）${line}
`;
    },
  };
}

function buildSmallerRootTemplate(id: string, title: string, paramsFactory: () => RelParams): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_roots_relations_basic",
      title,
      difficulty: 1,
      tags: ["roots", "min"],
    },
    generate() {
      const params = paramsFactory();
      const poly = texPoly2(params.a, params.b, params.c);
      return {
        templateId: id,
        statement: `次の二次方程式の小さい方の解を答えよ。\n\n$$\n${poly} = 0\n$$`,
        answerKind: "numeric",
        params: params as unknown as Record<string, number>,
      };
    },
    grade(params, userAnswer) {
      const rel = params as unknown as RelParams;
      const smaller = Math.min(rel.r1, rel.r2);
      return gradeNumeric(userAnswer, smaller);
    },
    explain(params) {
      const rel = params as unknown as RelParams;
      const poly = texPoly2(rel.a, rel.b, rel.c);
      const smaller = Math.min(rel.r1, rel.r2);
      const line = factorLine(rel);
      return `
### この問題の解説
因数分解すると次の形になります。

$$
${poly} = 0
$$

$$
${line}
$$

よって解は ${rel.r1}, ${rel.r2} で、小さい方は ${smaller} です。
`;
    },
  };
}

export const quadRootsRelationsTemplates: QuestionTemplate[] = [
  buildSumTemplate("quad_rel_sum_1", "解の和 1", () =>
    buildFromRoots([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], [1, 2], false)
  ),
  buildSumTemplate("quad_rel_sum_2", "解の和 2", () =>
    buildFromRoots([-6, -5, -3, -2, -1, 1, 2, 3, 5, 6], [1, 3], false)
  ),
  buildSumTemplate("quad_rel_sum_3", "解の和 3", () =>
    buildFromRoots([-4, -2, -1, 1, 2, 4], [1, 2, 3], false)
  ),
  buildSumTemplate("quad_rel_sum_4", "解の和 4", () =>
    buildFromRoots([-7, -5, -3, -1, 1, 3, 5, 7], [1, 2], true)
  ),
  buildSumTemplate("quad_rel_sum_5", "解の和 5", () =>
    buildFromRoots([-6, -4, -2, 0, 2, 4, 6], [1, 2, 3], true)
  ),
  buildSumTemplate("quad_rel_sum_6", "解の和 6", () =>
    buildFromRoots([-3, -2, -1, 0, 1, 2, 3], [1, 3], true)
  ),
  buildSumTemplate("quad_rel_sum_7", "解の和 7", () =>
    buildFromRoots([-8, -6, -4, -2, 2, 4, 6, 8], [1, 2], false)
  ),
  buildSumTemplate("quad_rel_sum_8", "解の和 8", () =>
    buildFromRoots([-5, -3, -1, 1, 3, 5], [1, 2, 3], false)
  ),
  buildSumTemplate("quad_rel_sum_9", "解の和 9", () =>
    buildFromRoots([-7, -4, -2, 0, 2, 4, 7], [1, 3], true)
  ),
  buildSumTemplate("quad_rel_sum_10", "解の和 10", () =>
    buildFromRoots([-9, -6, -3, 0, 3, 6, 9], [1, 2], true)
  ),
  buildSumTemplate("quad_rel_sum_11", "解の和 11", () =>
    buildFromRoots([-10, -8, -4, -2, 2, 4, 8, 10], [1, 3], false)
  ),
  buildSumTemplate("quad_rel_sum_12", "解の和 12", () =>
    buildFromRoots([-6, -2, 2, 6], [1, 2, 3], true)
  ),
  buildSumTemplate("quad_rel_sum_13", "解の和 13", () =>
    buildFromRoots([-9, -5, -1, 1, 5, 9], [1, 2], false)
  ),
  buildSumTemplate("quad_rel_sum_14", "解の和 14", () =>
    buildFromRoots([-12, -6, -3, 3, 6, 12], [1, 3], true)
  ),
  buildSumTemplate("quad_rel_sum_15", "解の和 15", () =>
    buildFromRoots([-11, -7, -3, 1, 5, 9], [1, 2], false)
  ),
  buildSumTemplate("quad_rel_sum_16", "解の和 16", () =>
    buildFromRoots([-8, -5, -2, 2, 5, 8], [1, 3], true)
  ),

  buildProductTemplate("quad_rel_prod_1", "解の積 1", () =>
    buildFromRoots([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], [1, 2], false)
  ),
  buildProductTemplate("quad_rel_prod_2", "解の積 2", () =>
    buildFromRoots([-6, -3, -2, -1, 1, 2, 3, 6], [1, 3], false)
  ),
  buildProductTemplate("quad_rel_prod_3", "解の積 3", () =>
    buildFromRoots([-4, -2, -1, 1, 2, 4], [1, 2, 3], false)
  ),
  buildProductTemplate("quad_rel_prod_4", "解の積 4", () =>
    buildFromRoots([-7, -5, -3, -1, 1, 3, 5, 7], [1, 2], true)
  ),
  buildProductTemplate("quad_rel_prod_5", "解の積 5", () =>
    buildFromRoots([-6, -4, -2, 0, 2, 4, 6], [1, 2, 3], true)
  ),
  buildProductTemplate("quad_rel_prod_6", "解の積 6", () =>
    buildFromRoots([-3, -2, -1, 0, 1, 2, 3], [1, 3], true)
  ),
  buildProductTemplate("quad_rel_prod_7", "解の積 7", () =>
    buildFromRoots([-8, -6, -4, -2, 2, 4, 6, 8], [1, 2], false)
  ),
  buildProductTemplate("quad_rel_prod_8", "解の積 8", () =>
    buildFromRoots([-5, -3, -1, 1, 3, 5], [1, 2, 3], false)
  ),
  buildProductTemplate("quad_rel_prod_9", "解の積 9", () =>
    buildFromRoots([-7, -4, -2, 0, 2, 4, 7], [1, 3], true)
  ),
  buildProductTemplate("quad_rel_prod_10", "解の積 10", () =>
    buildFromRoots([-9, -6, -3, 0, 3, 6, 9], [1, 2], true)
  ),
  buildProductTemplate("quad_rel_prod_11", "解の積 11", () =>
    buildFromRoots([-10, -8, -4, -2, 2, 4, 8, 10], [1, 3], false)
  ),
  buildProductTemplate("quad_rel_prod_12", "解の積 12", () =>
    buildFromRoots([-6, -2, 2, 6], [1, 2, 3], true)
  ),
  buildProductTemplate("quad_rel_prod_13", "解の積 13", () =>
    buildFromRoots([-9, -5, -1, 1, 5, 9], [1, 2], false)
  ),
  buildProductTemplate("quad_rel_prod_14", "解の積 14", () =>
    buildFromRoots([-12, -6, -3, 3, 6, 12], [1, 3], true)
  ),
  buildProductTemplate("quad_rel_prod_15", "解の積 15", () =>
    buildFromRoots([-11, -7, -3, 1, 5, 9], [1, 2], false)
  ),
  buildProductTemplate("quad_rel_prod_16", "解の積 16", () =>
    buildFromRoots([-8, -5, -2, 2, 5, 8], [1, 3], true)
  ),

  buildSmallerRootTemplate("quad_rel_min_1", "小さい方の解 1", () =>
    buildFromRoots([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], [1, 2], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_2", "小さい方の解 2", () =>
    buildFromRoots([-6, -5, -3, -2, -1, 1, 2, 3, 5, 6], [1, 3], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_3", "小さい方の解 3", () =>
    buildFromRoots([-4, -2, -1, 1, 2, 4], [1, 2, 3], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_4", "小さい方の解 4", () =>
    buildFromRoots([-6, -4, -2, 0, 2, 4, 6], [1, 2], true)
  ),
  buildSmallerRootTemplate("quad_rel_min_5", "小さい方の解 5", () =>
    buildFromRoots([-3, -2, -1, 0, 1, 2, 3], [1, 3], true)
  ),
  buildSmallerRootTemplate("quad_rel_min_6", "小さい方の解 6", () =>
    buildFromRoots([-7, -5, -3, -1, 1, 3, 5, 7], [1, 2], true)
  ),
  buildSmallerRootTemplate("quad_rel_min_7", "小さい方の解 7", () =>
    buildFromRoots([-8, -6, -4, -2, 2, 4, 6, 8], [1, 2], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_8", "小さい方の解 8", () =>
    buildFromRoots([-5, -3, -1, 1, 3, 5], [1, 3], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_9", "小さい方の解 9", () =>
    buildFromRoots([-8, -6, -4, -2, 2, 4, 6, 8], [1, 2], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_10", "小さい方の解 10", () =>
    buildFromRoots([-5, -3, -1, 1, 3, 5], [1, 2, 3], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_11", "小さい方の解 11", () =>
    buildFromRoots([-7, -4, -2, 0, 2, 4, 7], [1, 3], true)
  ),
  buildSmallerRootTemplate("quad_rel_min_12", "小さい方の解 12", () =>
    buildFromRoots([-9, -6, -3, 0, 3, 6, 9], [1, 2], true)
  ),
  buildSmallerRootTemplate("quad_rel_min_13", "小さい方の解 13", () =>
    buildFromRoots([-10, -8, -4, -2, 2, 4, 8, 10], [1, 3], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_14", "小さい方の解 14", () =>
    buildFromRoots([-6, -2, 2, 6], [1, 2, 3], true)
  ),
  buildSmallerRootTemplate("quad_rel_min_15", "小さい方の解 15", () =>
    buildFromRoots([-9, -5, -1, 1, 5, 9], [1, 2], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_16", "小さい方の解 16", () =>
    buildFromRoots([-12, -6, -3, 3, 6, 12], [1, 3], true)
  ),
  buildSmallerRootTemplate("quad_rel_min_17", "小さい方の解 17", () =>
    buildFromRoots([-11, -7, -3, 1, 5, 9], [1, 2], false)
  ),
  buildSmallerRootTemplate("quad_rel_min_18", "小さい方の解 18", () =>
    buildFromRoots([-8, -5, -2, 2, 5, 8], [1, 3], true)
  ),
];

const extraRootsRelationTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const id = `quad_rel_extra_${idx + 1}`;
  if (kind === 0) {
    return buildSumTemplate(id, "解の和（追加）", () =>
      buildFromRoots([-6, -4, -2, -1, 1, 2, 4, 6], [1, 2, 3], false)
    );
  }
  if (kind === 1) {
    return buildProductTemplate(id, "解の積（追加）", () =>
      buildFromRoots([-5, -3, -1, 1, 3, 5], [1, 2, 3], true)
    );
  }
  return buildSmallerRootTemplate(id, "小さい方の解（追加）", () =>
    buildFromRoots([-7, -5, -2, -1, 1, 2, 5, 7], [1, 2], false)
  );
});

quadRootsRelationsTemplates.push(...extraRootsRelationTemplates);
