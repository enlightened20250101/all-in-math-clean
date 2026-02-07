// src/lib/course/templates/math1/geo_measure_right_triangle_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texAngle, texSegmentLen } from "@/lib/format/tex";

type NumericCase = {
  id: string;
  title: string;
  statement: string;
  answer: number;
  explain: string;
};

type ChoiceCase = {
  id: string;
  title: string;
  statement: string;
  correct: string;
  choices: string[];
  explain: string;
};

function buildNumeric(c: NumericCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "geo_measure_right_triangle_basic",
      title: c.title,
      difficulty: 1,
      tags: ["geometry", "right-triangle"],
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

function buildChoice(c: ChoiceCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "geo_measure_right_triangle_basic",
      title: c.title,
      difficulty: 1,
      tags: ["geometry", "right-triangle", "angle"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "choice",
        choices: c.choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return c.explain;
    },
  };
}

function rightTriangleConditions(parts: string[]): string {
  return `$$\n${parts.join(",\\, ")}\n$$`;
}

const numericCases: NumericCase[] = [
  {
    id: "geo_rt_sin_1",
    title: "sin30で高さ",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 30),
      texSegmentLen("A", "B", 10),
    ])}`,
    answer: 5,
    explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $BC=10\\times\\frac{1}{2}=5$ です。
`,
  },
  {
    id: "geo_rt_sin_2",
    title: "sin30で斜辺",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AB}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 30),
      texSegmentLen("B", "C", 6),
    ])}`,
    answer: 12,
    explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $AB=\\frac{BC}{\\sin30^\\circ}=12$ です。
`,
  },
  {
    id: "geo_rt_cos_1",
    title: "cos60で隣辺",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 60),
      texSegmentLen("A", "B", 12),
    ])}`,
    answer: 6,
    explain: `
### この問題の解説
$$
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2}
$$
より $AC=12\\times\\frac{1}{2}=6$ です。
`,
  },
  {
    id: "geo_rt_cos_2",
    title: "cos60で斜辺",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AB}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 60),
      texSegmentLen("A", "C", 9),
    ])}`,
    answer: 18,
    explain: `
### この問題の解説
$$
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2}
$$
より $AB=18$ です。
`,
  },
  {
    id: "geo_rt_tan_1",
    title: "tan45で高さ",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 45),
      texSegmentLen("A", "C", 8),
    ])}`,
    answer: 8,
    explain: `
### この問題の解説
$$
\\tan 45^\\circ = \\frac{BC}{AC} = 1
$$
より $BC=AC=8$ です。
`,
  },
  {
    id: "geo_rt_tan_2",
    title: "tan45で隣辺",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 45),
      texSegmentLen("B", "C", 5),
    ])}`,
    answer: 5,
    explain: `
### この問題の解説
$$
\\tan 45^\\circ = \\frac{BC}{AC} = 1
$$
より $AC=BC=5$ です。
`,
  },
  {
    id: "geo_rt_sin_3",
    title: "sin30で高さ2",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 30),
      texSegmentLen("A", "B", 14),
    ])}`,
    answer: 7,
    explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $BC=7$ です。
`,
  },
  {
    id: "geo_rt_cos_3",
    title: "cos60で隣辺2",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 60),
      texSegmentLen("A", "B", 16),
    ])}`,
    answer: 8,
    explain: `
### この問題の解説
$$
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2}
$$
より $AC=8$ です。
`,
  },
  {
    id: "geo_rt_tan_3",
    title: "tan45で高さ2",
    statement: `地面からの仰角が $45^\\circ$、観測点から塔までの水平距離が 12 m のとき、塔の高さを求めよ。`,
    answer: 12,
    explain: `
### この問題の解説
$$
\\tan 45^\\circ = \\frac{\\text{高さ}}{\\text{水平距離}} = 1
$$
より高さは 12 m です。
`,
  },
  {
    id: "geo_rt_sin_4",
    title: "sin30で高さ3",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 30),
      texSegmentLen("A", "B", 18),
    ])}`,
    answer: 9,
    explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $BC=18\\times\\frac{1}{2}=9$ です。
`,
  },
  {
    id: "geo_rt_cos_4",
    title: "cos60で隣辺3",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 60),
      texSegmentLen("A", "B", 14),
    ])}`,
    answer: 7,
    explain: `
### この問題の解説
$$
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2}
$$
より $AC=14\\times\\frac{1}{2}=7$ です。
`,
  },
  {
    id: "geo_rt_tan_4",
    title: "tan45で高さ3",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 45),
      texSegmentLen("A", "C", 9),
    ])}`,
    answer: 9,
    explain: `
