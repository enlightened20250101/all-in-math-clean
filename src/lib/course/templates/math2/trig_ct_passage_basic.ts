// src/lib/course/templates/math2/trig_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  angle: 30 | 45 | 60 | 90;
  context: string;
  difficulty: 2 | 3;
};

function trigValues(angle: number) {
  switch (angle) {
    case 30:
      return { sin: 0.5, cos: Math.sqrt(3) / 2, tan: 1 / Math.sqrt(3) };
    case 45:
      return { sin: Math.sqrt(2) / 2, cos: Math.sqrt(2) / 2, tan: 1 };
    case 60:
      return { sin: Math.sqrt(3) / 2, cos: 0.5, tan: Math.sqrt(3) };
    case 90:
      return { sin: 1, cos: 0, tan: Infinity };
    default:
      return { sin: 0, cos: 1, tan: 0 };
  }
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const vals = trigValues(c.angle);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）$\\sin ${c.angle}^\\circ$ を求めよ。`,
    `（問2）$\\cos ${c.angle}^\\circ$ を求めよ。`,
    `（問3）$\\tan ${c.angle}^\\circ$ を求めよ。`,
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "trig_special_angles_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["trig", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "sin" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "cos" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "tan" },
        ],
        params: {},
      };
    },
    grade(_params, userAnswer) {
      let parsed: Record<string, string> = {};
      try {
        parsed = JSON.parse(userAnswer) as Record<string, string>;
      } catch {
        parsed = {};
      }
      const q1Result = gradeNumeric(parsed.q1 ?? "", vals.sin);
      const q2Result = gradeNumeric(parsed.q2 ?? "", vals.cos);
      const q3Result = c.angle === 90 ? { isCorrect: false } : gradeNumeric(parsed.q3 ?? "", vals.tan);
      return {
        isCorrect: c.angle === 90 ? q1Result.isCorrect && q2Result.isCorrect : q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${vals.sin} / 問2:${vals.cos} / 問3:${c.angle === 90 ? "定義なし" : vals.tan}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(vals.sin) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(vals.cos) },
          q3: { isCorrect: c.angle === 90 ? false : q3Result.isCorrect, correctAnswer: c.angle === 90 ? "定義なし" : String(vals.tan) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n特別角の値を用いる。$90^\\circ$ の $\\tan$ は定義されない。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "trig_ct_passage_1",
    title: "特別角 連問 1",
    angle: 30,
    context: "三角比の特別角の値を確認する。",
    difficulty: 2,
  },
  {
    id: "trig_ct_passage_2",
    title: "特別角 連問 2",
    angle: 60,
    context: "三角比の特別角の値を確認する。",
    difficulty: 3,
  },
];

export const trigCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
