// src/server/rag/search.ts
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
};

export async function fetchRagChunks({ skillId, objective }: { skillId: string; objective?: string }) {
  const supabase = getSupabase();
  if (!supabase) return [];

  // ベクトル検索 + キーワード絞り（skill_id単位で）
  const q = (objective ?? '').slice(0, 120);
  const { data, error } = await supabase.rpc('rag_search_by_skill', {
    p_skill_id: skillId,
    p_query: q
  });
  if (error) throw error;
  // 返却は {id, text, section_id, score}
  // 同一sectionからは1-2個だけ取る（冗長回避）
  const bySection = new Map<string, any[]>();
  for (const row of data as any[]) {
    const arr = bySection.get(row.section_id) ?? [];
    if (arr.length < 2) arr.push(row);
    bySection.set(row.section_id, arr);
  }
  return Array.from(bySection.values()).flat().slice(0, 8);
}

export async function search(query: string, opts?: { k?: number; skillId?: string }) {
  const skillId = opts?.skillId;
  if (!skillId) {
    return { hits: [] as Array<{ content: string; summary?: string }> };
  }
  const chunks = await fetchRagChunks({ skillId, objective: query });
  const k = opts?.k ?? chunks.length;
  const hits = chunks.slice(0, k).map((row: any) => ({
    content: String(row.text ?? ""),
    summary: String(row.text ?? ""),
    score: row.score ?? null,
  }));
  return { hits };
}
