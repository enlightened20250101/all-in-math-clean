// src/lib/course/templates/mathA/geo_circle_geometry.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texJoin, texSegment, texSegmentLen } from "@/lib/format/tex";

type OppCase = { id: string; title: string; angle: number };
type CondCase = { id: string; title: string; correct: string; choices: string[] };
type AngleCase = { id: string; title: string; a: number; b: number };
type TangentChordCase = { id: string; title: string; angle: number };
type ChordCase = { id: string; title: string; ap: number; pb: number; cp: number };
type SecantTangentCase = { id: string; title: string; ext: number; whole: number };
type SecantSecantCase = { id: string; title: string; ext1: number; whole1: number; ext2: number };

function buildOpposite(c: OppCase): QuestionTemplate {
  const angleABC = texJoin("\\angle", "ABC");
  const angleADC = texJoin("\\angle", "ADC");
  const ans = 180 - c.angle;
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_geometry",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_CIRCLE_GEOMETRY"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `四角形ABCDが円に内接し、$${angleABC}=${c.angle}^\\circ$ のとき、$${angleADC}$ を求めよ。`,
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
内接四角形の向かい合う角の和は $180^\\circ$ なので、
$${angleADC} = 180^\\circ - ${c.angle}^\\circ = ${ans}^\\circ$。
`;
    },
  };
}

function buildCondition(c: CondCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_geometry",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_CIRCLE_GEOMETRY"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: "四角形が円に内接する条件として正しいものを選べ。",
        answerKind: "choice",
        choices: c.choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `
### この問題の解説
正しい条件は「${c.correct}」です。
`;
    },
  };
}

function buildAngleCase(c: AngleCase): QuestionTemplate {
  const angleABC = texJoin("\\angle", "ABC");
  const angleBCD = texJoin("\\angle", "BCD");
  const angleBAD = texJoin("\\angle", "BAD");
  const ans = 180 - c.a - c.b;
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_geometry",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_CIRCLE_GEOMETRY"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `四角形ABCDが円に内接し、$${angleABC}=${c.a}^\\circ$、` +
          `$${angleBCD}=${c.b}^\\circ$ のとき、$${angleBAD}$ を求めよ。`,
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
内接四角形の対角の和が $180^\\circ$ なので、
$${angleBAD} = 180^\\circ - ${c.a}^\\circ - ${c.b}^\\circ = ${ans}^\\circ$。
`;
    },
  };
}

function buildTangentChord(c: TangentChordCase): QuestionTemplate {
  const angleACB = texJoin("\\angle", "ACB");
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_geometry",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_CIRCLE_GEOMETRY"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `点Aにおける接線と弦ABのなす角が $${c.angle}^\\circ$ のとき、` +
          `同じ弧ABに対する円周角 $${angleACB}$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.angle);
    },
    explain() {
      return `
### この問題の解説
接線と弦のなす角は、同じ弧に対する円周角に等しいので答えは ${c.angle}^\\circ。
`;
    },
  };
}

function buildChord(c: ChordCase): QuestionTemplate {
  const pd = (c.ap * c.pb) / c.cp;
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_geometry",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_CIRCLE_GEOMETRY"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `円の内部で2つの弦が交わり、` +
          `$${texSegmentLen("A", "P", c.ap)}$、$${texSegmentLen("P", "B", c.pb)}$、` +
          `$${texSegmentLen("C", "P", c.cp)}$ のとき、$${texSegment("P", "D")}$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, pd);
    },
    explain() {
      return `
### この問題の解説
交わる弦の定理より $AP\\cdot PB = CP\\cdot PD$。
よって $PD = \\dfrac{${c.ap}\\cdot ${c.pb}}{${c.cp}} = ${pd}$。
`;
    },
  };
}

