// src/lib/course/types.ts
import type { TopicId } from "./topics";

export type AnswerKind = "numeric" | "choice" | "multi_numeric" | "multi";

export type QuestionParams = Record<string, number>;

export type SubQuestion = {
  id: string;
  label: string;
  answerKind: Exclude<AnswerKind, "multi">;
  choices?: string[];
  placeholder?: string;
};

export type QuestionGenerated = {
  templateId: string;
  topicId: TopicId;
  statement: string; // Markdown + TeX
  answerKind: AnswerKind;
  params: QuestionParams;
  choices?: string[];
  subQuestions?: SubQuestion[];
  signature?: string;
};

export type GradeResult = {
  isCorrect: boolean;
  correctAnswer: string;
  partResults?: Record<string, { isCorrect: boolean; correctAnswer: string }>;
};

export type TemplateMeta = {
  id: string;                  // templateId
  topicId: TopicId;
  title: string;               // 管理用
  difficulty: 1 | 2 | 3;       // ざっくり
  tags?: string[];             // 例: ["vertex", "axis"]
  prerequisites?: TopicId[];   // 粗い依存だけ
  reviewWeight?: number;       // 復習優先度（任意）
};

export type QuestionTemplate = {
  meta: TemplateMeta;

  // 出題（paramsと本文を生成）
  generate: () => Omit<QuestionGenerated, "topicId">;

  // 採点
  grade: (params: QuestionParams, userAnswer: string) => GradeResult;

  // 問題別解説（任意：なければ null）
  explain?: (params: QuestionParams) => string | null;
};
