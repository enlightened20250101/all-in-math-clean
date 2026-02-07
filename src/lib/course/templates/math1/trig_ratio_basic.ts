// src/lib/course/templates/math1/trig_ratio_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick } from "../_shared/utils";
import { texAngle, texFrac, texSegmentLen } from "@/lib/format/tex";

type Triple = { adj: number; opp: number; hyp: number };
type RatioType = "sin" | "cos" | "tan";

const TRIPLES: Triple[] = [
  { adj: 4, opp: 3, hyp: 5 },
  { adj: 12, opp: 5, hyp: 13 },
  { adj: 15, opp: 8, hyp: 17 },
  { adj: 24, opp: 7, hyp: 25 },
  { adj: 40, opp: 9, hyp: 41 },
  { adj: 35, opp: 12, hyp: 37 },
  { adj: 21, opp: 20, hyp: 29 },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function ratioValue(ratio: RatioType, t: Triple): string {
  if (ratio === "sin") return texFrac(t.opp, t.hyp);
  if (ratio === "cos") return texFrac(t.adj, t.hyp);
  return texFrac(t.opp, t.adj);
}

function ratioChoices(ratio: RatioType, t: Triple): string[] {
  const candidates =
    ratio === "tan"
      ? [
          texFrac(t.opp, t.adj),
          texFrac(t.adj, t.opp),
          texFrac(t.opp, t.hyp),
          texFrac(t.adj, t.hyp),
        ]
      : [
          texFrac(t.opp, t.hyp),
          texFrac(t.adj, t.hyp),
          texFrac(t.opp, t.adj),
          texFrac(t.adj, t.opp),
        ];
  const unique = Array.from(new Set(candidates));
  return shuffle(unique).slice(0, 4);
}

function buildTemplate(id: string, title: string, ratio: RatioType, triple: Triple): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_ratio_basic",
      title,
      difficulty: 1,
      tags: ["trig", ratio],
    },
    generate() {
      const t = pick([triple]);
      const value = ratioValue(ratio, t);
      const choices = ratioChoices(ratio, t);
      const angle = texAngle("C", 90);
      const ab = texSegmentLen("A", "B", t.hyp);
      const ac = texSegmentLen("A", "C", t.adj);
      const bc = texSegmentLen("B", "C", t.opp);
      return {
        templateId: id,
        statement: `直角三角形ABCで、次を満たす。\n\n$$\n${angle},\\, ${ab},\\, ${ac},\\, ${bc}\n$$\n\n$\\${ratio} A$ を求めよ。`,
        answerKind: "choice",
        choices,
        params: { adj: t.adj, opp: t.opp, hyp: t.hyp, ratioIndex: ["sin", "cos", "tan"].indexOf(ratio) },
      };
    },
    grade(_params, userAnswer) {
      const t = triple;
      const correct = ratioValue(ratio, t);
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain(_params) {
      const t = triple;
      const correct = ratioValue(ratio, t);
      const ab = texSegmentLen("A", "B", t.hyp);
      const ac = texSegmentLen("A", "C", t.adj);
      const bc = texSegmentLen("B", "C", t.opp);
      return `
### この問題の解説
直角三角形で、$\\sin A=\\dfrac{BC}{AB}$、$\\cos A=\\dfrac{AC}{AB}$、$\\tan A=\\dfrac{BC}{AC}$ です。

$$
${ab},\\, ${ac},\\, ${bc}
$$

したがって $\\${ratio} A=${correct}$ です。
`;
    },
  };
}

