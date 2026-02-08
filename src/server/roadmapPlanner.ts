// src/server/roadmapPlanner.ts
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import { loadCurriculumGraph, loadCurriculumViews, ViewMap } from "@/server/curriculum";

export type PlanParams = {
  userId: string;
  goalText?: string;                // 例: "共通テスト 数I A 80点 / 2ヶ月 / 因数分解と二次関数を重点"
  targetDate?: string | null;       // "2025-01-15"
  weeklyHours?: number;             // 7 など
  viewCodes?: string[];             // 明示指定すればこちら優先
  includeMastered?: boolean;        // 既習も残すなら true
  maxDepth?: number;                // 前提の掘り下げ深さ
  maxSkills?: number;               // 上限スキル数
};

export type PlannedNode = {
  skill_id: string;
  title: string;
  priority: number;
  due_at?: string | null;
  prereqs?: string[];
};

export async function planRoadmap(p: PlanParams): Promise<{ nodes: PlannedNode[], budgetHours: number }> {
    const userId = p.userId;
    const weeklyHours = Math.max(1, Math.min(50, p.weeklyHours ?? 7));
    const target = p.targetDate ? new Date(p.targetDate) : null;
  
    const sb = await await supabaseServerReadOnly();
    const cg = await loadCurriculumGraph();    // { prereqs, titles }
    const views = await loadCurriculumViews(); // { [view_code]: { items:[{skill_id,order,weight}...] } }
  
    // 1) 候補スキル集合（view優先、無ければ goalText から view を推定）
    const candidateSkills = new Set<string>();
    const usedViews: string[] = [];
  
    if (p.viewCodes && p.viewCodes.length) {
      for (const vc of p.viewCodes) {
        if (views[vc]) { usedViews.push(vc); views[vc].items.forEach(it => candidateSkills.add(it.skill_id)); }
      }
    } else if (p.goalText) {
      const guessed = simpleMatchViews(views, p.goalText).slice(0, 3);
      for (const vc of guessed) { usedViews.push(vc); views[vc].items.forEach(it => candidateSkills.add(it.skill_id)); }
    }
  
    // フォールバック：なにも選べなければ教科の基礎領域を大まかに
    if (candidateSkills.size === 0) {
      Object.keys(cg.titles).filter(k => /^M1\./.test(k)).slice(0, 60).forEach(k => candidateSkills.add(k));
    }
  
    // 2) 前提閉包
    const prereqsMap = new Map<string, string[]>(Object.entries(cg.prereqs));
    const required = closure(candidateSkills, prereqsMap, p.maxDepth ?? 6);
  
    // 3) mastery
    const reqIds = Array.from(required);
    const mastery = new Map<string, number>();
    if (reqIds.length) {
      const { data: rows } = await sb.from("user_skill_mastery")
        .select("skill_id, mastery_level").eq("user_id", userId).in("skill_id", reqIds);
      (rows||[]).forEach((r: any) => mastery.set(r.skill_id, r.mastery_level ?? 0));
    }
  
    // 4) スコアリング＆取捨
    type Scored = { skill_id: string; title: string; score: number; estHours: number; prereqs: string[]; depth: number };
    const depths = topoDepth(required, prereqsMap);
    const scored: Scored[] = [];
    for (const sid of required) {
      const m = mastery.get(sid) ?? 0;
      if (!p.includeMastered && m >= 4) continue;
      const title = cg.titles[sid] || sid;
      const relWeight = viewWeight(sid, views, usedViews);
      const matchScore = textMatch(p.goalText || "", title); // ここは軽い足し算だけ
      const depth = depths.get(sid) ?? 0;
      const estHours = clamp(0.25 + relWeight * 0.75 + depth * 0.1, 0.25, 2.0);
      const score = relWeight*2 + matchScore*1.5 + (m<2 ? 0.5 : 0) + Math.max(0, 2 - depth*0.1);
      scored.push({ skill_id: sid, title, score, estHours, prereqs: (prereqsMap.get(sid) || []), depth });
    }
  
    // 5) 予算内で greedy 選抜（前提込み）
    const weeks = target ? Math.max(1, Math.ceil((target.getTime() - Date.now()) / (1000*60*60*24*7))) : 8;
    const budgetHours = weeks * weeklyHours;
    const maxSkills = p.maxSkills ?? 120;
    const pool = scored.sort((a,b)=> b.score - a.score);
    const chosen = new Set<string>();
    let used = 0;
    for (const s of pool) {
      if (chosen.has(s.skill_id)) continue;
      const chain = chainWithPrereqs(s.skill_id, prereqsMap);
      const addList = chain.filter(x => required.has(x) && !chosen.has(x));
      const addHours = addList.reduce((h, sid) => {
        const sc = pool.find(x => x.skill_id === sid); return h + (sc?.estHours ?? 0.5);
      }, 0);
      if (used + addHours > budgetHours) continue;
      addList.forEach(x => chosen.add(x));
      used += addHours;
      if (chosen.size >= maxSkills) break;
    }
  
    // 6) スケジューリング
    const nodes: PlannedNode[] = [];
    const chosenDepths = Array.from(chosen).map(sid => depths.get(sid) ?? 0);
    const maxDepth = chosenDepths.length ? Math.max(...chosenDepths) : 0;
    for (const sid of chosen) {
      const d = depths.get(sid) ?? 0;
      const pct = maxDepth ? d/maxDepth : 0;
      const due = target ? new Date(target) : addDays(new Date(), 28);
      if (target) due.setDate(due.getDate() - Math.round((1-pct) * (weeks*7*0.8)));
      nodes.push({
        skill_id: sid,
        title: cg.titles[sid] || sid,
        priority: 10 + Math.round((1-pct)*10),
        due_at: (target ? due.toISOString() : null),
        prereqs: (prereqsMap.get(sid) || []).filter(p => chosen.has(p)),
      });
    }
    nodes.sort((a,b)=> {
      if (a.due_at && b.due_at) return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      return b.priority - a.priority;
    });
  
    return { nodes, budgetHours: Math.round(budgetHours) };
  }

