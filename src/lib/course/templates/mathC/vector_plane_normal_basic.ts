// src/lib/course/templates/mathC/vector_plane_normal_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { normalizeSigns, texTerm } from "@/lib/format/tex";

type NormalParams = {
  a: number;
  b: number;
  c: number;
};

function texPlane(a: number, b: number, c: number, d: number) {
  let s = "";
  const t1 = texTerm(a, "x", true);
  if (t1 && t1 !== "0") s += t1;
  const t2 = texTerm(b, "y", s === "");
  if (t2 && t2 !== "0") s += s ? ` ${t2}` : t2;
  const t3 = texTerm(c, "z", s === "");
  if (t3 && t3 !== "0") s += s ? ` ${t3}` : t3;
  if (!s) s = "0";
  return `${normalizeSigns(s)} = ${d}`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_plane_normal_basic",
      title,
      difficulty: 1,
      tags: ["vector", "plane", "ct"],
    },
    generate() {
      const a = 2;
      const b = -1;
      const c = 3;
      const plane = texPlane(a, b, c, 5);
      const statement = `壁面 ${plane} の法線ベクトルの $z$ 成分を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as NormalParams).c);
    },
    explain() {
      return `
### この問題の解説
平面の法線ベクトルは係数 $(a,b,c)$ なので $z$ 成分は 3 です。
答えは **3** です。
`;
    },
  };
}

const extraVectorPlaneNormalTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_plane_normal_basic_${i + 21}`, `法線ベクトル 追加${i + 1}`)
);

export const vectorPlaneNormalTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) =>
    buildTemplate(`vector_plane_normal_basic_${i + 1}`, `法線ベクトル ${i + 1}`)
  ),
  ...extraVectorPlaneNormalTemplates,
];
