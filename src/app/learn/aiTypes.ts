// src/app/learn/aiTypes.ts
import { z } from 'zod';
import type { VizSpec } from '@/lib/vizSpec';

/* -------------------------------------------------------
 * Shared enums / small types（既存）
 * ----------------------------------------------------- */
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Verdict = 'correct' | 'partial' | 'wrong';

export type Link = { title: string; slug?: string; href?: string };

/* -------------------------------------------------------
 * Steps grading（既存）
 * ----------------------------------------------------- */
export type StepGradingItem = {
  ok: boolean;
  kind: string;           // 'expression' | 'equation' | 'inequality' | 'diff' | 'int' | 'eq_forward' | 'eq_backward' | ...
  error?: string;         // 例外があれば
};

export type StepsDetail = {
  id: string;             // exercise item id
  steps: StepGradingItem[];
};

/* -------------------------------------------------------
 * Machine check（既存）
 * ----------------------------------------------------- */
export type MachineCheckItem = {
  id: string;
  ok: boolean;
  type: string | null;    // verify type; e.g., 'derivative' | 'equation' | ...
  payload: unknown;       // math-verify に投げた payload
  result?: unknown;       // math-verify のレスポンス（{ ok, computed_latex, ... } など）
  error?: string;
};

export type MachineCheck = {
  ok: boolean;            // 全問正解か
  items: MachineCheckItem[];
  summary: { correct: number; total: number };
};

/* -------------------------------------------------------
 * Input schemas（既存：Legacy / Rich）
 * ----------------------------------------------------- */

// 旧来の軽量入力（互換用）
export const LegacyTutorTurnIn = z.object({
  sessionId: z.number().optional(),
  intent: z.enum([
    'diagnose', 'explain', 'example', 'exercise', 'hint', 'check', 'next', 'teach', 'chat',
  ]),
  topic: z.string().optional(),
  context: z.object({
    userAnswer: z.string().optional(),
    exerciseId: z.string().optional(),
    difficulty: z.enum(['auto', 'easy', 'medium', 'hard']).default('auto').optional(),
  }).optional(),
});
export type LegacyTutorTurnInput = z.infer<typeof LegacyTutorTurnIn>;

// 現行サーバ（runTutorTurnServer）が実際に扱うリッチ入力
export const TutorTurnIn = z.object({
  intent: z.enum([
    'diagnose', 'explain', 'example', 'exercise', 'hint', 'check', 'next', 'teach', 'chat',
  ]),
  text: z.string().optional(),
  topic: z.string().optional(),
  topics: z.array(z.string()).optional(),
  methods: z.array(z.string()).optional(),
  count: z.number().optional(),
  // exercise payload（items は最低 id/prompt）
  exercise: z.object({
    exerciseId: z.string(),
    items: z.array(z.object({
      id: z.string(),
      prompt: z.string().optional(),
      answer: z.string().optional(),
      // 任意メタ（skillId / 生成系のフィールド）
      skillId: z.string().optional(),
      // 数式系の代表的キー（verify payload 構築側が拾う）
      funcLatex: z.string().optional(),
      variable: z.string().optional(),
      lhs: z.string().optional(),
      rhs: z.string().optional(),
      equation: z.string().optional(),
      summand: z.string().optional(),
      index: z.string().optional(),
      lower: z.string().optional(),
      upper: z.string().optional(),
      term: z.string().optional(),
      a: z.any().optional(),
      b: z.any().optional(),
      mat: z.any().optional(),
    })),
  }).optional(),
  // user answers（map で itemId → value）
  user: z.object({
    userAnswerText: z.string().optional(),
    userAnswersMap: z.record(z.string()).optional(), // value は string だが {final,steps} の JSON 文字列も許容
  }).optional(),
  // 学習プリファレンス
  prefs: z.object({
    detailLevel: z.number().optional(),
    difficulty: z.number().optional(),
    practiceAmount: z.number().optional(),
    rigor: z.number().optional(),
    speed: z.number().optional(),
    languageLevel: z.number().optional(),
  }).optional(),
});
export type TutorTurnInput = z.infer<typeof TutorTurnIn>;

/* -------------------------------------------------------
 * Output union（既存：サーバ返却の従来フォーマット）
 * ----------------------------------------------------- */

export type DiagnoseOutput = {
  type: 'diagnose';
  level: 'HS' | 'UG' | 'ADV';
  mastery: number;           // 0..1
  notes: string;
  links?: Link;
} & Partial<{ links: Link[] }>;

export type ExplainOutput = {
  type: 'explain';
  text: string;              // 本文（TeX 混在可）
  links?: Link[];
};

export type ExampleOutput = {
  type: 'example';
  prompt: string;
  solution: string;
  links?: Link[];
};

