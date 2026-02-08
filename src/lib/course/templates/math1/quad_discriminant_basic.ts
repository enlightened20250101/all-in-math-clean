// src/lib/course/templates/math1/quad_discriminant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type DiscParams = {
  a: number;
  b: number;
  c: number;
};

const CONTEXTS: Record<string, string> = {
  quad_disc_value_1: "放物線と$x$軸の交点の個数を判別する前に$D$を求める。",
  quad_disc_value_2: "解の個数を判断するための判別式を計算する。",
  quad_disc_roots_1: "実数解の個数を判定するために$D$を使う。",
  quad_disc_roots_2: "二次関数のグラフと$x$軸の交点の数を判断する。",
};

function calcD(a: number, b: number, c: number) {
  return b * b - 4 * a * c;
}

function buildAnyParams(aChoices: number[], bMin: number, bMax: number, cMin: number, cMax: number): DiscParams {
  const a = pick(aChoices);
  const b = randInt(bMin, bMax);
  const c = randInt(cMin, cMax);
  return { a, b, c };
}

function buildParamsWithDistinctRoots(rootRange: number[], aChoices: number[]): DiscParams {
  const a = pick(aChoices);
  let r1 = pick(rootRange);
  let r2 = pick(rootRange);
  while (r2 === r1) r2 = pick(rootRange);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  return { a, b, c };
}

function buildParamsWithDoubleRoot(rootRange: number[], aChoices: number[]): DiscParams {
  const a = pick(aChoices);
  const r = pick(rootRange);
  const b = -2 * a * r;
  const c = a * r * r;
  return { a, b, c };
}

function buildParamsWithNoRealRoots(aChoices: number[], bMin: number, bMax: number, cMin: number, cMax: number): DiscParams {
  while (true) {
    const a = pick(aChoices);
    const b = randInt(bMin, bMax);
    const c = randInt(cMin, cMax);
    if (calcD(a, b, c) < 0) return { a, b, c };
  }
}

function buildDiscValueTemplate(
  id: string,
  title: string,
  paramsFactory: () => DiscParams
): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_discriminant_basic",
      title,
      difficulty: 1,
      tags: ["discriminant", "value"],
    },
    generate() {
      const params = paramsFactory();
      const poly = texPoly2(params.a, params.b, params.c);
      const lead = CONTEXTS[id] ? `${CONTEXTS[id]}\n` : "";
      return {
        templateId: id,
        statement: `${lead}次の二次方程式の判別式 $D$ を求めよ。\n\n$$\n${poly} = 0\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const D = calcD(params.a, params.b, params.c);
      return gradeNumeric(userAnswer, D);
    },
    explain(params) {
      const { a, b, c } = params;
      const poly = texPoly2(a, b, c);
      const D = calcD(a, b, c);
      return `
### この問題の解説
判別式は $D=b^2-4ac$ です。

$$
${poly} = 0
$$

$$
D = ${b}^2 - 4\\cdot${a}\\cdot${c} = ${D}
$$
`;
    },
  };
}

function buildRootCountTemplate(
  id: string,
  title: string,
  paramsFactory: () => DiscParams
): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_discriminant_basic",
      title,
      difficulty: 1,
      tags: ["discriminant", "roots-count"],
    },
    generate() {
      const params = paramsFactory();
      const poly = texPoly2(params.a, params.b, params.c);
      const lead = CONTEXTS[id] ? `${CONTEXTS[id]}\n` : "";
      return {
        templateId: id,
        statement: `${lead}次の二次方程式の実数解の個数を答えよ（$2/1/0$）。\n\n$$\n${poly} = 0\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const D = calcD(params.a, params.b, params.c);
      const count = D > 0 ? 2 : D === 0 ? 1 : 0;
      return gradeNumeric(userAnswer, count);
    },
    explain(params) {
      const { a, b, c } = params;
      const poly = texPoly2(a, b, c);
      const D = calcD(a, b, c);
      const count = D > 0 ? 2 : D === 0 ? 1 : 0;
      const verdict =
        D > 0 ? "D > 0 なので実数解が2つ" : D === 0 ? "D = 0 なので重解（1つ）" : "D < 0 なので実数解なし";
      return `
### この問題の解説
$$
${poly} = 0
$$

$$
D = ${b}^2 - 4\\cdot${a}\\cdot${c} = ${D}
$$

${verdict}。答えは ${count} です。
`;
    },
  };
}

