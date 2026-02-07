// src/lib/course/templates/mathB/stats_scatter_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type ScatterCase = {
  id: string;
  title: string;
  prompt: string;
  choices: string[];
  correct: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: ScatterCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "stats_scatter_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "scatter", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.prompt,
        answerKind: "choice",
        choices: c.choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `### この問題の解説\n散布図は「向き」と「まとまり具合」で判断します。答えは **${c.correct}** です。`;
    },
  };
}

const CASES: ScatterCase[] = [
  {
    id: "stats_scatter_var_1",
    title: "相関の強さ比較 1",
    prompt:
      "次の2つの散布図データのうち、相関がより強いものを選べ。\n\nA: (1,1),(2,2),(3,3),(4,4)\nB: (1,1),(2,3),(3,2),(4,4)",
    choices: ["A", "B", "同程度"],
    correct: "A",
    difficulty: 1,
  },
  {
    id: "stats_scatter_var_2",
    title: "相関の強さ比較 2",
    prompt:
      "次の2つの散布図データのうち、相関がより強いものを選べ。\n\nA: (1,4),(2,3),(3,2),(4,1)\nB: (1,5),(2,3),(3,4),(4,2)",
    choices: ["A", "B", "同程度"],
    correct: "A",
    difficulty: 1,
  },
  {
    id: "stats_scatter_var_3",
    title: "外れ値の影響 1",
    prompt:
      "データ: (1,1),(2,2),(3,3),(4,4) に外れ値 (10,0) を追加した。相関の強さはどうなるか。",
    choices: ["強くなる", "弱くなる", "変わらない"],
    correct: "弱くなる",
    difficulty: 2,
  },
  {
    id: "stats_scatter_var_4",
    title: "外れ値の影響 2",
    prompt:
      "データ: (1,4),(2,3),(3,2),(4,1) に外れ値 (10,0) を追加した。相関の向きはどうなるか。",
    choices: ["正の相関に近づく", "負の相関のまま", "相関なしに近づく"],
    correct: "負の相関のまま",
    difficulty: 2,
  },
  {
    id: "stats_scatter_var_5",
    title: "相関の有無 1",
    prompt:
      "次のデータの散布図は相関があるといえるか。\n\n(1,2),(2,2),(3,2),(4,2)",
    choices: ["相関がある", "相関がない"],
    correct: "相関がない",
    difficulty: 1,
  },
  {
    id: "stats_scatter_var_6",
    title: "相関の有無 2",
    prompt:
      "次のデータの散布図は相関があるといえるか。\n\n(1,1),(2,2),(3,3),(4,4),(5,5)",
    choices: ["相関がある", "相関がない"],
    correct: "相関がある",
    difficulty: 1,
  },
  {
    id: "stats_scatter_var_7",
    title: "ばらつき比較",
    prompt:
      "次の2つのデータのうち、相関が弱いものを選べ。\n\nA: (1,1),(2,2),(3,3),(4,4)\nB: (1,1),(2,4),(3,2),(4,5)",
    choices: ["A", "B", "同程度"],
    correct: "B",
    difficulty: 2,
  },
  {
    id: "stats_scatter_var_8",
    title: "相関の向き判定",
    prompt:
      "次のデータの散布図の相関の向きを選べ。\n\n(1,5),(2,4),(3,3),(4,2),(5,1)",
    choices: ["正の相関", "負の相関", "相関なし"],
    correct: "負の相関",
    difficulty: 1,
  },
];

export const statsScatterVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);

