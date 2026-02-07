// src/server/learning/prompts.ts
// NOTE: Drop-in replacement tailored for /learn precision upgrades.
// - Keeps backward-compat exports
// - Adds STYLE_GUIDE_JA
// - Expands SCHEMAS (EXPLAIN/HINT/EXERCISE/EXAMPLE/TEACH/NEXT/CHAT)
// - Accepts message_md in addition to text for new UI
// - Adds message builders (teach/hint/exercise/next/chat) alongside existing ones

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

/* =========================
 * 日本語スタイルガイド（System 常駐）
 * ========================= */
export const STYLE_GUIDE_JA = [
  '【日本語スタイル】',
  '・語尾は一貫して丁寧な「です・ます」調。',
  '・構成は 1) 箇条書き → 2) 式 → 3) 根拠 → 4) 最終結論（$\\\\boxed{...}$）。',
  '・数式は LaTeX。等式/不等式/途中式/代入/記号/単位はすべて TeX で表記する。',
  '・関数名は \\text ではなく \\sin, \\cos, \\tan, \\log, \\ln のようにコマンドで書く（\\text は文章に限る）。',
  '・不要な前置きや感想、過度な比喩は禁止。',
  '・不確かな場合は推測せず「不明」と明示する。',
].join('\\n');

export const CONTEXT_USAGE = [
  '【文脈使用】',
  '・直前の会話履歴（context.history）とロードマップ状況（context.roadmap）を活用し、',
  '  前の説明との連続性・現在の習熟段階・次に学ぶべきトピックに沿う内容にしてください。',
  '・前回と矛盾する表現は避け、必要なら「前回は〜でしたが今回は〜です」と補正します。',
].join('\\n');

export function makeSystem() {
  return [
    'You are an excellent math tutor for Japanese learners.',
    '出力は必ず **JSON（オブジェクト1つ）**。指示したschemaに厳密に一致させること。',
    // すべての数式を TeX 化
    '数式は **常に LaTeX** を用いること（等式・不等式・途中式・代入・数表現・単位表記を含む）。',
    '本文中に数学的記号（=, ≠, ≈, ≤, ≥, +, −, ×, ÷, ∑, ∫, lim など）が出る場合は、必ず `$...$` または `$$...$$` で囲む。',
    '最終出力前に自己検証（$/$対応・\\\\begin/\\\\end 対応・TeXでない式の有無）を行い、必要なら自動修正してから出力すること。',
    '自己検証では、(1) $ と $$ の個数が偶数で対応、(2) \\\\begin{...} と \\\\end{...} の対応、(3) 不正なコマンド（例: "\\\\ ext", "egin"）が無いことを確認する。',
    '出力の最終段で文末を丁寧な「です・ます」調に統一する。',
    CONTEXT_USAGE,
    STYLE_GUIDE_JA,
  ].join('\\n');
}

/* =========================
 * SCHEMAS（後方互換＋新UI対応）
 * ========================= */

export const SCHEMA_EXERCISE = [
  '【exercise JSON schema】',
  'type: "exercise", difficulty: "easy"|"medium"|"hard",',
  'items: [{ id:string, prompt:string, answer:string }, ...]  // answerは必ず文字列で',
  'hint: string[]  // 段階ヒント。最低1つ以上（最大3つ）。最後のヒントでも解答は直接言わない。',
  'topics?: string[]  // 例: ["極限","指数関数","三角関数"]',
  'methods?: string[] // 例: ["置換積分","部分積分","数学的帰納法"]',
  'count?: number',
  'prefs?: { difficulty:number; rigor:number; practiceAmount:number }',
].join('\\n');

export const SCHEMA_EXPLAIN = [
  '【explain JSON schema】',
  'type: "explain",',
  'text?: string,            // 後方互換: 本文（TeX可）',
  'message_md?: string,      // 新UI: Markdown+TeX の本文（text と同義。どちらか片方でOK）',
  'links?: Array<{title:string; slug?:string}>',
  'prefs?: { detailLevel:number; difficulty:number; rigor:number; languageLevel:number }',
  '// 要件: 140〜260字（detailLevel>=7 なら 260〜420字まで許可）。冒頭に箇条書き→式→根拠→$\\\\boxed{結論}$。',
  ' // - 文末は「です・ます」調に統一。',
  ' // - 直前の文脈/ロードマップに沿う内容にする（CONTEXT_USAGE参照）。',
].join('\\n');