export const quadDiscriminantTemplates: QuestionTemplate[] = [
  buildDiscValueTemplate("quad_disc_value_1", "判別式の値 1", () =>
    buildAnyParams([1, 2], -6, 6, -6, 6)
  ),
  buildDiscValueTemplate("quad_disc_value_2", "判別式の値 2", () =>
    buildAnyParams([1, 2, 3], -5, 5, -6, 6)
  ),
  buildDiscValueTemplate("quad_disc_value_3", "判別式の値 3", () =>
    buildAnyParams([1, 2], -7, 7, -5, 5)
  ),
  buildDiscValueTemplate("quad_disc_value_4", "判別式の値 4", () =>
    buildAnyParams([1, 3], -6, 6, -4, 4)
  ),
  buildDiscValueTemplate("quad_disc_value_5", "判別式の値 5", () =>
    buildAnyParams([1, 2, 3], -4, 4, -8, 8)
  ),
  buildDiscValueTemplate("quad_disc_value_6", "判別式の値 6", () =>
    buildAnyParams([1, 2], -8, 8, -6, 6)
  ),
  buildDiscValueTemplate("quad_disc_value_7", "判別式の値 7", () =>
    buildAnyParams([1, 2, 3], -6, 6, -3, 3)
  ),
  buildDiscValueTemplate("quad_disc_value_8", "判別式の値 8", () =>
    buildAnyParams([1, 2], -5, 5, -7, 7)
  ),
  buildDiscValueTemplate("quad_disc_value_9", "判別式の値 9", () =>
    buildAnyParams([1, 3], -7, 7, -5, 5)
  ),
  buildDiscValueTemplate("quad_disc_value_10", "判別式の値 10", () =>
    buildAnyParams([1, 2, 3], -6, 6, -6, 6)
  ),

  buildRootCountTemplate("quad_disc_count_1", "解の個数判定 1", () =>
    buildParamsWithDistinctRoots([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], [1, 2])
  ),
  buildRootCountTemplate("quad_disc_count_2", "解の個数判定 2", () =>
    buildParamsWithDistinctRoots([-6, -5, -4, -2, -1, 1, 2, 3, 4, 6], [1, 3])
  ),
  buildRootCountTemplate("quad_disc_count_3", "解の個数判定 3", () =>
    buildParamsWithDistinctRoots([-4, -3, -1, 1, 2, 4], [1, 2, 3])
  ),
  buildRootCountTemplate("quad_disc_count_4", "解の個数判定 4", () =>
    buildParamsWithDoubleRoot([-6, -4, -3, -2, -1, 0, 1, 2, 3, 4, 6], [1, 2])
  ),
  buildRootCountTemplate("quad_disc_count_5", "解の個数判定 5", () =>
    buildParamsWithDoubleRoot([-5, -3, -1, 1, 3, 5], [1, 3])
  ),
  buildRootCountTemplate("quad_disc_count_6", "解の個数判定 6", () =>
    buildParamsWithDoubleRoot([-4, -2, 0, 2, 4], [1, 2])
  ),
  buildRootCountTemplate("quad_disc_count_7", "解の個数判定 7", () =>
    buildParamsWithNoRealRoots([1, 2], -5, 5, 1, 6)
  ),
  buildRootCountTemplate("quad_disc_count_8", "解の個数判定 8", () =>
    buildParamsWithNoRealRoots([1, 2, 3], -6, 6, 2, 7)
  ),
  buildRootCountTemplate("quad_disc_count_9", "解の個数判定 9", () =>
    buildParamsWithNoRealRoots([2, 3], -4, 4, 1, 6)
  ),
  buildRootCountTemplate("quad_disc_count_10", "解の個数判定 10", () =>
    buildParamsWithNoRealRoots([1, 3], -7, 7, 3, 9)
  ),
  buildDiscValueTemplate("quad_disc_value_11", "判別式の値 11", () =>
    buildAnyParams([1, 2, 3], -6, 6, -5, 5)
  ),
  buildDiscValueTemplate("quad_disc_value_12", "判別式の値 12", () =>
    buildAnyParams([1, 2], -8, 8, -6, 6)
  ),
  buildDiscValueTemplate("quad_disc_value_13", "判別式の値 13", () =>
    buildAnyParams([1, 3], -7, 7, -4, 4)
  ),
  buildDiscValueTemplate("quad_disc_value_14", "判別式の値 14", () =>
    buildAnyParams([2, 3], -6, 6, -5, 5)
  ),
  buildRootCountTemplate("quad_disc_count_11", "解の個数判定 11", () =>
    buildParamsWithDoubleRoot([-7, -5, -3, -1, 1, 3, 5, 7], [1, 2])
  ),
  buildRootCountTemplate("quad_disc_count_12", "解の個数判定 12", () =>
    buildParamsWithNoRealRoots([1, 2, 3], -5, 5, 2, 8)
  ),
  buildDiscValueTemplate("quad_disc_value_15", "判別式の値 15", () =>
    buildAnyParams([1, 2], -9, 9, -6, 6)
  ),
  buildDiscValueTemplate("quad_disc_value_16", "判別式の値 16", () =>
    buildAnyParams([1, 3], -8, 8, -5, 5)
  ),
  buildDiscValueTemplate("quad_disc_value_17", "判別式の値 17", () =>
    buildAnyParams([2, 3], -7, 7, -4, 4)
  ),
  buildDiscValueTemplate("quad_disc_value_18", "判別式の値 18", () =>
    buildAnyParams([1, 2, 3], -6, 6, -7, 7)
  ),
  buildDiscValueTemplate("quad_disc_value_19", "判別式の値 19", () =>
    buildAnyParams([1, 4], -6, 6, -5, 5)
  ),
  buildDiscValueTemplate("quad_disc_value_20", "判別式の値 20", () =>
    buildAnyParams([1, 2], -10, 10, -4, 4)
  ),
  buildDiscValueTemplate("quad_disc_value_21", "判別式の値 21", () =>
    buildAnyParams([1, 3], -9, 9, -6, 6)
  ),
  buildDiscValueTemplate("quad_disc_value_22", "判別式の値 22", () =>
    buildAnyParams([2, 3], -8, 8, -5, 5)
  ),
  buildDiscValueTemplate("quad_disc_value_23", "判別式の値 23", () =>
    buildAnyParams([1, 2, 3], -7, 7, -3, 3)
  ),
  buildDiscValueTemplate("quad_disc_value_24", "判別式の値 24", () =>
    buildAnyParams([1, 4], -6, 6, -6, 6)
  ),
  buildDiscValueTemplate("quad_disc_value_25", "判別式の値 25", () =>
    buildAnyParams([1, 2], -8, 8, -7, 7)
  ),
  buildDiscValueTemplate("quad_disc_value_26", "判別式の値 26", () =>
    buildAnyParams([1, 3], -7, 7, -8, 8)
  ),
  buildDiscValueTemplate("quad_disc_value_27", "判別式の値 27", () =>
    buildAnyParams([2, 3], -6, 6, -6, 6)
  ),
  buildDiscValueTemplate("quad_disc_value_28", "判別式の値 28", () =>
    buildAnyParams([1, 2, 3], -5, 5, -9, 9)
  ),
  buildDiscValueTemplate("quad_disc_value_29", "判別式の値 29", () =>
    buildAnyParams([1, 4], -7, 7, -5, 5)
  ),
  buildRootCountTemplate("quad_disc_count_13", "解の個数判定 13", () =>
    buildParamsWithDistinctRoots([-6, -5, -3, -2, -1, 1, 2, 3, 5, 6], [1, 2])
  ),
  buildRootCountTemplate("quad_disc_count_14", "解の個数判定 14", () =>
    buildParamsWithDistinctRoots([-7, -4, -2, -1, 1, 2, 4, 7], [1, 3])
  ),
  buildRootCountTemplate("quad_disc_count_15", "解の個数判定 15", () =>
    buildParamsWithDistinctRoots([-5, -4, -2, 1, 2, 4, 5], [2, 3])
  ),
  buildRootCountTemplate("quad_disc_count_16", "解の個数判定 16", () =>
    buildParamsWithDistinctRoots([-8, -6, -3, -1, 1, 3, 6, 8], [1, 2, 3])
  ),
  buildRootCountTemplate("quad_disc_count_17", "解の個数判定 17", () =>
    buildParamsWithDoubleRoot([-8, -6, -4, -2, 0, 2, 4, 6, 8], [1, 2])
  ),
  buildRootCountTemplate("quad_disc_count_18", "解の個数判定 18", () =>
    buildParamsWithDoubleRoot([-7, -5, -3, -1, 1, 3, 5, 7], [2, 3])
  ),
  buildRootCountTemplate("quad_disc_count_19", "解の個数判定 19", () =>
    buildParamsWithDoubleRoot([-6, -3, 0, 3, 6], [1, 3])
  ),
  buildRootCountTemplate("quad_disc_count_20", "解の個数判定 20", () =>
    buildParamsWithDoubleRoot([-9, -6, -3, 0, 3, 6, 9], [1, 2])
  ),
  buildRootCountTemplate("quad_disc_count_21", "解の個数判定 21", () =>
    buildParamsWithNoRealRoots([1, 2], -6, 6, 2, 9)
  ),
  buildRootCountTemplate("quad_disc_count_22", "解の個数判定 22", () =>
    buildParamsWithNoRealRoots([2, 3], -7, 7, 3, 9)
  ),
  buildRootCountTemplate("quad_disc_count_23", "解の個数判定 23", () =>
    buildParamsWithNoRealRoots([1, 3], -8, 8, 4, 10)
  ),
  buildRootCountTemplate("quad_disc_count_24", "解の個数判定 24", () =>
    buildParamsWithNoRealRoots([1, 2, 3], -6, 6, 5, 11)
  ),
  buildRootCountTemplate("quad_disc_count_25", "解の個数判定 25", () =>
    buildParamsWithNoRealRoots([2, 3], -5, 5, 1, 8)
  ),
  buildRootCountTemplate("quad_disc_count_26", "解の個数判定 26", () =>
    buildParamsWithDistinctRoots([-9, -7, -4, -2, 2, 4, 7, 9], [1, 2])
  ),
  buildRootCountTemplate("quad_disc_count_27", "解の個数判定 27", () =>
    buildParamsWithDoubleRoot([-8, -4, 0, 4, 8], [1, 2, 3])
  ),
];

const extraDiscriminantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const id = `quad_disc_extra_${idx + 1}`;
  if (kind === 0) {
    return buildDiscValueTemplate(id, "判別式の値（追加）", () =>
      buildAnyParams([1, 2, 3], -8, 8, -7, 7)
    );
  }
  if (kind === 1) {
    return buildRootCountTemplate(id, "解の個数判定（追加）", () =>
      buildParamsWithDistinctRoots([-6, -4, -2, -1, 1, 2, 4, 6], [1, 2])
    );
  }
  return buildRootCountTemplate(id, "解の個数判定（追加）", () =>
    buildParamsWithNoRealRoots([1, 2, 3], -6, 6, 2, 8)
  );
});

quadDiscriminantTemplates.push(...extraDiscriminantTemplates);
