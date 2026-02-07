// src/lib/course/templates/mathA/geo_ratio_theorems.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texSegment, texSegmentLen, texTriangle } from "@/lib/format/tex";

type BisectorCase = { id: string; title: string; ab: number; ac: number; bd: number; ask: "DC" };
type MenelausCase = { id: string; title: string; af: number; fb: number; bd: number; dc: number; ae: number; ask: "CE" };
type CevaCase = { id: string; title: string; af: number; fb: number; bd: number; dc: number; ae: number; ask: "CE" };
type MidpointCase = { id: string; title: string; bc: number; ask: "MN" };
type AreaCase = { id: string; title: string; bd: number; dc: number; area: number; ask: "ABD" };

function buildBisector(c: BisectorCase): QuestionTemplate {
  const tri = texTriangle("A", "B", "C");
  const dc = (c.bd * c.ac) / c.ab;
  return {
    meta: {
      id: c.id,
      topicId: "geo_ratio_theorems",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_RATIO_THEOREM"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `三角形 $${tri}$ で、$${texSegmentLen("A", "B", c.ab)}$、` +
          `$${texSegmentLen("A", "C", c.ac)}$。点Dは $\\angle A$ の二等分線と $${texSegment("B", "C")}$ の交点とする。` +
          `$${texSegmentLen("B", "D", c.bd)}$ のとき、$${texSegment("D", "C")}$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, dc);
    },
    explain() {
      return `
### この問題の解説
角の二等分線の定理より $\\dfrac{BD}{DC} = \\dfrac{AB}{AC}$。
よって $DC = ${c.bd} \\times \\dfrac{${c.ac}}{${c.ab}} = ${dc}$。
`;
    },
  };
}

function buildMenelaus(c: MenelausCase): QuestionTemplate {
  const tri = texTriangle("A", "B", "C");
  const ratio = (c.fb * c.dc) / (c.af * c.bd);
  const ce = c.ae * ratio;
  return {
    meta: {
      id: c.id,
      topicId: "geo_ratio_theorems",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_RATIO_THEOREM"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `三角形 $${tri}$ で、点Dは辺BC上、点Eは辺CA上、点Fは辺AB上にあり、` +
          `D,E,Fは一直線上にあるとする。` +
          `$${texSegmentLen("A", "F", c.af)}$、$${texSegmentLen("F", "B", c.fb)}$、` +
          `$${texSegmentLen("B", "D", c.bd)}$、$${texSegmentLen("D", "C", c.dc)}$、` +
          `$${texSegmentLen("A", "E", c.ae)}$ のとき、$${texSegment("C", "E")}$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, ce);
    },
    explain() {
      return `
### この問題の解説
メネラウスの定理より
$$
\\frac{AF}{FB} \\cdot \\frac{BD}{DC} \\cdot \\frac{CE}{EA} = 1
$$
よって $\\dfrac{CE}{EA} = \\dfrac{${c.fb} \\times ${c.dc}}{${c.af} \\times ${c.bd}} = ${ratio}$。
したがって $CE = ${c.ae} \\times ${ratio} = ${ce}$。
`;
    },
  };
}

function buildCeva(c: CevaCase): QuestionTemplate {
  const tri = texTriangle("A", "B", "C");
  const ratio = (c.fb * c.dc) / (c.af * c.bd);
  const ce = c.ae * ratio;
  return {
    meta: {
      id: c.id,
      topicId: "geo_ratio_theorems",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_RATIO_THEOREM"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `三角形 $${tri}$ で、点Dは辺BC上、点Eは辺CA上、点Fは辺AB上にあり、` +
          `線分AD,BE,CFは一点で交わるとする。` +
          `$${texSegmentLen("A", "F", c.af)}$、$${texSegmentLen("F", "B", c.fb)}$、` +
          `$${texSegmentLen("B", "D", c.bd)}$、$${texSegmentLen("D", "C", c.dc)}$、` +
          `$${texSegmentLen("A", "E", c.ae)}$ のとき、$${texSegment("C", "E")}$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, ce);
    },
    explain() {
      return `
### この問題の解説
チェバの定理より
$$
\\frac{AF}{FB} \\cdot \\frac{BD}{DC} \\cdot \\frac{CE}{EA} = 1
$$
したがって $\\dfrac{CE}{EA} = \\dfrac{${c.fb} \\times ${c.dc}}{${c.af} \\times ${c.bd}} = ${ratio}$。
よって $CE = ${c.ae} \\times ${ratio} = ${ce}$。
`;
    },
  };
}

function buildMidpoint(c: MidpointCase): QuestionTemplate {
  const tri = texTriangle("A", "B", "C");
  const mn = c.bc / 2;
  return {
    meta: {
      id: c.id,
      topicId: "geo_ratio_theorems",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_RATIO_THEOREM"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `三角形 $${tri}$ で、点M,Nはそれぞれ辺AB,ACの中点とする。` +
          `$${texSegmentLen("B", "C", c.bc)}$ のとき、$${texSegment("M", "N")}$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, mn);
    },
    explain() {
      return `
### この問題の解説
中点連結定理より $${texSegment("M", "N")} = \\dfrac{1}{2}${texSegment("B", "C")}$。
よって $MN = ${c.bc} \\times \\dfrac{1}{2} = ${mn}$。
`;
    },
  };
}