export const SCHEMA_HINT = [
  '【hint JSON schema】',
  'type: "hint", exerciseId?:string,',
  'hint: string | string[],  // 2〜3段階の箇条書きでヒント。解答は言わない。',
  'message_md?: string       // 新UI: ヒントをMarkdownで返す場合はこちら（hint とどちらか片方で可）',
  ' // 文末は「です・ます」調。直前の誤り・進捗を踏まえた指示にする。',
].join('\\n');

export const SCHEMA_EXAMPLE = [
  '【example JSON schema】',
  'type: "example",',
  'prompt: string,',
  'solution: string  // 途中式は簡潔。最後は \\\\boxed{...}。',
].join('\\n');

export const SCHEMA_NEXT = [
  '【next JSON schema】',
  'type: "next",',
  'topic: string,   // 次に進むべきトピックのスラッグ/見出し',
  'why: string      // その理由を簡潔に（TeX可）',
].join('\\n');

export const SCHEMA_TEACH = [
  '【teach JSON schema】',
  'type:"teach",',
  'sections: Array<{ key:string; title:string; body:string }>,',
  'examples: Array<{ prompt:string; solution:string }>,',
  'exercises: Array<{ id:string; prompt:string; answer:string; hint:string[] }>,',
  'nextCandidates: Array<{ key:string; title:string }>,',
  'prefs?: { detailLevel:number; rigor:number }',
  '// body/solution 内の数式は必ず TeX。必要に応じて message_md を併記してもよい。',
  ' // 各 body は「です・ます」調、直前の説明と矛盾しないように補正。',
  ' // 可能なら message_md を併記してもよい。',
].join('\\n');

export const SCHEMA_CHAT = [
  '【chat JSON schema】',
  'type:"chat",',
  'text?:string,',
  'message_md?:string,     // 新UI: Markdown+TeX 本文',
  'links?: Array<{title:string; slug?:string}>',
  'prefs?: { detailLevel:number; languageLevel:number; rigor:number }',
  ' // 短答でも文末は「です・ます」調に統一。',
].join('\\n');

/* =========================
 * Message Builders
 * ========================= */

// 既存：check（MVP用・機械採点UI向け）
export function createCheckMessages(args: {
  system: string;
  exercise: { exerciseId: string; items: { id: string; prompt: string; answer: string }[] };
  user: { userAnswerText?: string; userAnswersMap?: Record<string, string> };
}) {
  const { system, exercise, user } = args;
  const { items } = exercise;
  return [
    { role: 'system', content: system },
    { role: 'system', content: [
      '返答は必ず JSON（type:"check"）。',
      'schema: { type:"check", score:0|1, solutions:{id,expected}[], userAnswers:{id,value}[], feedback:string }',
    ].join('\\n') },
    {
      role: 'user',
      content: JSON.stringify({
        intent: 'check',
        exerciseId: exercise.exerciseId,
        solutions: items.map((it) => ({ id: it.id, expected: it.answer })),
        userAnswers: Object.entries(user.userAnswersMap ?? {}).map(([id, value]) => ({ id, value })),
        requirements: [
          '必ず JSON を返す',
          'solutions に各設問の正解（expected）を必ず含める（exercise.items[].answer をそのまま写す）',
          'userAnswers も {id,value}[] でそのまま写す',
          'feedback は日本語で簡潔に（誤り箇所→修正指針→次の一手 の順で 120字以内）',
          'score は 0 か 1（全体の出来の指標・MVP）',
        ],
        language: 'ja',
      }),
    },
  ] as ChatMessage[];
}