function buildSecantTangent(c: SecantTangentCase): QuestionTemplate {
  const t = Math.sqrt(c.ext * c.whole);
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_geometry",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_CIRCLE_GEOMETRY"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `点Pから円に引いた接線の長さを $x$ とする。割線で外部部分が ${c.ext}、` +
          `円との交点までの全長が ${c.whole} のとき、$x$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, t);
    },
    explain() {
      return `
### この問題の解説
接線と割線の定理より $x^2 = ${c.ext}\\times ${c.whole}$。
よって $x = ${t}$。
`;
    },
  };
}

function buildSecantSecant(c: SecantSecantCase): QuestionTemplate {
  const whole2 = (c.ext1 * c.whole1) / c.ext2;
  return {
    meta: {
      id: c.id,
      topicId: "geo_circle_geometry",
      title: c.title,
      difficulty: 1,
      tags: ["HS_A_CIRCLE_GEOMETRY"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `点Pから2本の割線を引き、外部部分と全長がそれぞれ ${c.ext1}, ${c.whole1} のとき、` +
          `もう一方の割線の外部部分が ${c.ext2} なら全長を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, whole2);
    },
    explain() {
      return `
### この問題の解説
割線と割線の定理より
${c.ext1}\\times ${c.whole1} = ${c.ext2}\\times (\\text{全長})。
よって全長 $= ${whole2}$。
`;
    },
  };
}

const OPP_CASES: OppCase[] = [
  { id: "geo_circle_opp_1", title: "内接四角形 1", angle: 70 },
  { id: "geo_circle_opp_2", title: "内接四角形 2", angle: 80 },
  { id: "geo_circle_opp_3", title: "内接四角形 3", angle: 95 },
  { id: "geo_circle_opp_4", title: "内接四角形 4", angle: 110 },
  { id: "geo_circle_opp_5", title: "内接四角形 5", angle: 65 },
  { id: "geo_circle_opp_6", title: "内接四角形 6", angle: 85 },
  { id: "geo_circle_opp_7", title: "内接四角形 7", angle: 75 },
  { id: "geo_circle_opp_8", title: "内接四角形 8", angle: 100 },
  { id: "geo_circle_opp_9", title: "内接四角形 9", angle: 120 },
  { id: "geo_circle_opp_10", title: "内接四角形 10", angle: 55 },
];

const COND_CASES: CondCase[] = [
  {
    id: "geo_circle_cond_1",
    title: "内接条件 1",
    correct: "向かい合う角の和が180°である",
    choices: [
      "向かい合う角の和が180°である",
      "隣り合う角の和が180°である",
      "対辺が等しい",
    ],
  },
  {
    id: "geo_circle_cond_2",
    title: "内接条件 2",
    correct: "一方の角と外角が等しい",
    choices: [
      "一方の角と外角が等しい",
      "対辺が平行である",
      "対角が等しい",
    ],
  },
  {
    id: "geo_circle_cond_3",
    title: "内接条件 3",
    correct: "向かい合う角の和が180°である",
    choices: [
      "向かい合う角の和が180°である",
      "対角の和が90°である",
      "隣り合う角が等しい",
    ],
  },
  {
    id: "geo_circle_cond_4",
    title: "内接条件 4",
    correct: "一方の角と外角が等しい",
    choices: [
      "一方の角と外角が等しい",
      "対辺が等しい",
      "対角の和が90°である",
    ],
  },
  {
    id: "geo_circle_cond_5",
    title: "内接条件 5",
    correct: "向かい合う角の和が180°である",
    choices: [
      "向かい合う角の和が180°である",
      "対角が等しい",
      "隣り合う角が等しい",
    ],
  },
];

const ANGLE_CASES: AngleCase[] = [
  { id: "geo_circle_ang_1", title: "角度 1", a: 60, b: 50 },
  { id: "geo_circle_ang_2", title: "角度 2", a: 70, b: 40 },
  { id: "geo_circle_ang_3", title: "角度 3", a: 80, b: 30 },
  { id: "geo_circle_ang_4", title: "角度 4", a: 65, b: 55 },
  { id: "geo_circle_ang_5", title: "角度 5", a: 75, b: 35 },
  { id: "geo_circle_ang_6", title: "角度 6", a: 55, b: 65 },
  { id: "geo_circle_ang_7", title: "角度 7", a: 50, b: 70 },
  { id: "geo_circle_ang_8", title: "角度 8", a: 85, b: 25 },
];

