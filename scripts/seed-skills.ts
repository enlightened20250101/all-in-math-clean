#!/usr/bin/env tsx
/**
 * Seed NDJSON (skills / prereqs / views / view_items) into Supabase
 * Usage:
 *   npx tsx scripts/seed-skills.ts --dir ./data/curriculum/JPN-2022-HS --dry-run
 *   npx tsx scripts/seed-skills.ts --dir ./data/curriculum/JPN-2022-HS --upsert
 *
 * Expected files in --dir:
 *   views.ndjson
 *   skills_*.ndjson
 *   skill_prereqs_*.ndjson
 *   view_items_*.ndjson   (uses "view_code", will be mapped to views.id)
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import fg from 'fast-glob';
import { createClient } from '@supabase/supabase-js';

type ViewRow = {
  code: string;
  title: string;
  description?: string;
  kind?: string;
};
type SkillRow = {
  id: string;
  title: string;
  subject?: string;
  unit?: string;
  topic?: string;
  difficulty: number;
  priority: number;
  tags?: string[];
  curriculum_version?: unknown;
  effective?: unknown;
  examples?: unknown;
};
type SkillPrereqRow = {
  skill_id: string;
  prereq_id: string;
};
type ViewItemRowInput = {
  view_code: string;
  skill_id: string;
  order_index?: number;
  weight?: number;
  config?: unknown;
};
type ViewItemRow = {
  view_id: string;
  skill_id: string;
  order_index?: number;
  weight?: number;
  config?: unknown;
};

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

const args = new Map<string, string | boolean>();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const [k, v] = a.includes('=') ? a.split('=') : [a, 'true'];
    args.set(k.replace(/^--/, ''), v === 'true' ? true : v);
  }
}
const DIR = (args.get('dir') as string) ?? '';
if (!DIR) {
  console.error('Usage: --dir <path to folder with ndjson files> [--upsert] [--dry-run]');
  process.exit(1);
}
const DRY_RUN = !!args.get('dry-run');
const DO_UPSERT = !!args.get('upsert');

const BATCH_SIZE = 500;

async function readNdjson<T = any>(file: string): Promise<T[]> {
  const out: T[] = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity,
  });

  // 文字列リテラル外の // or # 以降を削除
  const stripInlineComment = (s: string) => {
    let inStr = false, esc = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (!inStr && c === '#') return s.slice(0, i).trim();
      if (!inStr && c === '/' && s[i+1] === '/') return s.slice(0, i).trim();
      if (c === '"' && !esc) inStr = !inStr;
      esc = c === '\\' && !esc;
    }
    return s.trim();
  };

  for await (const raw of rl) {
    const line = stripInlineComment(raw);
    if (!line) continue;            // 空行はスキップ
    try {
      out.push(JSON.parse(line));
    } catch (e) {
      console.error(`JSON parse error in ${file}: ${raw}`);
      throw e;
    }
  }
  return out;
}

async function chunked<T>(arr: T[], size = BATCH_SIZE): Promise<T[][]> {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

// 追加: 配列の重複排除ヘルパ
function uniqBy<T>(rows: T[], keyFn: (r: T) => string): T[] {
  const m = new Map<string, T>();
  for (const r of rows) {
    const k = keyFn(r);
    if (!m.has(k)) m.set(k, r);          // 先勝ち。後勝ちにしたいなら常に set する
  }
  return Array.from(m.values());
}

async function upsertViews(rows: ViewRow[]) {
  if (!rows.length) return new Map<string, string>();
  // ★ 追加: dedupe
  rows = uniqBy(rows, (r) => r.code);
  console.log(`\n[views] ${rows.length} rows`);
  if (DRY_RUN) {
    console.log('  (dry-run) skip upsert');
    // fake IDs for downstream mapping
    const m = new Map<string, string>();
    rows.forEach((r) => m.set(r.code, `dry-${r.code}`));
    return m;
  }
  // Upsert by unique code
  for (const batch of await chunked(rows)) {
    const { error } = await supabase.from('views')
      .upsert(
        batch.map(r => ({
          code: r.code,
          title: r.title,
          description: r.description ?? null,
          kind: r.kind ?? 'playlist',
        })),
        { onConflict: 'code' }
      );
    if (error) throw error;
  }
  // Fetch id map
  const codes = rows.map(r => r.code);
  const { data, error } = await supabase.from('views').select('id, code').in('code', codes);
  if (error) throw error;
  const map = new Map<string, string>();
  data?.forEach(r => map.set(r.code, r.id));
  return map;
}

async function upsertSkills(rows: SkillRow[]) {
  if (!rows.length) return;
  // ★ 追加
  rows = uniqBy(rows, (r) => r.id);
  console.log(`\n[skills] ${rows.length} rows`);
  if (DRY_RUN) { console.log('  (dry-run) skip upsert'); return; }

  for (const batch of await chunked(rows)) {
    const { error } = await supabase.from('skills')
      .upsert(
        batch.map(r => ({
          id: r.id,
          title: r.title,
          subject: r.subject ?? null,
          unit: r.unit ?? null,
          topic: r.topic ?? null,
          difficulty: r.difficulty,
          priority: r.priority,
          tags: r.tags ?? [],
          curriculum_version: r.curriculum_version ?? { spec: 'JPN-2022-HS' },
          effective: r.effective ?? { start: '2022-04-01', end: null },
          examples: r.examples ?? [],
        })),
        { onConflict: 'id' }
      );
    if (error) throw error;
  }
}

async function upsertSkillPrereqs(rows: SkillPrereqRow[]) {
  if (!rows.length) return;
  // ★ 追加
  rows = uniqBy(rows, (r) => `${r.skill_id}@@${r.prereq_id}`);
  console.log(`\n[skill_prereqs] ${rows.length} rows`);
  if (DRY_RUN) { console.log('  (dry-run) skip upsert'); return; }

  for (const batch of await chunked(rows)) {
    const { error } = await supabase.from('skill_prereqs')
      .upsert(
        batch.map(r => ({
          skill_id: r.skill_id,
          prereq_id: r.prereq_id,
        })),
        { onConflict: 'skill_id,prereq_id' }
      );
    if (error) throw error;
  }
}

async function upsertViewItems(rows: ViewItemRowInput[], codeToId: Map<string, string>) {
  if (!rows.length) return;

  // まず view_code -> view_id にマップ
  const mapped: ViewItemRow[] = [];
  for (const r of rows) {
    const vid = codeToId.get(r.view_code);
    if (!vid) { console.warn(`  (!) view_code not found, skip: ${r.view_code}`); continue; }
    mapped.push({
      view_id: vid,
      skill_id: r.skill_id,
      order_index: r.order_index ?? 0,
      weight: r.weight ?? 1,
      config: r.config ?? {},
    });
  }

  // ★ 追加: (view_id, skill_id) 単位で重複を潰す（order_index は小さい方を残す）
  const best = new Map<string, ViewItemRow>();
  for (const r of mapped) {
    const k = `${r.view_id}@@${r.skill_id}`;
    const ex = best.get(k);
    if (!ex || (r.order_index ?? 0) < (ex.order_index ?? 0)) {
      best.set(k, r);
    }
  }
  const deduped = Array.from(best.values());

  console.log(`\n[view_items] ${deduped.length} rows`);
  if (DRY_RUN) { console.log('  (dry-run) skip upsert'); return; }

  for (const batch of await chunked(deduped)) {
    const { error } = await supabase.from('view_items')
      .upsert(batch, { onConflict: 'view_id,skill_id' });
    if (error) throw error;
  }
}


async function main() {
  const dir = path.resolve(DIR);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`Not a directory: ${dir}`);
  }

  // 1) views
  const viewsFile = path.join(dir, 'views.ndjson');
  const views: ViewRow[] = fs.existsSync(viewsFile) ? await readNdjson<ViewRow>(viewsFile) : [];
  const viewCodeToId = await upsertViews(views);

  // 2) skills_* (順不同で全部拾う)
  const skillFiles = await fg(['skills_*.ndjson'], { cwd: dir, onlyFiles: true, absolute: true });
  const allSkills: SkillRow[] = [];
  for (const f of skillFiles) allSkills.push(...await readNdjson<SkillRow>(f));
  if (DO_UPSERT) await upsertSkills(allSkills); else console.log('\n[skills] --upsert not passed, preview only:', allSkills.length);

  // 3) skill_prereqs_*（A/B/C/Dごとに分割されている想定）
  const prereqFiles = await fg(['skill_prereqs_*.ndjson'], { cwd: dir, onlyFiles: true, absolute: true });
  const allPrereqs: SkillPrereqRow[] = [];
  for (const f of prereqFiles) allPrereqs.push(...await readNdjson<SkillPrereqRow>(f));
  if (DO_UPSERT) await upsertSkillPrereqs(allPrereqs); else console.log('\n[skill_prereqs] --upsert not passed, preview only:', allPrereqs.length);

  // 4) view_items_*（view_code を DBの view_id にマップして upsert）
  const viFiles = await fg(['view_items_*.ndjson'], { cwd: dir, onlyFiles: true, absolute: true });
  const allViewItems: ViewItemRowInput[] = [];
  for (const f of viFiles) allViewItems.push(...await readNdjson<ViewItemRowInput>(f));
  if (DO_UPSERT) await upsertViewItems(allViewItems, viewCodeToId); else console.log('\n[view_items] --upsert not passed, preview only:', allViewItems.length);

  console.log('\n✅ Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
