import { callJSONWithSchema } from '@/server/learning/llm';
import { CritiqueSchema } from '@/lib/zod-schemas';
import { CritiqueJSONSchema } from '@/lib/jsonschemas';

export type Critique = {
  issues: string[];
  severity: 'minor'|'major';
  patch?: any | null;
};

export async function critiqueProblem(problem: any): Promise<Critique> {
  const sys = 'You are a strict math item reviewer. Return JSON matching schema. ' +
              'List issues precisely. Do NOT propose patches.';
  const rubric = {
    difficulty_alignment: true,
    solution_steps_completeness: true,
    common_error_coverage: true,
    uniqueness_of_solution: true,
    numerical_sanity: true,
  };
  const user = JSON.stringify({ rubric, problem });

  const txt = await callJSONWithSchema({
    model: 'gpt-4.1-mini',
    system: sys,
    user,
    jsonSchema: CritiqueJSONSchema,
    schemaName: 'Critique',
    temperature: 0,
    maxTokens: 800,
  });

  return CritiqueSchema.parse(JSON.parse(txt));
}

// ← パッチは適用しない（生成側で自動補正する方針）
export async function critiqueLoop(problem: any, _maxRounds = 1) {
  try { await critiqueProblem(problem); } catch {}
  return problem;
}
