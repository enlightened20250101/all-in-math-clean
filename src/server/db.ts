// src/server/db.ts
import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 環境変数
 * - NEXT_PUBLIC_SUPABASE_URL:      公開OK（クライアントでも使うURL）
 * - SUPABASE_SERVICE_ROLE_KEY:     サーバ専用のService Role（RLSバイパス）
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const hasSupabase = !!(URL && SERVICE_KEY);

let supabase: SupabaseClient | null = null;
if (hasSupabase) {
  supabase = createClient(URL, SERVICE_KEY, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'math-community-server' } },
  });
} else {
  console.warn('[db] Supabase is not configured. Using in-memory fallbacks.');
}

/** ***************
 * 型（最低限）
 ******************/
export type AbilityRow = { user_id: string; theta: number; created_at: string };
export type ItemRow = {
  id: string;
  skill_id: string;
  beta: number;         // 出題難度（Eloのβ）
  difficulty: number;   // 目安1-5
};
export type RepetitionRow = {
  user_id: string;
  item_id: string;
  interval_days: number;
  last_seen: string;
};

export type GeneratedProblemRow = {
  id: string;
  user_id: string | null;
  skill_id: string | null;
  difficulty: number | null;
  payload: any; // jsonb
  created_at: string;
};

/** ***************
 * 便利ユーティリティ
 ******************/
function nowIso() {
  return new Date().toISOString();
}

/** ***************
 * 実DB or モックの実装
 ******************/
export const db = {
  ability_history: {
    /**
     * 指定ユーザーの最新θ（能力推定）を取得
     */
    async findLatest(userId: string): Promise<AbilityRow | null> {
      if (!supabase) {
        return { user_id: userId, theta: 0, created_at: nowIso() };
      }
      const { data, error } = await supabase
        .from('ability_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) {
        console.warn('[db.ability_history.findLatest] error:', error.message);
        return null;
      }
      if (!data || data.length === 0) return null;
      return data[0] as AbilityRow;
    },

    /**
     * 新しいθレコードを追加（任意）
     */
    async insert(userId: string, theta: number) {
      if (!supabase) return;
      const { error } = await supabase.from('ability_history').insert({
        user_id: userId,
        theta,
        created_at: nowIso(),
      });
      if (error) console.warn('[db.ability_history.insert] error:', error.message);
    },
  },

  items: {
    /**
     * 候補アイテムの取得（ユーザーと任意のスキルIDで絞り込み）
     * 実運用では「未出題」「期限切れの復習」などの条件を加えてOK
     */
    async findCandidates({ userId, skillId }: { userId: string; skillId?: string }): Promise<ItemRow[]> {
      if (!supabase) {
        // モック（最低1件は返す）
        const sid = skillId ?? 'diff.chain';
        return [
          { id: 'demo-1', skill_id: sid, beta: 1500, difficulty: 3 },
          { id: 'demo-2', skill_id: sid, beta: 1600, difficulty: 4 },
        ];
      }
      let q = supabase.from('items').select('id, skill_id, beta, difficulty').limit(50);
      if (skillId) q = q.eq('skill_id', skillId);
      const { data, error } = await q;
      if (error) {
        console.warn('[db.items.findCandidates] error:', error.message);
        // テーブル未作成など。モック返しでパイプラインを止めない
        const sid = skillId ?? 'diff.chain';
        return [
          { id: 'demo-1', skill_id: sid, beta: 1500, difficulty: 3 },
          { id: 'demo-2', skill_id: sid, beta: 1600, difficulty: 4 },
        ];
      }
      return (data ?? []) as ItemRow[];
    },

    /**
     * 生成した問題を保存（スキーマは簡易）
     * - generated_problems テーブルがなければ警告を出して続行
     * - userId は任意
     */
    async upsertGenerated(problem: any, opts?: { userId?: string | null }) {
      if (!supabase) return;
      const payload = problem ?? {};
      const skill_id = payload.skill_id ?? null;
      const difficulty = payload.difficulty ?? null;
      const user_id = opts?.userId ?? null;

      const { error } = await supabase.from('generated_problems').insert({
        user_id,
        skill_id,
        difficulty,
        payload,
        created_at: nowIso(),
      });

      if (error) {
        // テーブル未作成 / RLS などで失敗する可能性 → ログだけ
        console.warn('[db.upsertGenerated] insert failed:', error.message);
      }
    },
  },

  repetition: {
    /**
     * 間隔反復の履歴取得（直近1件）
     */
    async get(userId: string, itemId: string): Promise<{ intervalDays: number; lastSeen: number } | null> {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('repetitions')
        .select('interval_days, last_seen')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .order('last_seen', { ascending: false })
        .limit(1);
      if (error) {
        console.warn('[db.repetition.get] error:', error.message);
        return null;
      }
      if (!data || data.length === 0) return null;
      const row = data[0] as RepetitionRow;
      return { intervalDays: row.interval_days, lastSeen: Date.parse(row.last_seen) };
    },

    /**
     * 学習後の間隔更新（任意）
     */
    async upsert(userId: string, itemId: string, nextIntervalDays: number) {
      if (!supabase) return;
      const { error } = await supabase.from('repetitions').upsert(
        {
          user_id: userId,
          item_id: itemId,
          interval_days: nextIntervalDays,
          last_seen: nowIso(),
        },
        { onConflict: 'user_id,item_id' },
      );
      if (error) console.warn('[db.repetition.upsert] error:', error.message);
    },
  },
};

/**
 * 参考DDL（Supabase SQL Editorで実行）
 *
 * create table if not exists ability_history (
 *   user_id uuid not null,
 *   theta numeric not null,
 *   created_at timestamptz not null default now()
 * );
 *
 * create table if not exists items (
 *   id uuid primary key default gen_random_uuid(),
 *   skill_id text not null,
 *   beta numeric not null,
 *   difficulty int not null
 * );
 *
 * create table if not exists repetitions (
 *   user_id uuid not null,
 *   item_id uuid not null,
 *   interval_days int not null default 1,
 *   last_seen timestamptz not null default now(),
 *   primary key (user_id, item_id)
 * );
 *
 * create table if not exists generated_problems (
 *   id uuid primary key default gen_random_uuid(),
 *   user_id uuid,
 *   skill_id text,
 *   difficulty int,
 *   payload jsonb not null,
 *   created_at timestamptz not null default now()
 * );
 *
 * -- インデックス（推奨）
 * create index if not exists idx_generated_problems_created_at on generated_problems (created_at desc);
 * create index if not exists idx_generated_problems_skill on generated_problems (skill_id);
 *
 * -- 必要なら RLS を設定（Service Role 経由で書くなら不要）
 */
