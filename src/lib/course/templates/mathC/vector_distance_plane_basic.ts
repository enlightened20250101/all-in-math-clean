// src/lib/course/templates/mathC/vector_distance_plane_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { normalizeSigns, texTerm } from "@/lib/format/tex";

const CASES = [
  { a: 1, b: 0, c: 0, d: 2, x0: 5, y0: 0, z0: 0, dist: 3 },
  { a: 0, b: 1, c: 0, d: -1, x0: 0, y0: 4, z0: 0, dist: 5 },
  { a: 0, b: 0, c: 1, d: 3, x0: 0, y0: 0, z0: 8, dist: 5 },
];

type PlaneParams = {
  a: number;
  b: number;
  c: number;
  d: number;
  x0: number;
  y0: number;
  z0: number;
  dist: number;
};

function buildParams(): PlaneParams {
  return pick(CASES);
}

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
      topicId: "vector_distance_plane_basic",
      title,
      difficulty: 1,
      tags: ["vector", "plane", "ct"],
    },
    generate() {
      const params = buildParams();
      const plane = texPlane(params.a, params.b, params.c, params.d);
      const statement = `ベクトルで扱う空間内で、平面 ${plane} と点 $P(${params.x0},${params.y0},${params.z0})$ の距離を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as PlaneParams).dist);
    },
    explain(params) {
      const p = params as PlaneParams;
      return `
### この問題の解説
軸に平行な平面なので距離は ${p.dist} です。
答えは **${p.dist}** です。
`;
    },
  };
}

const extraVectorDistancePlaneTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_distance_plane_basic_${i + 21}`, `平面との距離 追加${i + 1}`)
);

export const vectorDistancePlaneTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) =>
    buildTemplate(`vector_distance_plane_basic_${i + 1}`, `平面との距離 ${i + 1}`)
  ),
  ...extraVectorDistancePlaneTemplates,
];
