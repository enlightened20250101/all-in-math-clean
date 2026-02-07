// src/lib/course/templates/mathA/geo_triangle_centers.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texSegment, texSegmentLen, texTriangle } from "@/lib/format/tex";

type CentroidCase =
  | { id: string; title: string; am: number; ask: "AG" | "GM" }
  | { id: string; title: string; ag: number; ask: "GM" | "AM" }
  | { id: string; title: string; gm: number; ask: "AG" | "AM" };

type IncenterCase = { id: string; title: string; r: number; ask: "distance" };
type CircumcenterCase = { id: string; title: string; radius: number; ask: "distance" };

function buildCentroid(c: CentroidCase): QuestionTemplate {
  const tri = texTriangle("A", "B", "C");
  let ans = 0;
  let statement = "";
  if ("am" in c) {
    const ag = (2 * c.am) / 3;
    const gm = c.am / 3;
    ans = c.ask === "AG" ? ag : gm;
    statement =
      `三角形 $${tri}$ で、点Mは辺BCの中点、点Gは重心とする。` +
      `$${texSegmentLen("A", "M", c.am)}$ のとき、$${texSegment(c.ask === "AG" ? "A" : "G", c.ask === "AG" ? "G" : "M")}$ を求めよ。`;
  } else if ("ag" in c) {
    const gm = c.ag / 2;
    const am = (3 * c.ag) / 2;
    ans = c.ask === "GM" ? gm : am;
    statement =
      `三角形 $${tri}$ で、点Mは辺BCの中点、点Gは重心とする。` +
      `$${texSegmentLen("A", "G", c.ag)}$ のとき、$${texSegment(c.ask === "GM" ? "G" : "A", "M")}$ を求めよ。`;
  } else {
    const ag = 2 * c.gm;
    const am = 3 * c.gm;
    ans = c.ask === "AG" ? ag : am;
    statement =
      `三角形 $${tri}$ で、点Mは辺BCの中点、点Gは重心とする。` +
      `$${texSegmentLen("G", "M", c.gm)}$ のとき、$${texSegment("A", c.ask === "AG" ? "G" : "M")}$ を求めよ。`;
  }
  return {
    meta: {
      id: c.id,
      topicId: "geo_triangle_centers",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_TRIANGLE_CENTER"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, ans);
    },
    explain() {
      return `
### この問題の解説
重心は中線を $2:1$ に内分するので、$AG:GM=2:1$。
よって答えは ${ans}。
`;
    },
  };
}

function buildIncenter(c: IncenterCase): QuestionTemplate {
  const tri = texTriangle("A", "B", "C");
  return {
    meta: {
      id: c.id,
      topicId: "geo_triangle_centers",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_TRIANGLE_CENTER"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `三角形 $${tri}$ の内心をIとする。Iから辺ABへの距離が ${c.r} のとき、` +
          `Iから辺BCへの距離を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.r);
    },
    explain() {
      return `
### この問題の解説
内心から各辺への距離は等しいので、答えは ${c.r}。
`;
    },
  };
}

function buildCircumcenter(c: CircumcenterCase): QuestionTemplate {
  const tri = texTriangle("A", "B", "C");
  return {
    meta: {
      id: c.id,
      topicId: "geo_triangle_centers",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_TRIANGLE_CENTER"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `三角形 $${tri}$ の外心をOとする。$${texSegmentLen("O", "A", c.radius)}$ のとき、$${texSegment("O", "C")}$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.radius);
    },
    explain() {
      return `
### この問題の解説
外心は3頂点から等距離なので、$OA=OB=OC$。
したがって $OC=${c.radius}$。
`;
    },
  };
}

const CENTROID_CASES: CentroidCase[] = [
  { id: "geo_center_centroid_1", title: "重心 1", am: 12, ask: "AG" },
  { id: "geo_center_centroid_2", title: "重心 2", am: 15, ask: "GM" },
  { id: "geo_center_centroid_3", title: "重心 3", ag: 8, ask: "GM" },
  { id: "geo_center_centroid_4", title: "重心 4", ag: 12, ask: "AM" },
  { id: "geo_center_centroid_5", title: "重心 5", gm: 5, ask: "AG" },
  { id: "geo_center_centroid_6", title: "重心 6", gm: 6, ask: "AM" },
  { id: "geo_center_centroid_7", title: "重心 7", am: 18, ask: "AG" },
  { id: "geo_center_centroid_8", title: "重心 8", ag: 10, ask: "GM" },
];

const INCENTER_CASES: IncenterCase[] = [
  { id: "geo_center_in_1", title: "内心 1", r: 3, ask: "distance" },
  { id: "geo_center_in_2", title: "内心 2", r: 4, ask: "distance" },
  { id: "geo_center_in_3", title: "内心 3", r: 5, ask: "distance" },
  { id: "geo_center_in_4", title: "内心 4", r: 6, ask: "distance" },
  { id: "geo_center_in_5", title: "内心 5", r: 7, ask: "distance" },
  { id: "geo_center_in_6", title: "内心 6", r: 8, ask: "distance" },
];