export const trigRatioTemplates: QuestionTemplate[] = [
  buildTemplate("trig_ratio_sin_1", "三角比（sin）1", "sin", TRIPLES[0]),
  buildTemplate("trig_ratio_sin_2", "三角比（sin）2", "sin", TRIPLES[1]),
  buildTemplate("trig_ratio_sin_3", "三角比（sin）3", "sin", TRIPLES[2]),
  buildTemplate("trig_ratio_sin_4", "三角比（sin）4", "sin", TRIPLES[3]),
  buildTemplate("trig_ratio_sin_5", "三角比（sin）5", "sin", TRIPLES[4]),
  buildTemplate("trig_ratio_sin_6", "三角比（sin）6", "sin", TRIPLES[5]),
  buildTemplate("trig_ratio_sin_7", "三角比（sin）7", "sin", TRIPLES[6]),

  buildTemplate("trig_ratio_cos_1", "三角比（cos）1", "cos", TRIPLES[0]),
  buildTemplate("trig_ratio_cos_2", "三角比（cos）2", "cos", TRIPLES[1]),
  buildTemplate("trig_ratio_cos_3", "三角比（cos）3", "cos", TRIPLES[2]),
  buildTemplate("trig_ratio_cos_4", "三角比（cos）4", "cos", TRIPLES[3]),
  buildTemplate("trig_ratio_cos_5", "三角比（cos）5", "cos", TRIPLES[4]),
  buildTemplate("trig_ratio_cos_6", "三角比（cos）6", "cos", TRIPLES[5]),

  buildTemplate("trig_ratio_tan_1", "三角比（tan）1", "tan", TRIPLES[0]),
  buildTemplate("trig_ratio_tan_2", "三角比（tan）2", "tan", TRIPLES[1]),
  buildTemplate("trig_ratio_tan_3", "三角比（tan）3", "tan", TRIPLES[2]),
  buildTemplate("trig_ratio_tan_4", "三角比（tan）4", "tan", TRIPLES[3]),
  buildTemplate("trig_ratio_tan_5", "三角比（tan）5", "tan", TRIPLES[4]),
  buildTemplate("trig_ratio_tan_6", "三角比（tan）6", "tan", TRIPLES[6]),
  buildTemplate("trig_ratio_tan_7", "三角比（tan）7", "tan", TRIPLES[5]),
  buildTemplate("trig_ratio_cos_7", "三角比（cos）7", "cos", TRIPLES[6]),
  buildTemplate("trig_ratio_sin_8", "三角比（sin）8", "sin", TRIPLES[0]),
  buildTemplate("trig_ratio_sin_9", "三角比（sin）9", "sin", TRIPLES[1]),
  buildTemplate("trig_ratio_sin_10", "三角比（sin）10", "sin", TRIPLES[2]),
  buildTemplate("trig_ratio_sin_11", "三角比（sin）11", "sin", TRIPLES[3]),
  buildTemplate("trig_ratio_sin_12", "三角比（sin）12", "sin", TRIPLES[4]),
  buildTemplate("trig_ratio_sin_13", "三角比（sin）13", "sin", TRIPLES[5]),
  buildTemplate("trig_ratio_sin_14", "三角比（sin）14", "sin", TRIPLES[6]),
  buildTemplate("trig_ratio_cos_8", "三角比（cos）8", "cos", TRIPLES[0]),
  buildTemplate("trig_ratio_cos_9", "三角比（cos）9", "cos", TRIPLES[1]),
  buildTemplate("trig_ratio_cos_10", "三角比（cos）10", "cos", TRIPLES[2]),
  buildTemplate("trig_ratio_cos_11", "三角比（cos）11", "cos", TRIPLES[3]),
  buildTemplate("trig_ratio_cos_12", "三角比（cos）12", "cos", TRIPLES[4]),
  buildTemplate("trig_ratio_cos_13", "三角比（cos）13", "cos", TRIPLES[5]),
  buildTemplate("trig_ratio_cos_14", "三角比（cos）14", "cos", TRIPLES[6]),
  buildTemplate("trig_ratio_tan_8", "三角比（tan）8", "tan", TRIPLES[0]),
  buildTemplate("trig_ratio_tan_9", "三角比（tan）9", "tan", TRIPLES[1]),
  buildTemplate("trig_ratio_tan_10", "三角比（tan）10", "tan", TRIPLES[2]),
  buildTemplate("trig_ratio_tan_11", "三角比（tan）11", "tan", TRIPLES[3]),
  buildTemplate("trig_ratio_tan_12", "三角比（tan）12", "tan", TRIPLES[4]),
  buildTemplate("trig_ratio_tan_13", "三角比（tan）13", "tan", TRIPLES[5]),
  buildTemplate("trig_ratio_tan_14", "三角比（tan）14", "tan", TRIPLES[6]),
  buildTemplate("trig_ratio_sin_15", "三角比（sin）15", "sin", TRIPLES[2]),
  buildTemplate("trig_ratio_sin_16", "三角比（sin）16", "sin", TRIPLES[4]),
  buildTemplate("trig_ratio_cos_15", "三角比（cos）15", "cos", TRIPLES[2]),
  buildTemplate("trig_ratio_cos_16", "三角比（cos）16", "cos", TRIPLES[4]),
  buildTemplate("trig_ratio_tan_15", "三角比（tan）15", "tan", TRIPLES[2]),
  buildTemplate("trig_ratio_tan_16", "三角比（tan）16", "tan", TRIPLES[4]),
  buildTemplate("trig_ratio_sin_17", "三角比（sin）17", "sin", TRIPLES[1]),
  buildTemplate("trig_ratio_cos_17", "三角比（cos）17", "cos", TRIPLES[1]),
  buildTemplate("trig_ratio_tan_17", "三角比（tan）17", "tan", TRIPLES[1]),
];

const extraTrigRatioTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const ratio: RatioType = kind === 0 ? "sin" : kind === 1 ? "cos" : "tan";
  const triple = TRIPLES[idx % TRIPLES.length];
  const id = `trig_ratio_extra_${idx + 1}`;
  const title = `三角比（${ratio}）追加${idx + 1}`;
  return buildTemplate(id, title, ratio, triple);
});

trigRatioTemplates.push(...extraTrigRatioTemplates);
