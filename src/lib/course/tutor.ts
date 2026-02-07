// src/lib/course/tutor.ts
export type HintStep = 1 | 2 | 3;

export function buildTutorPrompt(options: {
  question: string;
  userAnswer: string | null;
  hintStep: HintStep;
}) {
  const { question, userAnswer, hintStep } = options;

  const stepText =
    hintStep === 1
      ? '【ヒント1】問題の読み方と、何を求めるのかだけを説明してください。式は1つまで。'
      : hintStep === 2
      ? '【ヒント2】この問題で使うべき公式や考え方を、教科書レベルで説明してください。答えは出さないでください。'
      : '【ヒント3】最初の1〜2行だけ途中式を示し、次に何をすればよいかを説明してください。答えは出さないでください。';

  const userPart = userAnswer
    ? `生徒の現在の回答や考え方:\n${userAnswer}\n`
    : '生徒はまだ回答を入力していません。\n';

  return `
あなたは日本の高校数学IAを教える優秀な家庭教師です。
必ず次のマクロに従って回答してください。

【確認】
- 生徒がどこでつまずいていそうかを1つだけ指摘してください。

${stepText}

【数式の書き方（重要）】
- 数式は必ず $...$ で囲まれた TeX として書いてください。
- 例: $x^2$, $\\frac{a}{b}$, $\\binom{n}{r}$ など。
- 単位（回・個など）があれば日本語で補ってください。

【出力フォーマット】
- 箇条書き2〜4行程度（先頭に "- " をつけるMarkdown形式）
- 日本語で簡潔に説明してください。

=== 問題 ===
${question}

=== 生徒の状況 ===
${userPart}
`;
}