export type ExerciseItem = {
  id: string;
  prompt: string;
  // 生成済みの模範解答（あれば）
  answer?: string;
};
export type ExerciseOutput = {
  type: 'exercise';
  exerciseId: string;
  difficulty: Difficulty;
  items: ExerciseItem[];
  hint?: string;
  links?: Link[];
};

export type HintOutput = {
  type: 'hint';
  exerciseId: string;
  hint: string;
  links?: Link[];
};

export type CheckSolution = { id: string; expected: string };
export type CheckUserAnswer = { id: string; value: string };

export type CheckOutput = {
  type: 'check';
  exerciseId?: string;
  // 合計スコア（整数 + 部分点で 0.5 刻み可）
  score: number;
  // 期待解とユーザー解
  solutions: CheckSolution[];
  userAnswers: CheckUserAnswer[];
  // フィードバックメッセージ（簡易）
  feedback: string;
  // 判定の要約
  verdict: Verdict;
  // 機械採点の詳細（math-verify）
  machine_check: MachineCheck;
  // ステップ採点の詳細（あれば）
  steps_detail?: StepsDetail[];
  // 次の難易度（あれば）
  nextDifficulty?: Difficulty;
  // 参考リンク
  links?: Link[];
};

export type NextOutput = {
  type: 'next';
  topic: string;        // 次に学ぶべきトピック/スキル
  why: string;          // 根拠（誤答の傾向など）
  links?: Link[];
};

export type TeachOutput = {
  type: 'teach';
  text: string;         // 解説・手順
  steps?: string[];     // 箇条書きの学習手順
  links?: Link[];
};

export type ChatOutput = {
  type: 'chat';
  text: string;
  links?: Link[];
};

export type PaywallOutput = {
  type: 'paywall';
  message: string;
};

/** すべての出力の合併型（実装はこれを返す） */
export type TutorTurnOutput =
  | DiagnoseOutput
  | ExplainOutput
  | ExampleOutput
  | ExerciseOutput
  | HintOutput
  | CheckOutput
  | NextOutput
  | TeachOutput
  | ChatOutput
  | PaywallOutput;

/* -------------------------------------------------------
 * 新規追記：段階的開示 UI 用の“構造化返答タイプ”
 *  - TeachView の新UIで使用
 *  - サーバは従来出力に加えて、こちらを返してもOK
 * ----------------------------------------------------- */

export type TutorKind =
  | 'hint'
  | 'explain'
  | 'solution'
  | 'check'
  | 'diagram'
  | 'quiz'
  | 'curriculum_feedback';

export type TutorAction =
  | 'show_more'           // 詳しく
  | 'show_full_solution'  // 解法を表示
  | 'draw_diagram'        // 図を表示
  | 'ask_leading_question'
  | 'ask_answer'
  | 'schedule_review'
  | 'next_problem';

export type TutorCite = { title: string; ref?: string };

export type TutorMsg =
  | {
      id: string;
      kind: 'diagram';
      detail_level?: 1 | 2 | 3;
      diagram: VizSpec;
      actions?: TutorAction[];
      cites?: TutorCite[];
    }
  | {
      id: string;
      kind: Exclude<TutorKind, 'diagram'>;
      detail_level?: 1 | 2 | 3;
      message_md?: string;        // Markdown + LaTeX
      actions?: TutorAction[];
      cites?: TutorCite[];
      diagram?: VizSpec;          // 併設図
      quiz?: {
        question_md: string;
        choices?: string[];
      };
    };

/** UI から Tutor へ送る「次のアクション」 */
export type TutorNextRequest = {
  sessionId?: string;
  lastMsgId?: string;
  action: TutorAction;
  detail_level?: 1 | 2 | 3;
  user_answer_md?: string;
  want_diagram?: boolean;
  /** ユーザープリファレンス（出力の長さ/難易度/厳密さ/言語レベル） */
  prefs?: {
    detailLevel?: number;     // 1=要点, 2=標準, 3=丁寧 (UIは1..3で扱う)
    difficulty?: number;      // 1..5（簡→難）
    rigor?: number;           // 1..10（説明の厳密さ）
    languageLevel?: number;   // 1..10（日本語の難易度）
  };
  /** 分岐用：過去カードから続けるときのアンカー情報 */
  anchor?: {
    id: string;
    text?: string;            // そのカードの message_md を渡す
  };
};

/** Tutor からの応答（UI で追加表示するメッセージ群） */
export type TutorNextResponse =
  | { ok: true; messages: TutorMsg[] }
  | { ok: false; error: string };

/* -------------------------------------------------------
 * 旧ファイル互換メモ
 * ----------------------------------------------------- */
// 以前の 'correct:boolean' が必要なら、(o: TutorTurnOutput).type==='check' のとき
// `o.machine_check.ok` または `o.verdict==='correct'` を参照するのが安全。