function buildAreaRatio(c: AreaCase): QuestionTemplate {
  const tri = texTriangle("A", "B", "C");
  const total = c.bd + c.dc;
  const abd = (c.area * c.bd) / total;
  return {
    meta: {
      id: c.id,
      topicId: "geo_ratio_theorems",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_RATIO_THEOREM"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `三角形 $${tri}$ で、点Dは辺BC上にあり $${texSegmentLen("B", "D", c.bd)}$、` +
          `$${texSegmentLen("D", "C", c.dc)}$ とする。` +
          `三角形 $${tri}$ の面積が ${c.area} のとき、三角形ABDの面積を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, abd);
    },
    explain() {
      return `
### この問題の解説
同じ高さをもつ三角形の面積比は底辺の比に等しいので
$$
\\frac{S_{ABD}}{S_{ABC}} = \\frac{BD}{BC} = \\frac{${c.bd}}{${total}}
$$
よって $S_{ABD} = ${c.area} \\times \\dfrac{${c.bd}}{${total}} = ${abd}$。
`;
    },
  };
}

const BISECTOR_CASES: BisectorCase[] = [
  { id: "geo_ratio_bis_1", title: "二等分線 1", ab: 4, ac: 6, bd: 2, ask: "DC" },
  { id: "geo_ratio_bis_2", title: "二等分線 2", ab: 6, ac: 9, bd: 4, ask: "DC" },
  { id: "geo_ratio_bis_3", title: "二等分線 3", ab: 5, ac: 10, bd: 3, ask: "DC" },
  { id: "geo_ratio_bis_4", title: "二等分線 4", ab: 3, ac: 6, bd: 2, ask: "DC" },
  { id: "geo_ratio_bis_5", title: "二等分線 5", ab: 7, ac: 14, bd: 3, ask: "DC" },
  { id: "geo_ratio_bis_6", title: "二等分線 6", ab: 8, ac: 12, bd: 4, ask: "DC" },
  { id: "geo_ratio_bis_7", title: "二等分線 7", ab: 6, ac: 12, bd: 3, ask: "DC" },
  { id: "geo_ratio_bis_8", title: "二等分線 8", ab: 9, ac: 12, bd: 6, ask: "DC" },
  { id: "geo_ratio_bis_9", title: "二等分線 9", ab: 10, ac: 15, bd: 4, ask: "DC" },
  { id: "geo_ratio_bis_10", title: "二等分線 10", ab: 12, ac: 18, bd: 5, ask: "DC" },
];

const MENELAUS_CASES: MenelausCase[] = [
  { id: "geo_ratio_men_1", title: "メネラウス 1", af: 2, fb: 4, bd: 3, dc: 6, ae: 2, ask: "CE" },
  { id: "geo_ratio_men_2", title: "メネラウス 2", af: 3, fb: 6, bd: 2, dc: 4, ae: 3, ask: "CE" },
  { id: "geo_ratio_men_3", title: "メネラウス 3", af: 4, fb: 8, bd: 3, dc: 6, ae: 2, ask: "CE" },
  { id: "geo_ratio_men_4", title: "メネラウス 4", af: 5, fb: 10, bd: 2, dc: 5, ae: 2, ask: "CE" },
  { id: "geo_ratio_men_5", title: "メネラウス 5", af: 6, fb: 12, bd: 3, dc: 9, ae: 1, ask: "CE" },
  { id: "geo_ratio_men_6", title: "メネラウス 6", af: 3, fb: 9, bd: 2, dc: 8, ae: 1, ask: "CE" },
  { id: "geo_ratio_men_7", title: "メネラウス 7", af: 2, fb: 6, bd: 3, dc: 9, ae: 1, ask: "CE" },
  { id: "geo_ratio_men_8", title: "メネラウス 8", af: 3, fb: 6, bd: 2, dc: 8, ae: 1, ask: "CE" },
  { id: "geo_ratio_men_9", title: "メネラウス 9", af: 4, fb: 8, bd: 2, dc: 6, ae: 1, ask: "CE" },
  { id: "geo_ratio_men_10", title: "メネラウス 10", af: 5, fb: 10, bd: 2, dc: 8, ae: 1, ask: "CE" },
];

const CEVA_CASES: CevaCase[] = [
  { id: "geo_ratio_cev_1", title: "チェバ 1", af: 2, fb: 4, bd: 3, dc: 6, ae: 2, ask: "CE" },
  { id: "geo_ratio_cev_2", title: "チェバ 2", af: 3, fb: 6, bd: 2, dc: 4, ae: 3, ask: "CE" },
  { id: "geo_ratio_cev_3", title: "チェバ 3", af: 4, fb: 8, bd: 3, dc: 6, ae: 2, ask: "CE" },
  { id: "geo_ratio_cev_4", title: "チェバ 4", af: 5, fb: 10, bd: 2, dc: 5, ae: 2, ask: "CE" },
  { id: "geo_ratio_cev_5", title: "チェバ 5", af: 6, fb: 12, bd: 3, dc: 9, ae: 1, ask: "CE" },
  { id: "geo_ratio_cev_6", title: "チェバ 6", af: 4, fb: 8, bd: 2, dc: 6, ae: 2, ask: "CE" },
  { id: "geo_ratio_cev_7", title: "チェバ 7", af: 2, fb: 6, bd: 3, dc: 9, ae: 1, ask: "CE" },
  { id: "geo_ratio_cev_8", title: "チェバ 8", af: 3, fb: 6, bd: 2, dc: 8, ae: 1, ask: "CE" },
  { id: "geo_ratio_cev_9", title: "チェバ 9", af: 4, fb: 8, bd: 2, dc: 6, ae: 1, ask: "CE" },
  { id: "geo_ratio_cev_10", title: "チェバ 10", af: 5, fb: 10, bd: 2, dc: 8, ae: 1, ask: "CE" },
];

const MIDPOINT_CASES: MidpointCase[] = [
  { id: "geo_ratio_mid_1", title: "中点連結 1", bc: 10, ask: "MN" },
  { id: "geo_ratio_mid_2", title: "中点連結 2", bc: 12, ask: "MN" },
  { id: "geo_ratio_mid_3", title: "中点連結 3", bc: 14, ask: "MN" },
  { id: "geo_ratio_mid_4", title: "中点連結 4", bc: 16, ask: "MN" },
  { id: "geo_ratio_mid_5", title: "中点連結 5", bc: 18, ask: "MN" },
  { id: "geo_ratio_mid_6", title: "中点連結 6", bc: 20, ask: "MN" },
  { id: "geo_ratio_mid_7", title: "中点連結 7", bc: 22, ask: "MN" },
  { id: "geo_ratio_mid_8", title: "中点連結 8", bc: 24, ask: "MN" },
  { id: "geo_ratio_mid_9", title: "中点連結 9", bc: 26, ask: "MN" },
  { id: "geo_ratio_mid_10", title: "中点連結 10", bc: 28, ask: "MN" },
];

const AREA_CASES: AreaCase[] = [
  { id: "geo_ratio_area_1", title: "面積比 1", bd: 2, dc: 3, area: 50, ask: "ABD" },
  { id: "geo_ratio_area_2", title: "面積比 2", bd: 3, dc: 2, area: 45, ask: "ABD" },
  { id: "geo_ratio_area_3", title: "面積比 3", bd: 1, dc: 4, area: 25, ask: "ABD" },
  { id: "geo_ratio_area_4", title: "面積比 4", bd: 4, dc: 1, area: 35, ask: "ABD" },
  { id: "geo_ratio_area_5", title: "面積比 5", bd: 3, dc: 5, area: 64, ask: "ABD" },
  { id: "geo_ratio_area_6", title: "面積比 6", bd: 5, dc: 2, area: 70, ask: "ABD" },
  { id: "geo_ratio_area_7", title: "面積比 7", bd: 4, dc: 6, area: 80, ask: "ABD" },
  { id: "geo_ratio_area_8", title: "面積比 8", bd: 6, dc: 4, area: 90, ask: "ABD" },
  { id: "geo_ratio_area_9", title: "面積比 9", bd: 2, dc: 6, area: 64, ask: "ABD" },
  { id: "geo_ratio_area_10", title: "面積比 10", bd: 6, dc: 2, area: 72, ask: "ABD" },
];

export const geoRatioTheoremTemplates: QuestionTemplate[] = [
  ...BISECTOR_CASES.map(buildBisector),
  ...MENELAUS_CASES.map(buildMenelaus),
  ...CEVA_CASES.map(buildCeva),
  ...MIDPOINT_CASES.map(buildMidpoint),
  ...AREA_CASES.map(buildAreaRatio),
];