const TANGENT_CHORD_CASES: TangentChordCase[] = [
  { id: "geo_circle_tan_1", title: "接弦定理 1", angle: 30 },
  { id: "geo_circle_tan_2", title: "接弦定理 2", angle: 40 },
  { id: "geo_circle_tan_3", title: "接弦定理 3", angle: 50 },
  { id: "geo_circle_tan_4", title: "接弦定理 4", angle: 60 },
  { id: "geo_circle_tan_5", title: "接弦定理 5", angle: 70 },
  { id: "geo_circle_tan_6", title: "接弦定理 6", angle: 80 },
  { id: "geo_circle_tan_7", title: "接弦定理 7", angle: 20 },
  { id: "geo_circle_tan_8", title: "接弦定理 8", angle: 75 },
];

const CHORD_CASES: ChordCase[] = [
  { id: "geo_circle_pow_1", title: "交わる弦 1", ap: 3, pb: 12, cp: 6 },
  { id: "geo_circle_pow_2", title: "交わる弦 2", ap: 4, pb: 9, cp: 6 },
  { id: "geo_circle_pow_3", title: "交わる弦 3", ap: 5, pb: 8, cp: 4 },
  { id: "geo_circle_pow_4", title: "交わる弦 4", ap: 6, pb: 10, cp: 5 },
  { id: "geo_circle_pow_5", title: "交わる弦 5", ap: 4, pb: 9, cp: 3 },
  { id: "geo_circle_pow_6", title: "交わる弦 6", ap: 2, pb: 14, cp: 4 },
  { id: "geo_circle_pow_7", title: "交わる弦 7", ap: 3, pb: 15, cp: 5 },
];

const SECANT_TANGENT_CASES: SecantTangentCase[] = [
  { id: "geo_circle_sec_1", title: "接線・割線 1", ext: 4, whole: 9 },
  { id: "geo_circle_sec_2", title: "接線・割線 2", ext: 5, whole: 20 },
  { id: "geo_circle_sec_3", title: "接線・割線 3", ext: 6, whole: 24 },
  { id: "geo_circle_sec_4", title: "接線・割線 4", ext: 7, whole: 28 },
  { id: "geo_circle_sec_5", title: "接線・割線 5", ext: 8, whole: 18 },
  { id: "geo_circle_sec_6", title: "接線・割線 6", ext: 9, whole: 16 },
  { id: "geo_circle_sec_7", title: "接線・割線 7", ext: 10, whole: 25 },
];

const SECANT_SECANT_CASES: SecantSecantCase[] = [
  { id: "geo_circle_secsec_1", title: "割線と割線 1", ext1: 3, whole1: 12, ext2: 4 },
  { id: "geo_circle_secsec_2", title: "割線と割線 2", ext1: 5, whole1: 20, ext2: 4 },
  { id: "geo_circle_secsec_3", title: "割線と割線 3", ext1: 2, whole1: 18, ext2: 3 },
  { id: "geo_circle_secsec_4", title: "割線と割線 4", ext1: 6, whole1: 24, ext2: 3 },
  { id: "geo_circle_secsec_5", title: "割線と割線 5", ext1: 4, whole1: 20, ext2: 5 },
];

export const geoCircleGeometryTemplates: QuestionTemplate[] = [
  ...OPP_CASES.map(buildOpposite),
  ...COND_CASES.map(buildCondition),
  ...ANGLE_CASES.map(buildAngleCase),
  ...TANGENT_CHORD_CASES.map(buildTangentChord),
  ...CHORD_CASES.map(buildChord),
  ...SECANT_TANGENT_CASES.map(buildSecantTangent),
  ...SECANT_SECANT_CASES.map(buildSecantSecant),
];