// 既存：explain（強化版）
export function createExplainMessages(args: {
  system: string;
  topic: string;
  userNote?: string;
  prefs?: { detailLevel?: number; rigor?: number; languageLevel?: number };
}) {
  const { system, topic, userNote, prefs } = args;
  return [
    { role: 'system', content: system },
    { role: 'system', content: SCHEMA_EXPLAIN },
    { role: 'system', content: CONTEXT_USAGE },
    {
      role: 'user',
      content: JSON.stringify({
        intent: 'explain',
        topic,
        userNote,
        prefs,
        requirements: [
          'text または message_md のどちらかを必ず返す（両方でも可）。',
          '140〜260字（detailLevel>=7 は 260〜420字まで）。日本語の箇条書き→式→根拠→\\\\boxed{結論}。',
          '文末は「です・ます」調に統一し、直前の会話/ロードマップと整合する内容にする。',
          '不要な前置きや比喩は禁止。'
        ],
        language: 'ja',
      }),
    },
  ] as ChatMessage[];
}

// 新規：teach
export function createTeachMessages(args: {
  system: string;
  sectionsSeed: Array<{ key:string; title:string; note?:string }>;
  prefs?: { detailLevel?: number; rigor?: number };
}) {
  const { system, sectionsSeed, prefs } = args;
  return [
    { role: 'system', content: system },
    { role: 'system', content: SCHEMA_TEACH },
    {
      role: 'user',
      content: JSON.stringify({
        intent: 'teach',
        sectionsSeed,
        prefs,
        requirements: [
          '必ず JSON で返す（teach schema 準拠）。',
          'sections[].body, examples[].solution, exercises[].answer は TeX を含むことがある。',
          'ヒントは 1〜3 個、解答を直接書かない。'
        ],
        language: 'ja',
      }),
    },
  ] as ChatMessage[];
}

// 新規：hint
export function createHintMessages(args: {
  system: string;
  exerciseId?: string;
  userNote?: string;
}) {
  const { system, exerciseId, userNote } = args;
  return [
    { role: 'system', content: system },
    { role: 'system', content: SCHEMA_HINT },
    {
      role: 'user',
      content: JSON.stringify({
        intent: 'hint',
        exerciseId,
        userNote,
        requirements: [
          '解答は直接言わない。2〜3段階の箇条書きでヒント。',
          'JSON の hint または message_md のどちらかで返す。'
        ],
        language: 'ja',
      }),
    },
  ] as ChatMessage[];
}

// 新規：exercise（問題生成）
export function createExerciseMessages(args: {
  system: string;
  topic: string;
  count?: number;
  prefs?: { difficulty?: number; rigor?: number; practiceAmount?: number };
}) {
  const { system, topic, count, prefs } = args;
  return [
    { role: 'system', content: system },
    { role: 'system', content: SCHEMA_EXERCISE },
    {
      role: 'user',
      content: JSON.stringify({
        intent: 'exercise',
        topic,
        count,
        prefs,
        requirements: [
          'items[].answer は必ず **文字列**。分数/無理数/式はTeXで表記。',
          'ヒントは 1〜3 個。'
        ],
        language: 'ja',
      }),
    },
  ] as ChatMessage[];
}

// 新規：next（次トピック提案）
export function createNextMessages(args: {
  system: string;
  currentTopic?: string;
  weaknessNote?: string;
}) {
  const { system, currentTopic, weaknessNote } = args;
  return [
    { role: 'system', content: system },
    { role: 'system', content: SCHEMA_NEXT },
    {
      role: 'user',
      content: JSON.stringify({
        intent: 'next',
        currentTopic, weaknessNote,
        requirements: [
          'topic と why を必ず含める。',
          'why には「誤りの傾向」や「必要な前提スキル」などの根拠を書く（TeX可）。'
        ],
        language: 'ja',
      }),
    },
  ] as ChatMessage[];
}

// 新規：chat（雑談/短答）
export function createChatMessages(args: {
  system: string;
  text: string;
  prefs?: { detailLevel?: number; languageLevel?: number; rigor?: number };
}) {
  const { system, text, prefs } = args;
  return [
    { role: 'system', content: system },
    { role: 'system', content: SCHEMA_CHAT },
    {
      role: 'user',
      content: JSON.stringify({
        intent: 'chat',
        text, prefs,
        requirements: [
          'text または message_md のどちらかを返す。',
          '冗長な前置きを避け、数式はすべて TeX で。'
        ],
        language: 'ja',
      }),
    },
  ] as ChatMessage[];
}
