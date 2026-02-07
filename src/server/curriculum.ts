// 追記/置換: src/server/curriculum.ts
import { promises as fs } from "fs";
import path from "path";

export type GraphOut = { prereqs: Record<string, string[]>; titles: Record<string, string> };
export type ViewMap = Record<string, { items: Array<{ skill_id: string; order: number; weight: number }> }>;

let _cache: GraphOut | null = null;
let _viewsCache: ViewMap | null = null;

export async function loadCurriculumGraph(dir = path.join(process.cwd(), "data/curriculum/JPN-2022-HS")): Promise<GraphOut> {
  if (_cache) return _cache;

  const entries = await fs.readdir(dir).catch(() => []);
  const skillFiles   = entries.filter(f => /^skills_.*\.ndjson$|^skills\.ndjson$/i.test(f));
  const prereqFiles  = entries.filter(f => /^skill[_-]?prereqs?(_.*)?\.ndjson$/i.test(f)); // ← 柔軟に
  const bridgeFiles  = entries.filter(f => /bridge.*\.ndjson$/i.test(f)); // ブリッジ系も拾う

  const titles: Record<string, string> = {};
  const prereqs: Record<string, string[]> = {};

  // 1) skills_* からタイトル辞書
  for (const f of skillFiles) {
    const full = path.join(dir, f);
    const text = await fs.readFile(full, "utf8").catch(() => "");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim(); if (!t) continue;
      try {
        const o = JSON.parse(t);
        const id = norm(o.skill_id ?? o.skill ?? o.code ?? o.id);
        const name = String(o.title ?? o.name ?? id);
        if (id) {
          titles[id] = name;
          if (!prereqs[id]) prereqs[id] = [];
        }
      } catch {}
    }
  }

  // 2) prereqs_* & bridge_* から依存抽出（多形対応）
  const edgeFiles = [...prereqFiles, ...bridgeFiles];
  for (const f of edgeFiles) {
    const full = path.join(dir, f);
    const text = await fs.readFile(full, "utf8").catch(() => "");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim(); if (!t) continue;
      try {
        const o = JSON.parse(t);
        // 可能な形：
        // A) { skill_id, prereqs:[...strings] }
        // B) { target, sources:[...strings] }
        // C) { to, from } / { child, parent } / { src, dst } / { a, b } など1対1
        // D) { requires: [{ skill_id }...] }
        let id = norm(o.skill_id ?? o.skill ?? o.code ?? o.id ?? o.target ?? o.to ?? o.child ?? o.dst ?? o.b);
        if (!id) continue;

        const collect = new Set<string>();

        // A
        if (Array.isArray(o.prereqs)) (o.prereqs).forEach((x:any)=> { const v = norm(x); if (v) collect.add(v); });
        // B
        if (Array.isArray(o.sources)) (o.sources).forEach((x:any)=> { const v = norm(x); if (v) collect.add(v); });
        // D
        if (Array.isArray(o.requires)) (o.requires).forEach((x:any)=> { const v = norm(x?.skill_id ?? x); if (v) collect.add(v); });
        // C 1対1
        const oneToOne = [o.from, o.parent, o.src, o.a, o.prereq];
        for (const cand of oneToOne) { const v = norm(cand); if (v) collect.add(v); }

        if (!prereqs[id]) prereqs[id] = [];
        if (collect.size) {
          const merged = Array.from(new Set([...prereqs[id], ...collect]));
          prereqs[id] = merged;
          // タイトル辞書に穴があれば埋める
          if (!titles[id]) titles[id] = id;
          merged.forEach(p => { if (!titles[p]) titles[p] = p; if (!prereqs[p]) prereqs[p] = prereqs[p] || []; });
        }
      } catch {}
    }
  }

  if (Object.keys(prereqs).length === 0 && Object.keys(titles).length > 0) {
    for (const k of Object.keys(titles)) prereqs[k] = [];
  }

  _cache = { prereqs, titles };
  return _cache;
}

export async function loadCurriculumViews(dir = path.join(process.cwd(), "data/curriculum/JPN-2022-HS")): Promise<ViewMap> {
  if (_viewsCache) return _viewsCache;

  const entries = await fs.readdir(dir).catch(() => []);
  const viewFiles = entries.filter(f => /^view_items_.*\.ndjson$/i.test(f));

  const views: ViewMap = {};
  for (const f of viewFiles) {
    const full = path.join(dir, f);
    const text = await fs.readFile(full, "utf8").catch(() => "");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim(); if (!t) continue;
      try {
        const o = JSON.parse(t);
        const vc = String(o.view_code || o.view || "");
        const sid = norm(o.skill_id || o.skill || "");
        const order = Number.isFinite(o.order_index) ? Number(o.order_index) : (Number(o.order) || 0);
        const weight = Number.isFinite(o.weight) ? Number(o.weight) : 1.0;
        if (!vc || !sid) continue;
        if (!views[vc]) views[vc] = { items: [] };
        views[vc].items.push({ skill_id: sid, order, weight });
      } catch {}
    }
  }
  // order でソート＋重複排除
  for (const v of Object.values(views)) {
    v.items = v.items
      .sort((a,b)=> a.order - b.order)
      .filter((x, i, arr) => arr.findIndex(y => y.skill_id === x.skill_id) === i);
  }

  _viewsCache = views;
  return views;
}

// ビューの順序から擬似依存を作る（prev -> curr）
export function buildViewEdges(views: ViewMap, codes: string[], window = 1): Array<{ to: string; from: string }> {
  const edges: Array<{to:string; from:string}> = [];
  for (const code of codes) {
    const v = views[code]; if (!v) continue;
    const items = v.items;
    for (let i = 1; i < items.length; i++) {
      const curr = items[i].skill_id;
      for (let k = 1; k <= window; k++) {
        const prev = items[i - k]?.skill_id;
        if (prev) edges.push({ to: curr, from: prev });
      }
    }
  }
  return edges;
}

function norm(x: any): string | null {
  if (typeof x !== "string") return null;
  const s = x.trim();
  return s || null;
}
