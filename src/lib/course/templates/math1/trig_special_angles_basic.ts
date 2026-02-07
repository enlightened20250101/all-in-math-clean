// src/lib/course/templates/math1/trig_special_angles_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick } from "../_shared/utils";

type Func = "sin" | "cos" | "tan";
type Angle = 0 | 30 | 45 | 60 | 90;

type Case = {
  func: Func;
  angle: Angle;
  value: string;
};

const VALUE_POOL = [
  "\\frac{1}{2}",
  "\\frac{\\sqrt{3}}{2}",
  "\\frac{\\sqrt{2}}{2}",
  "0",
  "1",
  "\\sqrt{3}",
  "\\frac{\\sqrt{3}}{3}",
];

const CASES: Case[] = [
  { func: "sin", angle: 30, value: "\\frac{1}{2}" },
  { func: "cos", angle: 30, value: "\\frac{\\sqrt{3}}{2}" },
  { func: "tan", angle: 30, value: "\\frac{\\sqrt{3}}{3}" },
  { func: "sin", angle: 45, value: "\\frac{\\sqrt{2}}{2}" },
  { func: "cos", angle: 45, value: "\\frac{\\sqrt{2}}{2}" },
  { func: "tan", angle: 45, value: "1" },
  { func: "sin", angle: 60, value: "\\frac{\\sqrt{3}}{2}" },
  { func: "cos", angle: 60, value: "\\frac{1}{2}" },
  { func: "tan", angle: 60, value: "\\sqrt{3}" },
  { func: "sin", angle: 0, value: "0" },
  { func: "cos", angle: 0, value: "1" },
  { func: "tan", angle: 0, value: "0" },
  { func: "sin", angle: 90, value: "1" },
  { func: "cos", angle: 90, value: "0" },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function choicesFor(value: string): string[] {
  const pool = VALUE_POOL.filter((v) => v !== value);
  const picks = shuffle(pool).slice(0, 3);
  return shuffle([value, ...picks]);
}

function buildTemplate(id: string, title: string, c: Case): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_special_angles_basic",
      title,
      difficulty: 1,
      tags: ["trig", "special-angle", c.func],
    },
    generate() {
      const choices = choicesFor(c.value);
      return {
        templateId: id,
        statement: `$\\${c.func} ${c.angle}^\\circ$ の値を求めよ。`,
        answerKind: "choice",
        choices,
        params: { funcIndex: ["sin", "cos", "tan"].indexOf(c.func), angle: c.angle },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.value, correctAnswer: c.value };
    },
    explain() {
      return `
### この問題の解説
特殊角の三角比の暗記表を使います。

$$
\\${c.func} ${c.angle}^\\circ = ${c.value}
$$
`;
    },
  };
}

export const trigSpecialAnglesTemplates: QuestionTemplate[] = [
  buildTemplate("trig_special_1", "特殊角 1", CASES[0]),
  buildTemplate("trig_special_2", "特殊角 2", CASES[1]),
  buildTemplate("trig_special_3", "特殊角 3", CASES[2]),
  buildTemplate("trig_special_4", "特殊角 4", CASES[3]),
  buildTemplate("trig_special_5", "特殊角 5", CASES[4]),
  buildTemplate("trig_special_6", "特殊角 6", CASES[5]),
  buildTemplate("trig_special_7", "特殊角 7", CASES[6]),
  buildTemplate("trig_special_8", "特殊角 8", CASES[7]),
  buildTemplate("trig_special_9", "特殊角 9", CASES[8]),
  buildTemplate("trig_special_10", "特殊角 10", CASES[9]),
  buildTemplate("trig_special_11", "特殊角 11", CASES[10]),
  buildTemplate("trig_special_12", "特殊角 12", CASES[11]),
  buildTemplate("trig_special_13", "特殊角 13", CASES[12]),
  buildTemplate("trig_special_14", "特殊角 14", CASES[13]),
  buildTemplate("trig_special_15", "特殊角 15", CASES[0]),
  buildTemplate("trig_special_16", "特殊角 16", CASES[2]),
  buildTemplate("trig_special_17", "特殊角 17", CASES[4]),
  buildTemplate("trig_special_18", "特殊角 18", CASES[6]),
  buildTemplate("trig_special_19", "特殊角 19", CASES[8]),
  buildTemplate("trig_special_20", "特殊角 20", CASES[10]),
  buildTemplate("trig_special_21", "特殊角 21", CASES[12]),
  buildTemplate("trig_special_22", "特殊角 22", CASES[13]),
  buildTemplate("trig_special_23", "特殊角 23", CASES[1]),
  buildTemplate("trig_special_24", "特殊角 24", CASES[3]),
  buildTemplate("trig_special_25", "特殊角 25", CASES[5]),
  buildTemplate("trig_special_26", "特殊角 26", CASES[7]),
  buildTemplate("trig_special_27", "特殊角 27", CASES[9]),
  buildTemplate("trig_special_28", "特殊角 28", CASES[11]),
  buildTemplate("trig_special_29", "特殊角 29", CASES[0]),
  buildTemplate("trig_special_30", "特殊角 30", CASES[2]),
  buildTemplate("trig_special_31", "特殊角 31", CASES[4]),
  buildTemplate("trig_special_32", "特殊角 32", CASES[6]),
  buildTemplate("trig_special_33", "特殊角 33", CASES[8]),
  buildTemplate("trig_special_34", "特殊角 34", CASES[10]),
  buildTemplate("trig_special_35", "特殊角 35", CASES[12]),
  buildTemplate("trig_special_36", "特殊角 36", CASES[13]),
  buildTemplate("trig_special_37", "特殊角 37", CASES[1]),
  buildTemplate("trig_special_38", "特殊角 38", CASES[3]),
  buildTemplate("trig_special_39", "特殊角 39", CASES[5]),
  buildTemplate("trig_special_40", "特殊角 40", CASES[7]),
  buildTemplate("trig_special_41", "特殊角 41", CASES[9]),
  buildTemplate("trig_special_42", "特殊角 42", CASES[11]),
  buildTemplate("trig_special_43", "特殊角 43", CASES[0]),
  buildTemplate("trig_special_44", "特殊角 44", CASES[2]),
  buildTemplate("trig_special_45", "特殊角 45", CASES[4]),
  buildTemplate("trig_special_46", "特殊角 46", CASES[6]),
  buildTemplate("trig_special_47", "特殊角 47", CASES[8]),
  buildTemplate("trig_special_48", "特殊角 48", CASES[10]),
  buildTemplate("trig_special_49", "特殊角 49", CASES[12]),
  buildTemplate("trig_special_50", "特殊角 50", CASES[13]),
  buildTemplate("trig_special_51", "特殊角 51", CASES[2]),
  buildTemplate("trig_special_52", "特殊角 52", CASES[6]),
];