### この問題の解説
$$
\\tan 45^\\circ = \\frac{BC}{AC} = 1
$$
より $BC=9$ です。
`,
  },
  {
    id: "geo_rt_tan_4",
    title: "tan45で距離",
    statement: `高さが 9 m の塔を見上げるとき、仰角が $45^\\circ$ である。観測点から塔までの水平距離を求めよ。`,
    answer: 9,
    explain: `
### この問題の解説
$$
\\tan 45^\\circ = \\frac{9}{\\text{距離}} = 1
$$
より距離は 9 m です。
`,
  },
  {
    id: "geo_rt_sin_4",
    title: "sin30で斜辺2",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AB}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 30),
      texSegmentLen("B", "C", 9),
    ])}`,
    answer: 18,
    explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $AB=18$ です。
`,
  },
  {
    id: "geo_rt_cos_4",
    title: "cos60で斜辺2",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AB}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 60),
      texSegmentLen("A", "C", 4),
    ])}`,
    answer: 8,
    explain: `
### この問題の解説
$$
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2}
$$
より $AB=8$ です。
`,
  },
  {
    id: "geo_rt_tan_5",
    title: "tan45で高さ3",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 45),
      texSegmentLen("A", "C", 11),
    ])}`,
    answer: 11,
    explain: `
### この問題の解説
$$
\\tan 45^\\circ = \\frac{BC}{AC} = 1
$$
より $BC=11$ です。
`,
  },
  {
    id: "geo_rt_tan_6",
    title: "tan45で隣辺2",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 45),
      texSegmentLen("B", "C", 7),
    ])}`,
    answer: 7,
    explain: `
### この問題の解説
$$
\\tan 45^\\circ = \\frac{BC}{AC} = 1
$$
より $AC=7$ です。
`,
  },
  {
    id: "geo_rt_sin_5",
    title: "sin30で高さ3",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 30),
      texSegmentLen("A", "B", 18),
    ])}`,
    answer: 9,
    explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $BC=9$ です。
`,
  },
  {
    id: "geo_rt_cos_5",
    title: "cos60で隣辺3",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 60),
      texSegmentLen("A", "B", 20),
    ])}`,
    answer: 10,
    explain: `
### この問題の解説
$$
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2}
$$
より $AC=10$ です。
`,
  },
  {
    id: "geo_rt_cos_6",
    title: "cos60で斜辺3",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AB}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 60),
      texSegmentLen("A", "C", 7),
    ])}`,
    answer: 14,
    explain: `
### この問題の解説
$$
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2}
$$
より $AB=14$ です。
`,
  },
  {
    id: "geo_rt_sin_6",
    title: "sin30で斜辺3",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{AB}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 30),
      texSegmentLen("B", "C", 8),
    ])}`,
    answer: 16,
    explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $AB=16$ です。
`,
  },
];

const choiceCases: ChoiceCase[] = [
  {
    id: "geo_rt_angle_30",
    title: "角度判定（sin=1/2）",
    statement: `直角三角形ABCで次を満たすとき、$\\angle{A}$ を求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "B", 10),
      texSegmentLen("B", "C", 5),
    ])}`,
    correct: "30^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ"],
    explain: `
### この問題の解説
$$
\\sin A = \\frac{BC}{AB} = \\frac{5}{10} = \\frac{1}{2}
$$
より $\\angle{A}=30^\\circ$ です。
`,
  },
  {
    id: "geo_rt_angle_60",
    title: "角度判定（cos=1/2）",
    statement: `直角三角形ABCで次を満たすとき、$\\angle{A}$ を求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "B", 12),
      texSegmentLen("A", "C", 6),
    ])}`,
    correct: "60^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ"],
    explain: `
### この問題の解説
$$
\\cos A = \\frac{AC}{AB} = \\frac{6}{12} = \\frac{1}{2}
$$
より $\\angle{A}=60^\\circ$ です。
`,
  },
  {
    id: "geo_rt_angle_45",
    title: "角度判定（tan=1）",
    statement: `直角三角形ABCで次を満たすとき、$\\angle{A}$ を求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 4),
      texSegmentLen("B", "C", 4),
    ])}`,
    correct: "45^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ"],
    explain: `
### この問題の解説
$$
\\tan A = \\frac{BC}{AC} = \\frac{4}{4} = 1
$$
より $\\angle{A}=45^\\circ$ です。
`,
  },
  {
    id: "geo_rt_angle_30_alt",
    title: "角度判定（sin=1/2）2",
    statement: `直角三角形ABCで次を満たすとき、$\\angle{A}$ を求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "B", 14),
      texSegmentLen("B", "C", 7),
    ])}`,
    correct: "30^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ"],
    explain: `
### この問題の解説
$$
\\sin A = \\frac{BC}{AB} = \\frac{7}{14} = \\frac{1}{2}
$$
より $\\angle{A}=30^\\circ$ です。
`,
  },
  {
    id: "geo_rt_angle_60_alt",
    title: "角度判定（cos=1/2）2",
    statement: `直角三角形ABCで次を満たすとき、$\\angle{A}$ を求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "B", 16),
      texSegmentLen("A", "C", 8),
    ])}`,
    correct: "60^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ"],
    explain: `
### この問題の解説
$$
\\cos A = \\frac{AC}{AB} = \\frac{8}{16} = \\frac{1}{2}
$$
より $\\angle{A}=60^\\circ$ です。
`,
  },
  {
    id: "geo_rt_angle_45_alt",
    title: "角度判定（tan=1）2",
    statement: `直角三角形ABCで次を満たすとき、$\\angle{A}$ を求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 9),
      texSegmentLen("B", "C", 9),
    ])}`,
    correct: "45^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ"],
    explain: `
### この問題の解説
$$
\\tan A = \\frac{BC}{AC} = \\frac{9}{9} = 1
$$
より $\\angle{A}=45^\\circ$ です。
`,
  },
  {
    id: "geo_rt_angle_60_alt2",
    title: "角度判定（cos=1/2）3",
    statement: `直角三角形ABCで次を満たすとき、$\\angle{A}$ を求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "B", 18),
      texSegmentLen("A", "C", 9),
    ])}`,
    correct: "60^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ"],
    explain: `
### この問題の解説
$$
\\cos A = \\frac{AC}{AB} = \\frac{9}{18} = \\frac{1}{2}
$$
より $\\angle{A}=60^\\circ$ です。
`,
  },
];

