// src/lib/course/templates/mathC/complex_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";
import { texConst } from "@/lib/format/tex";

type ComplexParams = {
  a: number;
  b: number;
  c: number;
  d: number;
  op: number; // 0:add, 1:sub, 2:mul
  value: number; // real part
};

function buildParams(): ComplexParams {
  const a = randInt(-4, 4);
  const b = randInt(-4, 4);
  const c = randInt(-4, 4);
  const d = randInt(-4, 4);
  const op = pick([0, 1, 2]);
  if (op === 0) {
    return { a, b, c, d, op, value: a + c };
  }
  if (op === 1) {
    return { a, b, c, d, op, value: a - c };
  }
  // (a+bi)(c+di) = (ac-bd) + (ad+bc)i
  return { a, b, c, d, op, value: a * c - b * d };
}

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  const abs = Math.abs(b);
  return `(${a}${sign}${abs}i)`;
}

function explain(params: ComplexParams) {
  if (params.op === 0) {
    const sum = texConst(params.c);
    return `
### この問題の解説
実部は ${params.a}${sum ? ` ${sum}` : ""} = ${params.value}。
答えは **${params.value}** です。
`;
  }
  if (params.op === 1) {
    const diff = texConst(-params.c);
    return `
### この問題の解説
実部は ${params.a}${diff ? ` ${diff}` : ""} = ${params.value}。
答えは **${params.value}** です。
`;
  }
  return `
### この問題の解説
$(a+bi)(c+di)=(ac-bd)+(ad+bc)i$ より実部は
$$
${params.a}\\cdot${params.c}-${params.b}\\cdot${params.d}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_basic",
      title,
      difficulty: 1,
      tags: ["complex"],
    },
    generate() {
      const params = buildParams();
      const z1 = texComplex(params.a, params.b);
      const z2 = texComplex(params.c, params.d);
      const statement =
        params.op === 0
          ? `座標平面上の点を表す複素数 $${z1}+${z2}$ の実部を求めよ。`
        : params.op === 1
          ? `座標平面上の点を表す複素数 $${z1}-${z2}$ の実部を求めよ。`
          : `座標平面上の点を表す複素数 $${z1}${z2}$ の実部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ComplexParams).value);
    },
    explain(params) {
      return explain(params as ComplexParams);
    },
  };
}

export const complexBasicTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`complex_basic_${i + 1}`, `複素数計算 ${i + 1}`)
);

const extraComplexBasicTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`complex_basic_${i + 21}`, `複素数計算 追加${i + 1}`)
);

complexBasicTemplates.push(...extraComplexBasicTemplates);
