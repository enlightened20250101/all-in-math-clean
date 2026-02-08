// src/lib/course/templates/math1/geo_sine_cosine_law_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
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
      topicId: "geo_sine_cosine_law_basic",
      title: c.title,
      difficulty: 1,
      tags: ["geometry", "cosine-law"],
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
      topicId: "geo_sine_cosine_law_basic",
      title: c.title,
      difficulty: 1,
      tags: ["geometry", "sine-law"],
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

function buildNumericSine(c: NumericCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "geo_sine_cosine_law_basic",
      title: c.title,
      difficulty: 1,
      tags: ["geometry", "sine-law"],
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

function triangleConditions(parts: string[]): string {
  return `$$\n${parts.join(",\\, ")}\n$$`;
}

const cosineCases: NumericCase[] = [
  {
    id: "geo_cos_1",
    title: "余弦定理（90°）1",
    statement: `測量で得た測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 3),
      texSegmentLen("B", "C", 4),
    ])}`,
    answer: 5,
    explain: `
### この問題の解説
$$
AB^2 = AC^2 + BC^2 = 3^2 + 4^2 = 25
$$
より $AB=5$ です。
`,
  },
  {
    id: "geo_cos_2",
    title: "余弦定理（90°）2",
    statement: `測量で得た測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 5),
      texSegmentLen("B", "C", 12),
    ])}`,
    answer: 13,
    explain: `
### この問題の解説
$$
AB^2 = 5^2 + 12^2 = 169
$$
より $AB=13$ です。
`,
  },
  {
    id: "geo_cos_3",
    title: "余弦定理（90°）3",
    statement: `測量で得た測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 6),
      texSegmentLen("B", "C", 8),
    ])}`,
    answer: 10,
    explain: `
### この問題の解説
$$
AB^2 = 6^2 + 8^2 = 100
$$
より $AB=10$ です。
`,
  },
  {
    id: "geo_cos_4",
    title: "余弦定理（90°）4",
    statement: `測量で得た測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 7),
      texSegmentLen("B", "C", 24),
    ])}`,
    answer: 25,
    explain: `
### この問題の解説
$$
AB^2 = 7^2 + 24^2 = 625
$$
より $AB=25$ です。
`,
  },
  {
    id: "geo_cos_5",
    title: "余弦定理（90°）5",
    statement: `測量で得た測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 8),
      texSegmentLen("B", "C", 15),
    ])}`,
    answer: 17,
    explain: `
### この問題の解説
$$
AB^2 = 8^2 + 15^2 = 289
$$
より $AB=17$ です。
`,
  },
  {
    id: "geo_cos_6",
    title: "余弦定理（90°）6",
    statement: `測量で得た測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 9),
      texSegmentLen("B", "C", 12),
    ])}`,
    answer: 15,
    explain: `
### この問題の解説
$$
AB^2 = 9^2 + 12^2 = 225
$$
より $AB=15$ です。
`,
  },
  {
    id: "geo_cos_7",
    title: "余弦定理（60°）1",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 7),
      texSegmentLen("B", "C", 7),
    ])}`,
    answer: 7,
    explain: `
### この問題の解説
$$
AB^2 = 7^2 + 7^2 - 2\\cdot7\\cdot7\\cos60^\\circ = 49
$$
より $AB=7$ です。
`,
  },
  {
    id: "geo_cos_8",
    title: "余弦定理（60°）2",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 5),
      texSegmentLen("B", "C", 5),
    ])}`,
    answer: 5,
    explain: `
### この問題の解説
$$
AB^2 = 5^2 + 5^2 - 2\\cdot5\\cdot5\\cos60^\\circ = 25
$$
より $AB=5$ です。
`,
  },
  {
    id: "geo_cos_9",
    title: "余弦定理（60°）3",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 6),
      texSegmentLen("B", "C", 6),
    ])}`,
    answer: 6,
    explain: `
