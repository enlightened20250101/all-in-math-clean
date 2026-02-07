// src/lib/course/templates/math1/trig_ratio_word_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texFrac } from "@/lib/format/tex";

type WordCase = {
  id: string;
  title: string;
  statement: string;
  answer: number;
  explain: string;
};

function buildTemplate(c: WordCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "trig_ratio_basic",
      title: c.title,
      difficulty: 1,
      tags: ["trig", "word"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.answer);
    },
    explain() {
      return c.explain;
    },
  };
}

const CASES: WordCase[] = [
  {
    id: "trig_word_1",
    title: "はしごの高さ",
    statement: `長さ10のはしごを地面に立てかけ、地面となす角が $30^\\circ$ である。壁に当たる高さを求めよ。`,
    answer: 5,
    explain: `
### この問題の解説
高さは $10\\sin 30^\\circ=10\\cdot${texFrac(1, 2)}=5$。
`,
  },
  {
    id: "trig_word_2",
    title: "はしごの高さ（45°）",
    statement: `壁から6だけ離してはしごを立て、地面となす角が $45^\\circ$ である。壁に当たる高さを求めよ。`,
    answer: 6,
    explain: `
### この問題の解説
\\tan 45^\\circ=\\frac{\\text{高さ}}{6}=1 なので、高さは 6。
`,
  },
  {
    id: "trig_word_3",
    title: "斜面の長さ",
    statement: `高さ6の斜面が地面となす角が $30^\\circ$ である。斜面の長さを求めよ。`,
    answer: 12,
    explain: `
### この問題の解説
斜面の長さを $L$ とすると $6=L\\sin 30^\\circ$。
$$
L=\\frac{6}{1/2}=12
$$
`,
  },
  {
    id: "trig_word_4",
    title: "水平距離",
    statement: `高さ5の塔の頂点から地面を見る俯角が $45^\\circ$ である。塔の足元から観測点までの水平距離を求めよ。`,
    answer: 5,
    explain: `
### この問題の解説
俯角と仰角は等しいので、$\\tan 45^\\circ=\\frac{5}{d}=1$。
よって $d=5$。
`,
  },
];

export const trigRatioWordVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