/* ------------ helpers --------------- */

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function clamp(v: number, lo:number, hi:number){ return Math.min(hi, Math.max(lo, v)); }
function closure(seeds: Set<string>, g: Map<string,string[]>, maxDepth: number): Set<string> {
  const out = new Set<string>(seeds);
  const q = Array.from(seeds).map(s => ({ sid:s, depth:0 }));
  while (q.length) {
    const { sid, depth } = q.shift()!;
    if (depth >= maxDepth) continue;
    const ps = g.get(sid) || [];
    for (const p of ps) if (!out.has(p)) { out.add(p); q.push({ sid:p, depth: depth+1 }); }
  }
  return out;
}
function topoDepth(show: Set<string>, g: Map<string,string[]>): Map<string, number> {
  const indeg = new Map<string, number>(); const d = new Map<string, number>();
  for (const s of show) indeg.set(s, (g.get(s)||[]).filter(p => show.has(p)).length);
  const q: string[] = [];
  for (const s of show) if ((indeg.get(s) ?? 0) === 0) { d.set(s, 0); q.push(s); }
  while (q.length) {
    const u = q.shift()!; const du = d.get(u) ?? 0;
    for (const v of show) {
      const ps = g.get(v) || []; if (!ps.includes(u)) continue;
      indeg.set(v, (indeg.get(v) ?? 0) - 1);
      d.set(v, Math.max(d.get(v) ?? 0, du+1));
      if ((indeg.get(v) ?? 0) === 0) q.push(v);
    }
  }
  return d;
}
function chainWithPrereqs(sid: string, g: Map<string,string[]>): string[] {
  const out: string[] = []; const seen = new Set<string>();
  function dfs(x: string) { if (seen.has(x)) return; (g.get(x)||[]).forEach(dfs); out.push(x); seen.add(x); }
  dfs(sid); return out;
}
function viewWeight(sid: string, views: ViewMap, used: string[]): number {
  let w = 0;
  for (const code of used) {
    const v = views[code]; if (!v) continue;
    const hit = v.items.find(it => it.skill_id === sid);
    if (hit) w += (hit.weight || 1) * (1 + 1/(1+hit.order));
  }
  return w || 1.0;
}
function textMatch(q: string, title: string): number {
  if (!q) return 0;
  const low = q.toLowerCase(), t = title.toLowerCase();
  const kws = low.split(/[/\s・、,]+/).filter(Boolean);
  let s = 0; for (const k of kws) if (t.includes(k)) s += Math.min(k.length/6, 1);
  return Math.min(2.0, s);
}
function simpleMatchViews(views: ViewMap, q: string): string[] {
  const low = (q||"").toLowerCase();
  const tokens = low.split(/[/\s・、,（）()]+/).filter(Boolean);
  // 例: "数I" → mathI / m1 / school-mathI などに緩くヒット
  function norm(s: string){ return s.toLowerCase().replace(/[-_]/g,""); }
  const scored = Object.keys(views).map(code => {
    const C = norm(code);
    let score = 0; tokens.forEach(t => { const tt = t.toLowerCase().replace(/[-_]/g,""); if (C.includes(tt)) score += Math.min(tt.length/5, 1); });
    return { code, score };
  }).filter(x => x.score > 0.3)
    .sort((a,b)=> b.score - a.score);
  return scored.map(x => x.code);
}