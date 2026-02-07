// src/lib/course/templates/math2/trig_identities_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texEq } from "@/lib/format/tex";

type IdentityCase = { tex: string; answer: number; explain: string };

const IDENTITIES: IdentityCase[] = [
  {
    tex: "\\sin^2\\theta + \\cos^2\\theta",
    answer: 1,
    explain: "三角比の基本恒等式より \\sin^2\\theta + \\cos^2\\theta = 1 です。",
  },
  {
    tex: "\\sin^2 0^\\circ + \\cos^2 0^\\circ",
    answer: 1,
    explain: "\\sin 0^\\circ=0, \\cos 0^\\circ=1 より 0^2+1^2=1 です。",
  },
  {
    tex: "\\sin^2 90^\\circ + \\cos^2 90^\\circ",
    answer: 1,
    explain: "\\sin 90^\\circ=1, \\cos 90^\\circ=0 より 1^2+0^2=1 です。",
  },
  {
    tex: "1+\\tan^2\\theta",
    answer: 2,
    explain: "\\theta=45^\\circ のとき \\tan\\theta=1 なので 1+\\tan^2\\theta=2 です。",
  },
  {
    tex: "1+\\tan^2 45^\\circ",
    answer: 2,
    explain: "\\tan 45^\\circ=1 より 1+\\tan^2 45^\\circ=2 です。",
  },
  {
    tex: "1+\\tan^2 60^\\circ",
    answer: 4,
    explain: "\\tan 60^\\circ=\\sqrt{3} より 1+\\tan^2 60^\\circ=1+3=4 です。",
  },
  {
    tex: "1-\\cos^2\\theta",
    answer: 0,
    explain: "\\theta=0^\\circ のとき \\cos\\theta=1 なので 1-\\cos^2\\theta=0 です。",
  },
  {
    tex: "1-\\sin^2 90^\\circ",
    answer: 0,
    explain: "\\sin 90^\\circ=1 より 1-\\sin^2 90^\\circ=0 です。",
  },
  {
    tex: "\\sin^2 30^\\circ + \\cos^2 30^\\circ",
    answer: 1,
    explain: "どの角でも \\sin^2\\theta + \\cos^2\\theta = 1 です。",
  },
  {
    tex: "1+\\tan^2 0^\\circ",
    answer: 1,
    explain: "\\tan 0^\\circ=0 より 1+\\tan^2 0^\\circ=1 です。",
  },
  {
    tex: "1-\\cos^2 90^\\circ",
    answer: 1,
    explain: "\\cos 90^\\circ=0 より 1-\\cos^2 90^\\circ=1 です。",
  },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_identities_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const idx = Math.floor(Math.random() * IDENTITIES.length);
      const c = IDENTITIES[idx];
      const statement = `次を計算せよ。\\n\\n$$${texEq(c.tex, "?")}$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params: { caseId: idx, answer: c.answer },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.answer);
    },
    explain(params) {
      const c = IDENTITIES[params.caseId] ?? IDENTITIES[0];
      return `
### この問題の解説
${c.explain}
答えは **${c.answer}** です。
`;
    },
  };
}

export const trigIdentityTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`trig_identities_basic_${i + 1}`, `三角恒等式 ${i + 1}`)
);
