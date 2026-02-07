// src/lib/course/templates/mathC/vector_space_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type SpaceParams = { ax: number; ay: number; az: number; op: number; value: number };

function buildParams(): SpaceParams {
  const ax = randInt(-3, 3);
  const ay = randInt(-3, 3);
  const az = randInt(-3, 3);
  const op = pick([0, 1]); // 0: 2a, 1: -a
  const value = op === 0 ? 2 * ax : -ax;
  return { ax, ay, az, op, value };
}

function explain(params: SpaceParams) {
  return `
### この問題の解説
成分表示の実数倍は各成分に掛けます。x 成分は
$$
${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_space_basic",
      title,
      difficulty: 1,
      tags: ["vector", "space", "ct"],
    },
    generate() {
      const params = buildParams();
      const a = `\\vec{a}=(${params.ax},${params.ay},${params.az})`;
      const statement =
        params.op === 0
          ? `空間ベクトル $${a}$ の $2\\vec{a}$ の x 成分を求めよ。`
          : `空間ベクトル $${a}$ の $-\\vec{a}$ の x 成分を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SpaceParams).value);
    },
    explain(params) {
      return explain(params as SpaceParams);
    },
  };
}

const extraVectorSpaceTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_space_basic_${i + 21}`, `空間ベクトル 追加${i + 1}`)
);

export const vectorSpaceTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) => buildTemplate(`vector_space_basic_${i + 1}`, `空間ベクトル ${i + 1}`)),
  ...extraVectorSpaceTemplates,
];
