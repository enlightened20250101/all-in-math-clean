// src/lib/zod-schemas.ts
import { z } from "zod";


export const CritiqueSchema = z.object({
  issues: z.array(z.string()),                 // 必須
  severity: z.enum(["minor", "major"]),        // 必須
  patch: z.any().optional().nullable(),        // ← 任意に（基本は使わない）
});

export const MachineCheckSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("derivative"), expr: z.string(), var: z.string(), expected: z.string() }),
  z.object({ type: z.literal("equation"),  lhs: z.string(), rhs: z.string(), var: z.string() }),
  z.object({ type: z.literal("roots"),     equation: z.string(), var: z.string(), solutions: z.array(z.string()) }),
  // 追加 ↓
  z.object({ type: z.literal("integral"),  integrand: z.string(), var: z.string(), expected: z.string() }),
  z.object({
    type: z.literal("roots_system"),
    equations: z.array(z.string()).min(2),
    vars: z.array(z.string()).min(2).max(3),
    solution: z.array(z.string()).min(2).max(3),
  }),
]);


export const ProblemSchema = z.object({
  skill_id: z.string(),
  difficulty: z.number().int().min(1).max(5),
  problem_latex: z.string(),
  answer_latex: z.string(),
  hint_steps: z.array(z.string()).min(1),
  machine_check: MachineCheckSchema,     // ← 追加
});

export const TutorialSchema = z.object({
  title: z.string(),
  learning_objectives: z.array(z.string()).min(1).max(3),
  sections: z.array(
    z.object({
      heading: z.string(),
      content_latex: z.string(),
      common_misconceptions: z.array(z.string()),   // ← optional をやめて必須に（空配列で可）
    })
  ).min(3).max(5),
});

