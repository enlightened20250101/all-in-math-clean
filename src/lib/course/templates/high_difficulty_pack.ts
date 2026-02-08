// src/lib/course/templates/high_difficulty_pack.ts
import type { QuestionTemplate } from "../types";
import { gradeChoice, gradeNumeric } from "./_shared/utils";

export const highDifficultyTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "hd_quad_inequality_param_1",
      topicId: "quad_inequality_basic",
      title: "パラメータと判別式（難）",
      difficulty: 3,
      tags: ["parameter", "discriminant"],
    },
    generate() {
      const correct = "\\frac{1-\\sqrt{13}}{2}\\le a\\le \\frac{1+\\sqrt{13}}{2}";
      return {
        templateId: "hd_quad_inequality_param_1",
        statement:
          "実数 $a$ について、不等式 $x^2-2ax+a+3\\ge 0$ が全ての実数 $x$ で成り立つような $a$ の範囲を選べ。",
        answerKind: "choice",
        choices: [
          correct,
          "a\\le \\frac{1-\\sqrt{13}}{2}",
          "a\\ge \\frac{1+\\sqrt{13}}{2}",
          "\\frac{1-\\sqrt{13}}{2}\\le a",
        ],
        params: {},
      };
    },
    grade(_params, userAnswer) {
      const correct = "\\frac{1-\\sqrt{13}}{2}\\le a\\le \\frac{1+\\sqrt{13}}{2}";
      return gradeChoice(userAnswer, correct);
    },
  },
  {
    meta: {
      id: "hd_combi_condition_1",
      topicId: "combi_conditions_basic",
      title: "条件付き組合せ（難）",
      difficulty: 3,
      tags: ["combi", "restriction"],
    },
    generate() {
      return {
        templateId: "hd_combi_condition_1",
        statement:
          "男子6人・女子4人の中から4人を選ぶ。女子が少なくとも2人含まれる選び方の総数を求めよ。",
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, 115);
    },
  },
  {
    meta: {
      id: "hd_exp_log_equation_1",
      topicId: "exp_log_equations_basic",
      title: "対数方程式（難）",
      difficulty: 3,
      tags: ["log", "domain"],
    },
    generate() {
      return {
        templateId: "hd_exp_log_equation_1",
        statement:
          "方程式 $\\log_2(x-1)+\\log_2(x-3)=3$ を解け。",
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, 5);
    },
  },
  {
    meta: {
      id: "hd_sequence_recurrence_1",
      topicId: "sequence_recurrence_basic",
      title: "漸化式（難）",
      difficulty: 3,
      tags: ["recurrence"],
    },
    generate() {
      return {
        templateId: "hd_sequence_recurrence_1",
        statement:
          "数列 $a_{n+1}=2a_n+n$、$a_1=1$ とする。$a_5$ を求めよ。",
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, 42);
    },
  },
  {
    meta: {
      id: "hd_calc_abs_area_1",
      topicId: "calc_integral_advanced_basic",
      title: "絶対値の面積（難）",
      difficulty: 3,
      tags: ["integral", "absolute"],
    },
    generate() {
      return {
        templateId: "hd_calc_abs_area_1",
        statement:
          "次の面積を求めよ。$$\\int_{-1}^{2} |x^2-1|\\,dx$$",
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, 8 / 3);
    },
  },
  {
    meta: {
      id: "hd_vector_plane_distance_1",
      topicId: "vector_plane_basic",
      title: "点と平面の距離（難）",
      difficulty: 3,
      tags: ["vector", "distance"],
    },
    generate() {
      return {
        templateId: "hd_vector_plane_distance_1",
        statement:
          "点 $P(1,2,3)$ と平面 $x+2y-2z=4$ の距離を求めよ。",
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, 5 / 3);
    },
  },
];