const extraNumericCases: NumericCase[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 4;
  const id = `geo_rt_extra_${idx + 1}`;
  if (kind === 0) {
    const hyp = pick([10, 12, 14, 16, 18, 20]);
    const answer = hyp / 2;
    return {
      id,
      title: "sin30で高さ（追加）",
      statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
        texAngle("C", 90),
        texAngle("A", 30),
        texSegmentLen("A", "B", hyp),
      ])}`,
      answer,
      explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $BC=${hyp}\\times\\frac{1}{2}=${answer}$ です。
`,
    };
  }
  if (kind === 1) {
    const bc = pick([4, 5, 6, 7, 8, 9]);
    const hyp = 2 * bc;
    return {
      id,
      title: "sin30で斜辺（追加）",
      statement: `直角三角形ABCで次を満たすとき、$\\overline{AB}$ の長さを求めよ。\n\n${rightTriangleConditions([
        texAngle("C", 90),
        texAngle("A", 30),
        texSegmentLen("B", "C", bc),
      ])}`,
      answer: hyp,
      explain: `
### この問題の解説
$$
\\sin 30^\\circ = \\frac{BC}{AB} = \\frac{1}{2}
$$
より $AB=${bc}\\div\\frac{1}{2}=${hyp}$ です。
`,
    };
  }
  if (kind === 2) {
    const hyp = pick([10, 12, 14, 16, 18, 20]);
    const ac = hyp / 2;
    return {
      id,
      title: "cos60で隣辺（追加）",
      statement: `直角三角形ABCで次を満たすとき、$\\overline{AC}$ の長さを求めよ。\n\n${rightTriangleConditions([
        texAngle("C", 90),
        texAngle("A", 60),
        texSegmentLen("A", "B", hyp),
      ])}`,
      answer: ac,
      explain: `
### この問題の解説
$$
\\cos 60^\\circ = \\frac{AC}{AB} = \\frac{1}{2}
$$
より $AC=${hyp}\\times\\frac{1}{2}=${ac}$ です。
`,
    };
  }
  const ac = pick([6, 8, 10, 12, 14]);
  return {
    id,
    title: "tan45で高さ（追加）",
    statement: `直角三角形ABCで次を満たすとき、$\\overline{BC}$ の長さを求めよ。\n\n${rightTriangleConditions([
      texAngle("C", 90),
      texAngle("A", 45),
      texSegmentLen("A", "C", ac),
    ])}`,
    answer: ac,
    explain: `
### この問題の解説
$$
\\tan 45^\\circ = \\frac{BC}{AC} = 1
$$
より $BC=${ac}$ です。
`,
  };
});

export const geoMeasureRightTriangleTemplates: QuestionTemplate[] = [
  ...numericCases.map(buildNumeric),
  ...extraNumericCases.map(buildNumeric),
  ...choiceCases.map(buildChoice),
];