### この問題の解説
$$
AB^2 = 6^2 + 6^2 - 2\\cdot6\\cdot6\\cos60^\\circ = 36
$$
より $AB=6$ です。
`,
  },
  {
    id: "geo_cos_10",
    title: "余弦定理（60°）4",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 8),
      texSegmentLen("B", "C", 8),
    ])}`,
    answer: 8,
    explain: `
### この問題の解説
$$
AB^2 = 8^2 + 8^2 - 2\\cdot8\\cdot8\\cos60^\\circ = 64
$$
より $AB=8$ です。
`,
  },
  {
    id: "geo_cos_11",
    title: "余弦定理（60°）5",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 9),
      texSegmentLen("B", "C", 9),
    ])}`,
    answer: 9,
    explain: `
### この問題の解説
$$
AB^2 = 9^2 + 9^2 - 2\\cdot9\\cdot9\\cos60^\\circ = 81
$$
より $AB=9$ です。
`,
  },
  {
    id: "geo_cos_12",
    title: "余弦定理（60°）6",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 4),
      texSegmentLen("B", "C", 4),
    ])}`,
    answer: 4,
    explain: `
### この問題の解説
$$
AB^2 = 4^2 + 4^2 - 2\\cdot4\\cdot4\\cos60^\\circ = 16
$$
より $AB=4$ です。
`,
  },
  {
    id: "geo_cos_13",
    title: "余弦定理（90°）5",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 8),
      texSegmentLen("B", "C", 15),
    ])}`,
    answer: 17,
    explain: `
### この問題の解説
$$
AB^2 = 8^2 + 15^2 = 289
$$
より $AB=17$ です。
`,
  },
  {
    id: "geo_cos_14",
    title: "余弦定理（90°）6",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 9),
      texSegmentLen("B", "C", 12),
    ])}`,
    answer: 15,
    explain: `
### この問題の解説
$$
AB^2 = 9^2 + 12^2 = 225
$$
より $AB=15$ です。
`,
  },
  {
    id: "geo_cos_15",
    title: "余弦定理（60°）7",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 7),
      texSegmentLen("B", "C", 7),
    ])}`,
    answer: 7,
    explain: `
### この問題の解説
$$
AB^2 = 7^2 + 7^2 - 2\\cdot7\\cdot7\\cos60^\\circ = 49
$$
より $AB=7$ です。
`,
  },
  {
    id: "geo_cos_16",
    title: "余弦定理（60°）8",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 10),
      texSegmentLen("B", "C", 10),
    ])}`,
    answer: 10,
    explain: `
### この問題の解説
$$
AB^2 = 10^2 + 10^2 - 2\\cdot10\\cdot10\\cos60^\\circ = 100
$$
より $AB=10$ です。
`,
  },
  {
    id: "geo_cos_17",
    title: "余弦定理（90°）7",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 5),
      texSegmentLen("B", "C", 12),
    ])}`,
    answer: 13,
    explain: `
### この問題の解説
$$
AB^2 = 5^2 + 12^2 = 169
$$
より $AB=13$ です。
`,
  },
  {
    id: "geo_cos_18",
    title: "余弦定理（90°）8",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 12),
      texSegmentLen("B", "C", 16),
    ])}`,
    answer: 20,
    explain: `
### この問題の解説
$$
AB^2 = 12^2 + 16^2 = 400
$$
より $AB=20$ です。
`,
  },
  {
    id: "geo_cos_19",
    title: "余弦定理（60°）9",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 6),
      texSegmentLen("B", "C", 6),
    ])}`,
    answer: 6,
    explain: `
### この問題の解説
$$
AB^2 = 6^2 + 6^2 - 2\\cdot6\\cdot6\\cos60^\\circ = 36
$$
より $AB=6$ です。
`,
  },
  {
    id: "geo_cos_20",
    title: "余弦定理（60°）10",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 8),
      texSegmentLen("B", "C", 8),
    ])}`,
    answer: 8,
    explain: `
### この問題の解説
$$
AB^2 = 8^2 + 8^2 - 2\\cdot8\\cdot8\\cos60^\\circ = 64
$$
より $AB=8$ です。
`,
  },
  {
    id: "geo_cos_21",
    title: "余弦定理（90°）9",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 7),
      texSegmentLen("B", "C", 24),
    ])}`,
    answer: 25,
    explain: `
