// src/lib/course/templates/math2/coord_distance_point_line_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  statement: string;
  answer: number;
  explain: string;
};

function buildTemplate(c: Case): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "coord_distance_point_line_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
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

const CASES: Case[] = [
  {
    id: "coord_dist_v1",
    title: "点と直線の距離（3-4-5）1",
    statement: `直線 $3x+4y=0$ と点 $(3,4)$ の距離を求めよ。`,
    answer: 5,
    explain: `距離は $\\frac{|3\\cdot3+4\\cdot4|}{5}=\\frac{25}{5}=5$。`,
  },
  {
    id: "coord_dist_v2",
    title: "点と直線の距離（3-4-5）2",
    statement: `直線 $3x+4y-25=0$ と点 $(0,0)$ の距離を求めよ。`,
    answer: 5,
    explain: `距離は $\\frac{|0+0-25|}{5}=5$。`,
  },
  {
    id: "coord_dist_v3",
    title: "点と直線の距離（5-12-13）1",
    statement: `直線 $5x+12y-26=0$ と点 $(0,0)$ の距離を求めよ。`,
    answer: 2,
    explain: `距離は $\\frac{|0+0-26|}{13}=2$。`,
  },
  {
    id: "coord_dist_v4",
    title: "点と直線の距離（5-12-13）2",
    statement: `直線 $5x+12y-39=0$ と点 $(0,0)$ の距離を求めよ。`,
    answer: 3,
    explain: `距離は $\\frac{|0+0-39|}{13}=3$。`,
  },
];

export const coordDistancePointLineVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