const CIRCUMCENTER_CASES: CircumcenterCase[] = [
  { id: "geo_center_out_1", title: "外心 1", radius: 5, ask: "distance" },
  { id: "geo_center_out_2", title: "外心 2", radius: 6, ask: "distance" },
  { id: "geo_center_out_3", title: "外心 3", radius: 7, ask: "distance" },
  { id: "geo_center_out_4", title: "外心 4", radius: 8, ask: "distance" },
  { id: "geo_center_out_5", title: "外心 5", radius: 9, ask: "distance" },
  { id: "geo_center_out_6", title: "外心 6", radius: 10, ask: "distance" },
];

export const geoTriangleCentersTemplates: QuestionTemplate[] = [
  ...CENTROID_CASES.map(buildCentroid),
  ...INCENTER_CASES.map(buildIncenter),
  ...CIRCUMCENTER_CASES.map(buildCircumcenter),
];

const extraCentroidCases: CentroidCase[] = [
  { id: "geo_center_centroid_extra_1", title: "重心 追加1", am: 21, ask: "AG" },
  { id: "geo_center_centroid_extra_2", title: "重心 追加2", am: 24, ask: "GM" },
  { id: "geo_center_centroid_extra_3", title: "重心 追加3", ag: 14, ask: "GM" },
  { id: "geo_center_centroid_extra_4", title: "重心 追加4", ag: 18, ask: "AM" },
  { id: "geo_center_centroid_extra_5", title: "重心 追加5", gm: 7, ask: "AG" },
  { id: "geo_center_centroid_extra_6", title: "重心 追加6", gm: 9, ask: "AM" },
  { id: "geo_center_centroid_extra_7", title: "重心 追加7", am: 27, ask: "AG" },
  { id: "geo_center_centroid_extra_8", title: "重心 追加8", ag: 16, ask: "GM" },
  { id: "geo_center_centroid_extra_9", title: "重心 追加9", am: 30, ask: "AG" },
  { id: "geo_center_centroid_extra_10", title: "重心 追加10", ag: 20, ask: "GM" },
  { id: "geo_center_centroid_extra_11", title: "重心 追加11", gm: 8, ask: "AM" },
];

const extraIncenterCases: IncenterCase[] = [
  { id: "geo_center_in_extra_1", title: "内心 追加1", r: 9, ask: "distance" },
  { id: "geo_center_in_extra_2", title: "内心 追加2", r: 10, ask: "distance" },
  { id: "geo_center_in_extra_3", title: "内心 追加3", r: 11, ask: "distance" },
  { id: "geo_center_in_extra_4", title: "内心 追加4", r: 12, ask: "distance" },
  { id: "geo_center_in_extra_5", title: "内心 追加5", r: 13, ask: "distance" },
  { id: "geo_center_in_extra_6", title: "内心 追加6", r: 14, ask: "distance" },
  { id: "geo_center_in_extra_7", title: "内心 追加7", r: 15, ask: "distance" },
  { id: "geo_center_in_extra_8", title: "内心 追加8", r: 16, ask: "distance" },
  { id: "geo_center_in_extra_9", title: "内心 追加9", r: 18, ask: "distance" },
];

const extraCircumcenterCases: CircumcenterCase[] = [
  { id: "geo_center_out_extra_1", title: "外心 追加1", radius: 11, ask: "distance" },
  { id: "geo_center_out_extra_2", title: "外心 追加2", radius: 12, ask: "distance" },
  { id: "geo_center_out_extra_3", title: "外心 追加3", radius: 13, ask: "distance" },
  { id: "geo_center_out_extra_4", title: "外心 追加4", radius: 14, ask: "distance" },
  { id: "geo_center_out_extra_5", title: "外心 追加5", radius: 15, ask: "distance" },
  { id: "geo_center_out_extra_6", title: "外心 追加6", radius: 16, ask: "distance" },
  { id: "geo_center_out_extra_7", title: "外心 追加7", radius: 18, ask: "distance" },
  { id: "geo_center_out_extra_8", title: "外心 追加8", radius: 20, ask: "distance" },
  { id: "geo_center_out_extra_9", title: "外心 追加9", radius: 22, ask: "distance" },
  { id: "geo_center_out_extra_10", title: "外心 追加10", radius: 24, ask: "distance" },
];

geoTriangleCentersTemplates.push(
  ...extraCentroidCases.map(buildCentroid),
  ...extraIncenterCases.map(buildIncenter),
  ...extraCircumcenterCases.map(buildCircumcenter)
);