### この問題の解説
$$
AB^2 = 7^2 + 24^2 = 625
$$
より $AB=25$ です。
`,
  },
  {
    id: "geo_cos_22",
    title: "余弦定理（90°）10",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 9),
      texSegmentLen("B", "C", 40),
    ])}`,
    answer: 41,
    explain: `
### この問題の解説
$$
AB^2 = 9^2 + 40^2 = 1681
$$
より $AB=41$ です。
`,
  },
  {
    id: "geo_cos_23",
    title: "余弦定理（60°）11",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 9),
      texSegmentLen("B", "C", 9),
    ])}`,
    answer: 9,
    explain: `
### この問題の解説
$$
AB^2 = 9^2 + 9^2 - 2\\cdot9\\cdot9\\cos60^\\circ = 81
$$
より $AB=9$ です。
`,
  },
  {
    id: "geo_cos_24",
    title: "余弦定理（60°）12",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 60),
      texSegmentLen("A", "C", 11),
      texSegmentLen("B", "C", 11),
    ])}`,
    answer: 11,
    explain: `
### この問題の解説
$$
AB^2 = 11^2 + 11^2 - 2\\cdot11\\cdot11\\cos60^\\circ = 121
$$
より $AB=11$ です。
`,
  },
  {
    id: "geo_cos_25",
    title: "余弦定理（90°）11",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 15),
      texSegmentLen("B", "C", 20),
    ])}`,
    answer: 25,
    explain: `
### この問題の解説
$$
AB^2 = 15^2 + 20^2 = 625
$$
より $AB=25$ です。
`,
  },
  {
    id: "geo_cos_26",
    title: "余弦定理（90°）12",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AB}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("C", 90),
      texSegmentLen("A", "C", 20),
      texSegmentLen("B", "C", 21),
    ])}`,
    answer: 29,
    explain: `
### この問題の解説
$$
AB^2 = 20^2 + 21^2 = 841
$$
より $AB=29$ です。
`,
  },
];

const sineNumericCases: NumericCase[] = [
  {
    id: "geo_sine_num_1",
    title: "正弦定理（辺の長さ）",
    statement: `三角形ABCで $${texAngle("A", 30)},\\ ${texAngle("B", 90)},\\ ${texSegmentLen("B", "C", 6)}$ とする。辺 $AC$ の長さを求めよ。`,
    answer: 12,
    explain: `
### この問題の解説
正弦定理より
$$
\\frac{BC}{\\sin A}=\\frac{AC}{\\sin B}
$$
なので
$$
AC = BC\\frac{\\sin B}{\\sin A} = 6\\times\\frac{1}{1/2}=12
$$
`,
  },
  {
    id: "geo_cos_num_1",
    title: "余弦定理（辺の長さ）",
    statement: `三角形ABCで $${texAngle("C", 60)},\\ ${texSegmentLen("A", "C", 5)},\\ ${texSegmentLen("B", "C", 5)}$ とする。辺 $AB$ の長さを求めよ。`,
    answer: 5,
    explain: `
### この問題の解説
余弦定理より
$$
AB^2 = 5^2+5^2-2\\cdot5\\cdot5\\cos60^\\circ = 25
$$
よって $AB=5$。
`,
  },
];

const sineChoiceCases: ChoiceCase[] = [
  {
    id: "geo_sine_1",
    title: "正弦定理（30°→60°）",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AC}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("A", 30),
      texAngle("B", 60),
      texSegmentLen("B", "C", 5),
    ])}`,
    correct: "5\\sqrt{3}",
    choices: ["5\\sqrt{3}", "5", "10", "3\\sqrt{5}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin B} = \\frac{BC}{\\sin A}
$$
なので $AC = 5\\cdot\\frac{\\sin 60^\\circ}{\\sin 30^\\circ}=5\\sqrt{3}$ です。
`,
  },
  {
    id: "geo_sine_2",
    title: "正弦定理（30°→90°）",
    statement: `測量で得た三角形ABCで次を満たす。$\\overline{AC}$ の長さを求めよ。\n\n${triangleConditions([
      texAngle("A", 30),
      texAngle("B", 90),
      texSegmentLen("B", "C", 6),
    ])}`,
    correct: "12",
    choices: ["12", "6", "3\\sqrt{3}", "9"],
    explain: `
### この問題の解説
$$
\\frac{AC}{\\sin B} = \\frac{BC}{\\sin A}
$$
より $AC=6\\times\\frac{\\sin90^\\circ}{\\sin30^\\circ}=12$ です。
`,
  },
  {
    id: "geo_sine_3",
    title: "正弦定理（角度）",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\overline{BC}=4$、$\\overline{AC}=8$ とする。$\\angle{B}$ を求めよ。`,
    correct: "90^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ", "90^\\circ"],
    explain: `
### この問題の解説
正弦定理で

$$
\\frac{4}{\\sin30^\\circ} = \\frac{8}{\\sin B}
$$
より $\\sin B=1$、したがって $B=90^\\circ$ です。
`,
  },
  {
    id: "geo_sine_4",
    title: "正弦定理（60°）",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\overline{BC}=5$、$\\overline{AC}=5\\sqrt{3}$ とする。$\\angle{B}$ を求めよ。`,
    correct: "60^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ", "90^\\circ"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{5}{\\sin30^\\circ} = \\frac{5\\sqrt{3}}{\\sin B}
$$
なので $\\sin B=\\frac{\\sqrt{3}}{2}$、よって $B=60^\\circ$ です。
`,
  },
  {
    id: "geo_sine_5",
    title: "正弦定理（45°）",
    statement: `三角形ABCで $\\angle{A}=45^\\circ$、$\\overline{BC}=6$、$\\overline{AC}=6$ とする。$\\angle{B}$ を求めよ。`,
    correct: "45^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ", "90^\\circ"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{6}{\\sin45^\\circ} = \\frac{6}{\\sin B}
$$
なので $\\sin B=\\sin45^\\circ$、よって $B=45^\\circ$ です。
`,
  },
  {
    id: "geo_sine_6",
    title: "正弦定理（30°→60°）2",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=60^\\circ$、$\\overline{BC}=7$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "7\\sqrt{3}",
    choices: ["7\\sqrt{3}", "7", "14", "3\\sqrt{7}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{BC}{\\sin30^\\circ} = \\frac{AC}{\\sin60^\\circ}
$$
なので $AC=7\\sqrt{3}$ です。
`,
  },
  {
    id: "geo_sine_7",
    title: "正弦定理（30°→90°）2",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=90^\\circ$、$\\overline{BC}=4$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "8",
    choices: ["8", "4", "4\\sqrt{3}", "6"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{BC}{\\sin30^\\circ} = \\frac{AC}{\\sin90^\\circ}
$$
なので $AC=8$ です。
`,
  },
  {
    id: "geo_sine_8",
    title: "正弦定理（角度）2",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\overline{BC}=5$、$\\overline{AC}=10$ とする。$\\angle{B}$ を求めよ。`,
    correct: "90^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ", "90^\\circ"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{5}{\\sin30^\\circ} = \\frac{10}{\\sin B}
$$
なので $\\sin B=1$、よって $B=90^\\circ$ です。
`,
  },
  {
    id: "geo_sine_9",
    title: "正弦定理（30°→60°）3",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=60^\\circ$、$\\overline{BC}=9$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "9\\sqrt{3}",
    choices: ["9\\sqrt{3}", "9", "18", "3\\sqrt{9}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{BC}{\\sin30^\\circ} = \\frac{AC}{\\sin60^\\circ}
$$
なので $AC=9\\sqrt{3}$ です。
`,
  },
  {
    id: "geo_sine_10",
    title: "正弦定理（30°→90°）3",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=90^\\circ$、$\\overline{BC}=7$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "14",
    choices: ["14", "7", "7\\sqrt{3}", "10"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{BC}{\\sin30^\\circ} = \\frac{AC}{\\sin90^\\circ}
$$
なので $AC=14$ です。
`,
  },
  {
    id: "geo_sine_11",
    title: "正弦定理（角度）3",
    statement: `三角形ABCで $\\angle{A}=45^\\circ$、$\\overline{BC}=4$、$\\overline{AC}=4\\sqrt{2}$ とする。$\\angle{B}$ を求めよ。`,
    correct: "90^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ", "90^\\circ"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{4}{\\sin45^\\circ} = \\frac{4\\sqrt{2}}{\\sin B}
$$
なので $\\sin B=1$、よって $B=90^\\circ$ です。
`,
  },
  {
    id: "geo_sine_12",
    title: "正弦定理（30°→60°）2",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=60^\\circ$、$\\overline{BC}=4$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "4\\sqrt{3}",
    choices: ["4\\sqrt{3}", "4", "8", "2\\sqrt{3}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin60^\\circ} = \\frac{BC}{\\sin30^\\circ}
$$
なので $AC=4\\cdot\\frac{\\sin60^\\circ}{\\sin30^\\circ}=4\\sqrt{3}$ です。
`,
  },
  {
    id: "geo_sine_13",
    title: "正弦定理（45°→45°）",
    statement: `三角形ABCで $\\angle{A}=45^\\circ$、$\\angle{B}=45^\\circ$、$\\overline{BC}=6$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "6",
    choices: ["6", "3\\sqrt{2}", "6\\sqrt{2}", "3"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin45^\\circ} = \\frac{BC}{\\sin45^\\circ}
$$
なので $AC=6$ です。
`,
  },
  {
    id: "geo_sine_14",
    title: "正弦定理（30°→90°）4",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=90^\\circ$、$\\overline{BC}=5$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "10",
    choices: ["10", "5", "5\\sqrt{3}", "8"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin90^\\circ} = \\frac{BC}{\\sin30^\\circ}
$$
なので $AC=10$ です。
`,
  },
  {
    id: "geo_sine_15",
    title: "正弦定理（30°→60°）3",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=60^\\circ$、$\\overline{BC}=6$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "6\\sqrt{3}",
    choices: ["6\\sqrt{3}", "6", "12", "3\\sqrt{3}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin60^\\circ} = \\frac{BC}{\\sin30^\\circ}
$$
なので $AC=6\\cdot\\frac{\\sin60^\\circ}{\\sin30^\\circ}=6\\sqrt{3}$ です。
`,
  },
  {
    id: "geo_sine_16",
    title: "正弦定理（45°→90°）",
    statement: `三角形ABCで $\\angle{A}=45^\\circ$、$\\angle{B}=90^\\circ$、$\\overline{BC}=4$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "4\\sqrt{2}",
    choices: ["4\\sqrt{2}", "4", "8", "2\\sqrt{2}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin90^\\circ} = \\frac{BC}{\\sin45^\\circ}
$$
なので $AC=4\\cdot\\frac{1}{\\sin45^\\circ}=4\\sqrt{2}$ です。
`,
  },
  {
    id: "geo_sine_17",
    title: "正弦定理（60°→60°）",
    statement: `三角形ABCで $\\angle{A}=60^\\circ$、$\\angle{B}=60^\\circ$、$\\overline{BC}=7$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "7",
    choices: ["7", "7\\sqrt{3}", "14", "3\\sqrt{7}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin60^\\circ} = \\frac{BC}{\\sin60^\\circ}
$$
なので $AC=7$ です。
`,
  },
  {
    id: "geo_sine_18",
    title: "正弦定理（角度）4",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\overline{BC}=5$、$\\overline{AC}=10$ とする。$\\angle{B}$ を求めよ。`,
    correct: "90^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ", "90^\\circ"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{5}{\\sin30^\\circ} = \\frac{10}{\\sin B}
$$
なので $\\sin B=1$、よって $B=90^\\circ$ です。
`,
  },
  {
    id: "geo_sine_19",
    title: "正弦定理（45°→30°）",
    statement: `三角形ABCで $\\angle{A}=45^\\circ$、$\\angle{B}=30^\\circ$、$\\overline{BC}=4$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "2\\sqrt{6}",
    choices: ["2\\sqrt{6}", "2\\sqrt{3}", "4\\sqrt{2}", "4"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin30^\\circ} = \\frac{BC}{\\sin45^\\circ}
$$
なので $AC=4\\cdot\\frac{\\sin30^\\circ}{\\sin45^\\circ}=2\\sqrt{6}$ です。
`,
  },
  {
    id: "geo_sine_20",
    title: "正弦定理（30°→60°）4",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=60^\\circ$、$\\overline{BC}=8$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "8\\sqrt{3}",
    choices: ["8\\sqrt{3}", "8", "16", "4\\sqrt{3}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin60^\\circ} = \\frac{BC}{\\sin30^\\circ}
$$
なので $AC=8\\cdot\\frac{\\sin60^\\circ}{\\sin30^\\circ}=8\\sqrt{3}$ です。
`,
  },
  {
    id: "geo_sine_21",
    title: "正弦定理（45°→90°）2",
    statement: `三角形ABCで $\\angle{A}=45^\\circ$、$\\angle{B}=90^\\circ$、$\\overline{BC}=6$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "6\\sqrt{2}",
    choices: ["6\\sqrt{2}", "6", "12", "3\\sqrt{2}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin90^\\circ} = \\frac{BC}{\\sin45^\\circ}
$$
なので $AC=6\\cdot\\frac{1}{\\sin45^\\circ}=6\\sqrt{2}$ です。
`,
  },
  {
    id: "geo_sine_22",
    title: "正弦定理（60°→30°）",
    statement: `三角形ABCで $\\angle{A}=60^\\circ$、$\\angle{B}=30^\\circ$、$\\overline{BC}=5$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "5\\sqrt{3}",
    choices: ["5\\sqrt{3}", "5", "10", "2\\sqrt{3}"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin30^\\circ} = \\frac{BC}{\\sin60^\\circ}
$$
なので $AC=5\\cdot\\frac{\\sin30^\\circ}{\\sin60^\\circ}=5\\sqrt{3}$ です。
`,
  },
  {
    id: "geo_sine_23",
    title: "正弦定理（角度）5",
    statement: `三角形ABCで $\\angle{A}=60^\\circ$、$\\overline{BC}=6$、$\\overline{AC}=6\\sqrt{3}$ とする。$\\angle{B}$ を求めよ。`,
    correct: "90^\\circ",
    choices: ["30^\\circ", "45^\\circ", "60^\\circ", "90^\\circ"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{6}{\\sin60^\\circ} = \\frac{6\\sqrt{3}}{\\sin B}
$$
なので $\\sin B=1$、よって $B=90^\\circ$ です。
`,
  },
  {
    id: "geo_sine_24",
    title: "正弦定理（30°→90°）5",
    statement: `三角形ABCで $\\angle{A}=30^\\circ$、$\\angle{B}=90^\\circ$、$\\overline{BC}=9$ とする。$\\overline{AC}$ を求めよ。`,
    correct: "18",
    choices: ["18", "9", "9\\sqrt{3}", "12"],
    explain: `
### この問題の解説
正弦定理より

$$
\\frac{AC}{\\sin90^\\circ} = \\frac{BC}{\\sin30^\\circ}
$$
なので $AC=18$ です。
`,
  },
];

export const geoSineCosineLawTemplates: QuestionTemplate[] = [
  ...cosineCases.map(buildNumeric),
  ...sineChoiceCases.map(buildChoice),
  ...sineNumericCases.map(buildNumericSine),
];
